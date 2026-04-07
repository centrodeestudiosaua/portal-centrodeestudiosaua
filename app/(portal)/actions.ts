"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getStripeServerClient } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

export async function updateLessonProgress(formData: FormData) {
  const lessonId = String(formData.get("lesson_id") || "");
  const courseId = String(formData.get("course_id") || "");
  const courseSlug = String(formData.get("course_slug") || "");
  const returnTo = String(formData.get("return_to") || "");
  const progressPercent = Number(formData.get("progress_percent") || 0);
  const completed = progressPercent >= 100;

  if (!lessonId || !courseId || !courseSlug) {
    redirect("/dashboard");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    redirect("/auth/login");
  }

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("id")
    .eq("student_id", user.id)
    .eq("course_id", courseId)
    .in("status", ["active", "completed"])
    .maybeSingle();

  if (!enrollment) {
    redirect("/courses");
  }

  await supabase.from("lesson_progress").upsert(
    {
      student_id: user.id,
      course_id: courseId,
      lesson_id: lessonId,
      progress_percent: progressPercent,
      completed,
      last_viewed_at: new Date().toISOString(),
      completed_at: completed ? new Date().toISOString() : null,
    },
    { onConflict: "student_id,lesson_id" },
  );

  revalidatePath("/dashboard");
  revalidatePath("/courses");
  revalidatePath(`/courses/${courseSlug}`);
  revalidatePath(`/lessons/${lessonId}`);
  if (returnTo === "course") {
    redirect(`/courses/${courseSlug}#temario`);
  }
  redirect(`/lessons/${lessonId}`);
}

export async function updateStudentProfile(formData: FormData) {
  const fullName = String(formData.get("full_name") || "").trim();
  const firstName = String(formData.get("first_name") || "").trim();
  const lastName = String(formData.get("last_name") || "").trim();
  const phone = String(formData.get("phone") || "")
    .replace(/\D/g, "")
    .slice(0, 10);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    redirect("/auth/login");
  }

  if (phone && phone.length !== 10) {
    redirect("/settings?error=phone");
  }

  await supabase
    .from("student_profiles")
    .update({
      full_name: fullName,
      first_name: firstName,
      last_name: lastName,
      phone: phone || null,
    })
    .eq("id", user.id);

  revalidatePath("/dashboard");
  revalidatePath("/settings");
  redirect("/settings?saved=1");
}

export async function createCheckoutSession(formData: FormData) {
  const courseId = String(formData.get("course_id") || "");
  const courseSlug = String(formData.get("course_slug") || "");
  const priceId = String(formData.get("price_id") || "");
  const mode = String(formData.get("mode") || "payment");
  const purchaseOption = String(formData.get("purchase_option") || "one_time");
  const successPath =
    String(formData.get("success_path") || "").trim() ||
    `/courses/${courseSlug}?checkout=success`;
  const cancelPath =
    String(formData.get("cancel_path") || "").trim() ||
    `/courses/${courseSlug}?checkout=cancelled`;

  if (!courseId || !courseSlug || !priceId) {
    redirect("/courses");
  }

  const supabase = await createClient();
  const stripe = getStripeServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id || !user.email) {
    redirect("/auth/login");
  }

  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  const protocol = headerStore.get("x-forwarded-proto") ?? "http";
  const origin =
    host && protocol
      ? `${protocol}://${host}`
      : process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: mode === "subscription" ? "subscription" : "payment",
    customer_email: user.email,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}${successPath}`,
    cancel_url: `${origin}${cancelPath}`,
    metadata: {
      user_id: user.id,
      user_email: user.email,
      course_id: courseId,
      course_slug: courseSlug,
      purchase_option: purchaseOption,
    },
  });

  if (!session.url) {
    redirect(`/courses/${courseSlug}?checkout=error`);
  }

  redirect(session.url);
}
