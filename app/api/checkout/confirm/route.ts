import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import Stripe from "stripe";

import { getStripeServerClient } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

function addMonths(date: Date, months: number) {
  const copy = new Date(date);
  copy.setMonth(copy.getMonth() + months);
  return copy;
}

async function findOrCreateCustomer(stripe: Stripe, email: string, userId: string) {
  const existing = await stripe.customers.list({ email, limit: 1 });
  const customer = existing.data[0];

  if (customer) return customer.id;

  const created = await stripe.customers.create({
    email,
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

    if (!user?.id || !user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: "Missing Supabase service role" }, { status: 500 });
    }

    const admin = createAdminClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.metadata?.user_id !== user.id) {
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

    if (!courseId) {
      return NextResponse.json({ error: "Payment metadata missing course" }, { status: 400 });
    }

    const { data: existingPayment } = await admin
      .from("payments")
      .select("id")
      .eq("stripe_payment_intent_id", paymentIntent.id)
      .maybeSingle();

    if (!existingPayment) {
      await admin.from("payments").insert({
        student_id: user.id,
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

    await admin.from("enrollments").upsert(
      {
        student_id: user.id,
        course_id: courseId,
        status: "active",
        enrolled_at: new Date().toISOString(),
      },
      { onConflict: "student_id,course_id" },
    );

    let subscriptionId: string | null = null;

    if (paymentType === "installments") {
      const customerId =
        typeof paymentIntent.customer === "string"
          ? paymentIntent.customer
          : await findOrCreateCustomer(stripe, user.email, user.id);
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
        invoice_settings: { default_payment_method: paymentMethodId },
      });

      const existingSubscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: "all",
        limit: 20,
      });

      const matchingSubscription = existingSubscriptions.data.find(
        (subscription) =>
          subscription.metadata?.user_id === user.id &&
          subscription.metadata?.course_id === courseId &&
          subscription.metadata?.plan === purchaseOption &&
          subscription.status !== "canceled" &&
          subscription.status !== "incomplete_expired",
      );

      if (matchingSubscription) {
        subscriptionId = matchingSubscription.id;
      } else {
        const now = new Date();
        const trialEnd = Math.floor(addMonths(now, 1).getTime() / 1000);
        const cancelAt = Math.floor(addMonths(now, monthsTotal).getTime() / 1000);

        const subscription = await stripe.subscriptions.create({
          customer: customerId,
          items: [{ price: priceId }],
          default_payment_method: paymentMethodId,
          trial_end: trialEnd,
          cancel_at: cancelAt,
          metadata: {
            user_id: user.id,
            user_email: user.email,
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

    return NextResponse.json({
      ok: true,
      enrolled: true,
      subscriptionId,
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
