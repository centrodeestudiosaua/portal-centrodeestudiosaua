import { NextResponse } from "next/server";

import { findOrCreateAdminUser, requireAdminRequester, sendAdminAccessEmail } from "../_shared";

export async function POST(request: Request) {
  const authResult = await requireAdminRequester();
  if ("error" in authResult) {
    return authResult.error;
  }

  try {
    const body = (await request.json()) as { email?: string; fullName?: string };
    const email = (body.email || "").trim().toLowerCase();
    const fullName = (body.fullName || "").trim();

    if (!email || !fullName) {
      return NextResponse.json({ error: "Nombre y correo son obligatorios" }, { status: 400 });
    }

    const origin = new URL(request.url).origin;
    const { existed } = await findOrCreateAdminUser({
      admin: authResult.admin,
      email,
      fullName,
    });

    await sendAdminAccessEmail({
      admin: authResult.admin,
      email,
      fullName,
      origin,
      mode: existed ? "resend" : "create",
    });

    return NextResponse.json({
      ok: true,
      mode: existed ? "resend" : "create",
      message: existed
        ? "El admin ya existia. Se reenviaron sus instrucciones de acceso."
        : "El admin fue creado y se envio el correo de acceso.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo crear el admin";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
