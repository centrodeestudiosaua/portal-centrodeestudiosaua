"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Cloud, ExternalLink, Loader2, Play } from "lucide-react";
import Link from "next/link";
import { getAdminBrowserCustomPath, getAdminBrowserPath } from "@/lib/admin-routes";
import { syncCourseWithStripe, togglePublishCourse } from "./course-actions";

export default function CourseBuilderHeader({ course }: { course: any }) {
  const router = useRouter();
  const [isPendingSync, startTransitionSync] = useTransition();
  const [isPendingPublish, startTransitionPublish] = useTransition();
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const coursesHref = getAdminBrowserPath("cursos");
  const previewHref = getAdminBrowserCustomPath(`/sys-cursos/${course.id}/preview`);

  const handleGlobalSync = () => {
    startTransitionSync(async () => {
      setMessage(null);
      const res = await syncCourseWithStripe(course.id);
      if (res.success) {
        setMessage({ type: "success", text: "Programa sincronizado correctamente con Stripe." });
        router.refresh();
      } else {
        setMessage({ type: "error", text: `Error de sincronización: ${res.error}` });
      }
    });
  };

  const handleTogglePublish = () => {
    startTransitionPublish(async () => {
      setMessage(null);
      const res = await togglePublishCourse(course.id, course.is_published);
      if (res.success) {
        setMessage({
          type: "success",
          text: course.is_published ? "Programa despublicado." : "Programa publicado correctamente.",
        });
        router.refresh();
      } else {
        setMessage({ type: "error", text: res.error });
      }
    });
  };

  return (
    <div className="shrink-0 border-b border-[#e8decf] bg-[#fbf8f3] px-6 py-4">
      <div className="flex items-start justify-between gap-6">
        <div className="flex items-start gap-4">
          <Link
            href={coursesHref}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-500 transition-colors hover:bg-[#f1ebe2] hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="max-w-[420px] truncate font-sans text-[16px] font-semibold text-slate-900">
              {course.title || "Curso sin nombre"}
            </h1>
            <div className="mt-1 flex items-center gap-2">
              {course.is_published ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span> Publicado
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span> Borrador
                </span>
              )}
              <span className="text-[10px] font-medium text-slate-300">|</span>
              <span className="font-mono text-[10px] font-medium text-slate-400">{course.id.split("-")[0]}</span>
            </div>
            {message ? (
              <div
                className={`mt-3 rounded-xl border px-3 py-2 text-sm font-medium ${
                  message.type === "error"
                    ? "border-red-200 bg-red-50 text-red-700"
                    : "border-emerald-200 bg-emerald-50 text-emerald-700"
                }`}
              >
                {message.text}
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          {course.id ? (
            <Link
              href={previewHref}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#e8decf] bg-white px-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Ver vista previa
            </Link>
          ) : null}

          <button
            onClick={handleGlobalSync}
            disabled={isPendingSync || isPendingPublish}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-white px-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-700 transition hover:bg-[#f1ebe2] disabled:opacity-50"
          >
            {isPendingSync ? <Loader2 className="h-3 w-3 animate-spin" /> : <Cloud className="h-3 w-3" />}
            Sincronizar Stripe
          </button>

          <button
            onClick={handleTogglePublish}
            disabled={isPendingPublish || isPendingSync}
            className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl px-6 text-xs font-bold uppercase tracking-[0.18em] shadow-sm transition-all disabled:opacity-50 ${
              course.is_published
                ? "bg-slate-800 text-white hover:bg-slate-900"
                : "bg-[#9B1D20] text-white hover:bg-[#7a171a]"
            }`}
          >
            {isPendingPublish ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
            {course.is_published ? "Despublicar" : "Publicar"}
          </button>
        </div>
      </div>
    </div>
  );
}
