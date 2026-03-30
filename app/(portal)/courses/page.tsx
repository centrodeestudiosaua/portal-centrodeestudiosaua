import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";

import { getCoursesPageData } from "@/lib/portal/data";

export default async function CoursesPage() {
  await connection();
  const data = await getCoursesPageData();
  const courses = data?.courses ?? [];

  return (
    <div className="space-y-8">
      <header>
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-accent">
          Mis Cursos
        </p>
        <h1 className="mt-3 text-4xl font-bold text-primary">
          Programas e inscripciones activas
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
          Aqui puedes revisar tus programas activos, avance por leccion y acceso
          directo al contenido academico.
        </p>
      </header>

      {courses.length ? (
        <div className="grid gap-6 xl:grid-cols-2">
          {courses.map((course) => (
            <article key={course.id} className="portal-card overflow-hidden">
              <div className="flex h-full flex-col md:flex-row">
                <div className="relative h-56 w-full md:h-auto md:w-56">
                  <Image
                    src={course.thumbnailUrl}
                    alt={course.title}
                    fill
                    sizes="(max-width: 767px) 100vw, 224px"
                    className="object-cover"
                  />
                </div>

                <div className="flex flex-1 flex-col justify-between p-6">
                  <div>
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      {course.badgeText ? (
                        <span className="bg-accent/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-accent">
                          {course.badgeText}
                        </span>
                      ) : null}
                      {course.durationLabel ? (
                        <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                          {course.durationLabel}
                        </span>
                      ) : null}
                    </div>

                    <h2 className="text-2xl font-bold text-primary">
                      {course.title}
                    </h2>
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">
                      {course.description || "Contenido academico disponible."}
                    </p>
                  </div>

                  <div className="mt-6">
                    <div className="mb-2 flex items-center justify-between text-xs font-medium text-primary">
                      <span>Avance general</span>
                      <span>{course.progress}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-accent"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>

                <div className="mt-4 flex items-center justify-between gap-4 text-xs text-muted-foreground">
                      <span>
                        {course.isEnrolled
                          ? `${course.lessonsCompleted}/${course.lessonsTotal} lecciones completadas`
                          : "Disponible para inscripcion"}
                      </span>
                      <Link
                        href={`/courses/${course.slug}`}
                        className="text-xs font-bold uppercase tracking-[0.18em] text-secondary underline underline-offset-4"
                      >
                        {course.isEnrolled ? "Ver curso" : "Comprar curso"}
                      </Link>
                    </div>
                  </div>
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
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
            Cuando tu inscripcion este activa, aqui apareceran tus programas con
            progreso, acceso al contenido y sesiones en vivo.
          </p>
        </section>
      )}
    </div>
  );
}
