"use client";

import { useState } from "react";
import { CheckCircle2, Globe, KeyRound, Mail, Shield, User2 } from "lucide-react";

type AdminSettingsPageProps = {
  user: {
    fullName: string;
    email: string | null;
    role: string | null;
    membershipLabel: string | null;
    createdAtLabel: string;
    emailConfirmedLabel: string;
  };
};

export function AdminSettingsPage({ user }: AdminSettingsPageProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

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

      <section className="grid gap-6 lg:grid-cols-2">
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

        <article className="rounded-[28px] border border-[#e8decf] bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f4efe6] text-[#9B3328]">
              <CheckCircle2 className="h-4.5 w-4.5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Qué debe llevar esta sección</h2>
              <p className="text-sm text-slate-500">
                Base operativa correcta para un cliente no técnico.
              </p>
            </div>
          </div>

          <ul className="mt-6 space-y-3 text-sm leading-7 text-slate-600">
            <li>Cuenta administrativa actual y correo de acceso.</li>
            <li>Cambio de contraseña por correo seguro.</li>
            <li>Estado de confirmación del correo.</li>
            <li>Dominios activos del ecosistema.</li>
            <li>Más adelante: usuarios admin, roles y correos transaccionales.</li>
          </ul>
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
