import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

import { getStripeServerClient } from "@/lib/stripe";

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!webhookSecret || !supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: "Missing webhook configuration" }, { status: 500 });
  }

  const stripe = getStripeServerClient();
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  async function unlockCourse(input: {
    userId: string;
    courseId: string;
    purchaseOption?: string | null;
    amountMxn?: number | null;
    currency?: string | null;
    stripePaymentIntentId?: string | null;
    stripeCheckoutSessionId?: string | null;
    stripeCustomerId?: string | null;
    paid?: boolean;
    accessExpiresAt?: string | null;
  }) {
    const {
      userId,
      courseId,
      purchaseOption,
      amountMxn,
      currency,
      stripePaymentIntentId,
      stripeCheckoutSessionId,
      stripeCustomerId,
      paid,
      accessExpiresAt,
    } = input;

    if (stripePaymentIntentId) {
      const { data: existingPayment } = await admin
        .from("payments")
        .select("id")
        .eq("stripe_payment_intent_id", stripePaymentIntentId)
        .maybeSingle();

      if (!existingPayment) {
        await admin.from("payments").insert({
          student_id: userId,
          course_id: courseId,
          provider: "stripe",
          payment_type: purchaseOption === "one_time" ? "one_time" : "installment",
          status: paid ? "paid" : "pending",
          amount_mxn: amountMxn ?? 0,
          currency: currency ?? "mxn",
          stripe_payment_intent_id: stripePaymentIntentId,
          stripe_checkout_session_id: stripeCheckoutSessionId,
          stripe_customer_id: stripeCustomerId,
          paid_at: paid ? new Date().toISOString() : null,
        });
      }
    }

    await admin.from("enrollments").upsert(
      {
        student_id: userId,
        course_id: courseId,
        status: "active",
        enrolled_at: new Date().toISOString(),
        access_expires_at: accessExpiresAt,
      },
      { onConflict: "student_id,course_id" },
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.metadata?.user_id;
    const courseId = session.metadata?.course_id;

    if (userId && courseId) {
      await unlockCourse({
        userId,
        courseId,
        purchaseOption: session.metadata?.purchase_option,
        amountMxn: session.amount_total ? session.amount_total / 100 : 0,
        currency: session.currency,
        stripeCheckoutSessionId: session.id,
        stripeCustomerId: typeof session.customer === "string" ? session.customer : null,
        paid: session.payment_status === "paid",
      });
    }
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    const userId = paymentIntent.metadata?.user_id;
    const courseId = paymentIntent.metadata?.course_id;

    if (userId && courseId) {
      await unlockCourse({
        userId,
        courseId,
        purchaseOption: paymentIntent.metadata?.purchase_option,
        amountMxn: paymentIntent.amount ? paymentIntent.amount / 100 : 0,
        currency: paymentIntent.currency,
        stripePaymentIntentId: paymentIntent.id,
        stripeCustomerId:
          typeof paymentIntent.customer === "string" ? paymentIntent.customer : null,
        paid: true,
      });
    }
  }

  if (event.type === "invoice.paid") {
    const invoice = event.data.object;
    const subscriptionId =
      typeof invoice.parent?.subscription_details?.subscription === "string"
        ? invoice.parent.subscription_details.subscription
        : null;

    if (subscriptionId) {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const userId = subscription.metadata?.user_id;
      const courseId = subscription.metadata?.course_id;

      if (userId && courseId) {
        const monthsTotal = Number(subscription.metadata?.months_total ?? "1");
        const accessExpiresAt = Number.isFinite(monthsTotal)
          ? new Date(Date.now() + monthsTotal * 30 * 24 * 60 * 60 * 1000).toISOString()
          : null;

        await unlockCourse({
          userId,
          courseId,
          purchaseOption: subscription.metadata?.purchase_option,
          amountMxn: invoice.amount_paid ? invoice.amount_paid / 100 : 0,
          currency: invoice.currency,
          stripeCustomerId:
            typeof subscription.customer === "string" ? subscription.customer : null,
          paid: true,
          accessExpiresAt,
        });
      }
    }
  }

  return NextResponse.json({ received: true });
}
