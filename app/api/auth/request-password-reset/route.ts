import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

import { renderPortalEmail, sendTransactionalEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const { email } = (await request.json()) as { email?: string };
    const normalizedEmail = (email || "").trim().toLowerCase();

    if (!normalizedEmail) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: "Missing Supabase configuration" }, { status: 500 });
    }

    const admin = createAdminClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
    const nextPath = "/dashboard";

    const { data, error } = await admin.auth.admin.generateLink({
      type: "recovery",
      email: normalizedEmail,
      options: {
        redirectTo: `${origin}/auth/update-password?next=${encodeURIComponent(nextPath)}`,
      },
    });

    if (error || !data.properties?.hashed_token) {
      return NextResponse.json(
        { error: "No se pudo preparar el correo de recuperacion" },
        { status: 500 },
      );
    }

    const recoveryUrl = `${origin}/auth/confirm?token_hash=${encodeURIComponent(
      data.properties.hashed_token,
    )}&type=recovery&next=${encodeURIComponent(
      `/auth/update-password?next=${encodeURIComponent(nextPath)}`,
    )}`;

    await sendTransactionalEmail({
      to: normalizedEmail,
      subject: "Restablece tu acceso al Portal AUA",
      html: renderPortalEmail({
        preview: "Crea una nueva contrasena para entrar al Portal AUA.",
        title: "Restablece tu contrasena",
        body:
          "Recibimos una solicitud para actualizar tu acceso al portal. Usa el siguiente boton para definir una nueva contrasena y entrar a tu cuenta.",
        ctaLabel: "Restablecer acceso",
        ctaUrl: recoveryUrl,
      }),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo enviar el correo";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
