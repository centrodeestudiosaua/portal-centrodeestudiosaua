import Link from "next/link";
import { BookOpenCheck, Medal } from "lucide-react";
import { connection } from "next/server";

import { CertificatesCard } from "@/components/portal/certificates-card";
import { CourseProgressCard } from "@/components/portal/course-progress-card";
import { LibraryPromoCard } from "@/components/portal/library-promo-card";
import { StatCard } from "@/components/portal/stat-card";
import { UpcomingClassesCard } from "@/components/portal/upcoming-classes-card";
import { getDashboardData } from "@/lib/portal/data";

export default async function DashboardPage() {
  await connection();
  const dashboard = await getDashboardData();
  const firstName =
    dashboard?.user.profile?.full_name?.split(" ").filter(Boolean)[0] ||
    dashboard?.user.email ||
    "Alumno";
  const stats = [
    {
      label: "En Curso",
      value: dashboard?.stats[0]?.value ?? "0 Programas",
      icon: BookOpenCheck,
      tone: "info" as const,
    },
    {
      label: "Completados",
      value: dashboard?.stats[1]?.value ?? "0 Diplomas",
      icon: Medal,
      tone: "success" as const,
    },
  ];

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h1 className="text-4xl font-bold leading-tight text-primary">
            Bienvenido de nuevo, {firstName}.
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Continua tu formacion de excelencia en el sector juridico.
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          {stats.map((stat) => (
            <StatCard key={stat.label} stat={stat} />
          ))}
        </div>
      </header>

      <div className="grid grid-cols-12 gap-8">
        <section className="col-span-12 lg:col-span-8">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="portal-section-title">Mis Cursos Activos</h2>
            <Link
              href="/courses"
              className="text-xs font-bold uppercase tracking-[0.18em] text-secondary underline underline-offset-4"
            >
              Ver Todo El Catalogo
            </Link>
          </div>

          <div className="space-y-4">
            {dashboard?.activeCourses.length ? (
              dashboard.activeCourses.map((course) => (
                <CourseProgressCard key={course.id} course={course} />
              ))
            ) : (
              <div className="portal-card p-8">
                <p className="text-sm text-muted-foreground">
                  Aun no tienes programas activos asignados.
                </p>
              </div>
            )}
          </div>
        </section>

        <aside className="col-span-12 space-y-8 lg:col-span-4">
          <UpcomingClassesCard items={dashboard?.upcomingClasses ?? []} />
          <CertificatesCard items={dashboard?.readyCertificates ?? []} />
          <LibraryPromoCard />
        </aside>
      </div>
    </div>
  );
}
