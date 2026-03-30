import { NextResponse } from "next/server";
import Stripe from "stripe";

import { createClient } from "@/lib/supabase/server";
import { getStripeServerClient } from "@/lib/stripe";

async function findOrCreateCustomer(stripe: Stripe, email: string, userId: string) {
  const existing = await stripe.customers.list({ email, limit: 1 });
  const customer = existing.data[0];

  if (customer) {
    return customer.id;
  }

  const created = await stripe.customers.create({
    email,
    metadata: {
      user_id: userId,
    },
  });

  return created.id;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      courseId?: string;
      courseSlug?: string;
      priceId?: string;
      mode?: "payment" | "subscription";
      purchaseOption?: string;
    };

    const courseId = body.courseId?.trim();
    const courseSlug = body.courseSlug?.trim();
    const priceId = body.priceId?.trim();
    const mode = body.mode === "subscription" ? "subscription" : "payment";
    const purchaseOption = body.purchaseOption?.trim() || "one_time";
    const monthsTotal =
      purchaseOption === "three_month" ? 3 : purchaseOption === "monthly" ? 6 : 1;

    if (!courseId || !courseSlug || !priceId) {
      return NextResponse.json(
        { error: "Missing checkout payload" },
        { status: 400 },
      );
    }

    const supabase = await createClient();
    const stripe = getStripeServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.id || !user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [{ data: course }, { data: enrollment }] = await Promise.all([
      supabase
        .from("courses")
        .select(
          "id, slug, stripe_one_time_price_id, stripe_three_month_price_id, stripe_monthly_price_id",
        )
        .eq("id", courseId)
        .eq("slug", courseSlug)
        .maybeSingle(),
      supabase
        .from("enrollments")
        .select("id")
        .eq("student_id", user.id)
        .eq("course_id", courseId)
        .in("status", ["active", "completed"])
        .maybeSingle(),
    ]);

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    if (enrollment) {
      return NextResponse.json(
        { error: "Course already unlocked for this user" },
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
        payment_method_types: ["card"],
        receipt_email: user.email,
        metadata: {
          user_id: user.id,
          user_email: user.email,
          course_id: courseId,
          course_slug: courseSlug,
          purchase_option: purchaseOption,
          price_id: priceId,
          payment_type: "one_time",
        },
      });

      return NextResponse.json({ clientSecret: paymentIntent.client_secret });
    }

    const customerId = await findOrCreateCustomer(stripe, user.email, user.id);
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
      customer: customerId,
      payment_method_types: ["card"],
      setup_future_usage: "off_session",
      receipt_email: user.email,
      metadata: {
        user_id: user.id,
        user_email: user.email,
        course_id: courseId,
        course_slug: courseSlug,
        purchase_option: purchaseOption,
        price_id: priceId,
        payment_type: "installments",
        plan: purchaseOption,
        months_total: String(monthsTotal),
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
