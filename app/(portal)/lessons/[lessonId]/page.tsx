import Link from "next/link";
import { connection } from "next/server";
import { notFound } from "next/navigation";

import { updateLessonProgress } from "@/app/(portal)/actions";
import { Button } from "@/components/ui/button";
import { getLessonDetail } from "@/lib/portal/data";

const progressSteps = [25, 50, 75, 100];

export default async function LessonPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  await connection();
  const { lessonId } = await params;
  const lesson = await getLessonDetail(lessonId);

  if (!lesson) notFound();

  return (
    <div className="space-y-8">
      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
          <Link href="/courses" className="hover:text-primary">
            Mis Cursos
          </Link>
          <span>/</span>
          <Link href={`/courses/${lesson.course.slug}`} className="hover:text-primary">
            {lesson.course.title}
          </Link>
        </div>
        <h1 className="text-4xl font-bold leading-tight text-primary">
          {lesson.title}
        </h1>
        <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
          {lesson.description || "Contenido academico disponible para tu avance actual."}
        </p>
      </header>

      <section className="portal-card p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-accent">
              Progreso de la leccion
            </p>
            <p className="text-3xl font-bold text-primary">{lesson.progressPercent}%</p>
            <div className="h-2 w-full max-w-xl overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-accent transition-all"
                style={{ width: `${lesson.progressPercent}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {lesson.completed
                ? "Leccion completada."
                : "Actualiza tu avance conforme consumas el contenido."}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:w-[360px]">
            {progressSteps.map((value) => (
              <form key={value} action={updateLessonProgress}>
                <input type="hidden" name="lesson_id" value={lesson.id} />
                <input type="hidden" name="course_id" value={lesson.course.id} />
                <input type="hidden" name="course_slug" value={lesson.course.slug} />
                <input type="hidden" name="progress_percent" value={value} />
                <Button
                  type="submit"
                  variant="default"
                  className={
                    lesson.progressPercent === value
                      ? "w-full rounded-xl border border-[#b7924d] bg-accent px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-primary hover:bg-[#b7924d]"
                      : "w-full rounded-xl border border-[#9B3328] bg-secondary px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white hover:bg-[#812821]"
                  }
                >
                  Marcar {value}%
                </Button>
              </form>
            ))}
          </div>
        </div>
      </section>

      <section className="portal-card p-8">
        <h2 className="portal-section-title">Contenido</h2>
        <div className="mt-6 space-y-6">
          {lesson.videoUrl ? (
            <div className="aspect-video w-full overflow-hidden border border-border bg-black">
              <iframe
                src={lesson.videoUrl}
                title={lesson.title}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="border border-dashed border-border bg-muted/30 p-10 text-sm text-muted-foreground">
              Esta leccion aun no tiene video cargado. El avance ya puede
              gestionarse y despues podemos conectar grabaciones o recursos.
            </div>
          )}

          {lesson.resourceUrl ? (
            <div>
              <Link
                href={lesson.resourceUrl}
                target="_blank"
                className="text-sm font-bold uppercase tracking-[0.18em] text-secondary underline underline-offset-4"
              >
                Abrir recurso adjunto
              </Link>
            </div>
          ) : null}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="portal-card p-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Leccion anterior
          </p>
          {lesson.previousLesson ? (
            <Link
              href={`/lessons/${lesson.previousLesson.id}`}
              className="mt-3 block text-lg font-bold text-primary hover:text-secondary"
            >
              {lesson.previousLesson.title}
            </Link>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              Esta es la primera leccion del programa.
            </p>
          )}
        </div>

        <div className="portal-card p-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Siguiente leccion
          </p>
          {lesson.nextLesson ? (
            <Link
              href={`/lessons/${lesson.nextLesson.id}`}
              className="mt-3 block text-lg font-bold text-primary hover:text-secondary"
            >
              {lesson.nextLesson.title}
            </Link>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              Ya estas en la ultima leccion disponible.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
