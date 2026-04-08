import crypto from "crypto";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { renderPortalEmail, sendTransactionalEmail } from "@/lib/email";
import { createClient } from "@/lib/supabase/server";

export async function requireAdminRequester() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const { data: profile } = await supabase
    .from("student_profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return {
      error: NextResponse.json({ error: "Missing Supabase configuration" }, { status: 500 }),
    };
  }

  const admin = createAdminClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  return { admin, user };
}

export async function sendAdminAccessEmail(input: {
  admin: any;
  email: string;
  fullName: string;
  origin: string;
  mode: "create" | "resend";
}) {
  const normalizedEmail = input.email.trim().toLowerCase();
  const nextPath = "/dashboard";
  const setPasswordPath = `/auth/update-password?next=${encodeURIComponent(nextPath)}`;

  const { data: linkData, error: linkError } = await input.admin.auth.admin.generateLink({
    type: "recovery",
    email: normalizedEmail,
    options: {
      redirectTo: `${input.origin}${setPasswordPath}`,
    },
  });

  if (linkError || !linkData.properties?.hashed_token) {
    throw new Error("No se pudo preparar el acceso al panel");
  }

  const activationUrl = `${input.origin}/auth/confirm?token_hash=${encodeURIComponent(
    linkData.properties.hashed_token,
  )}&type=recovery&next=${encodeURIComponent(setPasswordPath)}`;

  await sendTransactionalEmail({
    to: normalizedEmail,
    subject:
      input.mode === "create"
        ? "Tu acceso al panel admin AUA fue creado"
        : "Vuelve a acceder al panel admin AUA",
    html: renderPortalEmail({
      preview:
        input.mode === "create"
          ? "Tu acceso administrativo fue creado. Define tu contraseña."
          : "Te reenviamos el acceso al panel administrativo.",
      title: input.mode === "create" ? "Tu acceso administrativo fue creado" : "Te reenviamos tu acceso",
      body:
        input.mode === "create"
          ? `Creamos el acceso administrativo para ${input.fullName || normalizedEmail}. Usa el siguiente boton para definir tu contraseña y entrar al panel admin de AUA.`
          : `Reenviamos el acceso administrativo para ${input.fullName || normalizedEmail}. Usa el siguiente boton para definir o actualizar tu contraseña y entrar al panel admin de AUA.`,
      ctaLabel: input.mode === "create" ? "Activar acceso admin" : "Entrar al panel admin",
      ctaUrl: activationUrl,
    }),
  });
}

export async function findOrCreateAdminUser(input: {
  admin: any;
  email: string;
  fullName: string;
}) {
  const normalizedEmail = input.email.trim().toLowerCase();
  const listedUsers = await input.admin.auth.admin.listUsers({ page: 1, perPage: 500 });
  const existingUser =
    listedUsers.data?.users.find((listedUser: any) => (listedUser.email ?? "").toLowerCase() === normalizedEmail) ??
    null;

  let userId = existingUser?.id ?? null;

  if (!userId) {
    const { data: createdUser, error: createUserError } = await input.admin.auth.admin.createUser({
      email: normalizedEmail,
      email_confirm: true,
      password: crypto.randomUUID(),
      user_metadata: {
        full_name: input.fullName,
      },
    });

    if (createUserError || !createdUser.user) {
      throw new Error(createUserError?.message ?? "No se pudo crear el usuario admin");
    }

    userId = createdUser.user.id;
  }

  await input.admin.from("student_profiles").upsert(
    {
      id: userId,
      email: normalizedEmail,
      full_name: input.fullName,
      role: "admin",
      membership_label: "Administrador activo",
    } as never,
    { onConflict: "id" },
  );

  return { userId, existed: Boolean(existingUser) };
}
