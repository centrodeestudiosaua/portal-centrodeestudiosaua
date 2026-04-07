import { redirect } from "next/navigation";
import TemarioTabClient from "./temario-client";
import { createAdminCourseClient } from "../admin-client";

export default async function TemarioTab({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminCourseClient();

  const { data: course, error } = await supabase
    .from("courses")
    .select("id, title")
    .eq("id", id)
    .single();

  if (error || !course) {
    redirect("/sys-cursos");
  }

  // Fetch modules correctly sorted by order
  const { data: modules } = await supabase
    .from("course_modules")
    .select(`
      id,
      title,
      description,
      sort_order,
      course_lessons (
        id,
        title,
        description,
        duration_minutes,
        sort_order,
        is_published
      )
    `)
    .eq("course_id", id)
    .order("sort_order", { ascending: true });

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Estructura Académica</h2>
        <p className="text-sm font-medium text-slate-500">
          Organiza el contenido en submódulos principales y temas específicos para el alumno.
        </p>
      </div>

      <div className="flex-1 overflow-hidden rounded-[28px] border border-[#e4dacc] bg-white shadow-sm">
        <TemarioTabClient courseId={id} modules={modules || []} />
      </div>
    </div>
  );
}
