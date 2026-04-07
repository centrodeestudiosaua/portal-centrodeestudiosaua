"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, Type, ListChecks, ArrowRight } from "lucide-react";
import { saveCourseCheckout } from "../course-actions";

export default function CheckoutTabClient({ course }: { course: any }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const checkoutData = course.checkout_content_json || {};

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      setMessage(null);
      const res = await saveCourseCheckout(course.id, formData);
      if (res.success) {
        setMessage({ type: "success", text: "Copy comercial guardado." });
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
      
      {/* Sales Copy */}
      <div className="space-y-4">
        <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#9B1D20]">
          <Type className="h-4 w-4" /> Copy Comercial
        </h3>
        
        <div className="rounded-xl border-2 border-slate-100 bg-slate-50 p-5 grid grid-cols-1 gap-4">
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-500">Público Objetivo (Target Audience)</label>
            <input type="text" name="targetAudience" defaultValue={checkoutData.targetAudience?.join(", ") || ""} placeholder="Ej. Abogados, Contadores, Pymes" className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 font-medium outline-none focus:border-[#9B1D20] focus:ring-2 focus:ring-[#9B1D20]/10" />
            <p className="mt-1 text-[10px] text-slate-400">Separado por comas.</p>
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-500">Texto Cierre (Summary Text)</label>
            <textarea name="summaryText" rows={2} defaultValue={checkoutData.summaryText || ""} placeholder="Un resumen convincente para el lado derecho del checkout..." className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 font-medium outline-none resize-none focus:border-[#9B1D20] focus:ring-2 focus:ring-[#9B1D20]/10" />
          </div>
        </div>
      </div>

      {/* Bullets & Benefits */}
      <div className="space-y-4">
        <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#9B1D20]">
          <ListChecks className="h-4 w-4" /> Beneficios Que Incluye
        </h3>
        <p className="text-xs text-slate-500 font-medium">Escribe la lista de beneficios que obtiene el alumno. Sepáralos por saltos de línea (ENTER).</p>
        
        <textarea name="benefits" rows={4} defaultValue={checkoutData.benefits?.join("\n") || ""} placeholder="Acceso de por vida\nGrupo de Crecimiento en VIP\n..." className="w-full rounded-xl border-2 border-slate-100 bg-white p-4 font-medium outline-none resize-none focus:border-[#9B1D20] focus:bg-white focus:ring-4 focus:ring-[#9B1D20]/10" />
      </div>

      {/* FAQ & CTA */}
      <div className="space-y-4">
        <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#9B1D20]">
          <ArrowRight className="h-4 w-4" /> Call To Action y Preguntas
        </h3>
        
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-500">Texto del Botón (CTA)</label>
            <input type="text" name="ctaText" defaultValue={checkoutData.ctaText || "Inscribirme Ahora"} placeholder="Ej. Inscribirme Ahora" className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 font-bold outline-none focus:border-[#9B1D20] focus:ring-2 focus:ring-[#9B1D20]/10" />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-slate-100">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-slate-800 disabled:opacity-50"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Guardar Checkout
        </button>
      </div>
    </form>
  );
}
