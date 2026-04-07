"use server";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getStripeServerClient } from "@/lib/stripe";
import { revalidatePath } from "next/cache";

export async function createCourseWithStripe(formData: FormData) {
  try {
    const admin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const title = formData.get("title") as string;
    const slug = formData.get("slug") as string;
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
