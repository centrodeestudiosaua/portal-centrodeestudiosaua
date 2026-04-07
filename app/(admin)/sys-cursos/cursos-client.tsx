"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Plus, Loader2, Layers, Trash2 } from "lucide-react";
import { createDraftCourse, deleteCourse } from "./actions";

export default function CursosClient({ cursos }: { cursos: any[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleCreateDraft = () => {
    startTransition(async () => {
      setMessage(null);
      const res = await createDraftCourse();
      if (res.success && res.courseId) {
        router.push(`/sys-cursos/${res.courseId}/general`);
      } else {
        setMessage({ type: "error", text: res.error || "Error al crear programa borrador" });
      }
    });
  };

  const getStatusBadge = (published: boolean) => {
    if (published) {
      return <span className="inline-flex rounded-full bg-emerald-100/80 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-700">Publicado</span>;
    }
    return <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-500">Borrador</span>;
  };

  return (
    <div className="space-y-6">
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#9B1D20]/10 text-[#9B1D20]">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Programas y Cursos</h1>
            <p className="text-sm font-medium text-slate-500">{cursos.length} programas en el catálogo</p>
          </div>
        </div>
        <button
          onClick={handleCreateDraft}
          disabled={isPending}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#9B1D20] px-5 text-sm font-bold text-white shadow-sm shadow-[#9B1D20]/20 transition-all hover:bg-[#7a171a] hover:-translate-y-0.5 disabled:opacity-50"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Crear Programa
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white/70 backdrop-blur-xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">Programa Académico</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">Estatus</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">Precio Base</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80">
              {cursos.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-sm font-medium text-slate-400">Aún no hay cursos creados.</td></tr>
              ) : cursos.map((c: any) => (
                <tr key={c.id} className="transition-colors hover:bg-slate-50/60 group">
                  <td className="px-6 py-4 cursor-pointer" onClick={() => router.push(`/sys-cursos/${c.id}/general`)}>
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
                    {getStatusBadge(c.is_published)}
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-700">
                    {c.price_mxn ? `$${c.price_mxn.toLocaleString("es-MX")} MXN` : "No definido"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <button onClick={() => router.push(`/sys-cursos/${c.id}/general`)} className="text-xs font-bold text-[#9B1D20] hover:underline">
                        Editar Programa
                      </button>
                      {confirmDeleteId === c.id ? (
                        <>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="text-xs font-bold text-slate-500 hover:underline"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() =>
                              startTransition(async () => {
                                const res = await deleteCourse(c.id);
                                if (res.success) {
                                  setConfirmDeleteId(null);
                                  setMessage({ type: "success", text: "Curso eliminado." });
                                  router.refresh();
                                } else {
                                  setMessage({ type: "error", text: res.error });
                                }
                              })
                            }
                            className="inline-flex items-center gap-1 text-xs font-bold text-red-700 hover:underline"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Confirmar
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(c.id)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-red-700 hover:underline"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Borrar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
