"use server";

import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

function getAdminClient() {
  const { createClient } = require("@supabase/supabase-js");
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function createSession(courseId: string, data: any) {
  try {
    const admin = await getAdminClient();

    const { data: lastSession } = await admin
      .from("course_sessions")
      .select("sort_order")
      .eq("course_id", courseId)
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextOrder = (lastSession?.sort_order ?? 0) + 1;

    const { error } = await admin
      .from("course_sessions")
      .insert({
        course_id: courseId,
        title: data.title,
        description: data.description || null,
        starts_at: data.starts_at,
        provider: data.provider || "zoom",
        meeting_url: data.meeting_url || null,
        recording_url: data.recording_url || null,
        sort_order: nextOrder,
        is_published: data.is_published ?? true,
      });

    if (error) throw new Error(error.message);
    revalidatePath(`/sys-cursos/${courseId}/sesiones`);
    revalidatePath(`/sys-cursos/${courseId}`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateSession(sessionId: string, courseId: string, updates: any) {
  try {
    const admin = await getAdminClient();
    const { error } = await admin.from("course_sessions").update(updates).eq("id", sessionId);
    if (error) throw new Error(error.message);
    revalidatePath(`/sys-cursos/${courseId}/sesiones`);
    revalidatePath(`/sys-cursos/${courseId}`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteSession(sessionId: string, courseId: string) {
  try {
    const admin = await getAdminClient();
    const { error } = await admin.from("course_sessions").delete().eq("id", sessionId);
    if (error) throw new Error(error.message);
    revalidatePath(`/sys-cursos/${courseId}/sesiones`);
    revalidatePath(`/sys-cursos/${courseId}`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
