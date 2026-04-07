import { redirect } from "next/navigation";
import GeneralTabClient from "./general-client";
import { createAdminCourseClient } from "../admin-client";

export default async function GeneralTab({
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
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Información General</h2>
        <p className="text-sm font-medium text-slate-500">Configura la identidad pública y descripción del programa.</p>
      </div>
      
      <div className="rounded-2xl border border-slate-200/60 bg-white shadow-sm p-6">
        <GeneralTabClient course={course} />
      </div>
    </div>
  );
}
