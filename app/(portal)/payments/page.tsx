import Link from "next/link";
import { CircleAlert, CreditCard, ShieldCheck } from "lucide-react";
import { connection } from "next/server";

import { getPaymentsPageData } from "@/lib/portal/data";

export default async function PaymentsPage() {
  await connection();
  const data = await getPaymentsPageData();
  const accounts = data?.accounts ?? [];

  return (
    <div className="space-y-7">
      <header>
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-accent">
          Mis Pagos
        </p>
        <h1 className="mt-3 text-4xl font-bold text-primary">
          Cobros, renovaciones y estado de tu plan
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500">
          Aqui puedes revisar tu inversion actual, historial de pagos y el estado
          real de acceso de cada programa.
        </p>
      </header>

      {accounts.length ? (
        <div className="space-y-6">
          {accounts.map((account) => (
            <section key={account.courseId} className="overflow-hidden rounded-xl border border-border bg-white shadow-[0_18px_50px_rgba(21,18,40,0.06)]">
              <div className="grid gap-0 xl:grid-cols-[minmax(0,1.35fr)_340px]">
                <div className="p-6 lg:p-7">
                  <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-accent">
                        Programa
                      </p>
                      <h2 className="mt-3 text-[2rem] font-bold leading-tight text-primary">
                        {account.courseTitle}
                      </h2>
                      <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold uppercase tracking-[0.18em]">
                        <span className="rounded-full bg-accent/10 px-3 py-1 text-primary">
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

                  <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <div className="min-h-[132px] rounded-xl border border-border bg-white p-4">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                        Cobro actual
                      </p>
                      <p className="mt-3 break-words text-[1.7rem] font-bold leading-tight tracking-[-0.03em] text-primary">
                        {account.currentChargeLabel}
                      </p>
                    </div>

                    <div className="min-h-[132px] rounded-xl border border-border bg-white p-4">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                        Proximo cobro
                      </p>
                      <p className="mt-3 text-[1.05rem] font-bold leading-tight text-primary">
                        {account.nextChargeLabel || "Sin renovacion pendiente"}
                      </p>
                    </div>

                    <div className="min-h-[132px] rounded-xl border border-border bg-white p-4">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                        Progreso del plan
                      </p>
                      <p className="mt-3 text-[1.05rem] font-bold leading-tight text-primary">
                        {account.paidInstallmentsLabel || "Pago liquidado"}
                      </p>
                      {account.remainingInstallmentsLabel ? (
                        <p className="mt-2 text-sm leading-6 text-slate-500">
                          {account.remainingInstallmentsLabel}
                        </p>
                      ) : null}
                    </div>

                    <div className="min-h-[132px] rounded-xl border border-border bg-white p-4">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                        Metodo
                      </p>
                      <p className="mt-3 text-[1.05rem] font-bold leading-tight text-primary">
                        {account.paymentMethodLabel || "Tarjeta registrada"}
                      </p>
                    </div>
                  </div>

                  <div className={`mt-5 grid gap-3 ${account.renewalCadenceLabel ? "lg:grid-cols-2" : "lg:grid-cols-1"}`}>
                    <div className="rounded-xl border border-border p-5">
                      <div className="flex items-start gap-3">
                        <ShieldCheck className="mt-0.5 h-5 w-5 text-accent" />
                        <div>
                          <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-primary">
                            Estado del acceso
                          </h3>
                          <p className="mt-2 text-sm leading-7 text-slate-500">
                            {account.accessMessage}
                          </p>
                        </div>
                      </div>
                    </div>

                    {account.renewalCadenceLabel ? (
                      <div className="rounded-xl border border-border p-5">
                        <div className="flex items-start gap-3">
                          <CreditCard className="mt-0.5 h-5 w-5 text-secondary" />
                          <div>
                            <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-primary">
                              Plan de cobro
                            </h3>
                            <p className="mt-2 text-sm leading-7 text-slate-500">
                              {account.renewalCadenceLabel}
                            </p>
                            {account.startDateLabel ? (
                              <p className="mt-2 text-sm font-medium text-primary">
                                Inicio del diplomado: {account.startDateLabel}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-6">
                    <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-primary">
                      Historial de movimientos
                    </h3>
                    <div className="mt-4 overflow-hidden rounded-xl border border-border">
                      <table className="w-full text-left">
                        <thead className="bg-muted/40">
                          <tr className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
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
                                <td className="px-4 py-4 text-slate-500">{row.dateLabel}</td>
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
                              <td colSpan={4} className="px-4 py-6 text-sm text-slate-500">
                                Aun no hay movimientos visibles para este programa.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <aside className="border-t border-border bg-muted/20 p-6 xl:border-l xl:border-t-0 xl:p-6">
                  <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-primary">
                    Calendario del plan
                  </h3>
                  <div className="mt-4 space-y-3">
                    {account.schedule.length ? (
                      account.schedule.map((item) => (
                        <div
                          key={item.id}
                          className="rounded-xl border border-border bg-white px-4 py-4"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-sm font-semibold text-primary">
                                {item.label}
                              </p>
                              <p className="mt-1 text-sm text-slate-500">
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
                      <div className="rounded-xl border border-dashed border-border bg-white px-4 py-5 text-sm text-slate-500">
                        No hay renovaciones pendientes para este programa.
                      </div>
                    )}
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
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500">
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
