"use server";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

function getAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function saveCourseGeneral(courseId: string, formData: FormData) {
  try {
    const admin = getAdminClient();
    
    const updates = {
      title: formData.get("title")?.toString() || "",
      slug: formData.get("slug")?.toString() || "",
      description: formData.get("description")?.toString() || null,
      long_description: formData.get("longDescription")?.toString() || null,
      thumbnail_url: formData.get("thumbnailUrl")?.toString() || null,
      badge_text: formData.get("badgeText")?.toString() || null,
    };

    const { error } = await admin
      .from("courses")
      .update(updates)
      .eq("id", courseId);

    if (error) throw new Error(error.message);

    revalidatePath(`/sys-cursos/${courseId}`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function saveCourseCalendario(courseId: string, formData: FormData) {
  try {
    const admin = getAdminClient();

    const updates: any = {
      start_date: formData.get("startDateLabel")?.toString() || null,
      duration: formData.get("durationLabel")?.toString() || null,
      urgency_text: formData.get("urgencyText")?.toString() || null,
      timezone: formData.get("timezone")?.toString() || "America/Mexico_City",
      modality: formData.get("modalityLabel")?.toString() || null,
    };

    const { error } = await admin
      .from("courses")
      .update(updates)
      .eq("id", courseId);

    if (error) throw new Error(error.message);

    revalidatePath(`/sys-cursos/${courseId}`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function saveCoursePagos(courseId: string, formData: FormData) {
  try {
    const admin = getAdminClient();
    
    const updates = {
      allow_one_time: formData.get("allowOneTime") === "true",
      allow_three_month: formData.get("allowThreeMonth") === "true",
      allow_six_month: formData.get("allowSixMonth") === "true",
      price: parseFloat(formData.get("priceMxn")?.toString() || "0") || null,
      three_month_price_mxn: parseFloat(formData.get("price3Months")?.toString() || "0") || null,
      six_month_price_mxn: parseFloat(formData.get("price6Months")?.toString() || "0") || null,
      first_charge_immediate: formData.get("firstChargeImmediate") !== "false",
      billing_anchor_day: formData.get("billingAnchorDay") ? parseInt(formData.get("billingAnchorDay") as string) : null,
      suspend_on_failed_payment: formData.get("suspendOnFailed") !== "false",
      access_grace_days: parseInt(formData.get("graceDays")?.toString() || "3"),
    };

    const { error } = await admin
      .from("courses")
      .update(updates)
      .eq("id", courseId);

    if (error) throw new Error(error.message);

    revalidatePath(`/sys-cursos/${courseId}`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function syncCourseWithStripe(courseId: string) {
  try {
    const admin = getAdminClient();
    const { data: course, error } = await admin.from("courses").select("*").eq("id", courseId).single();
    if (error || !course) throw new Error("Curso no encontrado.");

    if (!course.title || !course.slug) throw new Error("Falta nombre o slug del curso para publicar.");

    const { getStripeServerClient } = await import("@/lib/stripe");
    const stripe = getStripeServerClient();

    // 1. Upsert Product
    let productId = course.stripe_product_id;
    const stripeImages =
      course.thumbnail_url && /^https?:\/\//.test(course.thumbnail_url)
        ? [course.thumbnail_url]
        : undefined;
    if (!productId) {
      const product = await stripe.products.create({
        name: course.title,
        description: course.description || undefined,
        images: stripeImages,
        metadata: { course_slug: course.slug, supabase_id: courseId },
      });
      productId = product.id;
    } else {
      await stripe.products.update(productId, {
        name: course.title,
        description: course.description || undefined,
        images: stripeImages,
      });
    }

    const priceUpdates: any = { stripe_product_id: productId }; // Disassociated is_published from pure sync

    // 2. Upsert One-Time Price
    if (course.allow_one_time && course.price) {
      const price = await stripe.prices.create({
        product: productId,
        unit_amount: Math.round(course.price * 100),
        currency: "mxn",
        metadata: { course_slug: course.slug },
      });
      priceUpdates.stripe_one_time_price_id = price.id;
      priceUpdates.stripe_price_id = price.id;
    }

    // 3. Upsert 3-Months Price
    if (course.allow_three_month && course.three_month_price_mxn) {
      const price3 = await stripe.prices.create({
        product: productId,
        unit_amount: Math.round(course.three_month_price_mxn * 100),
        currency: "mxn",
        recurring: { interval: "month" },
        metadata: { course_slug: course.slug, installments: "3" },
      });
      priceUpdates.stripe_three_month_price_id = price3.id;
      priceUpdates.stripe_3month_price_id = price3.id;
    }

    // 4. Upsert 6-Months Price
    if (course.allow_six_month && course.six_month_price_mxn) {
      const price6 = await stripe.prices.create({
        product: productId,
        unit_amount: Math.round(course.six_month_price_mxn * 100),
        currency: "mxn",
        recurring: { interval: "month" },
        metadata: { course_slug: course.slug, installments: "6" },
      });
      priceUpdates.stripe_six_month_price_id = price6.id;
      priceUpdates.stripe_monthly_price_id = price6.id;
    }

    const { error: dbUpdateError } = await admin.from("courses").update(priceUpdates).eq("id", courseId);
    if (dbUpdateError) throw new Error(dbUpdateError.message);

    revalidatePath(`/sys-cursos/${courseId}`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function togglePublishCourse(courseId: string, currentStatus: boolean) {
  try {
    const admin = getAdminClient();
    
    // If attempting to publish, run gates
    if (!currentStatus) {
      const { data: course, error } = await admin.from("courses").select(`
        *,
        course_modules (
          id,
          course_lessons (id)
        ),
        course_sessions (id, session_date, zoom_link)
      `).eq("id", courseId).single();
      
      if (error || !course) throw new Error("Curso no encontrado.");

      if (!course.title || course.title.trim() === "") throw new Error("Falta configurar el nombre en la pestaña General.");
      if (!course.slug || course.slug.trim() === "") throw new Error("Falta el slug.");
      if (!course.start_date) throw new Error("Falta la fecha de inicio en el Calendario.");
      
      const hasValidPrice = 
        (course.allow_one_time && course.price > 0) || 
        (course.allow_three_month && course.three_month_price_mxn > 0) || 
        (course.allow_six_month && course.six_month_price_mxn > 0);
        
      if (!hasValidPrice) throw new Error("Debes configurar al menos una modalidad de pago válida en la pestaña Pagos.");

      const modules = course.course_modules || [];
      if (modules.length === 0) throw new Error("El temario debe contener al menos 1 Módulo.");
      
      let totalLessons = 0;
      for (const m of modules) totalLessons += (m.course_lessons?.length || 0);
      if (totalLessons === 0) throw new Error("El temario debe contener al menos 1 Tema.");

      const sessions = course.course_sessions || [];
      for (const s of sessions) {
         if (!s.session_date) throw new Error("Alguna sesión no tiene fecha configurada.");
         if (s.zoom_link && !s.zoom_link.startsWith("http")) {
            throw new Error(`Enlace de Zoom incorrecto en una de las sesiones.`);
         }
      }
    }

    const { error: updateErr } = await admin.from("courses").update({ is_published: !currentStatus }).eq("id", courseId);
    if (updateErr) throw new Error(updateErr.message);

    revalidatePath(`/sys-cursos/${courseId}`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function saveCourseCheckout(courseId: string, formData: FormData) {
  try {
    const admin = getAdminClient();
    
    let targetAudience: string[] = [];
    if (formData.get("targetAudience")) {
      targetAudience = formData.get("targetAudience")!.toString().split(",").map(t => t.trim()).filter(Boolean);
    }
    
    let benefits: string[] = [];
    if (formData.get("benefits")) {
      benefits = formData.get("benefits")!.toString().split("\n").map(t => t.trim()).filter(Boolean);
    }
    
    const checkout_content_json = {
      targetAudience,
      summaryText: formData.get("summaryText")?.toString() || "",
      benefits,
      ctaText: formData.get("ctaText")?.toString() || "Inscribirme",
    };

    const { error } = await admin
      .from("courses")
      .update({ checkout_content_json })
      .eq("id", courseId);

    if (error) throw new Error(error.message);

    revalidatePath(`/sys-cursos/${courseId}`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
