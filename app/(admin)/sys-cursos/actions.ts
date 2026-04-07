"use server";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getStripeServerClient } from "@/lib/stripe";
import { revalidatePath } from "next/cache";

function getAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function createDraftCourse() {
  try {
    const admin = getAdminClient();
    const mockId = Math.random().toString(36).substring(2, 8);
    const slug = `borrador-${mockId}`;

    const { data: course, error } = await admin
      .from("courses")
      .insert({
        title: "Nuevo Programa Académico",
        slug,
        is_published: false,
      })
      .select("id")
      .single();

    if (error || !course) throw new Error(error?.message || "No se pudo crear el borrador");

    revalidatePath("/sys-cursos");
    return { success: true, courseId: course.id };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteCourse(courseId: string) {
  try {
    const admin = getAdminClient();

    const { data: modules } = await admin
      .from("course_modules")
      .select("id")
      .eq("course_id", courseId);

    const moduleIds = (modules ?? []).map((module: { id: string }) => module.id);

    await admin.from("course_sessions").delete().eq("course_id", courseId);

    if (moduleIds.length > 0) {
      await admin.from("course_lessons").delete().in("module_id", moduleIds);
    }

    await admin.from("course_modules").delete().eq("course_id", courseId);

    const { error } = await admin.from("courses").delete().eq("id", courseId);
    if (error) throw new Error(error.message);

    revalidatePath("/sys-cursos");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function createCourseWithStripe(formData: FormData) {
  try {
    const admin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const title = formData.get("title") as string;
    const slug = formData.get("slug") as string;
    const description = formData.get("description") as string;
    const thumbnailUrl = formData.get("thumbnailUrl") as string;
    const accessType = formData.get("accessType") as string; // 'one_time' or 'installments'
    const priceMxn = Number(formData.get("priceMxn"));
    const installmentMxn = Number(formData.get("installmentMxn") || priceMxn);
    const installmentsCount = Number(formData.get("installmentsCount") || 1);
    const durationLabel = formData.get("durationLabel") as string;

    if (!title || !slug || !priceMxn) {
      throw new Error("Faltan datos obligatorios para crear el curso.");
    }

    const stripe = getStripeServerClient();

    // 1. Create Product in Stripe
    const product = await stripe.products.create({
      name: title,
      description: description || undefined,
      images: thumbnailUrl ? [thumbnailUrl] : undefined,
      metadata: { course_slug: slug }
    });

    let priceId = "";

    // 2. Create Price in Stripe
    if (accessType === "one_time") {
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: Math.round(priceMxn * 100),
        currency: "mxn",
      });
      priceId = price.id;
    } else {
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: Math.round(installmentMxn * 100),
        currency: "mxn",
      });
      priceId = price.id;
    }

    // 3. Save to Supabase Courses Table
    const { error } = await admin.from("courses").insert({
      title,
      slug,
      description: description || null,
      thumbnail_url: thumbnailUrl || null,
      access_type: accessType,
      price_mxn: priceMxn,
      installment_amount_mxn: accessType === "installments" ? installmentMxn : null,
      installments_count: accessType === "installments" ? installmentsCount : null,
      duration_label: durationLabel || null,
      stripe_one_time_price_id: accessType === "one_time" ? priceId : null,
      stripe_monthly_price_id: accessType === "installments" ? priceId : null,
      is_published: true
    });

    if (error) {
      throw new Error(`Error en base de datos: ${error.message}`);
    }

    revalidatePath("/sys-cursos");
    return { success: true };

  } catch (err: any) {
    console.error("Course creation error:", err);
    return { success: false, error: err.message || "Error al conectar con Stripe o Base de Datos" };
  }
}
