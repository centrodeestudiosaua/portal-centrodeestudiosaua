import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  // Verificar que el usuario es admin
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("student_profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body: {
    full_name?: string;
    email?: string;
    phone?: string | null;
    company?: string | null;
    education_level?: string | null;
    city?: string | null;
    source?: string | null;
    status?: string;
    notes?: string | null;
  } = await request.json();

  const updates: Record<string, string | null | undefined> = {};

  if (typeof body.full_name !== "undefined") {
    updates.full_name = body.full_name.trim();
  }
  if (typeof body.email !== "undefined") {
    updates.email = body.email.trim().toLowerCase();
  }
  if (typeof body.phone !== "undefined") {
    updates.phone = body.phone?.trim() || null;
  }
  if (typeof body.company !== "undefined") {
    updates.company = body.company?.trim() || null;
  }
  if (typeof body.education_level !== "undefined") {
    updates.education_level = body.education_level?.trim() || null;
  }
  if (typeof body.city !== "undefined") {
    updates.city = body.city?.trim() || null;
  }
  if (typeof body.source !== "undefined") {
    updates.source = body.source?.trim() || null;
  }
  if (typeof body.status !== "undefined") {
    updates.status = body.status;
  }
  if (typeof body.notes !== "undefined") {
    updates.notes = body.notes?.trim() || null;
  }

  if (typeof updates.email === "string" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updates.email)) {
    return NextResponse.json({ error: "Correo invalido" }, { status: 400 });
  }

  if (typeof updates.full_name === "string" && !updates.full_name) {
    return NextResponse.json({ error: "Nombre obligatorio" }, { status: 400 });
  }

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  const { error } = await admin
    .from("leads")
    .update(updates)
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
