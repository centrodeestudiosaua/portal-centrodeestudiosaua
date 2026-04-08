"use client";

import { useState } from "react";
import { Globe, KeyRound, Mail, Shield, User2 } from "lucide-react";

type AdminSettingsPageProps = {
  user: {
    fullName: string;
    email: string | null;
    role: string | null;
    membershipLabel: string | null;
    createdAtLabel: string;
    emailConfirmedLabel: string;
  };
  adminUsers: Array<{
    id: string;
    fullName: string;
    email: string;
    createdAtLabel: string;
    emailConfirmedLabel: string;
  }>;
};

export function AdminSettingsPage({ user, adminUsers }: AdminSettingsPageProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [newAdminName, setNewAdminName] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [teamMessage, setTeamMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
  const [resendingFor, setResendingFor] = useState<string | null>(null);

  const handleSendReset = async () => {
    if (!user.email || isSubmitting) return;

    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/auth/request-password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      });

      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error || "No se pudo enviar el correo");
      }

      setMessage({
        type: "success",
        text: `Se envio el correo de cambio de contraseña a ${user.email}.`,
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "No se pudo enviar el correo",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCreatingAdmin) return;

    setIsCreatingAdmin(true);
    setTeamMessage(null);

    try {
      const response = await fetch("/api/admin/settings/admin-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: newAdminName,
          email: newAdminEmail,
        }),
      });

      const payload = (await response.json()) as { error?: string; message?: string };
      if (!response.ok) {
        throw new Error(payload.error || "No se pudo crear el admin");
      }

      setTeamMessage({
        type: "success",
        text: payload.message || "Se guardó el admin y se envió el acceso.",
      });
      setNewAdminName("");
      setNewAdminEmail("");
    } catch (error) {
      setTeamMessage({
        type: "error",
        text: error instanceof Error ? error.message : "No se pudo crear el admin",
      });
    } finally {
      setIsCreatingAdmin(false);
    }
  };

  const handleResendAccess = async (email: string, fullName: string) => {
    if (resendingFor) return;

    setResendingFor(email);
    setTeamMessage(null);

    try {
      const response = await fetch("/api/admin/settings/resend-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, fullName }),
      });

      const payload = (await response.json()) as { error?: string; message?: string };
      if (!response.ok) {
        throw new Error(payload.error || "No se pudo reenviar el acceso");
      }

      setTeamMessage({
        type: "success",
        text: payload.message || `Se reenviaron las instrucciones a ${email}.`,
      });
    } catch (error) {
      setTeamMessage({
        type: "error",
        text: error instanceof Error ? error.message : "No se pudo reenviar el acceso",
      });
    } finally {
      setResendingFor(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
          <Shield className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Ajustes</h1>
          <p className="text-sm text-slate-500">
            Administra tu acceso al panel y consulta la configuración operativa básica.
          </p>
        </div>
      </div>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-[28px] border border-[#e8decf] bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f4efe6] text-[#9B3328]">
              <User2 className="h-4.5 w-4.5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Cuenta administrativa</h2>
              <p className="text-sm text-slate-500">
                Datos del usuario que actualmente controla el panel.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <InfoCard label="Nombre" value={user.fullName || "Sin nombre"} />
            <InfoCard label="Correo de acceso" value={user.email || "Sin correo"} />
            <InfoCard label="Rol" value={user.role || "admin"} />
            <InfoCard label="Estado" value={user.membershipLabel || "Administrador activo"} />
            <InfoCard label="Miembro desde" value={user.createdAtLabel} />
            <InfoCard label="Correo confirmado" value={user.emailConfirmedLabel} />
          </div>
        </article>

        <article className="rounded-[28px] border border-[#e8decf] bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f4efe6] text-[#9B3328]">
              <KeyRound className="h-4.5 w-4.5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Seguridad y contraseña</h2>
              <p className="text-sm text-slate-500">
                Cambia tu contraseña con un correo transaccional branded.
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-[#efe4d3] bg-[#fcfaf6] p-5">
            <p className="text-sm leading-7 text-slate-600">
              El administrador no debe cambiar su contraseña desde campos inseguros dentro del panel.
              El flujo correcto es enviar un correo de recuperación al acceso actual y definir la nueva
              contraseña desde el enlace seguro.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleSendReset}
                disabled={!user.email || isSubmitting}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#9B3328] px-5 text-xs font-bold uppercase tracking-[0.18em] text-white transition hover:bg-[#842b22] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Mail className="h-4 w-4" />
                {isSubmitting ? "Enviando..." : "Enviar cambio de contraseña"}
              </button>
            </div>

            {message ? (
              <div
                className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${
                  message.type === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                {message.text}
              </div>
            ) : null}
          </div>
        </article>
      </section>

      <section>
        <article className="rounded-[28px] border border-[#e8decf] bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f4efe6] text-[#9B3328]">
              <Globe className="h-4.5 w-4.5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Dominios operativos</h2>
              <p className="text-sm text-slate-500">
                Referencia rápida de las entradas activas del ecosistema AUA.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <LinkRow
              label="Landing pública"
              href="https://centrodeestudiosaua.com"
            />
            <LinkRow
              label="Portal alumnos"
              href="https://alumnos.centrodeestudiosaua.com/login"
            />
            <LinkRow
              label="Panel admin"
              href="https://admin.centrodeestudiosaua.com/dashboard"
            />
          </div>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <article className="rounded-[28px] border border-[#e8decf] bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f4efe6] text-[#9B3328]">
              <Mail className="h-4.5 w-4.5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Crear admin</h2>
              <p className="text-sm text-slate-500">
                Alta un usuario administrativo y envía su acceso branded.
              </p>
            </div>
          </div>

          <form onSubmit={handleCreateAdmin} className="mt-6 space-y-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                Nombre completo
              </label>
              <input
                value={newAdminName}
                onChange={(e) => setNewAdminName(e.target.value)}
                required
                className="mt-2 h-12 w-full rounded-[14px] border border-[#e8decf] bg-[#fcfaf6] px-4 text-sm text-slate-900 outline-none transition focus:border-[#caa971]"
                placeholder="Ej. Victor Valencia"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                Correo de acceso
              </label>
              <input
                type="email"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                required
                className="mt-2 h-12 w-full rounded-[14px] border border-[#e8decf] bg-[#fcfaf6] px-4 text-sm text-slate-900 outline-none transition focus:border-[#caa971]"
                placeholder="admin@centrodeestudiosaua.com"
              />
            </div>

            <button
              type="submit"
              disabled={isCreatingAdmin}
              className="inline-flex h-11 items-center justify-center rounded-xl bg-[#9B3328] px-5 text-xs font-bold uppercase tracking-[0.18em] text-white transition hover:bg-[#842b22] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isCreatingAdmin ? "Guardando..." : "Crear admin y enviar acceso"}
            </button>

            {teamMessage ? (
              <div
                className={`rounded-2xl border px-4 py-3 text-sm ${
                  teamMessage.type === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                {teamMessage.text}
              </div>
            ) : null}
          </form>
        </article>

        <article className="rounded-[28px] border border-[#e8decf] bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f4efe6] text-[#9B3328]">
              <Shield className="h-4.5 w-4.5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Equipo administrativo</h2>
              <p className="text-sm text-slate-500">
                Consulta admins activos y reenvía sus instrucciones de acceso.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {adminUsers.map((adminUser) => (
              <div
                key={adminUser.id}
                className="rounded-2xl border border-[#efe4d3] bg-[#fcfaf6] px-4 py-4"
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{adminUser.fullName}</p>
                    <p className="text-xs text-slate-500">{adminUser.email}</p>
                    <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-slate-500">
                      <span>Alta: {adminUser.createdAtLabel}</span>
                      <span>Correo: {adminUser.emailConfirmedLabel}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleResendAccess(adminUser.email, adminUser.fullName)}
                    disabled={resendingFor === adminUser.email}
                    className="inline-flex h-10 items-center justify-center rounded-xl border border-[#dcc7a4] bg-white px-4 text-[11px] font-bold uppercase tracking-[0.16em] text-[#9B3328] transition hover:bg-[#fff8ef] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {resendingFor === adminUser.email ? "Enviando..." : "Reenviar acceso"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#efe4d3] bg-[#fcfaf6] px-4 py-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function LinkRow({ label, href }: { label: string; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="flex items-center justify-between rounded-2xl border border-[#efe4d3] bg-[#fcfaf6] px-4 py-4 text-sm text-slate-700 transition hover:border-[#dcc7a4] hover:bg-white"
    >
      <span className="font-semibold">{label}</span>
      <span className="truncate pl-4 text-right text-xs text-slate-500">{href}</span>
    </a>
  );
}
