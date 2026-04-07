"use client";

import { useState, useTransition } from "react";
import { BookOpen, Plus, X, Loader2 } from "lucide-react";
import { createCourseWithStripe } from "./actions";

export default function CursosClient({ cursos }: { cursos: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const ACCESS_LABELS: Record<string, string> = {
    free: "Gratuito",
    one_time: "Pago único",
    installments: "Mensualidades",
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await createCourseWithStripe(formData);
      if (res.success) {
        setIsOpen(false);
      } else {
        alert(res.error);
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Cursos</h1>
            <p className="text-sm text-slate-500">{cursos.length} cursos publicados en Stripe</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#9B1D20] px-4 text-sm font-semibold text-white transition hover:bg-[#7a171a]"
        >
          <Plus className="h-4 w-4" />
          Crear Curso en Stripe
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">Curso</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">Tipo</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">Precio Regular</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">Mensualidad</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">Duración</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cursos.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-400">Sin cursos registrados</td></tr>
              ) : cursos.map((c: any) => (
                <tr key={c.id} className="hover:bg-slate-50/60">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-800">{c.title}</p>
                    <p className="text-[10px] text-slate-400">/{c.slug}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-violet-100 px-2.5 py-1 text-[10px] font-bold text-violet-700">
                      {ACCESS_LABELS[c.access_type] ?? c.access_type}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {c.price_mxn ? `$${c.price_mxn.toLocaleString("es-MX")} MXN` : "—"}
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {c.access_type === "installments" && c.installment_amount_mxn
                      ? `$${c.installment_amount_mxn.toLocaleString("es-MX")} × ${c.installments_count}`
                      : "—"}
                  </td>
                  <td className="px-5 py-4 text-slate-500">{c.duration_label || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900">Nuevo Curso (Sincronizado vía Stripe)</h2>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Nombre del Curso</label>
                <input required type="text" name="title" placeholder="Ej. Diplomado en Amparo" className="w-full rounded-xl border border-slate-200 px-4 py-2 outline-none focus:border-[#9B1D20]" />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Slug (URL)</label>
                <input required type="text" name="slug" placeholder="Ej. diplomado-en-amparo" className="w-full rounded-xl border border-slate-200 px-4 py-2 outline-none focus:border-[#9B1D20]" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Precio Completo (MXN)</label>
                  <input required type="number" step="0.01" name="priceMxn" placeholder="2400" className="w-full rounded-xl border border-slate-200 px-4 py-2 outline-none focus:border-[#9B1D20]" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Tipo de Acceso</label>
                  <select required name="accessType" className="w-full rounded-xl border border-slate-200 px-4 py-2 outline-none focus:border-[#9B1D20] bg-white">
                    <option value="one_time">Pago Único</option>
                    <option value="installments">Mensualidades</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t pt-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-500">Monto Mensualidad</label>
                  <input type="number" step="0.01" name="installmentMxn" placeholder="(Opcional)" className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-[#9B1D20]" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-500">Cant. Pagos</label>
                  <input type="number" name="installmentsCount" placeholder="(Opcional)" className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-[#9B1D20]" />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Duración (Etiqueta)</label>
                <input type="text" name="durationLabel" placeholder="Ej. 6 meses (abril - octubre)" className="w-full rounded-xl border border-slate-200 px-4 py-2 outline-none focus:border-[#9B1D20]" />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="mt-6 flex w-full h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 font-bold text-white transition hover:bg-slate-800 disabled:opacity-50"
              >
                {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Crear y Publicar en Stripe"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
