import { connection } from "next/server";
import { BookOpen } from "lucide-react";
import { createClient as createAdminClient } from "@supabase/supabase-js";

async function getCursos() {
  const supabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  const { data } = await supabase
    .from("courses")
    .select("id, slug, title, access_type, price_mxn, installment_amount_mxn, installments_count, duration_label, created_at")
    .order("created_at", { ascending: false });

  return data ?? [];
}

export default async function AdminCursosPage() {
  await connection();
  const cursos = await getCursos();

  const ACCESS_LABELS: Record<string, string> = {
    free: "Gratuito",
    one_time: "Pago único",
    installments: "Mensualidades",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
          <BookOpen className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Cursos</h1>
          <p className="text-sm text-slate-500">{cursos.length} cursos en el catálogo</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">Curso</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">Tipo</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">Precio</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">Duración</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cursos.length === 0 ? (
                <tr><td colSpan={4} className="px-5 py-10 text-center text-slate-400">Sin cursos registrados</td></tr>
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
                    {c.access_type === "installments" && c.installment_amount_mxn
                      ? `$${c.installment_amount_mxn.toLocaleString("es-MX")} × ${c.installments_count} meses`
                      : c.price_mxn
                      ? `$${c.price_mxn.toLocaleString("es-MX")} MXN`
                      : "—"}
                  </td>
                  <td className="px-5 py-4 text-slate-500">{c.duration_label || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
