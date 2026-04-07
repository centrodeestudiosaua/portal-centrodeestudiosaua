import { redirect } from "next/navigation";
import { createAdminCourseClient } from "../admin-client";
import PreviewClient from "./preview-client";

export default async function CoursePreviewTab({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminCourseClient();

  const { data: course, error } = await supabase
    .from("courses")
    .select(`
      id,
      title,
      slug,
      description,
      long_description,
      thumbnail_url,
      cover_image_url,
      badge_text,
      urgency_text,
      start_date_label,
      duration_label,
      modality_label,
      access_type,
      price_mxn,
      installment_amount_mxn,
      installments_count,
      stripe_one_time_price_id,
      stripe_three_month_price_id,
      stripe_monthly_price_id,
      is_published,
      benefits,
      target_audience,
      syllabus,
      course_modules (
        title,
        sort_order,
        course_lessons (
          id
        )
      )
    `)
    .eq("id", id)
    .single();

  if (error || !course) {
    redirect("/sys-cursos");
  }

  const publicLandingHref = course.is_published && course.slug ? `/admision/${course.slug}` : null;
  const publicPortalHref = course.is_published && course.slug ? `/courses/${course.slug}` : null;
  return <PreviewClient course={course} publicLandingHref={publicLandingHref} publicPortalHref={publicPortalHref} />;
}
