"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Circle } from "lucide-react";

export function TopicProgressButton({
  lessonId,
  courseId,
  courseSlug,
  moduleId,
  completed,
}: {
  lessonId: string;
  courseId: string;
  courseSlug: string;
  moduleId: string;
  completed: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isCompleted, setIsCompleted] = useState(completed);

  if (isCompleted) {
    return (
      <div className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-[14px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
        <CheckCircle2 className="h-4 w-4" />
        Tema completado
      </div>
    );
  }

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          const response = await fetch("/api/portal/lesson-progress", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              lessonId,
              courseId,
              courseSlug,
              progressPercent: 100,
            }),
          });

          if (!response.ok) return;

          setIsCompleted(true);
          router.replace(`/courses/${courseSlug}?module=${encodeURIComponent(moduleId)}#temario`);
          router.refresh();
        });
      }}
      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-[14px] border border-[#eadfd3] bg-white px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] text-primary transition-colors hover:border-accent hover:bg-accent/5 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <Circle className="h-4 w-4" />
      {isPending ? "Guardando..." : "Marcar tema"}
    </button>
  );
}
