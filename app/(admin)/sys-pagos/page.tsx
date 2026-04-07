import { connection } from "next/server";
import { CreditCard } from "lucide-react";
import { createClient as createAdminClient } from "@supabase/supabase-js";

async function getPagos() {
  const supabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  const { data } = await supabase
    .from("payments")
    .select("id, course_id, payment_type, status, amount_mxn, currency, created_at, student_profiles(full_name, email), courses(title)")
    .order("created_at", { ascending: false })
    .limit(200);

  return data ?? [];
}

const STATUS_COLOR: Record<string, string> = {
  paid: "bg-green-100 text-green-700",
  succeeded: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  open: "bg-blue-100 text-blue-700",
  void: "bg-red-100 text-red-700",
};

export default async function AdminPagosPage() {
  await connection();
  const pagos = await getPagos();

  const total = pagos
    .filter((p: any) => p.status === "paid" || p.status === "succeeded")
    .reduce((sum: number, p: any) => sum + (p.amount_mxn ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
            <CreditCard className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Pagos</h1>
            <p className="text-sm text-slate-500">{pagos.length} transacciones</p>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-sm text-right">
          <p className="text-2xl font-bold text-slate-900">
            ${total.toLocaleString("es-MX")} MXN
          </p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">Total cobrado</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">Alumno</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">Curso</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">Tipo</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">Monto</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">Estado</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pagos.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-400">Sin pagos registrados</td></tr>
              ) : pagos.map((p: any) => {
                const profile = Array.isArray(p.student_profiles) ? p.student_profiles[0] : p.student_profiles;
                const course = Array.isArray(p.courses) ? p.courses[0] : p.courses;
                return (
                  <tr key={p.id} className="hover:bg-slate-50/60">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-800">{profile?.full_name || "—"}</p>
                      <p className="text-[10px] text-slate-400">{profile?.email}</p>
                    </td>
                    <td className="px-5 py-4 text-slate-600 text-xs">{course?.title || "—"}</td>
                    <td className="px-5 py-4 text-slate-500 text-xs capitalize">{p.payment_type}</td>
                    <td className="px-5 py-4 font-semibold text-slate-800">
                      {p.amount_mxn ? `$${p.amount_mxn.toLocaleString("es-MX")}` : "—"}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${STATUS_COLOR[p.status] ?? "bg-slate-100 text-slate-600"}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-400 text-xs whitespace-nowrap">
                      {new Date(p.created_at).toLocaleDateString("es-MX")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
