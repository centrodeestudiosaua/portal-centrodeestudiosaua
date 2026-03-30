import { connection } from "next/server";
import { notFound, redirect } from "next/navigation";

import { CheckoutPageContent } from "@/components/portal/checkout-page-content";
import { getCourseDetail } from "@/lib/portal/data";

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ course_slug?: string; checkout?: string }>;
}) {
  await connection();
  const query = await searchParams;
  const courseSlug = query.course_slug;

  if (!courseSlug) {
    redirect("/courses");
  }

  const course = await getCourseDetail(courseSlug);

  if (!course) notFound();

  if (course.isEnrolled) {
    redirect(`/courses/${course.slug}`);
  }

  return (
    <div className="space-y-6">
      {query.checkout === "cancelled" ? (
        <section className="border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          El pago fue cancelado antes de completarse.
        </section>
      ) : null}

      <CheckoutPageContent course={course} />
    </div>
  );
}
