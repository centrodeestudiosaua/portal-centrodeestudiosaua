import Image from "next/image";
import Link from "next/link";
import { BookOpen, CalendarClock, MonitorPlay, TrendingUp } from "lucide-react";
import { connection } from "next/server";

import { Button } from "@/components/ui/button";
import { getDashboardData } from "@/lib/portal/data";

function formatSessionMeta(meta: string) {
  return meta.replace(",", " •");
}

export default async function DashboardPage() {
  await connection();
  const dashboard = await getDashboardData();
  const firstName =
    dashboard?.user.profile?.full_name?.split(" ").filter(Boolean)[0] ||
    dashboard?.user.email ||
    "Alumno";

  const activeCourses = dashboard?.activeCourses ?? [];
  const upcomingClasses = dashboard?.upcomingClasses ?? [];
  const totalLessonsCompleted = activeCourses.reduce(
    (sum, course) => sum + (course.lessonsCompleted ?? 0),
    0,
  );
  const totalLessons = activeCourses.reduce(
    (sum, course) => sum + (course.lessonsTotal ?? 0),
    0,
  );
  const avgProgress = activeCourses.length
    ? Math.round(
        activeCourses.reduce((sum, course) => sum + course.progress, 0) /
          activeCourses.length,
      )
    : 0;

  const heroStats = [
    {
      label: "Inscritos",
      value: String(activeCourses.length),
      icon: BookOpen,
      accent: "bg-accent/18 text-accent",
    },
    {
      label: "Progreso",
      value: `${avgProgress}%`,
      icon: TrendingUp,
      accent: "bg-emerald-400/15 text-emerald-300",
    },
    {
      label: "Lecciones",
      value: `${totalLessonsCompleted}/${totalLessons || 0}`,
      icon: MonitorPlay,
      accent: "bg-blue-400/15 text-blue-200",
    },
  ];

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[28px] border border-white/8 bg-[#232342] text-white shadow-[0_28px_80px_rgba(18,16,37,0.18)]">
        <div className="relative px-8 py-8 sm:px-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_20%,rgba(255,255,255,0.08),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.04),transparent_55%)]" />
          <div className="relative space-y-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
              <div className="flex h-20 w-28 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-[#1d1b39]">
                <div className="text-center">
                  <p className="text-3xl font-bold tracking-[0.18em] text-white">
                    AUA
                  </p>
                  <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.24em] text-white/55">
                    Centro de Estudios
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-accent">
                  Portal del Estudiante
                </p>
                <div>
                  <h1 className="text-3xl font-bold leading-tight sm:text-[2.25rem]">
                    Hola, {firstName}
                  </h1>
                  <p className="mt-1 text-sm text-white/68">
                    Bienvenido a tu panel de control academico
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {heroStats.map((stat) => {
                const Icon = stat.icon;

                return (
                  <article
                    key={stat.label}
                    className="rounded-2xl border border-white/8 bg-white/4 px-5 py-4 backdrop-blur-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.accent}`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/55">
                          {stat.label}
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
            <CalendarClock className="h-4 w-4" />
          </div>
          <h2 className="text-2xl font-bold text-primary">Próximas Clases en Vivo</h2>
        </div>

        {upcomingClasses.length ? (
          <div className="grid gap-5 xl:grid-cols-3">
            {upcomingClasses.map((session, index) => (
              <article
                key={session.id}
                className="rounded-2xl border border-border bg-white p-5 shadow-[0_16px_50px_rgba(24,20,43,0.06)]"
              >
                <p className="inline-flex rounded-md bg-secondary/8 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-secondary">
                  Sesión {index + 1}
                </p>
                <h3 className="mt-4 text-lg font-bold leading-snug text-primary">
                  {session.title}
                </h3>
                <p className="mt-3 text-sm font-medium text-[#8a7a55]">
                  {formatSessionMeta(session.meta)}
                </p>
                <p className="mt-4 text-sm text-slate-500">
                  Enlace próximamente
                </p>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-white px-6 py-5 text-sm text-slate-500">
            Aún no hay clases en vivo programadas.
          </div>
        )}
      </section>

      <section className="space-y-5">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/12 text-accent">
            <BookOpen className="h-4 w-4" />
          </div>
          <h2 className="text-2xl font-bold text-primary">Mis Cursos Inscritos</h2>
        </div>

        {activeCourses.length ? (
          <div className="space-y-5">
            {activeCourses.map((course) => (
              <article
                key={course.id}
                className="overflow-hidden rounded-2xl border border-border bg-white shadow-[0_20px_60px_rgba(22,18,39,0.07)]"
              >
                <div className="flex flex-col md:flex-row">
                  <div className="relative h-64 md:h-auto md:w-[230px]">
                    <Image
                      src={course.cover}
                      alt={course.title}
                      fill
                      sizes="(max-width: 767px) 100vw, 230px"
                      className="object-cover"
                    />
                  </div>

                  <div className="flex flex-1 flex-col p-6 md:p-7">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="space-y-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-accent">
                          {course.category}
                        </p>
                        <h3 className="text-3xl font-bold leading-tight text-primary">
                          {course.title}
                        </h3>
                      </div>

                      {course.priceLabel ? (
                        <div className="rounded-xl bg-[#f7f3ea] px-4 py-2 text-right">
                          <p className="text-sm font-bold text-primary">
                            {course.priceLabel}
                          </p>
                        </div>
                      ) : null}
                    </div>

                    <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-600">
                      {course.description ||
                        "Programa academico activo con acceso al contenido y clases en vivo."}
                    </p>

                    <div className="mt-6">
                      <div className="mb-2 flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.2em] text-[#9f8650]">
                        <span>Progreso del curso</span>
                        <span>
                          {course.lessonsCompleted}/{course.lessonsTotal} lecciones •{" "}
                          {course.progress}%
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-[#ede7da]">
                        <div
                          className="h-full rounded-full bg-accent"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-6 flex flex-col gap-4 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <BookOpen className="h-4 w-4 text-[#9f8650]" />
                        <span>{course.lessonsLabel}</span>
                      </div>

                      <Button
                        asChild
                        className="rounded-xl bg-accent px-6 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white hover:bg-[#b7924d]"
                      >
                        <Link href={course.href}>Acceder al curso</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-white px-6 py-5 text-sm text-slate-500">
            Aún no tienes cursos inscritos.
          </div>
        )}
      </section>
    </div>
  );
}
