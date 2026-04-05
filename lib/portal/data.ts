import { cache } from "react";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";

type StudentProfile = {
  id: string;
  email: string;
  full_name: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  role: "admin" | "student";
  membership_label: string | null;
  avatar_url: string | null;
};

type DashboardCourseRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  badge_text: string | null;
  thumbnail_url: string | null;
  cover_image_url: string | null;
  access_type: "free" | "one_time" | "installments";
  duration_label: string | null;
  price_mxn?: number | null;
  installment_amount_mxn?: number | null;
  installments_count?: number | null;
  stripe_one_time_price_id?: string | null;
  stripe_three_month_price_id?: string | null;
  stripe_monthly_price_id?: string | null;
  course_lessons: { id: string }[] | null;
  lesson_progress:
    | {
        completed: boolean;
        progress_percent: number;
        last_viewed_at: string | null;
      }[]
    | null;
};

type DashboardSessionRow = {
  id: string;
  title: string;
  description: string | null;
  starts_at: string;
  meeting_url: string | null;
};

type CertificateRow = {
  id: string;
  course_id: string;
  file_url: string | null;
  issued_at: string;
  courses: { title: string } | { title: string }[] | null;
};

function takeFirst<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export type PortalUser = {
  id: string;
  email: string;
  profile: StudentProfile | null;
};

export type DashboardCourse = {
  id: string;
  slug: string;
  category: string;
  title: string;
  cover: string;
  progress: number;
  lessonsLabel: string;
  lastSeen: string;
  expiry: string;
  href: string;
};

export type DashboardSession = {
  id: string;
  month: string;
  day: string;
  title: string;
  meta: string;
  highlighted?: boolean;
};

export type DashboardCertificate = {
  id: string;
  title: string;
  fileUrl: string | null;
};

export type CourseListItem = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  thumbnailUrl: string;
  badgeText: string | null;
  durationLabel: string | null;
  accessType: "free" | "one_time" | "installments";
  progress: number;
  lessonsCompleted: number;
  lessonsTotal: number;
  isEnrolled: boolean;
};

export type PurchaseOption = {
  code: "one_time" | "three_month" | "monthly";
  label: string;
  description: string;
  priceId: string;
  mode: "payment" | "subscription";
};

export type CourseDetail = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  longDescription: string | null;
  thumbnailUrl: string | null;
  badgeText: string | null;
  urgencyText: string | null;
  durationLabel: string | null;
  modalityLabel: string | null;
  startDateLabel: string | null;
  priceMxn: number | null;
  installmentAmountMxn: number | null;
  installmentsCount: number | null;
  benefits: string[];
  targetAudience: string[];
  syllabus: Array<{ modulo?: string; titulo?: string; sesiones?: number }>;
  isEnrolled: boolean;
  purchaseOptions: PurchaseOption[];
  lessons: Array<{
    id: string;
    title: string;
    description: string | null;
    sortOrder: number;
    completed: boolean;
    progressPercent: number;
  }>;
  sessions: Array<{
    id: string;
    title: string;
    description: string | null;
    startsAt: string;
    meetingUrl: string | null;
  }>;
};

export type LessonDetail = {
  id: string;
  title: string;
  description: string | null;
  videoUrl: string | null;
  resourceUrl: string | null;
  progressPercent: number;
  completed: boolean;
  course: {
    id: string;
    slug: string;
    title: string;
  };
  previousLesson: {
    id: string;
    title: string;
  } | null;
  nextLesson: {
    id: string;
    title: string;
  } | null;
};

export type PublicAdmissionCourse = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  longDescription: string | null;
  thumbnailUrl: string | null;
  badgeText: string | null;
  urgencyText: string | null;
  durationLabel: string | null;
  modalityLabel: string | null;
  startDateLabel: string | null;
  priceMxn: number | null;
  installmentAmountMxn: number | null;
  installmentsCount: number | null;
  benefits: string[];
  targetAudience: string[];
  syllabus: Array<{ modulo?: string; titulo?: string; sesiones?: number }>;
  purchaseOptions: PurchaseOption[];
};

function formatLastSeen(lastViewedAt: string | null, fallback = "Sin actividad") {
  if (!lastViewedAt) return fallback;

  const viewedAt = new Date(lastViewedAt);
  if (Number.isNaN(viewedAt.getTime())) return fallback;

  const now = new Date();
  const diffMs = now.getTime() - viewedAt.getTime();
  const dayMs = 1000 * 60 * 60 * 24;
  const days = Math.floor(diffMs / dayMs);

  if (days <= 0) return "Hoy";
  if (days === 1) return "Ayer";
  return `Hace ${days} dias`;
}

function formatSessionDate(startsAt: string) {
  const date = new Date(startsAt);
  return {
    month: new Intl.DateTimeFormat("es-MX", {
      month: "short",
      timeZone: "UTC",
    })
      .format(date)
      .replace(".", "")
      .toUpperCase(),
    day: new Intl.DateTimeFormat("es-MX", {
      day: "2-digit",
      timeZone: "UTC",
    }).format(date),
    meta: new Intl.DateTimeFormat("es-MX", {
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "UTC",
    }).format(date),
  };
}

function toCourseCategory(accessType: string, badgeText: string | null) {
  if (badgeText) return badgeText;
  if (accessType === "installments") return "Programa en Parcialidades";
  if (accessType === "one_time") return "Curso Online";
  return "Programa Academico";
}

function toCover(thumbnailUrl: string | null, coverImageUrl: string | null) {
  const legacyAssetHost = "https://cixfitucqskplvfbavzq.supabase.co/";
  const chosen = thumbnailUrl || coverImageUrl;

  if (chosen?.startsWith(legacyAssetHost)) {
    return "/diplomadoamparo.png";
  }

  return (
    chosen ||
    "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80"
  );
}

function getPurchaseOptions(course: {
  price_mxn?: number | null;
  installment_amount_mxn?: number | null;
  installments_count?: number | null;
  stripe_one_time_price_id?: string | null;
  stripe_three_month_price_id?: string | null;
  stripe_monthly_price_id?: string | null;
}): PurchaseOption[] {
  const options: PurchaseOption[] = [];

  if (course.stripe_one_time_price_id) {
    options.push({
      code: "one_time",
      label: "Pago total",
      description: course.price_mxn
        ? `$${course.price_mxn.toLocaleString("es-MX")} MXN`
        : "Pago unico",
      priceId: course.stripe_one_time_price_id,
      mode: "payment",
    });
  }

  if (course.stripe_three_month_price_id) {
    options.push({
      code: "three_month",
      label: "Plan trimestral",
      description: "Suscripcion trimestral",
      priceId: course.stripe_three_month_price_id,
      mode: "subscription",
    });
  }

  if (course.stripe_monthly_price_id) {
    options.push({
      code: "monthly",
      label: "Mensualidades",
      description:
        course.installment_amount_mxn && course.installments_count
          ? `${course.installments_count} pagos de $${course.installment_amount_mxn.toLocaleString("es-MX")} MXN`
          : "Plan mensual",
      priceId: course.stripe_monthly_price_id,
      mode: "subscription",
    });
  }

  return options;
}

async function getAuthenticatedPortalUser(): Promise<PortalUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id || !user.email) return null;

  const { data: profile } = await supabase
    .from("student_profiles")
    .select(
      "id, email, full_name, first_name, last_name, phone, role, membership_label, avatar_url",
    )
    .eq("id", user.id)
    .maybeSingle<StudentProfile>();

  return {
    id: user.id,
    email: user.email,
    profile: profile ?? null,
  };
}

function createAdminPortalClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase admin configuration");
  }

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export const getPortalUser = getAuthenticatedPortalUser;

export async function getDashboardData(): Promise<{
  user: PortalUser;
  stats: { label: string; value: string }[];
  activeCourses: DashboardCourse[];
  upcomingClasses: DashboardSession[];
  readyCertificates: DashboardCertificate[];
} | null> {
  const user = await getPortalUser();
  if (!user) return null;

  const supabase = createAdminPortalClient();

  const [{ data: enrollments }, { data: sessions }, { data: certificates }] =
    await Promise.all([
      supabase
        .from("enrollments")
        .select(
          `
          id,
          status,
          access_expires_at,
          courses (
            id,
            slug,
            title,
            description,
            badge_text,
            thumbnail_url,
            cover_image_url,
            access_type,
            duration_label,
            course_lessons ( id ),
            lesson_progress (
              completed,
              progress_percent,
              last_viewed_at
            )
          )
        `,
        )
        .eq("student_id", user.id)
        .in("status", ["active", "completed"]),
      supabase
        .from("course_sessions")
        .select(
          `
          id,
          title,
          description,
          starts_at,
          meeting_url,
          courses!inner (
            enrollments!inner ( student_id )
          )
        `,
        )
        .eq("courses.enrollments.student_id", user.id)
        .gte("starts_at", new Date().toISOString())
        .eq("is_published", true)
        .order("starts_at", { ascending: true })
        .limit(3),
      supabase
        .from("certificates")
        .select(
          `
          id,
          course_id,
          file_url,
          issued_at,
          courses ( title )
        `,
        )
        .eq("student_id", user.id)
        .order("issued_at", { ascending: false })
        .limit(5),
    ]);

  const activeCourses: DashboardCourse[] = (enrollments ?? [])
    .map((enrollment) => {
      const course = takeFirst(enrollment.courses as DashboardCourseRow | DashboardCourseRow[] | null);
      if (!course) return null;

      const lessonsTotal = course.course_lessons?.length ?? 0;
      const progressRows = course.lesson_progress ?? [];
      const lessonsCompleted = progressRows.filter((item) => item.completed).length;
      const totalProgress =
        lessonsTotal > 0
          ? Math.round(
              progressRows.reduce(
                (sum, item) => sum + (item.progress_percent ?? 0),
                0,
              ) / lessonsTotal,
            )
          : 0;
      const latestSeen =
        progressRows
          .map((item) => item.last_viewed_at)
          .filter(Boolean)
          .sort()
          .at(-1) ?? null;

      return {
        id: course.id,
        slug: course.slug,
        category: toCourseCategory(course.access_type, course.badge_text),
        title: course.title,
        cover: toCover(course.thumbnail_url, course.cover_image_url),
        progress: totalProgress,
        lessonsLabel: `${lessonsCompleted}/${lessonsTotal} Lecciones`,
        lastSeen: `Ultima vez: ${formatLastSeen(latestSeen)}`,
        expiry: enrollment.access_expires_at
          ? `Acceso hasta ${new Intl.DateTimeFormat("es-MX").format(new Date(enrollment.access_expires_at))}`
          : course.duration_label || "Acceso activo",
        href: `/courses/${course.slug}`,
      };
    })
    .filter((course): course is DashboardCourse => Boolean(course));

  const upcomingClasses: DashboardSession[] = (sessions as DashboardSessionRow[] | null)?.map(
    (session, index) => {
      const formatted = formatSessionDate(session.starts_at);

      return {
        id: session.id,
        month: formatted.month,
        day: formatted.day,
        title: session.title,
        meta: session.meeting_url
          ? `${formatted.meta} • Zoom`
          : formatted.meta,
        highlighted: index === 0,
      };
    },
  ) ?? [];

  const readyCertificates: DashboardCertificate[] = (
    certificates as CertificateRow[] | null
  )?.map((certificate) => ({
    id: certificate.id,
    title: takeFirst(certificate.courses)?.title ?? "Certificado",
    fileUrl: certificate.file_url,
  })) ?? [];

  const stats = [
    {
      label: "En Curso",
      value: `${activeCourses.length} Programa${activeCourses.length === 1 ? "" : "s"}`,
    },
    {
      label: "Completados",
      value: `${readyCertificates.length} Diploma${readyCertificates.length === 1 ? "" : "s"}`,
    },
  ];

  return {
    user,
    stats,
    activeCourses,
    upcomingClasses,
    readyCertificates,
  };
}

export async function getCoursesPageData(): Promise<{
  user: PortalUser;
  courses: CourseListItem[];
} | null> {
  const user = await getPortalUser();
  if (!user) return null;

  const supabase = createAdminPortalClient();
  const [{ data: coursesData }, { data: enrollments }, { data: progressRows }] =
    await Promise.all([
      supabase
        .from("courses")
        .select(
          `
          id,
          slug,
          title,
          description,
          thumbnail_url,
          cover_image_url,
          badge_text,
          duration_label,
          access_type,
          course_lessons ( id )
        `,
        )
        .eq("is_published", true)
        .order("sort_order", { ascending: true }),
      supabase
        .from("enrollments")
        .select("course_id, status")
        .eq("student_id", user.id)
        .in("status", ["active", "completed"]),
      supabase
        .from("lesson_progress")
        .select("course_id, completed, progress_percent")
        .eq("student_id", user.id),
    ]);

  const enrolledCourseIds = new Set((enrollments ?? []).map((item) => item.course_id));
  const progressByCourse = new Map<
    string,
    { completedCount: number; totalPercent: number; rowCount: number }
  >();

  for (const row of progressRows ?? []) {
    const current = progressByCourse.get(row.course_id) ?? {
      completedCount: 0,
      totalPercent: 0,
      rowCount: 0,
    };
    current.totalPercent += row.progress_percent ?? 0;
    current.rowCount += 1;
    if (row.completed) current.completedCount += 1;
    progressByCourse.set(row.course_id, current);
  }

  const courses = (coursesData as DashboardCourseRow[] | null ?? []).map((course) => {
    const lessonsTotal = course.course_lessons?.length ?? 0;
    const progress = progressByCourse.get(course.id);

    return {
      id: course.id,
      slug: course.slug,
      title: course.title,
      description: course.description ?? null,
      thumbnailUrl: toCover(course.thumbnail_url, course.cover_image_url),
      badgeText: course.badge_text,
      durationLabel: course.duration_label,
      accessType: course.access_type,
      progress:
        lessonsTotal > 0 && progress
          ? Math.round(progress.totalPercent / lessonsTotal)
          : 0,
      lessonsCompleted: progress?.completedCount ?? 0,
      lessonsTotal,
      isEnrolled: enrolledCourseIds.has(course.id),
    };
  });

  return {
    user,
    courses,
  };
}

export async function getCourseDetail(slug: string): Promise<CourseDetail | null> {
  const user = await getPortalUser();
  if (!user) return null;

  const supabase = createAdminPortalClient();
  const { data: course } = await supabase
    .from("courses")
    .select(
      `
      id,
      slug,
      title,
      description,
      long_description,
      thumbnail_url,
      badge_text,
      urgency_text,
      duration_label,
      modality_label,
      start_date_label,
      price_mxn,
      installment_amount_mxn,
      installments_count,
      stripe_one_time_price_id,
      stripe_three_month_price_id,
      stripe_monthly_price_id,
      benefits,
      target_audience,
      syllabus,
      course_lessons (
        id,
        title,
        description,
        sort_order
      ),
      course_sessions (
        id,
        title,
        description,
        starts_at,
        meeting_url,
        sort_order
      )
    `,
    )
    .eq("slug", slug)
    .maybeSingle();

  if (!course) return null;

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("id, status")
    .eq("student_id", user.id)
    .eq("course_id", course.id)
    .in("status", ["active", "completed"])
    .maybeSingle();

  const lessonIds = (course.course_lessons ?? []).map((lesson) => lesson.id);
  const { data: progressRows } = lessonIds.length
    ? await supabase
        .from("lesson_progress")
        .select("lesson_id, completed, progress_percent")
        .eq("student_id", user.id)
        .in("lesson_id", lessonIds)
    : { data: [] };

  const purchaseOptions = getPurchaseOptions(course);
  const progressMap = new Map(
    (progressRows ?? []).map((row) => [
      row.lesson_id,
      { completed: row.completed, progressPercent: row.progress_percent ?? 0 },
    ]),
  );

  return {
    id: course.id,
    slug: course.slug,
    title: course.title,
    description: course.description,
    longDescription: course.long_description,
    thumbnailUrl: course.thumbnail_url,
    badgeText: course.badge_text,
    urgencyText: course.urgency_text,
    durationLabel: course.duration_label,
    modalityLabel: course.modality_label,
    startDateLabel: course.start_date_label,
    priceMxn: course.price_mxn,
    installmentAmountMxn: course.installment_amount_mxn,
    installmentsCount: course.installments_count,
    isEnrolled: Boolean(enrollment),
    purchaseOptions,
    benefits: Array.isArray(course.benefits) ? course.benefits : [],
    targetAudience: Array.isArray(course.target_audience)
      ? course.target_audience
      : [],
    syllabus: Array.isArray(course.syllabus) ? course.syllabus : [],
    lessons: (course.course_lessons ?? [])
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((lesson) => {
        const progress = progressMap.get(lesson.id);
        return {
          id: lesson.id,
          title: lesson.title,
          description: lesson.description,
          sortOrder: lesson.sort_order,
          completed: progress?.completed ?? false,
          progressPercent: progress?.progressPercent ?? 0,
        };
      }),
    sessions: (course.course_sessions ?? [])
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((session) => ({
        id: session.id,
        title: session.title,
        description: session.description,
        startsAt: session.starts_at,
        meetingUrl: session.meeting_url,
      })),
  } satisfies CourseDetail;
}

export async function getLessonDetail(lessonId: string): Promise<LessonDetail | null> {
  const user = await getPortalUser();
  if (!user) return null;

  const supabase = createAdminPortalClient();
  const { data: lesson } = await supabase
    .from("course_lessons")
    .select(
      `
      id,
      title,
      description,
      video_url,
      resource_url,
      sort_order,
      course_id,
      courses!inner (
        id,
        slug,
        title,
        enrollments!inner (
          student_id,
          status
        )
      )
    `,
    )
    .eq("id", lessonId)
    .eq("courses.enrollments.student_id", user.id)
    .in("courses.enrollments.status", ["active", "completed"])
    .maybeSingle();

  if (!lesson) return null;

  const course = takeFirst(
    lesson.courses as
      | {
          id: string;
          slug: string;
          title: string;
        }
      | {
          id: string;
          slug: string;
          title: string;
        }[]
      | null,
  );

  if (!course) return null;

  const [{ data: progress }, { data: courseLessons }] = await Promise.all([
    supabase
      .from("lesson_progress")
      .select("progress_percent, completed")
      .eq("student_id", user.id)
      .eq("lesson_id", lessonId)
      .maybeSingle(),
    supabase
      .from("course_lessons")
      .select("id, title, sort_order")
      .eq("course_id", lesson.course_id)
      .eq("is_published", true)
      .order("sort_order", { ascending: true }),
  ]);

  const lessonIndex = (courseLessons ?? []).findIndex((item) => item.id === lessonId);
  const previousLesson = lessonIndex > 0 ? courseLessons?.[lessonIndex - 1] : null;
  const nextLesson =
    lessonIndex >= 0 && courseLessons ? courseLessons[lessonIndex + 1] ?? null : null;

  return {
    id: lesson.id,
    title: lesson.title,
    description: lesson.description,
    videoUrl: lesson.video_url,
    resourceUrl: lesson.resource_url,
    progressPercent: progress?.progress_percent ?? 0,
    completed: progress?.completed ?? false,
    course: {
      id: course.id,
      slug: course.slug,
      title: course.title,
    },
    previousLesson: previousLesson
      ? { id: previousLesson.id, title: previousLesson.title }
      : null,
    nextLesson: nextLesson ? { id: nextLesson.id, title: nextLesson.title } : null,
  };
}

export const getPublicAdmissionCourse = cache(
  async (slug: string): Promise<PublicAdmissionCourse | null> => {
    const supabase = createAdminPortalClient();
    const { data: course } = await supabase
      .from("courses")
      .select(
        `
        id,
        slug,
        title,
        description,
        long_description,
        thumbnail_url,
        cover_image_url,
        badge_text,
        urgency_text,
        duration_label,
        modality_label,
        start_date_label,
        price_mxn,
        installment_amount_mxn,
        installments_count,
        stripe_one_time_price_id,
        stripe_three_month_price_id,
        stripe_monthly_price_id,
        benefits,
        target_audience,
        syllabus
      `,
      )
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle();

    if (!course) return null;

    return {
      id: course.id,
      slug: course.slug,
      title: course.title,
      description: course.description,
      longDescription: course.long_description,
      thumbnailUrl: toCover(course.thumbnail_url, course.cover_image_url),
      badgeText: course.badge_text,
      urgencyText: course.urgency_text,
      durationLabel: course.duration_label,
      modalityLabel: course.modality_label,
      startDateLabel: course.start_date_label,
      priceMxn: course.price_mxn,
      installmentAmountMxn: course.installment_amount_mxn,
      installmentsCount: course.installments_count,
      benefits: Array.isArray(course.benefits) ? course.benefits : [],
      targetAudience: Array.isArray(course.target_audience)
        ? course.target_audience
        : [],
      syllabus: Array.isArray(course.syllabus) ? course.syllabus : [],
      purchaseOptions: getPurchaseOptions(course),
    };
  },
);
