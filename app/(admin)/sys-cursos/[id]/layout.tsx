import { redirect } from "next/navigation";
import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import CourseBuilderNav from "./course-builder-nav";
import CourseBuilderHeader from "./course-builder-header";
import { createAdminCourseClient } from "./admin-client";

export default async function CourseBuilderLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  const admin = createAdminCourseClient();
  const { data: course, error } = await admin
    .from("courses")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !course) {
    redirect("/sys-cursos");
  }

  return (
    <div className="flex h-[calc(100vh-theme(spacing.16))] flex-col bg-[#f6f2ea] sm:h-screen">
      <CourseBuilderHeader course={course} />

      <div className="flex flex-1 overflow-hidden">
        <div className="hidden w-[280px] border-r border-[#e8decf] bg-[#fbf8f3] md:block">
          <CourseBuilderNav courseId={course.id} />
        </div>

        <main className="flex-1 overflow-y-auto bg-[#f6f2ea] p-6">
          <div className="mx-auto max-w-[1360px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
