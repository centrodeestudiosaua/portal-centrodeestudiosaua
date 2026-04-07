"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, CreditCard, Calendar } from "lucide-react";
import { saveCoursePagos } from "../course-actions";

export default function PagosTabClient({ course }: { course: any }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const [hasOneTime, setHasOneTime] = useState(course.allow_one_time ?? true);
  const [has3Months, setHas3Months] = useState(course.allow_three_month ?? false);
  const [has6Months, setHas6Months] = useState(course.allow_six_month ?? false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.append("allowOneTime", hasOneTime.toString());
    formData.append("allowThreeMonth", has3Months.toString());
    formData.append("allowSixMonth", has6Months.toString());
    
    startTransition(async () => {
      setMessage(null);
      const res = await saveCoursePagos(course.id, formData);
      if (res.success) {
        setMessage({ type: "success", text: "Configuración de pagos guardada." });
        router.refresh();
      } else {
        setMessage({ type: "error", text: res.error });
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      {message ? (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm font-medium ${
            message.type === "error"
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          {message.text}
        </div>
      ) : null}
      
      {/* 1. PAGO UNICO */}
      <div className={`rounded-xl border-2 p-5 transition-colors ${hasOneTime ? "border-[#9B1D20] bg-white" : "border-slate-100 bg-slate-50"}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CreditCard className={`h-5 w-5 ${hasOneTime ? "text-[#9B1D20]" : "text-slate-400"}`} />
            <h3 className={`font-bold ${hasOneTime ? "text-slate-900" : "text-slate-400"}`}>Ofrecer Pago Único de Contado</h3>
          </div>
          <button type="button" onClick={() => setHasOneTime(!hasOneTime)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${hasOneTime ? 'bg-[#9B1D20]' : 'bg-slate-300'}`}>
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${hasOneTime ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
        
        {hasOneTime && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-100">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-slate-500">Monto Total a Cobrar (MXN)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">$</span>
                <input required type="number" step="0.01" name="priceMxn" defaultValue={course.price || ""} placeholder="Ej. 14800.00" className="w-full rounded-lg border border-slate-200 pl-8 pr-4 py-2 font-bold outline-none focus:border-[#9B1D20] focus:ring-2 focus:ring-[#9B1D20]/10" />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-slate-500">Stripe Price ID (Pago Único)</label>
              <input type="text" name="stripeOneTimeId" defaultValue={course.stripe_one_time_price_id || ""} placeholder="Se generará al sincronizar automáticamente" readOnly className="w-full rounded-lg border border-slate-200 bg-slate-100 px-4 py-2 font-mono text-sm text-slate-500 cursor-not-allowed" />
            </div>
          </div>
        )}
      </div>

      {/* 2. MESES 3 */}
      <div className={`rounded-xl border-2 p-5 transition-colors ${has3Months ? "border-[#9B1D20] bg-white" : "border-slate-100 bg-slate-50"}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className={`h-5 w-5 ${has3Months ? "text-[#9B1D20]" : "text-slate-400"}`} />
            <h3 className={`font-bold ${has3Months ? "text-slate-900" : "text-slate-400"}`}>Ofrecer Plan 3 Mensualidades</h3>
          </div>
          <button type="button" onClick={() => setHas3Months(!has3Months)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${has3Months ? 'bg-[#9B1D20]' : 'bg-slate-300'}`}>
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${has3Months ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
        
        {has3Months && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-100">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-slate-500">Monto de Cada Mensualidad (MXN)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">$</span>
                <input required type="number" step="0.01" name="price3Months" defaultValue={course.three_month_price_mxn || ""} placeholder="Ej. 4933.34" className="w-full rounded-lg border border-slate-200 pl-8 pr-4 py-2 font-bold outline-none focus:border-[#9B1D20] focus:ring-2 focus:ring-[#9B1D20]/10" />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-slate-500">Stripe Price ID (3 MSI)</label>
              <input type="text" name="stripe3MonthsId" defaultValue={course.stripe_three_month_price_id || ""} placeholder="Auth-Sync" readOnly className="w-full rounded-lg border border-slate-200 bg-slate-100 px-4 py-2 font-mono text-sm text-slate-500 cursor-not-allowed" />
            </div>
          </div>
        )}
      </div>

      {/* 3. MESES 6 */}
      <div className={`rounded-xl border-2 p-5 transition-colors ${has6Months ? "border-[#9B1D20] bg-white" : "border-slate-100 bg-slate-50"}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className={`h-5 w-5 ${has6Months ? "text-[#9B1D20]" : "text-slate-400"}`} />
            <h3 className={`font-bold ${has6Months ? "text-slate-900" : "text-slate-400"}`}>Ofrecer Plan 6 Mensualidades</h3>
          </div>
          <button type="button" onClick={() => setHas6Months(!has6Months)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${has6Months ? 'bg-[#9B1D20]' : 'bg-slate-300'}`}>
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${has6Months ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
        
        {has6Months && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-100">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-slate-500">Monto de Cada Mensualidad (MXN)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">$</span>
                <input required type="number" step="0.01" name="price6Months" defaultValue={course.six_month_price_mxn || ""} placeholder="Ej. 2466.67" className="w-full rounded-lg border border-slate-200 pl-8 pr-4 py-2 font-bold outline-none focus:border-[#9B1D20] focus:ring-2 focus:ring-[#9B1D20]/10" />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-slate-500">Stripe Price ID (6 MSI)</label>
              <input type="text" name="stripe6MonthsId" defaultValue={course.stripe_six_month_price_id || ""} placeholder="Auth-Sync" readOnly className="w-full rounded-lg border border-slate-200 bg-slate-100 px-4 py-2 font-mono text-sm text-slate-500 cursor-not-allowed" />
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end pt-4 border-t border-slate-100">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-slate-800 disabled:opacity-50"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Guardar Opciones de Pago
        </button>
      </div>
    </form>
  );
}
