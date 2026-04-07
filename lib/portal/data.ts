import { cache } from "react";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import Stripe from "stripe";

import { createClient } from "@/lib/supabase/server";
import { getStripeServerClient } from "@/lib/stripe";

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
  createdAt: string | null;
  emailConfirmedAt: string | null;
  profile: StudentProfile | null;
};

export type DashboardCourse = {
  id: string;
  slug: string;
  category: string;
  title: string;
  description: string | null;
  cover: string;
  progress: number;
  lessonsCompleted: number;
  lessonsTotal: number;
  lessonsLabel: string;
  lastSeen: string;
  expiry: string;
  priceLabel: string | null;
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
  priceLabel: string | null;
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

type PaymentRow = {
  id: string;
  course_id: string;
  payment_type: "one_time" | "installment";
  status: string;
  amount_mxn: number | null;
  currency: string | null;
  created_at: string;
  paid_at: string | null;
  stripe_customer_id: string | null;
  stripe_payment_intent_id: string | null;
};

type EnrollmentBillingRow = {
  course_id: string;
  status: string;
  access_expires_at: string | null;
  courses:
    | {
        id: string;
        slug: string;
        title: string;
        start_date_label: string | null;
        duration_label: string | null;
        price_mxn: number | null;
        installment_amount_mxn: number | null;
        installments_count: number | null;
      }
    | {
        id: string;
        slug: string;
        title: string;
        start_date_label: string | null;
        duration_label: string | null;
        price_mxn: number | null;
        installment_amount_mxn: number | null;
        installments_count: number | null;
      }[]
    | null;
};

export type PaymentHistoryItem = {
  id: string;
  kind: "payment" | "invoice";
  title: string;
  amountLabel: string;
  statusLabel: string;
  dateLabel: string;
  isUpcoming: boolean;
};

export type BillingScheduleItem = {
  id: string;
  label: string;
  dateLabel: string;
  amountLabel: string;
  state: "paid" | "scheduled";
};

export type BillingCourseItem = {
  courseId: string;
  courseSlug: string;
  courseTitle: string;
  accessStatus: string;
  accessStatusLabel: string;
  planLabel: string;
  paymentStatusLabel: string;
  currentChargeLabel: string;
  nextChargeLabel: string | null;
  startDateLabel: string | null;
  renewalCadenceLabel: string | null;
  paidInstallmentsLabel: string | null;
  remainingInstallmentsLabel: string | null;
  paymentMethodLabel: string | null;
  accessMessage: string;
  history: PaymentHistoryItem[];
  schedule: BillingScheduleItem[];
};

export type PaymentsPageData = {
  user: PortalUser;
  accounts: BillingCourseItem[];
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

function formatCurrencyMxn(amount: number | null | undefined) {
  if (typeof amount !== "number" || Number.isNaN(amount)) return "Pendiente";

  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatPortalDate(value: string | number | Date | null | undefined) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatPortalDateShort(value: string | number | Date | null | undefined) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function invoiceAmountMxn(invoice: Stripe.Invoice) {
  if (typeof invoice.amount_paid === "number" && invoice.amount_paid > 0) {
    return invoice.amount_paid / 100;
  }

  if (typeof invoice.amount_due === "number" && invoice.amount_due > 0) {
    return invoice.amount_due / 100;
  }

  return null;
}

function subscriptionStatusLabel(status: Stripe.Subscription.Status) {
  switch (status) {
    case "trialing":
      return "Programada";
    case "active":
      return "Activa";
    case "past_due":
      return "Pago vencido";
    case "canceled":
      return "Cancelada";
    case "unpaid":
      return "Sin pagar";
    case "incomplete":
      return "Pendiente de confirmacion";
    default:
      return status;
  }
}

function enrollmentStatusLabel(status: string) {
  switch (status) {
    case "active":
      return "Activo";
    case "completed":
      return "Completado";
    case "suspended":
      return "Suspendido";
    default:
      return status;
  }
}

function paymentStatusLabel(status: string) {
  switch (status) {
    case "paid":
      return "Pagado";
    case "pending":
      return "Pendiente";
    case "succeeded":
      return "Pagado";
    case "open":
      return "Programado";
    case "draft":
      return "Borrador";
    case "void":
      return "Cancelado";
    case "uncollectible":
      return "No cobrado";
    default:
      return status;
  }
}

function paymentMethodLabel(method: Stripe.PaymentMethod | null) {
  if (!method || method.type !== "card" || !method.card) return null;
  const brand = method.card.brand ? method.card.brand.toUpperCase() : "Tarjeta";
  return `${brand} • ${method.card.last4}`;
}

function nextChargeFromSubscription(subscription: Stripe.Subscription) {
  const trialEnd =
    typeof subscription.trial_end === "number" ? subscription.trial_end * 1000 : null;
  if (trialEnd && trialEnd > Date.now()) return trialEnd;

  const item = subscription.items.data[0];
  return typeof item?.current_period_end === "number"
    ? item.current_period_end * 1000
    : null;
}

function buildInstallmentSchedule(input: {
  firstPaymentDate: string | null;
  nextChargeDate: number | null;
  totalInstallments: number | null;
  amountPerCharge: number | null;
  paidInstallments: number;
}) {
  const {
    firstPaymentDate,
    nextChargeDate,
    totalInstallments,
    amountPerCharge,
    paidInstallments,
  } = input;
  const schedule: BillingScheduleItem[] = [];

  if (firstPaymentDate && amountPerCharge) {
    schedule.push({
      id: `initial-${firstPaymentDate}`,
      label: "Cobro inicial",
      dateLabel: formatPortalDateShort(firstPaymentDate) ?? "Hoy",
      amountLabel: formatCurrencyMxn(amountPerCharge),
      state: "paid",
    });
  }

  if (!nextChargeDate || !totalInstallments || totalInstallments <= 1 || !amountPerCharge) {
    return schedule;
  }

  const remaining = Math.max(totalInstallments - paidInstallments, 0);
  const firstRenewal = new Date(nextChargeDate);

  for (let index = 0; index < remaining; index += 1) {
    const renewalDate = new Date(firstRenewal);
    renewalDate.setUTCMonth(firstRenewal.getUTCMonth() + index);
    schedule.push({
      id: `renewal-${index + 1}-${renewalDate.toISOString()}`,
      label: `Mensualidad ${paidInstallments + index + 1} de ${totalInstallments}`,
      dateLabel: formatPortalDateShort(renewalDate) ?? renewalDate.toISOString(),
      amountLabel: formatCurrencyMxn(amountPerCharge),
      state: "scheduled",
    });
  }

  return schedule;
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

  if (chosen && /^(https?:\/\/|\/)/.test(chosen)) {
    return chosen;
  }

  return "/diplomadoamparo.png";
}

function buildSyllabusFromModules(
  modules:
    | Array<{
        title?: string | null;
        sort_order?: number | null;
        course_lessons?: { id: string }[] | null;
      }>
    | null
    | undefined,
  fallback: Array<{ modulo?: string; titulo?: string; sesiones?: number }> | null | undefined,
) {
  if (Array.isArray(modules) && modules.length > 0) {
    return [...modules]
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      .map((module, index) => ({
        modulo: String(index + 1).padStart(2, "0"),
        titulo: module.title ?? `Modulo ${index + 1}`,
        sesiones: Array.isArray(module.course_lessons) ? module.course_lessons.length : 0,
      }));
  }

  return Array.isArray(fallback) ? fallback : [];
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
    createdAt: user.created_at ?? null,
    emailConfirmedAt: user.email_confirmed_at ?? null,
    profile: profile ?? null,
  };
}

async function createAdminPortalClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error("Missing Supabase URL configuration");
  }

  if (!serviceRoleKey) {
    return createClient();
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

  const supabase = await createAdminPortalClient();

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
            price_mxn,
            installment_amount_mxn,
            installments_count,
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
        description: course.description ?? null,
        cover: toCover(course.thumbnail_url, course.cover_image_url),
        progress: totalProgress,
        lessonsCompleted,
        lessonsTotal,
        lessonsLabel: `${lessonsCompleted}/${lessonsTotal} Lecciones`,
        lastSeen: `Ultima vez: ${formatLastSeen(latestSeen)}`,
        expiry: enrollment.access_expires_at
          ? `Acceso hasta ${new Intl.DateTimeFormat("es-MX").format(new Date(enrollment.access_expires_at))}`
          : course.duration_label || "Acceso activo",
        priceLabel:
          course.access_type === "installments" && course.installment_amount_mxn
            ? `${formatCurrencyMxn(course.installment_amount_mxn)} / mes`
            : course.price_mxn
              ? formatCurrencyMxn(course.price_mxn)
              : null,
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

  const supabase = await createAdminPortalClient();
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
          price_mxn,
          installment_amount_mxn,
          installments_count,
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
      priceLabel:
        course.access_type === "installments" && course.installment_amount_mxn
          ? `${formatCurrencyMxn(course.installment_amount_mxn)} / mes x ${course.installments_count ?? 0}`
          : course.price_mxn
            ? formatCurrencyMxn(course.price_mxn)
            : null,
    };
  });

  return {
    user,
    courses,
  };
}

export async function getPaymentsPageData(): Promise<PaymentsPageData | null> {
  const user = await getPortalUser();
  if (!user) return null;

  const supabase = await createAdminPortalClient();
  const stripe = getStripeServerClient();

  const [{ data: enrollments }, { data: paymentRows }] = await Promise.all([
    supabase
      .from("enrollments")
      .select(
        `
        course_id,
        status,
        access_expires_at,
        courses (
          id,
          slug,
          title,
          start_date_label,
          duration_label,
          price_mxn,
          installment_amount_mxn,
          installments_count
        )
      `,
      )
      .eq("student_id", user.id)
      .order("enrolled_at", { ascending: false }),
    supabase
      .from("payments")
      .select(
        "id, course_id, payment_type, status, amount_mxn, currency, created_at, paid_at, stripe_customer_id, stripe_payment_intent_id",
      )
      .eq("student_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const customerIds = Array.from(
    new Set((paymentRows ?? []).map((payment) => payment.stripe_customer_id).filter(Boolean)),
  ) as string[];

  const stripeSubscriptions: Stripe.Subscription[] = [];
  const stripeInvoices: Stripe.Invoice[] = [];

  await Promise.all(
    customerIds.map(async (customerId) => {
      const [subscriptions, invoices] = await Promise.all([
        stripe.subscriptions.list({ customer: customerId, status: "all", limit: 50 }),
        stripe.invoices.list({ customer: customerId, limit: 50 }),
      ]);

      stripeSubscriptions.push(...subscriptions.data);
      stripeInvoices.push(...invoices.data);
    }),
  );

  const paymentMethodIds = Array.from(
    new Set(
      stripeSubscriptions
        .map((subscription) =>
          typeof subscription.default_payment_method === "string"
            ? subscription.default_payment_method
            : null,
        )
        .filter(Boolean),
    ),
  ) as string[];

  const paymentMethods = new Map<string, Stripe.PaymentMethod>();

  await Promise.all(
    paymentMethodIds.map(async (paymentMethodId) => {
      const method = await stripe.paymentMethods.retrieve(paymentMethodId);
      paymentMethods.set(paymentMethodId, method);
    }),
  );

  const accounts = (enrollments as EnrollmentBillingRow[] | null ?? [])
    .map((enrollment) => {
      const course = takeFirst(enrollment.courses);
      if (!course) return null;

      const coursePayments = (paymentRows as PaymentRow[] | null ?? []).filter(
        (payment) => payment.course_id === course.id,
      );

      const subscription = stripeSubscriptions
        .filter(
          (item) =>
            item.metadata?.user_id === user.id &&
            item.metadata?.course_id === course.id &&
            item.status !== "incomplete_expired",
        )
        .sort((a, b) => b.created - a.created)[0];

      const subscriptionCustomerId =
        subscription && typeof subscription.customer === "string"
          ? subscription.customer
          : null;
      const subscriptionAmount =
        subscription && subscription.items.data[0]?.price.unit_amount
          ? subscription.items.data[0].price.unit_amount / 100
          : null;

      const accountPaymentsBase = subscriptionCustomerId
        ? coursePayments.filter(
            (payment) => payment.stripe_customer_id === subscriptionCustomerId,
          )
        : coursePayments.slice(0, 1);

      const accountPayments =
        subscriptionAmount !== null
          ? accountPaymentsBase.filter(
              (payment) => payment.amount_mxn === subscriptionAmount,
            )
          : accountPaymentsBase;

      const initialPaidPayment =
        [...accountPayments]
          .filter((payment) => payment.status === "paid")
          .sort((a, b) => a.created_at.localeCompare(b.created_at))[0] ?? null;
      const paidInstallments = accountPayments.filter((payment) => payment.status === "paid").length;

      const totalInstallments = subscription
        ? Number(subscription.metadata?.months_total ?? course.installments_count ?? 0)
        : course.installments_count;
      const nextChargeAt = subscription ? nextChargeFromSubscription(subscription) : null;
      const defaultPaymentMethodId =
        subscription && typeof subscription.default_payment_method === "string"
          ? subscription.default_payment_method
          : null;
      const methodLabel = defaultPaymentMethodId
        ? paymentMethodLabel(paymentMethods.get(defaultPaymentMethodId) ?? null)
        : null;

      const subscriptionInvoices = stripeInvoices
        .filter((invoice) => {
          const invoiceSubscriptionId =
            typeof invoice.parent?.subscription_details?.subscription === "string"
              ? invoice.parent.subscription_details.subscription
              : null;
          return (
            invoiceSubscriptionId === subscription?.id &&
            invoiceAmountMxn(invoice) !== null
          );
        })
        .sort((a, b) => b.created - a.created);

      const history: PaymentHistoryItem[] = [
        ...accountPayments.map((payment, index) => ({
          id: payment.id,
          kind: "payment" as const,
          title:
            payment.payment_type === "one_time"
              ? "Pago del programa"
              : index === 0
                ? "Cobro inicial del plan"
                : "Cobro del plan",
          amountLabel: formatCurrencyMxn(payment.amount_mxn),
          statusLabel: paymentStatusLabel(payment.status),
          dateLabel:
            formatPortalDateShort(payment.paid_at || payment.created_at) ??
            payment.created_at,
          isUpcoming: false,
        })),
        ...subscriptionInvoices.map((invoice) => ({
          id: invoice.id,
          kind: "invoice" as const,
          title:
            invoice.status === "paid"
              ? "Cobro del plan"
              : "Cobro pendiente",
          amountLabel: formatCurrencyMxn(invoiceAmountMxn(invoice)),
          statusLabel: paymentStatusLabel(invoice.status ?? "open"),
          dateLabel:
            formatPortalDateShort(
              typeof invoice.created === "number" ? invoice.created * 1000 : null,
            ) ?? "Pendiente",
          isUpcoming: (invoice.status ?? "") !== "paid",
        })),
      ]
        .sort((a, b) => {
          const aDate = Date.parse(a.dateLabel);
          const bDate = Date.parse(b.dateLabel);
          return Number.isNaN(bDate) || Number.isNaN(aDate) ? 0 : bDate - aDate;
        })
        .slice(0, 10);

      const planLabel = subscription
        ? `${totalInstallments} mensualidades`
        : coursePayments.some((payment) => payment.payment_type === "installment")
          ? `${course.installments_count ?? totalInstallments ?? 0} mensualidades`
          : "Pago unico";
      const remainingInstallments =
        totalInstallments && totalInstallments > 0
          ? Math.max(totalInstallments - paidInstallments, 0)
          : null;

      const schedule =
        subscription || coursePayments.some((payment) => payment.payment_type === "installment")
          ? buildInstallmentSchedule({
              firstPaymentDate: initialPaidPayment?.paid_at || initialPaidPayment?.created_at || null,
              nextChargeDate: nextChargeAt,
              totalInstallments,
              amountPerCharge:
                subscriptionAmount !== null
                  ? subscriptionAmount
                  : course.installment_amount_mxn,
              paidInstallments,
            })
          : initialPaidPayment
            ? [
                {
                  id: `single-${initialPaidPayment.id}`,
                  label: "Pago liquidado",
                  dateLabel:
                    formatPortalDateShort(
                      initialPaidPayment.paid_at || initialPaidPayment.created_at,
                    ) ?? "Pagado",
                  amountLabel: formatCurrencyMxn(initialPaidPayment.amount_mxn),
                  state: "paid" as const,
                },
              ]
            : [];

      return {
        courseId: course.id,
        courseSlug: course.slug,
        courseTitle: course.title,
        accessStatus: enrollment.status,
        accessStatusLabel: enrollmentStatusLabel(enrollment.status),
        planLabel,
        paymentStatusLabel: subscription
          ? subscriptionStatusLabel(subscription.status)
          : paymentStatusLabel(coursePayments[0]?.status ?? "pending"),
        currentChargeLabel: formatCurrencyMxn(
          subscriptionAmount !== null
            ? subscriptionAmount
            : initialPaidPayment?.amount_mxn ?? course.price_mxn,
        ),
        nextChargeLabel: nextChargeAt ? formatPortalDateShort(nextChargeAt) : null,
        startDateLabel: course.start_date_label,
        renewalCadenceLabel:
          subscription && totalInstallments && nextChargeAt
            ? `Renovacion automatica cada mes hasta completar ${totalInstallments} cargos`
            : null,
        paidInstallmentsLabel:
          totalInstallments && totalInstallments > 0
            ? `${Math.min(paidInstallments, totalInstallments)} de ${totalInstallments} cobradas`
            : null,
        remainingInstallmentsLabel:
          remainingInstallments !== null
            ? `${remainingInstallments} mensualidades pendientes`
            : null,
        paymentMethodLabel: methodLabel,
        accessMessage:
          enrollment.status === "active"
            ? `Tu acceso al curso esta activo${enrollment.access_expires_at ? ` hasta ${formatPortalDate(enrollment.access_expires_at)}` : ""}.`
            : "Tu acceso no esta activo en este momento.",
        history,
        schedule,
      } satisfies BillingCourseItem;
    })
    .filter((item): item is BillingCourseItem => Boolean(item));

  return {
    user,
    accounts,
  };
}

export async function getCourseDetail(slug: string): Promise<CourseDetail | null> {
  const user = await getPortalUser();
  if (!user) return null;

  const supabase = await createAdminPortalClient();
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
    thumbnailUrl: toCover(course.thumbnail_url, course.cover_image_url),
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

  const supabase = await createAdminPortalClient();
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
    const supabase = await createAdminPortalClient();
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
        syllabus,
        course_modules (
          title,
          sort_order,
          course_lessons (
            id
          )
        )
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
      syllabus: buildSyllabusFromModules(course.course_modules, course.syllabus),
      purchaseOptions: getPurchaseOptions(course),
    };
  },
);
