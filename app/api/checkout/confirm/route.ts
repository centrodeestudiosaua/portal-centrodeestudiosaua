import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import Stripe from "stripe";

import {
  buildPaymentConfirmedEmail,
  renderPortalEmail,
  sendTransactionalEmail,
} from "@/lib/email";
import { getStripeServerClient } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

function addMonths(date: Date, months: number) {
  const copy = new Date(date);
  copy.setMonth(copy.getMonth() + months);
  return copy;
}

function addMonthsUtc(date: Date, months: number) {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth() + months,
      date.getUTCDate(),
      12,
      0,
      0,
      0,
    ),
  );
}

function daysInUtcMonth(year: number, monthIndex: number) {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

function buildUtcAnchor(year: number, monthIndex: number, dayOfMonth: number) {
  return new Date(
    Date.UTC(
      year,
      monthIndex,
      Math.min(dayOfMonth, daysInUtcMonth(year, monthIndex)),
      12,
      0,
      0,
      0,
    ),
  );
}

function parseSpanishDateLabel(value: string | null | undefined) {
  if (!value) return null;

  const normalized = value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  const match = normalized.match(/^(\d{1,2})\s+de\s+([a-z]+)\s+de\s+(\d{4})$/);

  if (!match) return null;

  const [, dayRaw, monthRaw, yearRaw] = match;
  const monthIndex = [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
  ].indexOf(monthRaw);

  if (monthIndex < 0) return null;

  return buildUtcAnchor(Number(yearRaw), monthIndex, Number(dayRaw));
}

function resolveNextInstallmentChargeDate(now: Date, courseStartLabel: string | null | undefined) {
  const courseStart = parseSpanishDateLabel(courseStartLabel);

  if (!courseStart) {
    return addMonthsUtc(now, 1);
  }

  const anchorDay = courseStart.getUTCDate();
  const firstRenewal = addMonthsUtc(courseStart, 1);
  const currentMonthAnchor = buildUtcAnchor(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    anchorDay,
  );
  const nextMonthlyAnchor =
    now.getTime() < currentMonthAnchor.getTime()
      ? currentMonthAnchor
      : buildUtcAnchor(now.getUTCFullYear(), now.getUTCMonth() + 1, anchorDay);

  return nextMonthlyAnchor.getTime() > firstRenewal.getTime() ? nextMonthlyAnchor : firstRenewal;
}

async function findOrCreateCustomer(
  stripe: Stripe,
  input: {
    email: string;
    userId: string;
    name?: string | null;
    phone?: string | null;
  },
) {
  const { email, userId, name, phone } = input;
  const existing = await stripe.customers.list({ email, limit: 1 });
  const customer = existing.data[0];

  if (customer) {
    const needsUpdate =
      (name && customer.name !== name) ||
      (phone && customer.phone !== phone) ||
      customer.metadata?.user_id !== userId;

    if (needsUpdate) {
      await stripe.customers.update(customer.id, {
        name: name || customer.name || undefined,
        phone: phone || customer.phone || undefined,
        metadata: {
          ...customer.metadata,
          user_id: userId,
        },
      });
    }

    return customer.id;
  }

  const created = await stripe.customers.create({
    email,
    name: name || undefined,
    phone: phone || undefined,
    metadata: { user_id: userId },
  });

  return created.id;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      paymentIntentId?: string;
      courseSlug?: string;
    };

    const paymentIntentId = body.paymentIntentId?.trim();
    const courseSlug = body.courseSlug?.trim();

    if (!paymentIntentId || !courseSlug) {
      return NextResponse.json({ error: "Missing confirmation payload" }, { status: 400 });
    }

    const supabase = await createClient();
    const stripe = getStripeServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: "Missing Supabase service role" }, { status: 500 });
    }

    const admin = createAdminClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const headerStore = await headers();
    const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
    const protocol = headerStore.get("x-forwarded-proto") ?? "http";
    const origin =
      host && protocol
        ? `${protocol}://${host}`
        : process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    const paymentEmail = (paymentIntent.metadata?.user_email ?? "").toLowerCase();
    const needsAccountCreation =
      paymentIntent.metadata?.needs_account_creation === "true";

    let resolvedUserId = user?.id ?? null;
    let resolvedUserEmail = user?.email?.toLowerCase() ?? paymentEmail;

    if (!resolvedUserId && !needsAccountCreation) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (resolvedUserId && paymentIntent.metadata?.user_id && paymentIntent.metadata.user_id !== resolvedUserId) {
      return NextResponse.json({ error: "Payment does not belong to current user" }, { status: 403 });
    }

    if (paymentIntent.metadata?.course_slug !== courseSlug) {
      return NextResponse.json({ error: "Payment course mismatch" }, { status: 400 });
    }

    if (paymentIntent.status !== "succeeded" && paymentIntent.status !== "processing") {
      return NextResponse.json(
        { error: `Payment intent status is ${paymentIntent.status}` },
        { status: 409 },
      );
    }

    const courseId = paymentIntent.metadata?.course_id;
    const purchaseOption = paymentIntent.metadata?.purchase_option ?? "one_time";
    const paymentType = paymentIntent.metadata?.payment_type ?? "one_time";
    const priceId = paymentIntent.metadata?.price_id ?? "";
    const monthsTotal = Number(paymentIntent.metadata?.months_total ?? "1");
    const customerName = paymentIntent.metadata?.customer_name ?? "";
    const customerPhone = paymentIntent.metadata?.customer_phone ?? null;

    if (!courseId) {
      return NextResponse.json({ error: "Payment metadata missing course" }, { status: 400 });
    }

    const { data: course } = await admin
      .from("courses")
      .select("id, title, start_date_label")
      .eq("id", courseId)
      .maybeSingle();

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    let activationRedirectUrl: string | null = null;

    if (!resolvedUserId && needsAccountCreation) {
      const { data: listedUsers } = await admin.auth.admin.listUsers({
        page: 1,
        perPage: 200,
      });
      const existingUser =
        listedUsers?.users.find(
          (listedUser) => (listedUser.email ?? "").toLowerCase() === paymentEmail,
        ) ?? null;

      if (existingUser) {
        resolvedUserId = existingUser.id;
      } else {
        const { data: createdUser, error: createUserError } =
          await admin.auth.admin.createUser({
            email: paymentEmail,
            email_confirm: true,
            password: crypto.randomUUID(),
            user_metadata: {
              full_name: customerName,
              phone: customerPhone,
            },
          });

        if (createUserError || !createdUser.user) {
          return NextResponse.json(
            { error: createUserError?.message ?? "No se pudo crear el alumno" },
            { status: 500 },
          );
        }

        resolvedUserId = createdUser.user.id;
      }

      resolvedUserEmail = paymentEmail;

      const [firstName, ...lastNameParts] = customerName.split(" ").filter(Boolean);
      await admin.from("student_profiles").upsert(
        {
          id: resolvedUserId,
          email: resolvedUserEmail,
          full_name: customerName,
          first_name: firstName ?? "",
          last_name: lastNameParts.join(" "),
          phone: customerPhone,
          role: "student",
        },
        { onConflict: "id" },
      );

      const courseRedirectPath = `/courses/${courseSlug}?checkout=success`;
      const setPasswordPath = `/auth/update-password?next=${encodeURIComponent(courseRedirectPath)}`;

      const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
        type: "recovery",
        email: resolvedUserEmail,
        options: {
          redirectTo: `${origin}${setPasswordPath}`,
        },
      });

      if (linkError) {
        return NextResponse.json(
          { error: "No se pudo preparar el acceso al portal" },
          { status: 500 },
        );
      }

      const hashedToken = linkData.properties?.hashed_token ?? null;

      if (!hashedToken) {
        return NextResponse.json(
          { error: "No se pudo generar la redireccion de acceso" },
          { status: 500 },
        );
      }

      const activationUrl = `${origin}/auth/confirm?token_hash=${encodeURIComponent(
        hashedToken,
      )}&type=recovery&next=${encodeURIComponent(setPasswordPath)}`;

      await sendTransactionalEmail({
        to: resolvedUserEmail,
        subject: "Activa tu cuenta del Portal AUA",
        html: renderPortalEmail({
          preview: "Tu acceso fue creado. Define tu contrasena para entrar al portal.",
          title: "Tu acceso fue creado",
          body:
            "Hemos activado tu acceso al Portal AUA y tu programa ya esta asignado. Define tu contrasena desde el siguiente boton para entrar con tu correo y continuar con tu diplomado.",
          ctaLabel: "Activar cuenta",
          ctaUrl: activationUrl,
        }),
      });

      activationRedirectUrl = `${origin}/auth/check-email?mode=activation&email=${encodeURIComponent(
        resolvedUserEmail,
      )}`;
    }

    const [{ data: duplicateEnrollment }, { data: duplicatePayment }] = await Promise.all([
      admin
        .from("enrollments")
        .select("id, status")
        .eq("student_id", resolvedUserId!)
        .eq("course_id", courseId)
        .in("status", ["active", "completed"])
        .maybeSingle(),
      admin
        .from("payments")
        .select("id, stripe_payment_intent_id, status")
        .eq("student_id", resolvedUserId!)
        .eq("course_id", courseId)
        .eq("status", "paid")
        .neq("stripe_payment_intent_id", paymentIntent.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    if (duplicatePayment) {
      if (paymentIntent.status === "succeeded") {
        await stripe.refunds.create({
          payment_intent: paymentIntent.id,
          reason: "duplicate",
        });
      }

      const { data: existingPayment } = await admin
        .from("payments")
        .select("id")
        .eq("stripe_payment_intent_id", paymentIntent.id)
        .maybeSingle();

      if (!existingPayment) {
        await admin.from("payments").insert({
          student_id: resolvedUserId!,
          course_id: courseId,
          provider: "stripe",
          payment_type: paymentType === "installments" ? "installment" : "one_time",
          status: "refunded",
          amount_mxn: paymentIntent.amount ? paymentIntent.amount / 100 : 0,
          currency: paymentIntent.currency ?? "mxn",
          stripe_payment_intent_id: paymentIntent.id,
          stripe_customer_id:
            typeof paymentIntent.customer === "string" ? paymentIntent.customer : null,
          paid_at: new Date().toISOString(),
        });
      }

      return NextResponse.json(
        { error: "Ya existe un plan pagado para este programa. El cobro duplicado fue revertido." },
        { status: 409 },
      );
    }

    const { data: existingPayment } = await admin
      .from("payments")
      .select("id")
      .eq("stripe_payment_intent_id", paymentIntent.id)
      .maybeSingle();

    if (!existingPayment) {
      await admin.from("payments").insert({
        student_id: resolvedUserId!,
        course_id: courseId,
        provider: "stripe",
        payment_type: paymentType === "installments" ? "installment" : "one_time",
        status: paymentIntent.status === "succeeded" ? "paid" : "pending",
        amount_mxn: paymentIntent.amount ? paymentIntent.amount / 100 : 0,
        currency: paymentIntent.currency ?? "mxn",
        stripe_payment_intent_id: paymentIntent.id,
        stripe_customer_id:
          typeof paymentIntent.customer === "string" ? paymentIntent.customer : null,
        paid_at: paymentIntent.status === "succeeded" ? new Date().toISOString() : null,
      });
    }

    if (!duplicateEnrollment) {
      await admin.from("enrollments").upsert(
        {
          student_id: resolvedUserId!,
          course_id: courseId,
          status: "active",
          enrolled_at: new Date().toISOString(),
        },
        { onConflict: "student_id,course_id" },
      );
    }

    let subscriptionId: string | null = null;

    if (paymentType === "installments") {
      const customerId =
        typeof paymentIntent.customer === "string"
          ? paymentIntent.customer
          : await findOrCreateCustomer(stripe, {
              email: resolvedUserEmail,
              userId: resolvedUserId!,
              name: customerName || null,
              phone: customerPhone || null,
            });
      const paymentMethodId =
        typeof paymentIntent.payment_method === "string"
          ? paymentIntent.payment_method
          : null;

      if (!paymentMethodId) {
        return NextResponse.json(
          { error: "Payment method was not attached to the first charge" },
          { status: 500 },
        );
      }

      await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId }).catch(() => null);

      await stripe.customers.update(customerId, {
        name: customerName || undefined,
        phone: customerPhone || undefined,
        invoice_settings: { default_payment_method: paymentMethodId },
      });

      const existingSubscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: "all",
        limit: 20,
      });

      const matchingSubscription = existingSubscriptions.data.find(
        (subscription) =>
          subscription.metadata?.user_id === resolvedUserId &&
          subscription.metadata?.course_id === courseId &&
          subscription.metadata?.plan === purchaseOption &&
          subscription.status !== "canceled" &&
          subscription.status !== "incomplete_expired",
      );

      if (matchingSubscription) {
        subscriptionId = matchingSubscription.id;
      } else {
        const now = new Date();
        const firstRenewalDate = resolveNextInstallmentChargeDate(
          now,
          course.start_date_label,
        );
        const trialEnd = Math.floor(firstRenewalDate.getTime() / 1000);
        const cancelAt = Math.floor(
          addMonthsUtc(firstRenewalDate, Math.max(monthsTotal - 1, 0)).getTime() / 1000,
        );

        const subscription = await stripe.subscriptions.create({
          customer: customerId,
          items: [{ price: priceId }],
          default_payment_method: paymentMethodId,
          trial_end: trialEnd,
          cancel_at: cancelAt,
          metadata: {
            user_id: resolvedUserId!,
            user_email: resolvedUserEmail,
            course_id: courseId,
            course_slug: courseSlug,
            purchase_option: purchaseOption,
            plan: purchaseOption,
            months_total: String(monthsTotal),
          },
        });

        subscriptionId = subscription.id;
      }
    }

    const redirectUrl = resolvedUserId && !needsAccountCreation
      ? `${origin}/courses/${courseSlug}?checkout=success`
      : activationRedirectUrl;

    if (!redirectUrl) {
      return NextResponse.json(
        { error: "No se pudo determinar la redireccion final" },
        { status: 500 },
      );
    }

    if (paymentIntent.status === "succeeded") {
      const paymentEmailPayload = buildPaymentConfirmedEmail({
        courseTitle: course.title,
        planLabel:
          paymentType === "installments"
            ? `${monthsTotal} mensualidades`
            : "Pago unico",
        amountMxn: paymentIntent.amount ? paymentIntent.amount / 100 : 0,
        courseUrl: `${origin}/courses/${courseSlug}?checkout=success`,
      });

      void sendTransactionalEmail({
        to: resolvedUserEmail,
        subject: paymentEmailPayload.subject,
        html: paymentEmailPayload.html,
      }).catch((emailError) => {
        console.error("payment-confirmed-email", emailError);
      });
    }

    return NextResponse.json({
      ok: true,
      enrolled: true,
      subscriptionId,
      redirectUrl,
    });
  } catch (error) {
    const message =
      error instanceof Stripe.errors.StripeError
        ? error.message
        : error instanceof Error
          ? error.message
          : "No se pudo confirmar el pago";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
