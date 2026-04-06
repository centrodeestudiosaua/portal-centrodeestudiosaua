import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import Stripe from "stripe";

import { createClient } from "@/lib/supabase/server";
import { getStripeServerClient } from "@/lib/stripe";

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function normalizePhone(value: string) {
  return value.replace(/\D/g, "");
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidPhone(value: string) {
  return value.length === 10;
}

async function findExistingStudentIdByEmail(
  admin: ReturnType<typeof createPortalAdminClient>,
  email: string,
) {
  const { data: profile } = await admin
    .from("student_profiles")
    .select("id")
    .ilike("email", email)
    .maybeSingle<{ id: string }>();

  return profile?.id ?? null;
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
    metadata: {
      user_id: userId,
    },
  });

  return created.id;
}

function createPortalAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase admin configuration");
  }

  return createAdminClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      courseId?: string;
      courseSlug?: string;
      priceId?: string;
      mode?: "payment" | "subscription";
      purchaseOption?: string;
      customerName?: string;
      customerEmail?: string;
      customerPhone?: string;
    };

    const courseId = body.courseId?.trim();
    const courseSlug = body.courseSlug?.trim();
    const priceId = body.priceId?.trim();
    const mode = body.mode === "subscription" ? "subscription" : "payment";
    const purchaseOption = body.purchaseOption?.trim() || "one_time";
    const customerName = body.customerName?.trim() ?? "";
    const customerEmail = normalizeEmail(body.customerEmail ?? "");
    const customerPhone = normalizePhone(body.customerPhone ?? "");
    const monthsTotal =
      purchaseOption === "three_month" ? 3 : purchaseOption === "monthly" ? 6 : 1;

    if (!courseId || !courseSlug || !priceId) {
      return NextResponse.json(
        { error: "Missing checkout payload" },
        { status: 400 },
      );
    }

    const supabase = await createClient();
    const admin = createPortalAdminClient();
    const stripe = getStripeServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const resolvedUserId = user?.id ?? null;
    const resolvedUserEmail = user?.email?.toLowerCase() ?? customerEmail;

    if (!resolvedUserEmail) {
      return NextResponse.json(
        { error: "Missing customer email" },
        { status: 400 },
      );
    }

    if (!isValidEmail(resolvedUserEmail)) {
      return NextResponse.json(
        { error: "Invalid customer email" },
        { status: 400 },
      );
    }

    if (!resolvedUserId && (!customerName || !customerPhone)) {
      return NextResponse.json(
        { error: "Missing anonymous customer details" },
        { status: 400 },
      );
    }

    if (!resolvedUserId && !isValidPhone(customerPhone)) {
      return NextResponse.json(
        { error: "Invalid anonymous customer phone" },
        { status: 400 },
      );
    }

    const existingStudentId =
      resolvedUserId ?? (resolvedUserEmail ? await findExistingStudentIdByEmail(admin, resolvedUserEmail) : null);

    const [{ data: course }, { data: enrollment }] = await Promise.all([
      admin
        .from("courses")
        .select(
          "id, slug, stripe_one_time_price_id, stripe_three_month_price_id, stripe_monthly_price_id",
        )
        .eq("id", courseId)
        .eq("slug", courseSlug)
        .eq("is_published", true)
        .maybeSingle(),
      existingStudentId
        ? admin
            .from("enrollments")
            .select("id")
            .eq("student_id", existingStudentId)
            .eq("course_id", courseId)
            .in("status", ["active", "completed"])
            .maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    if (enrollment) {
      return NextResponse.json(
        { error: "Este programa ya esta activo para ese correo. Inicia sesion para entrar al portal." },
        { status: 409 },
      );
    }

    const validPriceIds = new Set(
      [
        course.stripe_one_time_price_id,
        course.stripe_three_month_price_id,
        course.stripe_monthly_price_id,
      ].filter(Boolean),
    );

    if (!validPriceIds.has(priceId)) {
      return NextResponse.json(
        { error: "Invalid price for course" },
        { status: 400 },
      );
    }

    const customerId =
      resolvedUserEmail
        ? await findOrCreateCustomer(stripe, {
            email: resolvedUserEmail,
            userId: resolvedUserId ?? `anon:${resolvedUserEmail}`,
            name: customerName || user?.user_metadata?.full_name || null,
            phone: customerPhone || null,
          })
        : null;

    if (mode === "payment") {
      const price = await stripe.prices.retrieve(priceId);

      if (!price.unit_amount || !price.currency) {
        return NextResponse.json(
          { error: "Stripe price is missing amount or currency" },
          { status: 400 },
        );
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: price.unit_amount,
        currency: price.currency,
        customer: customerId ?? undefined,
        payment_method_types: ["card"],
        receipt_email: resolvedUserEmail,
        metadata: {
          user_id: resolvedUserId ?? "",
          user_email: resolvedUserEmail,
          course_id: courseId,
          course_slug: courseSlug,
          purchase_option: purchaseOption,
          price_id: priceId,
          payment_type: "one_time",
          customer_name: customerName,
          customer_phone: customerPhone,
          needs_account_creation: resolvedUserId ? "false" : "true",
        },
      });

      return NextResponse.json({ clientSecret: paymentIntent.client_secret });
    }

    const price = await stripe.prices.retrieve(priceId);

    if (!price.unit_amount || !price.currency) {
      return NextResponse.json(
        { error: "Stripe price is missing amount or currency" },
        { status: 400 },
      );
    }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: price.unit_amount,
        currency: price.currency,
        customer: customerId ?? undefined,
        payment_method_types: ["card"],
        setup_future_usage: "off_session",
        receipt_email: resolvedUserEmail,
      metadata: {
        user_id: resolvedUserId ?? "",
        user_email: resolvedUserEmail,
        course_id: courseId,
        course_slug: courseSlug,
        purchase_option: purchaseOption,
        price_id: priceId,
        payment_type: "installments",
        plan: purchaseOption,
        months_total: String(monthsTotal),
        customer_name: customerName,
        customer_phone: customerPhone,
        needs_account_creation: resolvedUserId ? "false" : "true",
      },
    });

    const clientSecret = paymentIntent.client_secret;

    if (!clientSecret) {
      return NextResponse.json(
        { error: "Payment intent client secret was not created" },
        { status: 500 },
      );
    }

    return NextResponse.json({ clientSecret });
  } catch (error) {
    const message =
      error instanceof Stripe.errors.StripeError
        ? error.message
        : error instanceof Error
          ? error.message
          : "No se pudo crear la terminal de pago";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
