import Image from "next/image";
import Link from "next/link";
import { BookOpen, History } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { CourseProgressItem } from "@/components/portal/types";

export function CourseProgressCard({ course }: { course: CourseProgressItem }) {
  return (
    <article className="portal-card overflow-hidden">
      <div className="flex h-full flex-col md:flex-row">
        <div className="relative h-56 w-full overflow-hidden md:h-auto md:w-48">
          <Image
            src={course.cover}
            alt={course.title}
            fill
            sizes="(max-width: 767px) 100vw, 192px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="flex flex-1 flex-col justify-between p-6">
          <div>
            <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
                {course.category}
              </span>
              <span className="text-[10px] italic text-muted-foreground">
                {course.expiry}
              </span>
            </div>

            <h3 className="mb-4 text-2xl font-bold leading-tight text-primary">
              {course.title}
            </h3>

            <div className="mb-4">
              <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-primary">
                <span>Progreso del curso</span>
                <span>{course.progress}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-accent transition-all"
                  style={{ width: `${course.progress}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-2 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <BookOpen className="h-3.5 w-3.5" />
                {course.lessonsLabel}
              </span>
              <span className="flex items-center gap-1">
                <History className="h-3.5 w-3.5" />
                {course.lastSeen}
              </span>
            </div>

            <Button
              asChild
              className="rounded-none bg-primary px-6 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white hover:bg-secondary"
            >
              <Link href={course.href}>Continuar</Link>
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
