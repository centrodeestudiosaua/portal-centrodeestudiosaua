import { redirect } from "next/navigation";
import { ExternalLink, CheckCircle2, AlertCircle, ShoppingBag, Package } from "lucide-react";
import { createAdminCourseClient } from "../admin-client";

export default async function StripeConfigTab({
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

  const isSynced = course.stripe_product_id;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Integración con Stripe</h2>
        <p className="text-sm font-medium text-slate-500">Supervisa la sincronización de inventario con los sistemas de cobro internacionales.</p>
      </div>

      <div className="rounded-2xl border border-slate-200/60 bg-white shadow-sm p-6 space-y-6">
        
        {/* Sync Status Banner */}
        <div className={`flex items-center gap-4 rounded-xl p-4 border ${isSynced ? "bg-emerald-50 border-emerald-100" : "bg-amber-50 border-amber-100"}`}>
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${isSynced ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"}`}>
            {isSynced ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          </div>
          <div>
            <h4 className={`font-bold ${isSynced ? "text-emerald-900" : "text-amber-900"}`}>
              {isSynced ? "Sincronizado Activamente" : "Pendiente de Sincronización"}
            </h4>
            <p className={`text-sm font-medium ${isSynced ? "text-emerald-700" : "text-amber-700"}`}>
              {isSynced 
                ? "Este programa existe en tu catálogo de Stripe y puede procesar pagos en vivo."
                : "Usa el botón superior derecho 'Sincronizar' para generar este programa en Stripe."}
            </p>
          </div>
        </div>

        {/* Matrix of IDs */}
        <div className="space-y-4 pt-4">
          <h3 className="font-bold text-slate-900 uppercase tracking-widest text-xs flex items-center gap-2">
            <Package className="h-4 w-4 text-slate-400" /> Referencias de Catálogo
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Producto Padre (Stripe Product)</p>
              {course.stripe_product_id ? (
                <div className="flex items-center justify-between">
                  <p className="font-mono text-sm font-bold text-slate-800">{course.stripe_product_id}</p>
                  <a href={`https://dashboard.stripe.com/products/${course.stripe_product_id}`} target="_blank" rel="noreferrer" className="text-[#9B1D20] hover:text-[#7a171a] p-1">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              ) : (
                <p className="text-sm font-medium text-slate-400 text-center py-2 h-8">No asimilado</p>
              )}
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Precio Pago Único (Price ID)</p>
              {course.stripe_one_time_price_id ? (
                <div className="flex items-center justify-between">
                  <p className="font-mono text-sm font-bold text-slate-800">{course.stripe_one_time_price_id}</p>
                  <a href={`https://dashboard.stripe.com/prices/${course.stripe_one_time_price_id}`} target="_blank" rel="noreferrer" className="text-[#9B1D20] hover:text-[#7a171a] p-1">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              ) : (
                <p className="text-sm font-medium text-slate-400 text-center py-2 h-8">No asimilado</p>
              )}
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Modelo 3 Meses (Price ID)</p>
              {course.stripe_three_month_price_id ? (
                <div className="flex items-center justify-between">
                  <p className="font-mono text-sm font-bold text-slate-800">{course.stripe_three_month_price_id}</p>
                  <a href={`https://dashboard.stripe.com/prices/${course.stripe_three_month_price_id}`} target="_blank" rel="noreferrer" className="text-[#9B1D20] hover:text-[#7a171a] p-1">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              ) : (
                <p className="text-sm font-medium text-slate-400 text-center py-2 h-8">Inactivo o no asimilado</p>
              )}
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Modelo 6 Meses (Price ID)</p>
              {course.stripe_six_month_price_id ? (
                <div className="flex items-center justify-between">
                  <p className="font-mono text-sm font-bold text-slate-800">{course.stripe_six_month_price_id}</p>
                  <a href={`https://dashboard.stripe.com/prices/${course.stripe_six_month_price_id}`} target="_blank" rel="noreferrer" className="text-[#9B1D20] hover:text-[#7a171a] p-1">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              ) : (
                <p className="text-sm font-medium text-slate-400 text-center py-2 h-8">Inactivo o no asimilado</p>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
