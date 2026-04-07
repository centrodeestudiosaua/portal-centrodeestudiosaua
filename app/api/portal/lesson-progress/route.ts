import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      lessonId?: string;
      courseId?: string;
      courseSlug?: string;
      progressPercent?: number;
    };

    const lessonId = String(body.lessonId || "");
    const courseId = String(body.courseId || "");
    const courseSlug = String(body.courseSlug || "");
    const progressPercent = Number(body.progressPercent || 0);
    const completed = progressPercent >= 100;

    if (!lessonId || !courseId || !courseSlug) {
      return NextResponse.json({ error: "Missing lesson payload" }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: enrollment } = await supabase
      .from("enrollments")
      .select("id")
      .eq("student_id", user.id)
      .eq("course_id", courseId)
      .in("status", ["active", "completed"])
      .maybeSingle();

    if (!enrollment) {
      return NextResponse.json({ error: "Enrollment not found" }, { status: 403 });
    }

    await supabase.from("lesson_progress").upsert(
      {
        student_id: user.id,
        course_id: courseId,
        lesson_id: lessonId,
        progress_percent: progressPercent,
        completed,
        last_viewed_at: new Date().toISOString(),
        completed_at: completed ? new Date().toISOString() : null,
      },
      { onConflict: "student_id,lesson_id" },
    );

    revalidatePath("/dashboard");
    revalidatePath("/courses");
    revalidatePath(`/courses/${courseSlug}`);
    revalidatePath(`/lessons/${lessonId}`);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected error" },
      { status: 500 },
    );
  }
}
