import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

import { createClient } from "@/lib/supabase/server";
import { getStripeServerClient } from "@/lib/stripe";

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

    const headerStore = await headers();
    const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
    const protocol = headerStore.get("x-forwarded-proto") ?? "http";
    const origin =
      host && protocol
        ? `${protocol}://${host}`
        : process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const sessionParams = {
      ui_mode: "embedded",
      mode,
      customer_email: user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      return_url: `${origin}/courses/${courseSlug}?checkout=success`,
      metadata: {
        user_id: user.id,
        user_email: user.email,
        course_id: courseId,
        course_slug: courseSlug,
        purchase_option: purchaseOption,
      },
    } as unknown as Stripe.Checkout.SessionCreateParams;

    const session = await stripe.checkout.sessions.create(sessionParams);

    if (!session.client_secret) {
      return NextResponse.json(
        { error: "Embedded session missing client_secret" },
        { status: 500 },
      );
    }

    return NextResponse.json({ clientSecret: session.client_secret });
  } catch (error) {
    const message =
      error instanceof Stripe.errors.StripeError
        ? error.message
        : error instanceof Error
          ? error.message
          : "No se pudo crear la sesion de checkout";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
