"use server";

import { revalidatePath } from "next/cache";

type OrderedModule = {
  id: string;
  sort_order: number;
};

type OrderedLesson = {
  id: string;
  sort_order: number;
};

function getAdminClient() {
  // Use raw lib instantiation for auth override if we need service_role,
  // or just use generic server client if service_role is not required for these basic actions.
  // We'll import raw client for service_role access avoiding RLS.
  const { createClient } = require("@supabase/supabase-js");
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// ------------------------------------------------------------------
// MÓDULOS
// ------------------------------------------------------------------
export async function createModule(courseId: string, title: string) {
  try {
    const admin = await getAdminClient();
    
    const { data: maxRecord } = await admin
      .from("course_modules")
      .select("sort_order")
      .eq("course_id", courseId)
      .order("sort_order", { ascending: false })
      .limit(1)
      .single();

    const nextOrder = (maxRecord?.sort_order ?? 0) + 1;

    const { error } = await admin
      .from("course_modules")
      .insert({
        course_id: courseId,
        title,
        sort_order: nextOrder,
      });

    if (error) throw new Error(error.message);
    revalidatePath(`/sys-cursos/${courseId}`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateModule(moduleId: string, courseId: string, updates: { title?: string; description?: string }) {
  try {
    const admin = await getAdminClient();
    const { error } = await admin.from("course_modules").update(updates).eq("id", moduleId);
    if (error) throw new Error(error.message);
    revalidatePath(`/sys-cursos/${courseId}`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteModule(moduleId: string, courseId: string) {
  try {
    const admin = await getAdminClient();
    const { error } = await admin.from("course_modules").delete().eq("id", moduleId);
    if (error) throw new Error(error.message);
    revalidatePath(`/sys-cursos/${courseId}`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function moveModule(moduleId: string, courseId: string, direction: "up" | "down") {
  try {
    const admin = await getAdminClient();
    
    // Auth client is needed to perform complex operations cleanly, or we can fetch all and update
    const { data: modules } = await admin
      .from("course_modules")
      .select("id, sort_order")
      .eq("course_id", courseId)
      .order("sort_order", { ascending: true });

    if (!modules) return { success: false, error: "No modules found" };

    const currentIndex = modules.findIndex((module: OrderedModule) => module.id === moduleId);
    if (currentIndex === -1) return { success: false, error: "Module not found" };

    const swapIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (swapIndex < 0 || swapIndex >= modules.length) return { success: true }; // At bounds, do nothing

    const currentModule = modules[currentIndex];
    const swapModule = modules[swapIndex];

    // Swap orders
    await admin.from("course_modules").update({ sort_order: swapModule.sort_order }).eq("id", currentModule.id);
    await admin.from("course_modules").update({ sort_order: currentModule.sort_order }).eq("id", swapModule.id);

    revalidatePath(`/sys-cursos/${courseId}`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ------------------------------------------------------------------
// LECCIONES (TEMAS)
// ------------------------------------------------------------------
export async function createLesson(moduleId: string, courseId: string, title: string) {
  try {
    const admin = await getAdminClient();
    const { data: maxRecord } = await admin
      .from("course_lessons")
      .select("sort_order")
      .eq("module_id", moduleId)
      .order("sort_order", { ascending: false })
      .limit(1)
      .single();

    const nextOrder = (maxRecord?.sort_order ?? 0) + 1;

    const { data: moduleRecord, error: moduleError } = await admin
      .from("course_modules")
      .select("course_id")
      .eq("id", moduleId)
      .single();

    if (moduleError || !moduleRecord?.course_id) {
      throw new Error("No se pudo resolver el curso del módulo.");
    }

    const { error } = await admin
      .from("course_lessons")
      .insert({
        module_id: moduleId,
        course_id: moduleRecord.course_id,
        title,
        sort_order: nextOrder,
        is_published: true,
      });

    if (error) throw new Error(error.message);
    revalidatePath(`/sys-cursos/${courseId}`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateLesson(lessonId: string, courseId: string, updates: { title?: string; description?: string; duration_minutes?: number | null; is_published?: boolean }) {
  try {
    const admin = await getAdminClient();
    const { error } = await admin.from("course_lessons").update(updates).eq("id", lessonId);
    if (error) throw new Error(error.message);
    revalidatePath(`/sys-cursos/${courseId}`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteLesson(lessonId: string, courseId: string) {
  try {
    const admin = await getAdminClient();
    const { error } = await admin.from("course_lessons").delete().eq("id", lessonId);
    if (error) throw new Error(error.message);
    revalidatePath(`/sys-cursos/${courseId}`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function moveLesson(lessonId: string, moduleId: string, courseId: string, direction: "up" | "down") {
  try {
    const admin = await getAdminClient();
    const { data: lessons } = await admin
      .from("course_lessons")
      .select("id, sort_order")
      .eq("module_id", moduleId)
      .order("sort_order", { ascending: true });

    if (!lessons) return { success: false, error: "No lessons found" };

    const currentIndex = lessons.findIndex((lesson: OrderedLesson) => lesson.id === lessonId);
    if (currentIndex === -1) return { success: false, error: "Lesson not found" };

    const swapIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (swapIndex < 0 || swapIndex >= lessons.length) return { success: true };

    const currentLesson = lessons[currentIndex];
    const swapLesson = lessons[swapIndex];

    await admin.from("course_lessons").update({ sort_order: swapLesson.sort_order }).eq("id", currentLesson.id);
    await admin.from("course_lessons").update({ sort_order: currentLesson.sort_order }).eq("id", swapLesson.id);

    revalidatePath(`/sys-cursos/${courseId}`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
