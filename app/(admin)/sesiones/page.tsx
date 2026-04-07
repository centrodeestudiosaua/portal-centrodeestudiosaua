import { connection } from "next/server";
import { Video } from "lucide-react";
import { createClient as createAdminClient } from "@supabase/supabase-js";

async function getSesiones() {
  const supabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  const { data } = await supabase
    .from("course_sessions")
    .select("id, title, description, starts_at, meeting_url, is_published, courses(title)")
    .order("starts_at", { ascending: true });

  return data ?? [];
}

export default async function AdminSesionesPage() {
  await connection();
  const sesiones = await getSesiones();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
          <Video className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sesiones en Vivo</h1>
          <p className="text-sm text-slate-500">Administra las clases en vivo y sus enlaces de Zoom</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">Sesión</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">Curso</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">Fecha</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">Zoom Link</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sesiones.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-400">Sin sesiones registradas</td></tr>
              ) : sesiones.map((s: any) => (
                <tr key={s.id} className="hover:bg-slate-50/60">
                  <td className="px-5 py-4 font-semibold text-slate-800 max-w-[200px] truncate">{s.title}</td>
                  <td className="px-5 py-4 text-slate-500 text-xs">
                    {Array.isArray(s.courses) ? s.courses[0]?.title : s.courses?.title ?? "—"}
                  </td>
                  <td className="px-5 py-4 text-slate-600 whitespace-nowrap text-xs">
                    {new Date(s.starts_at).toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" })}
                  </td>
                  <td className="px-5 py-4">
                    {s.meeting_url ? (
                      <a href={s.meeting_url} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-blue-600 underline underline-offset-2 hover:text-blue-800 max-w-[160px] block truncate">
                        {s.meeting_url}
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Sin enlace</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${s.is_published ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                      {s.is_published ? "Publicada" : "Borrador"}
                    </span>
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
