import Link from "next/link";
import { BookOpen, CreditCard } from "lucide-react";
import { connection } from "next/server";

import { CourseCoverImage } from "@/components/portal/course-cover-image";
import { Button } from "@/components/ui/button";
import { getCoursesPageData } from "@/lib/portal/data";

export default async function CoursesPage() {
  await connection();
  const data = await getCoursesPageData();
  const courses = data?.courses ?? [];
  const enrolledCount = courses.filter((course) => course.isEnrolled).length;

  const statCards = [
    { label: "Disponibles", value: String(courses.length) },
    { label: "Inscritos", value: String(enrolledCount) },
  ];

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-primary">Mis Cursos</h1>
          <p className="mt-3 text-sm leading-7 text-slate-500">
            Consulta el contenido activo de tu academia.
          </p>
        </div>

        <div className="flex gap-3">
          {statCards.map((stat) => (
            <div
              key={stat.label}
              className="min-w-[110px] rounded-xl border border-border bg-white px-4 py-3 shadow-sm"
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                {stat.label}
              </p>
              <p className="mt-2 text-3xl font-bold text-primary">{stat.value}</p>
            </div>
          ))}
        </div>
      </header>

      {courses.length ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => (
            <article
              key={course.id}
              className="overflow-hidden rounded-2xl border border-border bg-white shadow-[0_18px_50px_rgba(21,18,40,0.06)]"
            >
              <div className="relative h-44 w-full">
                <CourseCoverImage
                  src={course.thumbnailUrl}
                  alt={course.title}
                  sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 33vw"
                  className="object-cover"
                />
                {course.isEnrolled ? (
                  <span className="absolute right-4 top-4 rounded-full bg-emerald-500 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white">
                    Inscrito
                  </span>
                ) : null}
              </div>

              <div className="p-5">
                <h2 className="text-xl font-bold text-primary">{course.title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {course.description || "Contenido academico disponible."}
                </p>

                <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-[#ebe7da]">
                  <div
                    className="h-full bg-accent"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>

                <div className="mt-5 flex flex-col gap-4 border-t border-border pt-4">
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-slate-400" />
                      {course.lessonsTotal} lecciones
                    </span>
                    {course.priceLabel ? (
                      <span className="flex items-center gap-2 font-semibold text-primary">
                        <CreditCard className="h-4 w-4 text-slate-400" />
                        {course.priceLabel}
                      </span>
                    ) : null}
                  </div>

                  <Button
                    asChild
                    className="w-full rounded-md bg-primary px-6 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white hover:bg-[#2a2950]"
                  >
                    <Link href={`/courses/${course.slug}`}>
                      {course.isEnrolled ? "Acceder al curso" : "Ver curso"}
                    </Link>
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <section className="portal-card max-w-4xl p-10">
          <h2 className="text-2xl font-bold text-primary">
            Aun no tienes cursos asignados
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500">
            Cuando tu inscripcion este activa, aqui apareceran tus programas con
            progreso, acceso al contenido y sesiones en vivo.
          </p>
        </section>
      )}
    </div>
  );
}
