import Link from "next/link";
import { CalendarClock, CircleAlert, CreditCard, ShieldCheck } from "lucide-react";
import { connection } from "next/server";

import { getPaymentsPageData } from "@/lib/portal/data";

export default async function PaymentsPage() {
  await connection();
  const data = await getPaymentsPageData();
  const accounts = data?.accounts ?? [];

  return (
    <div className="space-y-8">
      <header>
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-accent">
          Mis Pagos
        </p>
        <h1 className="mt-3 text-4xl font-bold text-primary">
          Cobros, renovaciones y estado de tu plan
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
          Aqui puedes revisar tu inversion actual, proximos cobros automaticos,
          historial de pagos y el estado de acceso de cada programa.
        </p>
      </header>

      {accounts.length ? (
        <div className="space-y-8">
          {accounts.map((account) => (
            <section key={account.courseId} className="portal-card overflow-hidden">
              <div className="grid gap-0 xl:grid-cols-[1.2fr_0.8fr]">
                <div className="p-8">
                  <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-accent">
                        Programa
                      </p>
                      <h2 className="mt-3 text-3xl font-bold text-primary">
                        {account.courseTitle}
                      </h2>
                      <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold uppercase tracking-[0.18em]">
                        <span className="rounded-full bg-accent/10 px-3 py-1 text-accent">
                          {account.planLabel}
                        </span>
                        <span className="rounded-full bg-secondary/10 px-3 py-1 text-secondary">
                          {account.paymentStatusLabel}
                        </span>
                        <span className="rounded-full bg-primary/5 px-3 py-1 text-primary/80">
                          Acceso {account.accessStatusLabel}
                        </span>
                      </div>
                    </div>

                    <Link
                      href={`/courses/${account.courseSlug}`}
                      className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-secondary underline underline-offset-4"
                    >
                      Ver curso
                    </Link>
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-2xl border border-border bg-muted/30 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                        Cobro actual
                      </p>
                      <p className="mt-3 text-2xl font-bold text-primary">
                        {account.currentChargeLabel}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-border bg-muted/30 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                        Proximo cobro
                      </p>
                      <p className="mt-3 text-lg font-bold text-primary">
                        {account.nextChargeLabel || "Sin renovacion pendiente"}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-border bg-muted/30 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                        Progreso del plan
                      </p>
                      <p className="mt-3 text-lg font-bold text-primary">
                        {account.paidInstallmentsLabel || "Pago liquidado"}
                      </p>
                      {account.remainingInstallmentsLabel ? (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {account.remainingInstallmentsLabel}
                        </p>
                      ) : null}
                    </div>

                    <div className="rounded-2xl border border-border bg-muted/30 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                        Metodo
                      </p>
                      <p className="mt-3 text-lg font-bold text-primary">
                        {account.paymentMethodLabel || "Tarjeta registrada"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 lg:grid-cols-2">
                    <div className="rounded-2xl border border-border p-5">
                      <div className="flex items-start gap-3">
                        <ShieldCheck className="mt-0.5 h-5 w-5 text-accent" />
                        <div>
                          <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-primary">
                            Estado del acceso
                          </h3>
                          <p className="mt-2 text-sm leading-7 text-muted-foreground">
                            {account.accessMessage}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-border p-5">
                      <div className="flex items-start gap-3">
                        <CalendarClock className="mt-0.5 h-5 w-5 text-secondary" />
                        <div>
                          <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-primary">
                            Renovacion automatica
                          </h3>
                          <p className="mt-2 text-sm leading-7 text-muted-foreground">
                            {account.renewalCadenceLabel ||
                              "Este programa no tiene renovaciones automaticas."}
                          </p>
                          {account.startDateLabel ? (
                            <p className="mt-2 text-sm font-medium text-primary">
                              Inicio del diplomado: {account.startDateLabel}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8">
                    <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-primary">
                      Historial de movimientos
                    </h3>
                    <div className="mt-4 overflow-hidden rounded-2xl border border-border">
                      <table className="w-full text-left">
                        <thead className="bg-muted/40">
                          <tr className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                            <th className="px-4 py-3">Movimiento</th>
                            <th className="px-4 py-3">Fecha</th>
                            <th className="px-4 py-3">Monto</th>
                            <th className="px-4 py-3">Estado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {account.history.length ? (
                            account.history.map((row) => (
                              <tr key={row.id} className="border-t border-border text-sm">
                                <td className="px-4 py-4 text-primary">{row.title}</td>
                                <td className="px-4 py-4 text-muted-foreground">{row.dateLabel}</td>
                                <td className="px-4 py-4 font-semibold text-primary">
                                  {row.amountLabel}
                                </td>
                                <td className="px-4 py-4">
                                  <span className="rounded-full bg-secondary/10 px-2.5 py-1 text-xs font-bold uppercase tracking-[0.14em] text-secondary">
                                    {row.statusLabel}
                                  </span>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr className="border-t border-border">
                              <td colSpan={4} className="px-4 py-6 text-sm text-muted-foreground">
                                Aun no hay movimientos visibles para este programa.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <aside className="border-t border-border bg-muted/20 p-8 xl:border-l xl:border-t-0">
                  <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-primary">
                    Calendario del plan
                  </h3>
                  <div className="mt-5 space-y-3">
                    {account.schedule.length ? (
                      account.schedule.map((item) => (
                        <div
                          key={item.id}
                          className="rounded-2xl border border-border bg-background px-4 py-4"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-sm font-semibold text-primary">
                                {item.label}
                              </p>
                              <p className="mt-1 text-sm text-muted-foreground">
                                {item.dateLabel}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-primary">
                                {item.amountLabel}
                              </p>
                              <p
                                className={`mt-1 text-[10px] font-bold uppercase tracking-[0.16em] ${
                                  item.state === "paid" ? "text-accent" : "text-secondary"
                                }`}
                              >
                                {item.state === "paid" ? "Cobrado" : "Programado"}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-2xl border border-dashed border-border bg-background px-4 py-5 text-sm text-muted-foreground">
                        No hay renovaciones pendientes para este programa.
                      </div>
                    )}
                  </div>

                  <div className="mt-6 rounded-2xl border border-border bg-background p-5">
                    <div className="flex items-start gap-3">
                      <CreditCard className="mt-0.5 h-5 w-5 text-secondary" />
                      <div>
                        <h4 className="text-sm font-bold uppercase tracking-[0.16em] text-primary">
                          Proximamente
                        </h4>
                        <p className="mt-2 text-sm leading-7 text-muted-foreground">
                          La siguiente iteracion conectara esta vista para actualizar
                          tarjeta, reintentar cobros pendientes y descargar comprobantes.
                        </p>
                      </div>
                    </div>
                  </div>
                </aside>
              </div>
            </section>
          ))}
        </div>
      ) : (
        <section className="portal-card max-w-4xl p-10">
          <div className="flex items-start gap-4">
            <CircleAlert className="mt-1 h-5 w-5 text-secondary" />
            <div>
              <h2 className="text-2xl font-bold text-primary">
                Aun no hay planes activos en tu cuenta
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
                Cuando completes un pago o una inscripcion en parcialidades,
                aqui aparecera tu resumen financiero y el calendario de cobros.
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
