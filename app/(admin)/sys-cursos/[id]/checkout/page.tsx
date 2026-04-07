import { redirect } from "next/navigation";
import CheckoutTabClient from "./checkout-client";
import { createAdminCourseClient } from "../admin-client";

export default async function CheckoutTab({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminCourseClient();
  const { data: course, error } = await supabase
    .from("courses")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !course) {
    redirect("/sys-cursos");
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Checkout y Promesas de Venta</h2>
        <p className="text-sm font-medium text-slate-500">Define los bullets de beneficios, CTA y preguntas frecuentes que cierran la compra del alumno en la página.</p>
      </div>
      
      <div className="rounded-2xl border border-slate-200/60 bg-white shadow-sm p-6">
        <CheckoutTabClient course={course} />
      </div>
    </div>
  );
}
