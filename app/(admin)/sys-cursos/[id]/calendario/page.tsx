import { redirect } from "next/navigation";
import CalendarioTabClient from "./calendario-client";
import { createAdminCourseClient } from "../admin-client";

export default async function CalendarioTab({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminCourseClient();
  const { data: course, error } = await supabase
    .from("courses")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !course) {
    redirect("/sys-cursos");
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Calendario y Operación</h2>
        <p className="text-sm font-medium text-slate-500">Ajusta los tiempos del curso y la modalidad operativa de impartición.</p>
      </div>
      
      <div className="rounded-[28px] border border-[#e4dacc] bg-white p-6 shadow-sm">
        <CalendarioTabClient course={course} />
      </div>
    </div>
  );
}
