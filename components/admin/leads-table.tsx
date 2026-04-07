"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Download, Search, Plus } from "lucide-react";

type Lead = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  company: string | null;
  education_level: string | null;
  city: string | null;
  course_slug: string | null;
  source: string;
  status: string;
  notes: string | null;
  created_at: string;
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  nuevo:           { label: "Nuevo",          color: "bg-blue-100 text-blue-700" },
  contactado:      { label: "Contactado",     color: "bg-yellow-100 text-yellow-700" },
  en_seguimiento:  { label: "En seguimiento", color: "bg-purple-100 text-purple-700" },
  cerrado_ganado:  { label: "Ganado ✓",       color: "bg-green-100 text-green-700" },
  cerrado_perdido: { label: "Perdido",        color: "bg-red-100 text-red-700" },
};

function exportCSV(leads: Lead[]) {
  const headers = ["Nombre", "Email", "Teléfono", "Empresa", "Grado de Estudios", "Ciudad", "Fuente", "Estado", "Fecha"];
  const rows = leads.map((l) => [
    l.full_name,
    l.email,
    l.phone ?? "",
    l.company ?? "",
    l.education_level ?? "",
    l.city ?? "",
    l.source,
    STATUS_LABELS[l.status]?.label ?? l.status,
    new Date(l.created_at).toLocaleDateString("es-MX"),
  ]);
  const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `leads-aua-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

async function updateLeadStatus(id: string, status: string) {
  await fetch(`/api/admin/leads/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
}

export function LeadsTable({ leads }: { leads: Lead[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("todos");
  const [isPending, startTransition] = useTransition();

  const filtered = leads.filter((l) => {
    const matchSearch =
      l.full_name.toLowerCase().includes(search.toLowerCase()) ||
      l.email.toLowerCase().includes(search.toLowerCase()) ||
      (l.phone ?? "").includes(search);
    const matchFilter = filter === "todos" || l.status === filter;
    return matchSearch && matchFilter;
  });

  function handleStatusChange(id: string, status: string) {
    startTransition(async () => {
      await updateLeadStatus(id, status);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, email o teléfono..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 text-sm text-slate-800 outline-none focus:border-[#9B1D20] sm:w-72"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#9B1D20]"
          >
            <option value="todos">Todos los estados</option>
            {Object.entries(STATUS_LABELS).map(([value, { label }]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>

          {/* Export */}
          <button
            onClick={() => exportCSV(filtered)}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <Download className="h-4 w-4" />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Count */}
      <p className="text-sm text-slate-500">
        {filtered.length} de {leads.length} leads
      </p>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">Nombre</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">Contacto</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">Perfil</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">Fuente</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">Estado</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-400">
                    No hay leads con esos criterios
                  </td>
                </tr>
              ) : (
                filtered.map((lead) => {
                  const statusInfo = STATUS_LABELS[lead.status] ?? { label: lead.status, color: "bg-slate-100 text-slate-600" };
                  return (
                    <tr key={lead.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-800">{lead.full_name}</p>
                        {lead.course_slug && (
                          <p className="text-[10px] text-slate-400 mt-0.5">{lead.course_slug}</p>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-slate-700">{lead.email}</p>
                        {lead.phone && <p className="text-slate-400 text-xs">{lead.phone}</p>}
                      </td>
                      <td className="px-5 py-4">
                        {lead.company && <p className="text-xs text-slate-700 font-medium">{lead.company}</p>}
                        {lead.education_level && <p className="text-[10px] text-slate-400">{lead.education_level}</p>}
                        {lead.city && <p className="text-[10px] text-slate-400">{lead.city}</p>}
                        {!lead.company && !lead.education_level && !lead.city && <span className="text-xs text-slate-400">—</span>}
                      </td>
                      <td className="px-5 py-4 text-slate-500">{lead.source}</td>
                      <td className="px-5 py-4">
                        <select
                          defaultValue={lead.status}
                          disabled={isPending}
                          onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                          className={`rounded-lg px-2.5 py-1 text-[11px] font-bold border-0 outline-none cursor-pointer ${statusInfo.color}`}
                        >
                          {Object.entries(STATUS_LABELS).map(([value, { label }]) => (
                            <option key={value} value={value}>{label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-5 py-4 text-slate-500 text-xs whitespace-nowrap">
                        {new Date(lead.created_at).toLocaleDateString("es-MX")}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
