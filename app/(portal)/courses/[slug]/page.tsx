import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { CheckCircle2, Clock3 } from "lucide-react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { getCourseDetail, type CourseDetail as PortalCourseDetail } from "@/lib/portal/data";

function buildModuleProgress(course: PortalCourseDetail) {
  let lessonOffset = 0;
  let sessionOffset = 0;

  return course.syllabus.map((module, index) => {
    const lessonCount = Math.max(module.sesiones ?? 0, 0);
    const moduleLessons =
      lessonCount > 0
        ? course.lessons.slice(lessonOffset, lessonOffset + lessonCount)
        : [];
    const moduleSessions =
      lessonCount > 0
        ? course.sessions.slice(sessionOffset, sessionOffset + lessonCount)
        : [];

    lessonOffset += moduleLessons.length;
    sessionOffset += moduleSessions.length;

    const total = moduleLessons.length;
    const completed = moduleLessons.filter((lesson) => lesson.completed).length;
    const averageProgress =
      total > 0
        ? Math.round(
            moduleLessons.reduce((acc, lesson) => acc + lesson.progressPercent, 0) / total,
          )
        : 0;

    return {
      id: `${module.modulo ?? index}-${module.titulo ?? index}`,
      title: module.titulo ?? `Modulo ${module.modulo ?? index + 1}`,
      label: String(index + 1).padStart(2, "0"),
      sessionsCount: module.sesiones ?? moduleLessons.length ?? 0,
      completedLessons: completed,
      progressPercent: averageProgress,
      topics:
        moduleLessons.length > 0
          ? moduleLessons.map((lesson, lessonIndex) => ({
              id: lesson.id,
              title: lesson.title,
              description: lesson.description,
              progressPercent: lesson.progressPercent,
              sessionDate: moduleSessions[lessonIndex]?.startsAt ?? null,
            }))
          : [],
    };
  });
}

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
  const modules = buildModuleProgress(course);

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
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-700">
              {course.description}
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-border bg-navy-deep p-4 text-white">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/60">
                  Inicio
                </p>
                <p className="mt-2 text-sm font-semibold text-white">
                  {course.startDateLabel || "Por definir"}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-navy-deep p-4 text-white">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/60">
                  Modalidad
                </p>
                <p className="mt-2 text-sm font-semibold text-white">
                  {course.modalityLabel || "Online"}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-navy-deep p-4 text-white">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/60">
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
                  <Link href="#temario">
                    Ver temario
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
              <div className="mt-6 space-y-2 text-sm text-slate-700">
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
        <section id="temario" className="portal-card p-8">
          <h2 className="portal-section-title">Temario del programa</h2>
          <div className="mt-6">
            <Accordion type="single" collapsible className="space-y-4">
              {modules.map((module) => (
                <AccordionItem
                  key={module.id}
                  value={module.id}
                  className="overflow-hidden rounded-[22px] border border-[#eadfd3] bg-white px-6 shadow-[0_14px_40px_rgba(56,42,30,0.06)]"
                >
                  <AccordionTrigger className="py-5 hover:no-underline">
                    <div className="flex w-full flex-col gap-4 pr-4 md:flex-row md:items-center md:justify-between">
                      <div className="flex items-center gap-4">
                        <span className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-secondary text-sm font-bold text-white">
                          {module.label}
                        </span>
                        <div>
                          <p className="text-lg font-bold text-primary">{module.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {module.sessionsCount} sesiones
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-3 md:min-w-[280px]">
                        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                          <span>Progreso del modulo</span>
                          <span className="text-primary">{module.progressPercent}%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-[#ece6db]">
                          <div
                            className="h-full rounded-full bg-accent"
                            style={{ width: `${module.progressPercent}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {module.completedLessons} de {module.sessionsCount} temas revisados
                        </p>
                      </div>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent className="pb-6">
                    {module.topics.length ? (
                      <div className="grid gap-4">
                        {module.topics.map((topic, topicIndex) => (
                          <article
                            key={topic.id}
                            className="rounded-[18px] border border-[#efe7db] bg-[#fcfbf8] p-5"
                          >
                            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-secondary">
                                  Tema {topicIndex + 1}
                                </p>
                                <h3 className="mt-2 text-base font-bold text-primary">
                                  {topic.title}
                                </h3>
                                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                                  {topic.description || "Contenido academico del modulo."}
                                </p>
                              </div>
                              <div className="md:w-[180px]">
                                <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-500">
                                  <span>Avance</span>
                                  <span className="text-primary">{topic.progressPercent}%</span>
                                </div>
                                <div className="h-1.5 overflow-hidden rounded-full bg-[#e7dfd2]">
                                  <div
                                    className="h-full rounded-full bg-accent"
                                    style={{ width: `${topic.progressPercent}%` }}
                                  />
                                </div>
                                {topic.sessionDate ? (
                                  <p className="mt-3 text-xs text-muted-foreground">
                                    {new Intl.DateTimeFormat("es-MX", {
                                      dateStyle: "medium",
                                    }).format(new Date(topic.sessionDate))}
                                  </p>
                                ) : null}
                              </div>
                            </div>
                          </article>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-[18px] border border-dashed border-[#e7dfd2] bg-[#fcfbf8] p-5 text-sm leading-7 text-muted-foreground">
                        Este modulo ya esta habilitado en tu portal. Su contenido visible es el
                        temario operativo de prueba; no incluye video ni recursos adjuntos.
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
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
                    className="rounded-xl border border-[#eadfd3] bg-white p-4 text-card-foreground shadow-[0_14px_40px_rgba(56,42,30,0.06)]"
                  >
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                      {new Intl.DateTimeFormat("es-MX", {
                        dateStyle: "full",
                        timeStyle: "short",
                      }).format(new Date(session.startsAt))}
                    </p>
                    <h3 className="mt-2 text-base font-bold text-primary">
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
            <ul className="mt-6 space-y-3 text-sm leading-7 text-slate-700">
              {course.benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3 border-b border-border pb-3 last:border-b-0">
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-accent" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="portal-card p-8">
            <h2 className="portal-section-title">Estado del avance</h2>
            <div className="mt-6 space-y-4 text-sm text-muted-foreground">
              <div className="flex items-start gap-3 rounded-[18px] border border-[#eadfd3] bg-[#fcfbf8] p-4">
                <Clock3 className="mt-1 h-4 w-4 shrink-0 text-secondary" />
                <p>
                  El curso ya no se presenta como lista de lecciones. Tu avance visible se
                  concentra por modulo para que el alumno vea el temario completo y no una
                  pantalla vacia de contenidos.
                </p>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
