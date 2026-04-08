import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";

export async function PATCH(request: Request) {
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

  const body: { ids?: string[]; status?: string } = await request.json();
  const ids = Array.isArray(body.ids) ? body.ids.filter(Boolean) : [];
  const status = body.status?.trim();

  if (ids.length === 0 || !status) {
    return NextResponse.json({ error: "Faltan ids o estatus." }, { status: 400 });
  }

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  const { error } = await admin
    .from("leads")
    .update({ status })
    .in("id", ids);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, updated: ids.length });
}
