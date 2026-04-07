import { connection } from "next/server";
import { BarChart3, TrendingUp, Users, CreditCard } from "lucide-react";
import { createClient as createAdminClient } from "@supabase/supabase-js";

async function getMetrics() {
  const supabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  const [leadsRes, studentsRes, paymentsRes] = await Promise.all([
    supabase.from("leads").select("id", { count: "exact" }),
    supabase.from("student_profiles").select("id", { count: "exact" }).eq("role", "student"),
    supabase.from("payments").select("amount_mxn").in("status", ["paid", "succeeded"]),
  ]);

  const totalRevenue = (paymentsRes.data ?? []).reduce((sum, p) => sum + (p.amount_mxn ?? 0), 0);

  return {
    leads: leadsRes.count ?? 0,
    students: studentsRes.count ?? 0,
    revenue: totalRevenue,
  };
}

export default async function AdminReportesPage() {
  await connection();
  const metrics = await getMetrics();

  const kpis = [
    { title: "Total Leads", value: metrics.leads, icon: Users, color: "text-blue-600", bg: "bg-blue-100" },
    { title: "Total Alumnos", value: metrics.students, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-100" },
    { title: "Ingresos Totales", value: `$${metrics.revenue.toLocaleString("es-MX")}`, icon: CreditCard, color: "text-purple-600", bg: "bg-purple-100" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
          <BarChart3 className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reportes</h1>
          <p className="text-sm text-slate-500">Métricas generales de la plataforma</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {kpis.map((kpi, i) => (
          <div key={i} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex items-start gap-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${kpi.bg} ${kpi.color}`}>
              <kpi.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-1">{kpi.title}</p>
              <p className={`text-3xl font-bold text-slate-900`}>{kpi.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <BarChart3 className="h-10 w-10 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-700">Más reportes próximamente</h3>
        <p className="text-slate-500 text-sm mt-2">Estamos trabajando en gráficas detalladas de conversión y ventas.</p>
      </div>
    </div>
  );
}
