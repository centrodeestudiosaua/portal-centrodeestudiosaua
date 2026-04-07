"use client";

import { useState, useTransition, useEffect } from "react";
import { BookOpen, Plus, X, Loader2, Image as ImageIcon, AlignLeft, Link as LinkIcon, DollarSign, Calendar, CreditCard } from "lucide-react";
import { createCourseWithStripe } from "./actions";

export default function CursosClient({ cursos }: { cursos: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [accessType, setAccessType] = useState<"one_time" | "installments">("one_time");

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  const ACCESS_LABELS: Record<string, string> = {
    free: "Gratuito",
    one_time: "Pago único",
    installments: "Mensualidades",
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.append("accessType", accessType);
    
    startTransition(async () => {
      const res = await createCourseWithStripe(formData);
      if (res.success) {
        setIsOpen(false);
        setAccessType("one_time");
      } else {
        alert(res.error);
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#9B1D20]/10 text-[#9B1D20]">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Catálogo de Cursos</h1>
            <p className="text-sm font-medium text-slate-500">{cursos.length} programas sincronizados</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#9B1D20] px-5 text-sm font-bold text-white shadow-sm shadow-[#9B1D20]/20 transition-all hover:bg-[#7a171a] hover:-translate-y-0.5"
        >
          <Plus className="h-4 w-4" />
          Crear Programa
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white/70 backdrop-blur-xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">Programa Académico</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">Modalidad</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">Precio Base</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">Esquema</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">Duración</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80">
              {cursos.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-sm font-medium text-slate-400">Aún no hay cursos creados.</td></tr>
              ) : cursos.map((c: any) => (
                <tr key={c.id} className="transition-colors hover:bg-slate-50/60 group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {c.thumbnail_url ? (
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-slate-100 border border-slate-200/60">
                          <img src={c.thumbnail_url} alt={c.title} className="h-full w-full object-cover" />
                        </div>
                      ) : (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 border border-slate-200/60 text-slate-400">
                          <BookOpen className="h-4 w-4" />
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-slate-800 group-hover:text-[#9B1D20] transition-colors">{c.title}</p>
                        <p className="text-[11px] font-medium text-slate-400 leading-tight block truncate max-w-[200px]">/{c.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${
                      c.access_type === "installments" ? "bg-amber-100/80 text-amber-700" : "bg-emerald-100/80 text-emerald-700"
                    }`}>
                      {c.access_type === "installments" ? <Calendar className="h-3 w-3" /> : <CreditCard className="h-3 w-3" />}
                      {ACCESS_LABELS[c.access_type] ?? c.access_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-700">
                    {c.price_mxn ? `$${c.price_mxn.toLocaleString("es-MX")} MXN` : "—"}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-500">
                    {c.access_type === "installments" && c.installment_amount_mxn
                      ? `$${c.installment_amount_mxn.toLocaleString("es-MX")} × ${c.installments_count}`
                      : "Pago Total"}
                  </td>
                  <td className="px-6 py-4 text-xs font-semibold text-slate-500">{c.duration_label || "No especificada"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Premium Glassmorphic Modal */}
      <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 transition-all duration-300 ${isOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"}`}>
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300" onClick={() => setIsOpen(false)} />
        
        <div className={`relative w-full max-w-2xl overflow-hidden rounded-[24px] bg-white shadow-2xl transition-all duration-300 ${isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-8"}`}>
          {/* Header */}
          <div className="bg-slate-50/80 border-b border-slate-100 px-6 py-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Publicar Nuevo Programa</h2>
              <p className="text-xs font-semibold mt-1 text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><DollarSign className="h-3 w-3" /> Sincronización Automática con Stripe</p>
            </div>
            <button onClick={() => setIsOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200/60 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-900">
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              
              <div className="col-span-full">
                <label className="mb-1.5 flex items-center gap-2 text-sm font-bold text-slate-700">
                  <BookOpen className="h-4 w-4 text-slate-400" /> Nombre del Programa
                </label>
                <input required type="text" name="title" placeholder="Ej. Diplomado Experto en Constitucional" className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium outline-none transition-all focus:border-[#9B1D20] focus:bg-white focus:ring-4 focus:ring-[#9B1D20]/10" />
              </div>

              <div className="col-span-full">
                <label className="mb-1.5 flex items-center gap-2 text-sm font-bold text-slate-700">
                  <AlignLeft className="h-4 w-4 text-slate-400" /> Descripción Corta
                </label>
                <textarea name="description" rows={2} placeholder="Una descripción atractiva para tu curso..." className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium outline-none transition-all focus:border-[#9B1D20] focus:bg-white focus:ring-4 focus:ring-[#9B1D20]/10 resize-none" />
              </div>

              <div>
                <label className="mb-1.5 flex items-center gap-2 text-sm font-bold text-slate-700">
                  <LinkIcon className="h-4 w-4 text-slate-400" /> Slug (URL Amigable)
                </label>
                <input required type="text" name="slug" placeholder="ej-diplomado-amparo" className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium outline-none transition-all focus:border-[#9B1D20] focus:bg-white focus:ring-4 focus:ring-[#9B1D20]/10 font-mono" />
              </div>

              <div>
                <label className="mb-1.5 flex items-center gap-2 text-sm font-bold text-slate-700">
                  <ImageIcon className="h-4 w-4 text-slate-400" /> URL de Portada (Opcional)
                </label>
                <input type="url" name="thumbnailUrl" placeholder="https://..." className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium outline-none transition-all focus:border-[#9B1D20] focus:bg-white focus:ring-4 focus:ring-[#9B1D20]/10" />
              </div>

              {/* Advanced Access Plan Toggles */}
              <div className="col-span-full pt-4 border-t border-slate-100">
                <label className="mb-3 block text-sm font-bold text-slate-700">Selecciona el Plan de Pago Base</label>
                <div className="grid grid-cols-2 gap-4">
                  <div 
                    onClick={() => setAccessType("one_time")}
                    className={`cursor-pointer rounded-2xl border-2 p-4 transition-all ${accessType === "one_time" ? "border-[#9B1D20] bg-[#9B1D20]/5 shadow-sm" : "border-slate-100 hover:border-slate-300 bg-white"}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className={`font-bold ${accessType === "one_time" ? "text-[#9B1D20]" : "text-slate-700"}`}>Pago Único</p>
                      <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${accessType === "one_time" ? "border-[#9B1D20]" : "border-slate-300"}`}>
                        {accessType === "one_time" && <div className="h-2 w-2 rounded-full bg-[#9B1D20]" />}
                      </div>
                    </div>
                    <p className="text-xs font-medium text-slate-500">Un solo cobro total.</p>
                  </div>

                  <div 
                    onClick={() => setAccessType("installments")}
                    className={`cursor-pointer rounded-2xl border-2 p-4 transition-all ${accessType === "installments" ? "border-[#9B1D20] bg-[#9B1D20]/5 shadow-sm" : "border-slate-100 hover:border-slate-300 bg-white"}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className={`font-bold ${accessType === "installments" ? "text-[#9B1D20]" : "text-slate-700"}`}>Mensualidades</p>
                      <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${accessType === "installments" ? "border-[#9B1D20]" : "border-slate-300"}`}>
                        {accessType === "installments" && <div className="h-2 w-2 rounded-full bg-[#9B1D20]" />}
                      </div>
                    </div>
                    <p className="text-xs font-medium text-slate-500">Dividir el precio en meses.</p>
                  </div>
                </div>
              </div>

              {/* Dynamic Price Fields depending on Toggle */}
              <div className="col-span-full grid grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 mt-2">
                <div className={accessType === "one_time" ? "col-span-2" : "col-span-1"}>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Valor Total (MXN)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">$</span>
                    <input required type="number" step="0.01" name="priceMxn" placeholder="2400.00" className="w-full rounded-xl border border-slate-200 bg-white pl-8 pr-4 py-2.5 text-sm font-bold outline-none transition-all focus:border-[#9B1D20] focus:ring-4 focus:ring-[#9B1D20]/10" />
                  </div>
                </div>

                {accessType === "installments" && (
                  <>
                    <div className="col-span-1">
                      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Cada Mes (MXN)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">$</span>
                        <input required type="number" step="0.01" name="installmentMxn" placeholder="800.00" className="w-full rounded-xl border border-slate-200 bg-white pl-8 pr-4 py-2.5 text-sm font-bold outline-none transition-all focus:border-[#9B1D20] focus:ring-4 focus:ring-[#9B1D20]/10" />
                      </div>
                    </div>
                    <div className="col-span-1">
                      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Pagos</label>
                      <input required type="number" name="installmentsCount" placeholder="3" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold outline-none transition-all focus:border-[#9B1D20] focus:ring-4 focus:ring-[#9B1D20]/10" />
                    </div>
                  </>
                )}

                <div className={accessType === "one_time" ? "col-span-1" : "col-span-full mt-2"}>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Vigencia Acceso</label>
                  <input type="text" name="durationLabel" placeholder="Ej. Acceso de por vida" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold outline-none transition-all focus:border-[#9B1D20] focus:ring-4 focus:ring-[#9B1D20]/10" />
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-full rounded-xl border border-slate-200 bg-white py-3.5 font-bold text-slate-700 transition-all hover:bg-slate-50 focus:ring-4 focus:ring-slate-100"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3.5 font-bold text-white shadow-xl shadow-slate-900/20 transition-all hover:bg-slate-800 disabled:opacity-50"
              >
                {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Publicar y Confirmar en Stripe"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
