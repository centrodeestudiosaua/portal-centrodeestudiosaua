import { connection } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import CursosClient from "./cursos-client";

async function getCursos() {
  const supabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  const { data } = await supabase
    .from("courses")
    .select("id, slug, title, thumbnail_url, is_published, access_type, price_mxn, installment_amount_mxn, installments_count, duration_label, created_at")
    .order("created_at", { ascending: false });

  return data ?? [];
}

export default async function AdminCursosPage() {
  await connection();
  const cursos = await getCursos();

  return <CursosClient cursos={cursos} />;
}
