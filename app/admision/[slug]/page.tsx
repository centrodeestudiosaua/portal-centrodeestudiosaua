import { notFound } from "next/navigation";

import { PublicAdmissionPage } from "@/components/portal/public-admission-page";
import { getPublicAdmissionCourse } from "@/lib/portal/data";

export default async function AdmissionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = await getPublicAdmissionCourse(slug);

  if (!course) notFound();

  return <PublicAdmissionPage course={course} />;
}
