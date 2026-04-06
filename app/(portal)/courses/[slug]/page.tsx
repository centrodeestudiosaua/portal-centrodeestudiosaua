import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import { Button } from "@/components/ui/button";
import { getCourseDetail } from "@/lib/portal/data";

export default async function CourseDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ checkout?: string }>;
}) {
  await connection();
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const course = await getCourseDetail(slug);

  if (!course) notFound();

  return (
    <div className="space-y-8">
      <section className="portal-card overflow-hidden">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="p-8">
            <div className="flex flex-wrap items-center gap-3">
              {course.badgeText ? (
                <span className="bg-accent/12 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                  {course.badgeText}
                </span>
              ) : null}
              {course.urgencyText ? (
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-secondary">
                  {course.urgencyText}
                </span>
              ) : null}
            </div>

            <h1 className="mt-4 text-4xl font-bold leading-tight text-primary">
              {course.title}
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground">
              {course.description}
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-border bg-navy-deep p-4 text-white">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  Inicio
                </p>
                <p className="mt-2 text-sm font-semibold text-white">
                  {course.startDateLabel || "Por definir"}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-navy-deep p-4 text-white">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  Modalidad
                </p>
                <p className="mt-2 text-sm font-semibold text-white">
                  {course.modalityLabel || "Online"}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-navy-deep p-4 text-white">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  Duracion
                </p>
                <p className="mt-2 text-sm font-semibold text-white">
                  {course.durationLabel || "Programa activo"}
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              {course.isEnrolled ? (
                <Button asChild className="rounded-xl bg-accent px-6 py-2 text-xs font-bold uppercase tracking-[0.18em] text-primary hover:bg-[#b7924d]">
                  <Link href={course.lessons[0] ? `/lessons/${course.lessons[0].id}` : "/courses"}>
                    Entrar al curso
                  </Link>
                </Button>
              ) : (
                <Button
                  asChild
                  className="rounded-xl bg-accent px-6 py-2 text-xs font-bold uppercase tracking-[0.18em] text-primary hover:bg-[#b7924d]"
                >
                  <Link href={`/checkout?course_slug=${course.slug}`}>
                    Ir al checkout
                  </Link>
                </Button>
              )}
            </div>

            {!course.isEnrolled && course.purchaseOptions.length ? (
              <div className="mt-6 space-y-2 text-sm text-muted-foreground">
                {course.purchaseOptions.map((option) => (
                  <p key={option.code}>
                    <span className="font-semibold text-primary">{option.label}:</span>{" "}
                    {option.description}
                  </p>
                ))}
              </div>
            ) : null}
          </div>

          <div className="relative min-h-[320px]">
            <Image
              src={course.thumbnailUrl || "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80"}
              alt={course.title}
              fill
              loading="eager"
              priority
              sizes="(max-width: 1023px) 100vw, 40vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {query.checkout === "success" ? (
        <section className="border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Pago recibido. Si el acceso no aparece de inmediato, recarga la página en unos segundos.
        </section>
      ) : null}

      {query.checkout === "cancelled" ? (
        <section className="border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          El pago fue cancelado antes de completarse.
        </section>
      ) : null}

      <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="portal-card p-8">
          <h2 className="portal-section-title">Lecciones del programa</h2>
          <div className="mt-6 space-y-4">
            {course.lessons.map((lesson) => (
              <article
                key={lesson.id}
                className="rounded-xl border border-border bg-navy-deep p-4 text-white"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-accent">
                      Leccion {lesson.sortOrder}
                    </p>
                    <h3 className="mt-2 text-lg font-bold text-white">
                      {course.isEnrolled ? (
                        <Link
                          href={`/lessons/${lesson.id}`}
                          className="hover:text-accent"
                        >
                          {lesson.title}
                        </Link>
                      ) : (
                        lesson.title
                      )}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">
                      {lesson.description || "Contenido disponible en tu acceso."}
                    </p>
                  </div>
                  <div className="w-full max-w-[220px]">
                    <div className="mb-2 flex items-center justify-between text-xs font-medium text-white">
                      <span>Progreso</span>
                      <span>{lesson.progressPercent}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/20">
                      <div
                        className="h-full bg-accent"
                        style={{ width: `${lesson.progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
                {course.isEnrolled ? (
                  <div className="mt-4">
                    <Link
                      href={`/lessons/${lesson.id}`}
                      className="text-xs font-bold uppercase tracking-[0.18em] text-accent underline underline-offset-4"
                    >
                      Abrir leccion
                    </Link>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </section>

        <aside className="space-y-8">
          {course.isEnrolled ? (
            <section className="portal-card p-8">
              <h2 className="portal-section-title">Proximas sesiones</h2>
              <div className="mt-6 space-y-4">
                {course.sessions.map((session) => (
                  <article
                    key={session.id}
                    className="rounded-xl border-l-2 border-secondary bg-navy-deep p-4 text-white"
                  >
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                      {new Intl.DateTimeFormat("es-MX", {
                        dateStyle: "full",
                        timeStyle: "short",
                      }).format(new Date(session.startsAt))}
                    </p>
                    <h3 className="mt-2 text-base font-bold text-white">
                      {session.title}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">
                      {session.description}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          <section className="portal-card p-8">
            <h2 className="portal-section-title">Beneficios</h2>
            <ul className="mt-6 space-y-3 text-sm leading-7 text-muted-foreground">
              {course.benefits.map((benefit) => (
                <li key={benefit} className="border-b border-border pb-3 last:border-b-0">
                  {benefit}
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
