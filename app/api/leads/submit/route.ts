import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

const ALLOWED_ORIGINS = new Set([
  "https://centrodeestudiosaua.com",
  "https://www.centrodeestudiosaua.com",
  "https://alumnos.centrodeestudiosaua.com",
  "https://admin.centrodeestudiosaua.com",
  "http://lpegr6dng54cqna3yxlx5fup.66.94.112.145.sslip.io",
  "https://lpegr6dng54cqna3yxlx5fup.66.94.112.145.sslip.io",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
]);

function buildCorsHeaders(origin: string | null) {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (origin && ALLOWED_ORIGINS.has(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers.Vary = "Origin";
  }

  return headers;
}

function jsonWithCors(body: unknown, init: ResponseInit, origin: string | null) {
  const headers = new Headers(init.headers);
  const corsHeaders = buildCorsHeaders(origin);

  Object.entries(corsHeaders).forEach(([key, value]) => {
    headers.set(key, value);
  });

  return NextResponse.json(body, {
    ...init,
    headers,
  });
}

function normalizeEmail(value: string | null | undefined) {
  return (value || "").trim().toLowerCase();
}

function normalizePhone(value: string | null | undefined, countryCode?: string | null) {
  const digits = (value || "").replace(/\D/g, "");
  const code = (countryCode || "").replace(/\D/g, "");

  if (!digits) return null;
  return code ? `+${code}${digits}` : digits;
}

function buildFullName(input: {
  fullName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  maternalLastName?: string | null;
}) {
  const direct = (input.fullName || "").trim();
  if (direct) return direct;

  return [input.firstName, input.lastName, input.maternalLastName]
    .map((value) => (value || "").trim())
    .filter(Boolean)
    .join(" ");
}

export async function OPTIONS(request: Request) {
  const origin = request.headers.get("origin");
  return new NextResponse(null, {
    status: 204,
    headers: buildCorsHeaders(origin),
  });
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");

  try {
    if (origin && !ALLOWED_ORIGINS.has(origin)) {
      return jsonWithCors({ error: "Origin not allowed" }, { status: 403 }, origin);
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return jsonWithCors({ error: "Missing Supabase configuration" }, { status: 500 }, origin);
    }

    const body = (await request.json()) as {
      fullName?: string;
      firstName?: string;
      lastName?: string;
      maternalLastName?: string;
      email?: string;
      phone?: string;
      countryCode?: string;
      educationLevel?: string;
      city?: string;
      company?: string;
      courseSlug?: string;
      source?: string;
      notes?: string;
    };

    const fullName = buildFullName(body);
    const email = normalizeEmail(body.email);
    const phone = normalizePhone(body.phone, body.countryCode);
    const educationLevel = (body.educationLevel || "").trim() || null;
    const city = (body.city || "").trim() || null;
    const company = (body.company || "").trim() || null;
    const courseSlug = (body.courseSlug || "").trim().toLowerCase() || null;
    const source = (body.source || "landing_publica").trim() || "landing_publica";
    const notes = (body.notes || "").trim() || null;

    if (!fullName) {
      return jsonWithCors({ error: "Nombre completo obligatorio" }, { status: 400 }, origin);
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return jsonWithCors({ error: "Correo electronico invalido" }, { status: 400 }, origin);
    }

    if (!phone) {
      return jsonWithCors({ error: "Telefono obligatorio" }, { status: 400 }, origin);
    }

    const admin = createAdminClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const duplicateWindow = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const duplicateQuery = admin
      .from("leads")
      .select("id")
      .eq("email", email)
      .gte("created_at", duplicateWindow)
      .limit(1);

    const { data: duplicateLead, error: duplicateError } = courseSlug
      ? await duplicateQuery.eq("course_slug", courseSlug)
      : await duplicateQuery.is("course_slug", null);

    if (duplicateError) {
      return jsonWithCors({ error: duplicateError.message }, { status: 500 }, origin);
    }

    if (duplicateLead?.length) {
      return jsonWithCors(
        { ok: true, duplicate: true, message: "Lead ya capturado recientemente" },
        { status: 200 },
        origin,
      );
    }

    const { data, error } = await admin
      .from("leads")
      .insert({
        full_name: fullName,
        email,
        phone,
        company,
        education_level: educationLevel,
        city,
        course_slug: courseSlug,
        source,
        status: "nuevo",
        notes,
      } as never)
      .select("id")
      .single();

    if (error) {
      return jsonWithCors({ error: error.message }, { status: 500 }, origin);
    }

    return jsonWithCors(
      {
        ok: true,
        leadId: data?.id ?? null,
        message: "Lead capturado correctamente",
      },
      { status: 201 },
      origin,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo capturar el lead";
    return jsonWithCors({ error: message }, { status: 500 }, origin);
  }
}
