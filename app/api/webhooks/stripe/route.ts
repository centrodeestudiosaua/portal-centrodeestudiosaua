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

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.metadata?.user_id;
    const courseId = session.metadata?.course_id;
    const purchaseOption = session.metadata?.purchase_option ?? "one_time";

    if (userId && courseId) {
      const { data: existingPayment } = await admin
        .from("payments")
        .select("id")
        .eq("stripe_checkout_session_id", session.id)
        .maybeSingle();

      if (!existingPayment) {
        await admin.from("payments").insert({
          student_id: userId,
          course_id: courseId,
          provider: "stripe",
          payment_type: purchaseOption === "one_time" ? "one_time" : "installment",
          status: session.payment_status === "paid" ? "paid" : "pending",
          amount_mxn: session.amount_total ? session.amount_total / 100 : 0,
          currency: session.currency ?? "mxn",
          stripe_checkout_session_id: session.id,
          stripe_customer_id:
            typeof session.customer === "string" ? session.customer : null,
          paid_at: session.payment_status === "paid" ? new Date().toISOString() : null,
        });
      }

      await admin.from("enrollments").upsert(
        {
          student_id: userId,
          course_id: courseId,
          status: "active",
          enrolled_at: new Date().toISOString(),
        },
        { onConflict: "student_id,course_id" },
      );
    }
  }

  return NextResponse.json({ received: true });
}
