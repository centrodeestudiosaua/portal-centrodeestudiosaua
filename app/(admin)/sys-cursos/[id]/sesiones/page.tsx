import { redirect } from "next/navigation";
import SesionesTabClient from "./sesiones-client";
import { createAdminCourseClient } from "../admin-client";

export default async function SesionesTab({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminCourseClient();

  const { data: course, error } = await supabase
    .from("courses")
    .select("id")
    .eq("id", id)
    .single();

  if (error || !course) {
    redirect("/sys-cursos");
  }

  const { data: sessions } = await supabase
    .from("course_sessions")
    .select("*")
    .eq("course_id", id)
    .order("sort_order", { ascending: true });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Sesiones en Vivo</h2>
        <p className="text-sm font-medium text-slate-500">
          Configura clases en vivo, enlaces de Zoom y grabaciones del programa desde una sola vista.
        </p>
      </div>

      <div className="rounded-[28px] border border-[#e4dacc] bg-white p-6 shadow-sm">
        <SesionesTabClient courseId={id} sessions={sessions || []} />
      </div>
    </div>
  );
}
