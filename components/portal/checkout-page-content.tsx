"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CreditCard, LockKeyhole, ShieldCheck } from "lucide-react";

import { createCheckoutSession } from "@/app/(portal)/actions";
import { Button } from "@/components/ui/button";
import type { CourseDetail, PurchaseOption } from "@/lib/portal/data";

function formatCurrency(value: number | null) {
  if (typeof value !== "number") return null;

  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 2,
  }).format(value);
}

function getPlanPresentation(course: CourseDetail, option: PurchaseOption) {
  if (option.code === "one_time") {
    return {
      badge: "Mejor precio",
      amount: formatCurrency(course.priceMxn) ?? option.description,
      suffix: "Precio total",
      caption: "Un solo pago, sin cargos recurrentes",
    };
  }

  if (option.code === "three_month") {
    const monthly = course.priceMxn ? course.priceMxn / 3 : null;

    return {
      badge: null,
      amount: formatCurrency(monthly) ?? option.description,
      suffix: "/mes",
      caption: "Total: 3 cargos mensuales automaticos",
    };
  }

  return {
    badge: "Mas accesible",
    amount: formatCurrency(course.installmentAmountMxn) ?? option.description,
    suffix: "/mes",
    caption:
      course.installmentsCount && course.priceMxn
        ? `Total: ${course.priceMxn.toLocaleString("es-MX")} MXN`
        : "Plan mensual",
  };
}

export function CheckoutPageContent({
  course,
  returnPath,
}: {
  course: CourseDetail;
  returnPath: string;
}) {
  const defaultOption = course.purchaseOptions.find(
    (option) => option.code === "monthly",
  );
  const [selectedCode, setSelectedCode] = useState(
    defaultOption?.code ?? course.purchaseOptions[0]?.code ?? "one_time",
  );

  const selectedOption = useMemo(
    () =>
      course.purchaseOptions.find((option) => option.code === selectedCode) ??
      course.purchaseOptions[0],
    [course.purchaseOptions, selectedCode],
  );

  if (!selectedOption) return null;

  const selectedPresentation = getPlanPresentation(course, selectedOption);

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-8">
        <header>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-accent">
            Proceso de inscripcion
          </p>
          <h1 className="mt-3 text-4xl font-bold text-primary">
            Finalizar compra
          </h1>
        </header>

        <section className="portal-card p-8">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
              1
            </span>
            <h2 className="text-lg font-bold uppercase tracking-[0.16em] text-primary">
              Detalle del pedido
            </h2>
          </div>

          <div className="flex flex-col gap-5 border border-border bg-background p-5 md:flex-row">
            <div className="h-28 w-full shrink-0 overflow-hidden bg-muted md:w-28">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={course.thumbnailUrl || "/diplomadoamparo.png"}
                alt={course.title}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-accent">
                {course.badgeText || "Programa online"}
              </p>
              <div className="mt-2 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-primary">
                    {course.title}
                  </h3>
                  <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
                    {course.description}
                  </p>
                </div>
                <div className="shrink-0 text-left md:text-right">
                  <p className="text-3xl font-bold text-primary">
                    {formatCurrency(course.priceMxn) ?? "Consultar"}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Precio total
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="portal-card p-8">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
              2
            </span>
            <h2 className="text-lg font-bold uppercase tracking-[0.16em] text-primary">
              Elige tu plan de pago
            </h2>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {course.purchaseOptions.map((option) => {
              const presentation = getPlanPresentation(course, option);
              const selected = option.code === selectedCode;

              return (
                <button
                  key={option.code}
                  type="button"
                  onClick={() => setSelectedCode(option.code)}
                  className={`relative border p-5 text-left transition-colors ${
                    selected
                      ? "border-accent bg-accent/5"
                      : "border-border bg-background hover:border-accent/50"
                  }`}
                >
                  {presentation.badge ? (
                    <span className="absolute -top-2 left-4 bg-emerald-500 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white">
                      {presentation.badge}
                    </span>
                  ) : null}

                  <p className="text-sm font-semibold text-primary">
                    {option.label}
                  </p>
                  <div className="mt-4 flex items-end gap-1">
                    <p className="text-4xl font-bold text-primary">
                      {presentation.amount}
                    </p>
                    <span className="pb-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      {presentation.suffix}
                    </span>
                  </div>
                  <p className="mt-3 text-xs leading-6 text-muted-foreground">
                    {presentation.caption}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        <section className="portal-card p-8">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
              3
            </span>
            <h2 className="text-lg font-bold uppercase tracking-[0.16em] text-primary">
              Pago seguro
            </h2>
          </div>

          <div className="space-y-4">
            <div className="border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-700">
              {selectedOption.code === "one_time"
                ? "Se procesara un pago unico seguro para activar tu acceso al programa."
                : `Se cobrara ${selectedPresentation.amount} ${selectedPresentation.suffix} conforme al plan seleccionado.`}
            </div>

            <div className="border border-border bg-background p-5">
              <div className="flex items-center gap-3 text-sm font-semibold text-primary">
                <CreditCard className="h-4 w-4 text-accent" />
                Tarjeta
              </div>
              <div className="mt-4 flex items-start gap-3 text-sm text-muted-foreground">
                <LockKeyhole className="mt-0.5 h-4 w-4 text-emerald-600" />
                <p className="leading-7">
                  El pago se procesa en una terminal segura de Stripe. Al
                  confirmar, el sistema abrira la pasarela protegida para
                  capturar tu tarjeta y activar tu acceso automaticamente.
                </p>
              </div>
            </div>

            <form action={createCheckoutSession}>
              <input type="hidden" name="course_id" value={course.id} />
              <input type="hidden" name="course_slug" value={course.slug} />
              <input type="hidden" name="price_id" value={selectedOption.priceId} />
              <input type="hidden" name="mode" value={selectedOption.mode} />
              <input
                type="hidden"
                name="purchase_option"
                value={selectedOption.code}
              />
              <input type="hidden" name="success_path" value={`/courses/${course.slug}?checkout=success`} />
              <input type="hidden" name="cancel_path" value={returnPath} />

              <Button
                type="submit"
                className="mt-2 w-full rounded-none bg-accent px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-primary hover:bg-accent/90"
              >
                {selectedOption.mode === "subscription"
                  ? `Suscribirme - ${selectedPresentation.amount}${selectedPresentation.suffix}`
                  : `Pagar ${selectedPresentation.amount}`}
              </Button>
            </form>
          </div>
        </section>
      </div>

      <aside className="space-y-6">
        <section className="bg-primary p-8 text-white">
          <h2 className="text-lg font-bold text-accent">Resumen de Inversion</h2>

          <div className="mt-6 space-y-4 text-sm">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-3">
              <span className="text-white/70">Programa</span>
              <span className="max-w-[160px] text-right font-semibold">
                {course.title}
              </span>
            </div>
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-3">
              <span className="text-white/70">Precio total</span>
              <span className="font-semibold">
                {formatCurrency(course.priceMxn) ?? "Consultar"}
              </span>
            </div>
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-3">
              <span className="text-white/70">Plan</span>
              <span className="font-semibold text-accent">
                {selectedOption.label}
              </span>
            </div>
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-3">
              <span className="text-white/70">Metodo</span>
              <span className="font-semibold">Tarjeta</span>
            </div>
          </div>

          <div className="mt-8 border-t border-white/10 pt-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">
              Cobro {selectedOption.mode === "subscription" ? "mensual" : "inmediato"}
            </p>
            <p className="mt-3 text-4xl font-bold">{selectedPresentation.amount}</p>
            <p className="mt-2 text-xs leading-6 text-white/70">
              {selectedOption.description}
            </p>
          </div>
        </section>

        <section className="portal-card p-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Navegacion
          </p>
          <Link
            href={`/courses/${course.slug}`}
            className="mt-4 block text-sm font-bold uppercase tracking-[0.18em] text-secondary underline underline-offset-4"
          >
            Volver al curso
          </Link>
          <div className="mt-6 flex items-center gap-2 rounded-none border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
            <ShieldCheck className="h-4 w-4" />
            Transaccion 100% encriptada
          </div>
        </section>
      </aside>
    </div>
  );
}
