"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { CalendarDays, Clock3, ShieldCheck } from "lucide-react";

import { StripeElementsCheckout } from "@/components/portal/stripe-elements-checkout";
import type { PublicAdmissionCourse, PurchaseOption } from "@/lib/portal/data";

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function onlyDigits(value: string) {
  return value.replace(/\D/g, "").slice(0, 10);
}

function formatPhone(value: string) {
  const digits = onlyDigits(value).slice(0, 10);

  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(value));
}

function isValidPhone(value: string) {
  return onlyDigits(value).length === 10;
}

function formatCurrency(value: number | null) {
  if (typeof value !== "number") return null;

  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 2,
  }).format(value);
}

function getPlanAmount(course: PublicAdmissionCourse, option: PurchaseOption) {
  if (option.code === "one_time") {
    return formatCurrency(course.priceMxn) ?? option.description;
  }

  if (option.code === "three_month" && course.priceMxn) {
    return formatCurrency(course.priceMxn / 3) ?? option.description;
  }

  return formatCurrency(course.installmentAmountMxn) ?? option.description;
}

function getPlanSummary(course: PublicAdmissionCourse, option: PurchaseOption) {
  const amount = getPlanAmount(course, option);

  if (option.code === "one_time") {
    return {
      amount,
      chargeSummary: `Se cobrara hoy ${amount} en un solo pago para activar tu acceso.`,
      submitLabel: `Pagar ${amount}`,
    };
  }

  if (option.code === "three_month") {
    return {
      amount,
      chargeSummary: `Se cobrara hoy la primera mensualidad de ${amount}. Los 2 cargos restantes quedaran programados automaticamente.`,
      submitLabel: `Pagar ${amount}`,
    };
  }

  return {
    amount,
    chargeSummary: `Se cobrara hoy la primera mensualidad de ${amount}. Los pagos restantes se cobraran conforme al plan seleccionado.`,
    submitLabel: `Pagar ${amount}`,
  };
}

export function PublicAdmissionPage({
  course,
}: {
  course: PublicAdmissionCourse;
}) {
  const [selectedCode, setSelectedCode] = useState(
    course.purchaseOptions.find((option) => option.code === "monthly")?.code ??
      course.purchaseOptions[0]?.code ??
      "one_time",
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [showPayment, setShowPayment] = useState(false);

  const selectedOption = useMemo(
    () =>
      course.purchaseOptions.find((option) => option.code === selectedCode) ??
      course.purchaseOptions[0],
    [course.purchaseOptions, selectedCode],
  );

  if (!selectedOption) return null;

  const normalizedEmail = normalizeEmail(email);
  const formattedPhone = formatPhone(phone);
  const canContinue =
    Boolean(name.trim()) && isValidEmail(email) && isValidPhone(phone);
  const selectedPlan = getPlanSummary(course, selectedOption);

  return (
    <main className="min-h-screen bg-[#f6f3ee] text-primary">
      <section className="relative overflow-hidden bg-primary text-white">
        <div className="absolute inset-0 opacity-15">
          <Image
            src="/diplomadoamparo.png"
            alt={course.title}
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
        </div>
        <div className="relative border-b border-white/10 bg-secondary py-2 text-center text-[10px] font-bold uppercase tracking-[0.26em] text-white/85">
          Matricula abierta: accede al cuerpo docente mas destacado en materia de amparo
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
              <div className="inline-flex items-center rounded-full border border-accent/40 bg-white/5 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.24em] text-accent">
                Alta especializacion 2026
              </div>
              <h1 className="mt-8 text-5xl font-bold leading-none md:text-7xl">
                Diplomado en
                <span className="mt-3 block font-display text-accent">Amparo</span>
              </h1>
              <p className="mt-8 max-w-3xl border-l border-accent/40 pl-6 text-xl leading-10 text-white/75">
                {course.description}
              </p>

              <div className="mt-8 inline-flex items-center rounded-none border border-accent/25 bg-white/5 px-5 py-4 text-sm font-semibold text-accent">
                Incluye taller practico: elaboracion de demanda de amparo directo e indirecto
              </div>

              <div className="mt-6 flex flex-wrap gap-4 text-sm text-white/80">
                <div className="flex items-center gap-2 rounded-none border border-white/10 bg-white/5 px-4 py-3">
                  <CalendarDays className="h-4 w-4 text-accent" />
                  Inicia: {course.startDateLabel || "Por definir"}
                </div>
                <div className="flex items-center gap-2 rounded-none border border-white/10 bg-white/5 px-4 py-3">
                  <Clock3 className="h-4 w-4 text-accent" />
                  {course.durationLabel || "Programa activo"}
                </div>
              </div>
            </div>

            <aside className="lg:sticky lg:top-8 lg:self-start">
              <div className="overflow-hidden rounded-[28px] bg-white shadow-[0_30px_80px_rgba(8,11,27,0.18)]">
                <div className="bg-[linear-gradient(180deg,rgba(28,27,57,0.98),rgba(36,33,69,0.95))] px-8 py-9 text-white">
                  <div className="inline-flex items-center rounded-full border border-accent/25 bg-white/5 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.24em] text-accent">
                    Cupo altamente limitado
                  </div>
                  <h2 className="mt-5 text-4xl font-bold">Solicita tu Admision</h2>
                  <p className="mt-4 text-sm leading-7 text-white/72">
                    Reserva tu lugar y accede al programa de amparo mas completo de Mexico.
                  </p>
                  <div className="mt-5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-accent">
                    <ShieldCheck className="h-4 w-4" />
                    Pago 100% seguro con Stripe
                  </div>
                </div>

                <div className="space-y-8 px-8 py-8">
                  <section>
                    <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground">
                      Modalidad de inversion
                    </p>
                    <div className="mt-4 space-y-3">
                      {course.purchaseOptions.map((option) => {
                        const selected = option.code === selectedCode;
                        return (
                          <button
                            key={option.code}
                            type="button"
                            onClick={() => setSelectedCode(option.code)}
                            className={`flex w-full items-center justify-between rounded-[18px] border px-5 py-4 text-left transition-colors ${
                              selected
                                ? "border-secondary bg-secondary/5"
                                : "border-border bg-white hover:border-secondary/40"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <span
                                className={`mt-1 h-4 w-4 rounded-full border ${
                                  selected
                                    ? "border-secondary bg-secondary"
                                    : "border-muted-foreground/30"
                                }`}
                              />
                              <div>
                                <p className="text-base font-bold text-primary">
                                  {option.code === "one_time"
                                    ? "Pago Unico"
                                    : option.code === "three_month"
                                      ? "3 Mensualidades"
                                      : "6 Mensualidades"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {option.code === "one_time"
                                    ? "Pago unico"
                                    : `${option.code === "three_month" ? 3 : 6} mensualidades`}
                                </p>
                              </div>
                            </div>
                            <p className="text-2xl font-bold text-primary">
                              {getPlanAmount(course, option)}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </section>

                  <section>
                    <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground">
                      Datos del estudiante
                    </p>
                    <div className="mt-4 space-y-4">
                      <label className="block space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                          Nombre completo
                        </span>
                        <input
                          value={name}
                          onChange={(event) => setName(event.target.value)}
                          placeholder="Nombre(s) y Apellidos"
                          autoComplete="name"
                          required
                          className="w-full rounded-[16px] border border-border bg-white px-4 py-4 text-sm text-primary outline-none transition-colors focus:border-accent"
                        />
                      </label>
                      <label className="block space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                          Correo electronico
                        </span>
                        <input
                          value={email}
                          onChange={(event) => setEmail(normalizeEmail(event.target.value))}
                          placeholder="tu@correo.com"
                          type="email"
                          autoComplete="email"
                          inputMode="email"
                          required
                          className="w-full rounded-[16px] border border-border bg-white px-4 py-4 text-sm text-primary outline-none transition-colors focus:border-accent"
                        />
                        {email && !isValidEmail(email) ? (
                          <p className="text-sm text-red-700">
                            Ingresa un correo valido.
                          </p>
                        ) : null}
                      </label>
                      <label className="block space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                          Telefono
                        </span>
                        <input
                          value={formattedPhone}
                          onChange={(event) => setPhone(onlyDigits(event.target.value))}
                          placeholder="(664) 800-0011"
                          type="tel"
                          autoComplete="tel"
                          inputMode="numeric"
                          maxLength={14}
                          required
                          className="w-full rounded-[16px] border border-border bg-white px-4 py-4 text-sm text-primary outline-none transition-colors focus:border-accent"
                        />
                        {phone && !isValidPhone(phone) ? (
                          <p className="text-sm text-red-700">
                            Ingresa un telefono de 10 digitos.
                          </p>
                        ) : null}
                      </label>
                      {!showPayment ? (
                        <button
                          type="button"
                          disabled={!canContinue}
                          onClick={() => setShowPayment(true)}
                          className="w-full rounded-[16px] bg-[#c8958d] px-5 py-4 text-sm font-bold uppercase tracking-[0.18em] text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Continuar al pago de {selectedPlan.amount}
                        </button>
                      ) : (
                        <div className="space-y-4">
                          <div className="rounded-[16px] border border-secondary/20 bg-secondary/[0.04] px-4 py-4">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-secondary">
                              Resumen del cobro
                            </p>
                            <div className="mt-3 flex items-end justify-between gap-4">
                              <div>
                                <p className="text-sm font-semibold text-primary">
                                  {selectedOption.code === "one_time"
                                    ? "Pago unico"
                                    : selectedOption.code === "three_month"
                                      ? "3 mensualidades"
                                      : "6 mensualidades"}
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                  {selectedPlan.chargeSummary}
                                </p>
                              </div>
                              <p className="text-3xl font-bold text-primary">
                                {selectedPlan.amount}
                              </p>
                            </div>
                          </div>

                          <StripeElementsCheckout
                            courseId={course.id}
                            courseSlug={course.slug}
                            option={selectedOption}
                            anonymousCustomer={{
                              name,
                              email: normalizedEmail,
                              phone: formattedPhone,
                            }}
                            chargeSummary={selectedPlan.chargeSummary}
                            submitLabel={selectedPlan.submitLabel}
                          />
                        </div>
                      )}
                    </div>
                  </section>

                  <section className="border-t border-border pt-6">
                    <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">
                      Incluido en su inversion:
                    </p>
                    <ul className="mt-4 space-y-3 text-sm leading-7 text-muted-foreground">
                      {course.benefits.map((benefit) => (
                        <li key={benefit} className="flex items-start gap-3">
                          <span className="mt-2 h-2 w-2 rounded-full bg-accent" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-16 px-6 py-20 lg:grid-cols-[1fr_380px]">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-secondary">
            Sobre el diplomado
          </p>
          <div
            className="prose mt-6 max-w-none prose-h2:text-4xl prose-h2:font-bold prose-p:text-lg prose-p:leading-9 prose-p:text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: course.longDescription || "" }}
          />

          <div className="mt-20">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-secondary">
              Programa academico 2026
            </p>
            <h2 className="mt-4 text-4xl font-bold text-primary">Temario y Claustro Docente</h2>
            <div className="mt-8 space-y-4">
              {course.syllabus.map((module, index) => (
                <article
                  key={`${module.modulo ?? index}-${module.titulo ?? index}`}
                  className="flex items-center gap-5 rounded-[22px] border border-[#eadfd3] bg-white px-6 py-5 shadow-[0_14px_40px_rgba(56,42,30,0.06)]"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-secondary text-sm font-bold text-white">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="text-lg font-bold text-primary">
                      {module.titulo ?? `Modulo ${module.modulo ?? index + 1}`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {module.sesiones ?? 0} sesiones
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>

        <aside className="rounded-[28px] bg-white p-8 shadow-[0_30px_80px_rgba(8,11,27,0.08)]">
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-secondary">
            Perfil ideal
          </p>
          <ul className="mt-6 space-y-3 text-sm leading-7 text-muted-foreground">
            {course.targetAudience.map((item) => (
              <li key={item} className="border-b border-border pb-3 last:border-b-0">
                {item}
              </li>
            ))}
          </ul>
        </aside>
      </section>
    </main>
  );
}
