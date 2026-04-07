"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ExternalLink, Monitor, Smartphone, Tablet } from "lucide-react";

const FALLBACK_COVER = "/diplomadoamparo.png";

type CoursePreviewData = {
  id: string;
  title?: string | null;
  slug?: string | null;
  description?: string | null;
  long_description?: string | null;
  thumbnail_url?: string | null;
  cover_image_url?: string | null;
  badge_text?: string | null;
  urgency_text?: string | null;
  start_date_label?: string | null;
  duration_label?: string | null;
  modality_label?: string | null;
  access_type?: string | null;
  price_mxn?: number | null;
  installment_amount_mxn?: number | null;
  installments_count?: number | null;
  stripe_one_time_price_id?: string | null;
  stripe_three_month_price_id?: string | null;
  stripe_monthly_price_id?: string | null;
  is_published?: boolean | null;
  benefits?: string[] | null;
  target_audience?: string[] | null;
  syllabus?: Array<{ modulo?: string; titulo?: string; sesiones?: number }> | null;
  course_modules?:
    | Array<{
        title?: string | null;
        sort_order?: number | null;
        course_lessons?: { id: string }[] | null;
      }>
    | null;
};

type ViewportMode = "phone" | "tablet" | "desktop";

const VIEWPORTS = {
  phone: { label: "Telefono", icon: Smartphone, widthClassName: "w-[390px]", chromeLabel: "390px" },
  tablet: { label: "iPad", icon: Tablet, widthClassName: "w-[820px]", chromeLabel: "820px" },
  desktop: { label: "Desktop", icon: Monitor, widthClassName: "w-full max-w-[1180px]", chromeLabel: "Flexible" },
} as const;

function toPlainText(value?: string | null) {
  if (!value) return "";
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function toRichHtml(value?: string | null) {
  if (!value?.trim()) {
    return "<p>Agrega una descripcion larga para ver aqui la narrativa completa del landing.</p>";
  }

  if (/<[a-z][\s\S]*>/i.test(value)) return value;

  return value
    .split(/\n{2,}/)
    .map((block) => {
      const lines = block
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

      if (!lines.length) return "";

      if (lines.every((line) => line.startsWith("• ") || line.startsWith("- "))) {
        const items = lines
          .map((line) => line.replace(/^(• |- )/, "").trim())
          .map((line) => `<li>${escapeHtml(line)}</li>`)
          .join("");
        return `<ul>${items}</ul>`;
      }

      if (lines.length === 1 && lines[0].startsWith("### ")) {
        return `<h3>${escapeHtml(lines[0].replace(/^### /, "").trim())}</h3>`;
      }

      return `<p>${lines.map((line) => escapeHtml(line)).join("<br />")}</p>`;
    })
    .join("");
}

function formatCurrency(value?: number | null) {
  if (typeof value !== "number") return null;
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 2,
  }).format(value);
}

function buildSyllabus(course: CoursePreviewData) {
  if (Array.isArray(course.course_modules) && course.course_modules.length > 0) {
    return [...course.course_modules]
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      .map((module, index) => ({
        modulo: String(index + 1).padStart(2, "0"),
        titulo: module.title ?? `Modulo ${index + 1}`,
        sesiones: Array.isArray(module.course_lessons) ? module.course_lessons.length : 0,
      }));
  }

  return Array.isArray(course.syllabus) ? course.syllabus : [];
}

function getPurchaseOptions(course: CoursePreviewData) {
  const options: Array<{ id: string; title: string; subtitle: string; amount: string }> = [];

  if (course.stripe_one_time_price_id && typeof course.price_mxn === "number") {
    options.push({
      id: "one_time",
      title: "Pago unico",
      subtitle: "Pago total",
      amount: formatCurrency(course.price_mxn) ?? "Pendiente",
    });
  }

  if (course.stripe_three_month_price_id && typeof course.price_mxn === "number") {
    options.push({
      id: "three_month",
      title: "3 mensualidades",
      subtitle: "Plan trimestral",
      amount: formatCurrency(course.price_mxn / 3) ?? "Pendiente",
    });
  }

  if (course.stripe_monthly_price_id && typeof course.installment_amount_mxn === "number") {
    options.push({
      id: "monthly",
      title: `${course.installments_count ?? 6} mensualidades`,
      subtitle: "Plan mensual",
      amount: formatCurrency(course.installment_amount_mxn) ?? "Pendiente",
    });
  }

  return options;
}

export default function PreviewClient({
  course,
  publicLandingHref,
  publicPortalHref,
}: {
  course: CoursePreviewData;
  publicLandingHref: string | null;
  publicPortalHref: string | null;
}) {
  const [viewport, setViewport] = useState<ViewportMode>("tablet");

  const activeViewport = VIEWPORTS[viewport];
  const cover = course.thumbnail_url || course.cover_image_url || FALLBACK_COVER;
  const shortDescription =
    toPlainText(course.description) || "Aqui se vera la descripcion comercial corta del programa.";
  const benefits = Array.isArray(course.benefits) ? course.benefits.filter(Boolean) : [];
  const audience = Array.isArray(course.target_audience) ? course.target_audience.filter(Boolean) : [];
  const syllabus = buildSyllabus(course);
  const purchaseOptions = getPurchaseOptions(course);

  const viewportClassName = useMemo(() => activeViewport.widthClassName, [activeViewport.widthClassName]);

  return (
    <div className="space-y-5 font-sans">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-slate-900">Vista previa</h2>
        <p className="text-sm font-medium text-slate-500">
          Aqui debes ver el mismo tipo de landing que se publica, no un mock aparte del constructor.
        </p>
      </div>

      <div className="rounded-2xl border border-[#e4dacc] bg-white px-4 py-3 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {(Object.keys(VIEWPORTS) as ViewportMode[]).map((key) => {
              const option = VIEWPORTS[key];
              const Icon = option.icon;
              const active = key === viewport;

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setViewport(key)}
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] transition ${
                    active
                      ? "bg-[#1a1a35] text-white"
                      : "border border-[#e4dacc] bg-white text-slate-600 hover:border-slate-300"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {option.label}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {publicLandingHref ? (
              <Link
                href={publicLandingHref}
                target="_blank"
                className="inline-flex items-center gap-2 rounded-full border border-[#e4dacc] px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-[#9B1D20]/30 hover:text-[#9B1D20]"
              >
                Ver landing
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            ) : null}
            {publicPortalHref ? (
              <Link
                href={publicPortalHref}
                target="_blank"
                className="inline-flex items-center gap-2 rounded-full border border-[#e4dacc] px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-[#9B1D20]/30 hover:text-[#9B1D20]"
              >
                Ver portal
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            ) : null}
            <span className="rounded-full border border-[#e4dacc] bg-[#fbf8f3] px-3 py-1.5 text-xs font-semibold text-slate-700">
              {course.urgency_text || "Sin urgencia"}
            </span>
            <span className="rounded-full border border-[#e4dacc] bg-[#fbf8f3] px-3 py-1.5 text-xs font-semibold text-slate-700">
              {purchaseOptions[0]?.amount || "Sin precio"}
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-[#e4dacc] bg-[#f1ebe2] p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-3 px-1">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
            Preview del landing
          </p>
          <p className="text-xs font-semibold text-slate-400">{activeViewport.chromeLabel}</p>
        </div>

        <div className="overflow-auto rounded-[24px] bg-[#e8decf] p-3">
          <div
            className={`mx-auto overflow-hidden rounded-[30px] border border-[#ddd1bf] bg-[#fffdf9] shadow-[0_18px_50px_rgba(26,26,53,0.12)] ${viewportClassName}`}
          >
            <div className="border-b border-[#efe5d6] bg-[#fcfaf6] px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#d6c2a3]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#d6c2a3]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#d6c2a3]" />
                </div>
                <span className="rounded-full border border-[#e4dacc] bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
                  {activeViewport.label}
                </span>
              </div>
            </div>

            <div className="max-h-[78vh] overflow-auto bg-[#f6f3ee] text-[#1a1a35]">
              <section className="relative overflow-hidden bg-[#1a1a35] text-white">
                <div className="relative border-b border-white/10 bg-[#151528] py-2 text-center text-[10px] font-bold uppercase tracking-[0.26em] text-white/85">
                  Matricula abierta: revisa la composicion del landing
                </div>
                <div className="relative mx-auto max-w-7xl px-6 py-14">
                  <div className="flex justify-center">
                    <div className="text-center">
                      <p className="text-5xl font-bold tracking-[0.18em] text-white">AUA</p>
                      <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.24em] text-white/80">
                        Centro de Estudios Juridicos
                      </p>
                    </div>
                  </div>

                  <div className="mt-12 grid gap-10 lg:grid-cols-[1.15fr_420px]">
                    <div className="max-w-4xl">
                      <div className="inline-flex items-center rounded-full border border-[#C5A55D]/40 bg-white/5 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.24em] text-[#C5A55D]">
                        {course.badge_text || "Alta especializacion 2026"}
                      </div>
                      <h1 className="mt-8 text-5xl font-bold leading-none md:text-7xl">
                        {course.title || "Nuevo programa"}
                      </h1>
                      <p className="mt-8 max-w-3xl border-l border-[#C5A55D]/40 pl-6 text-xl leading-10 text-white/75">
                        {shortDescription}
                      </p>

                      <div className="mt-8 inline-flex items-center rounded-none border border-[#C5A55D]/25 bg-white/5 px-5 py-4 text-sm font-semibold text-[#EAD896]">
                        {benefits[0] || "Incluye taller practico y acompanamiento academico."}
                      </div>

                      <div className="mt-6 flex flex-wrap gap-4 text-sm text-white/80">
                        <div className="rounded-none border border-white/10 bg-white/5 px-4 py-3">
                          Inicia: {course.start_date_label || "Por definir"}
                        </div>
                        <div className="rounded-none border border-white/10 bg-white/5 px-4 py-3">
                          {course.duration_label || "Duracion pendiente"}
                        </div>
                        <div className="rounded-none border border-white/10 bg-white/5 px-4 py-3">
                          {course.modality_label || "Modalidad pendiente"}
                        </div>
                      </div>
                    </div>

                    <aside className="overflow-hidden rounded-[28px] bg-white shadow-[0_30px_80px_rgba(8,11,27,0.18)]">
                      <div className="bg-[linear-gradient(180deg,rgba(28,27,57,0.98),rgba(36,33,69,0.95))] px-8 py-9 text-white">
                        <div className="inline-flex items-center rounded-full border border-[#C5A55D]/25 bg-white/5 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.24em] text-[#C5A55D]">
                          {course.urgency_text || "Cupo disponible"}
                        </div>
                        <h2 className="mt-5 text-4xl font-bold">Solicita tu admision</h2>
                        <p className="mt-4 text-sm leading-7 text-white/72">
                          Esta tarjeta replica la caja comercial de la landing publica.
                        </p>
                      </div>

                      <div className="space-y-6 px-8 py-8">
                        <section>
                          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">
                            Modalidad de inversion
                          </p>
                          <div className="mt-4 space-y-3">
                            {purchaseOptions.length > 0 ? (
                              purchaseOptions.map((option, index) => (
                                <div
                                  key={option.id}
                                  className={`flex items-center justify-between rounded-[18px] border px-5 py-4 ${
                                    index === 0
                                      ? "border-[#1a1a35] bg-[#1a1a35]/[0.03]"
                                      : "border-[#eadfd3] bg-white"
                                  }`}
                                >
                                  <div>
                                    <p className="text-base font-bold text-[#1a1a35]">{option.title}</p>
                                    <p className="text-xs text-slate-500">{option.subtitle}</p>
                                  </div>
                                  <p className="text-xl font-bold text-[#1a1a35]">{option.amount}</p>
                                </div>
                              ))
                            ) : (
                              <div className="rounded-[18px] border border-dashed border-[#eadfd3] px-5 py-4 text-sm font-medium text-slate-500">
                                Configura Stripe y precios para ver opciones de pago aqui.
                              </div>
                            )}
                          </div>
                        </section>

                        {benefits.length > 0 ? (
                          <section className="border-t border-[#eadfd3] pt-6">
                            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#1a1a35]">
                              Incluido en su inversion
                            </p>
                            <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-500">
                              {benefits.map((benefit) => (
                                <li key={benefit} className="flex items-start gap-3">
                                  <span className="mt-2 h-2 w-2 rounded-full bg-[#C5A55D]" />
                                  <span>{benefit}</span>
                                </li>
                              ))}
                            </ul>
                          </section>
                        ) : null}
                      </div>
                    </aside>
                  </div>
                </div>
              </section>

              <section className="mx-auto grid max-w-7xl gap-16 px-6 py-20 lg:grid-cols-[1fr_380px]">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#9B1D20]">
                    Sobre el programa
                  </p>
                  <div
                    className="prose mt-6 max-w-none prose-h2:text-4xl prose-h2:font-bold prose-p:text-lg prose-p:leading-9 prose-p:text-slate-600"
                    dangerouslySetInnerHTML={{ __html: toRichHtml(course.long_description) }}
                  />

                  <div className="mt-20">
                    <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#9B1D20]">
                      Programa academico 2026
                    </p>
                    <h2 className="mt-4 text-4xl font-bold text-[#1a1a35]">Temario y Claustro Docente</h2>
                    <div className="mt-8 space-y-4">
                      {syllabus.length > 0 ? (
                        syllabus.map((module, index) => (
                          <article
                            key={`${module.modulo ?? index}-${module.titulo ?? index}`}
                            className="flex items-center gap-5 rounded-[22px] border border-[#eadfd3] bg-white px-6 py-5 shadow-[0_14px_40px_rgba(56,42,30,0.06)]"
                          >
                            <span className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#9B1D20] text-sm font-bold text-white">
                              {String(index + 1).padStart(2, "0")}
                            </span>
                            <div>
                              <p className="text-lg font-bold text-[#1a1a35]">
                                {module.titulo ?? `Modulo ${module.modulo ?? index + 1}`}
                              </p>
                              <p className="text-sm text-slate-500">
                                {module.sesiones ?? 0} sesiones
                              </p>
                            </div>
                          </article>
                        ))
                      ) : (
                        <div className="rounded-[22px] border border-dashed border-[#eadfd3] bg-white px-6 py-6 text-sm font-medium text-slate-500">
                          Aun no hay modulos creados en el temario.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <aside className="rounded-[28px] bg-white p-8 shadow-[0_30px_80px_rgba(8,11,27,0.08)]">
                  <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#9B1D20]">
                    Perfil ideal
                  </p>
                  {audience.length > 0 ? (
                    <ul className="mt-6 space-y-3 text-sm leading-7 text-slate-500">
                      {audience.map((item) => (
                        <li key={item} className="border-b border-[#eadfd3] pb-3 last:border-b-0">
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="mt-6 rounded-[20px] border border-dashed border-[#eadfd3] px-4 py-5 text-sm font-medium text-slate-500">
                      Agrega el perfil ideal en checkout o audiencia para completar esta seccion.
                    </div>
                  )}
                </aside>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
