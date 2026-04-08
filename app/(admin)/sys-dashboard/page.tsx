import Image from "next/image";
import { connection } from "next/server";
import { Users, GraduationCap, CreditCard, TrendingUp } from "lucide-react";

import { createClient as createAdminClient } from "@supabase/supabase-js";
import { getAdminPublicPath } from "@/lib/admin-routes";

async function getAdminStats() {
  const supabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    { count: totalLeads },
    { count: leadsHoy },
    { count: totalAlumnos },
    { count: alumnosActivos },
  ] = await Promise.all([
    supabase.from("leads").select("*", { count: "exact", head: true }),
    supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .gte("created_at", today.toISOString()),
    supabase
      .from("student_profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "student"),
    supabase
      .from("enrollments")
      .select("*", { count: "exact", head: true })
      .eq("status", "active"),
  ]);

  return { totalLeads, leadsHoy, totalAlumnos, alumnosActivos };
}

export default async function AdminDashboardPage() {
  await connection();
  const stats = await getAdminStats();

  const kpis = [
    {
      label: "Leads Totales",
      value: stats.totalLeads ?? 0,
      sub: `${stats.leadsHoy ?? 0} hoy`,
      icon: Users,
      accent: "bg-blue-400/15 text-blue-300",
    },
    {
      label: "Alumnos Registrados",
      value: stats.totalAlumnos ?? 0,
      sub: "en la plataforma",
      icon: GraduationCap,
      accent: "bg-accent/18 text-accent",
    },
    {
      label: "Inscripciones Activas",
      value: stats.alumnosActivos ?? 0,
      sub: "cursos activos",
      icon: TrendingUp,
      accent: "bg-emerald-400/15 text-emerald-300",
    },
    {
      label: "Ingresos",
      value: "—",
      sub: "ver en Pagos",
      icon: CreditCard,
      accent: "bg-purple-400/15 text-purple-300",
    },
  ];

  return (
    <div className="space-y-7">
      {/* Header */}
      <section className="overflow-hidden rounded-[28px] border border-white/8 bg-[#232342] text-white shadow-[0_28px_80px_rgba(18,16,37,0.18)]">
        <div className="relative px-7 py-7 sm:px-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_20%,rgba(255,255,255,0.08),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.04),transparent_55%)]" />
          <div className="relative space-y-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
              <div className="flex h-20 w-32 shrink-0 items-center justify-center rounded-2xl bg-[#1d1b39]">
                <Image
                  src="/logo.png"
                  alt="Centro de Estudios AUA"
                  width={114}
                  height={60}
                  priority
                  className="object-contain"
                  style={{ width: "114px", height: "auto" }}
                />
              </div>
              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#e87b7e]">
                  Panel de Administración
                </p>
                <div>
                  <h1 className="text-3xl font-bold leading-tight sm:text-[2.25rem]">
                    Dashboard Admin
                  </h1>
                  <p className="mt-1 text-sm text-white/68">
                    Resumen general del Centro de Estudios AUA
                  </p>
                </div>
              </div>
            </div>

            {/* KPIs */}
            <div className="grid gap-3 md:grid-cols-4">
              {kpis.map((kpi) => {
                const Icon = kpi.icon;
                return (
                  <article
                    key={kpi.label}
                    className="rounded-2xl border border-white/8 bg-white/4 px-4 py-4 backdrop-blur-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${kpi.accent}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">{kpi.value}</p>
                        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/55">
                          {kpi.label}
                        </p>
                        <p className="text-[10px] text-white/40">{kpi.sub}</p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Quick links */}
      <section className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Ver Leads nuevos", href: getAdminPublicPath("leads"), color: "bg-blue-50 border-blue-200 text-blue-800" },
          { label: "Ver Alumnos", href: getAdminPublicPath("alumnos"), color: "bg-emerald-50 border-emerald-200 text-emerald-800" },
          { label: "Ver Pagos", href: getAdminPublicPath("pagos"), color: "bg-amber-50 border-amber-200 text-amber-800" },
        ].map((link) => (
          <a
            key={link.href}
            href={link.href}
            className={`rounded-2xl border px-6 py-5 text-sm font-bold transition-all hover:shadow-sm ${link.color}`}
          >
            {link.label} →
          </a>
        ))}
      </section>
    </div>
  );
}
