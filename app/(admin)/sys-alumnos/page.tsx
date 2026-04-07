import { connection } from "next/server";
import { GraduationCap } from "lucide-react";
import { createClient as createAdminClient } from "@supabase/supabase-js";

async function getAlumnos() {
  const supabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  const { data } = await supabase
    .from("student_profiles")
    .select("id, full_name, email, phone, role, membership_label, created_at")
    .eq("role", "student")
    .order("created_at", { ascending: false });

  return data ?? [];
}

export default async function AdminAlumnosPage() {
  await connection();
  const alumnos = await getAlumnos();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
          <GraduationCap className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Alumnos</h1>
          <p className="text-sm text-slate-500">{alumnos.length} alumnos registrados en la plataforma</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">Nombre</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">Email</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">Teléfono</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">Membresía</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">Registro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {alumnos.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-400">Sin alumnos registrados</td></tr>
              ) : alumnos.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/60">
                  <td className="px-5 py-4 font-semibold text-slate-800">{a.full_name || "—"}</td>
                  <td className="px-5 py-4 text-slate-600">{a.email}</td>
                  <td className="px-5 py-4 text-slate-500">{a.phone || "—"}</td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                      {a.membership_label || "Activo"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-400 text-xs">
                    {new Date(a.created_at).toLocaleDateString("es-MX")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
