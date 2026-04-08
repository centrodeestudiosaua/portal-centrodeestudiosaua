import { NextResponse } from "next/server";

import { requireAdminRequester, sendAdminAccessEmail } from "../_shared";

export async function POST(request: Request) {
  const authResult = await requireAdminRequester();
  if ("error" in authResult) {
    return authResult.error;
  }

  try {
    const body = (await request.json()) as { email?: string; fullName?: string };
    const email = (body.email || "").trim().toLowerCase();
    const fullName = (body.fullName || "").trim();

    if (!email) {
      return NextResponse.json({ error: "Correo requerido" }, { status: 400 });
    }

    const { data: profile } = await authResult.admin
      .from("student_profiles")
      .select("id, role")
      .eq("email", email)
      .eq("role", "admin")
      .maybeSingle();

    if (!profile) {
      return NextResponse.json({ error: "No existe un admin con ese correo" }, { status: 404 });
    }

    await sendAdminAccessEmail({
      admin: authResult.admin,
      email,
      fullName: fullName || email,
      origin: new URL(request.url).origin,
      mode: "resend",
    });

    return NextResponse.json({
      ok: true,
      message: "Se reenviaron las instrucciones de acceso al admin.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo reenviar el acceso";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
