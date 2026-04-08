import { connection } from "next/server";
import { Users } from "lucide-react";
import { createClient as createAdminClient } from "@supabase/supabase-js";

import { LeadsTable } from "@/components/admin/leads-table";

async function getLeads() {
  const supabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  const { data } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  return data ?? [];
}

export default async function AdminLeadsPage() {
  await connection();
  const leads = await getLeads();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Leads</h1>
            <p className="text-sm text-slate-500">
              Contactos del formulario de inscripción
            </p>
          </div>
        </div>
      </div>

      {/* Stats rápidas */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
        {[
          { label: "Total", value: leads.length, color: "text-slate-700" },
          { label: "Nuevos", value: leads.filter(l => l.status === "nuevo").length, color: "text-blue-600" },
          { label: "Contactados", value: leads.filter(l => l.status === "contactado").length, color: "text-yellow-600" },
          { label: "En seguimiento", value: leads.filter(l => l.status === "en_seguimiento").length, color: "text-purple-600" },
          { label: "Ganados", value: leads.filter(l => l.status === "cerrado_ganado").length, color: "text-green-600" },
          { label: "Perdidos", value: leads.filter(l => l.status === "cerrado_perdido").length, color: "text-red-600" },
        ].map(stat => (
          <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tabla */}
      <LeadsTable leads={leads} />
    </div>
  );
}
