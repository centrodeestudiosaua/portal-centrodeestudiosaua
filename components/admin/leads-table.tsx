"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, useRef } from "react";
import { Download, Search, Plus, Upload, ChevronLeft, ChevronRight, Settings2 } from "lucide-react";
import Papa from "papaparse";

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

const STATUS_LABELS: Record<string, { label: string; color: string; badge: string }> = {
  nuevo:           { label: "Nuevo",          color: "bg-blue-100 text-blue-700",       badge: "bg-blue-50 text-blue-700 border-blue-200" },
  contactado:      { label: "Contactado",     color: "bg-yellow-100 text-yellow-700",   badge: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  en_seguimiento:  { label: "En seguimiento", color: "bg-purple-100 text-purple-700",   badge: "bg-purple-50 text-purple-700 border-purple-200" },
  cerrado_ganado:  { label: "Ganado ✓",       color: "bg-green-100 text-green-700",     badge: "bg-green-50 text-green-700 border-green-200" },
  cerrado_perdido: { label: "Perdido",        color: "bg-red-100 text-red-700",         badge: "bg-red-50 text-red-700 border-red-200" },
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

function getInitials(name: string) {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  if (parts.length === 1) return (parts[0][0] + (parts[0][1] || "")).toUpperCase();
  return "NA";
}

export function LeadsTable({ leads }: { leads: Lead[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [globalFilter, setGlobalFilter] = useState("todos");
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pagination and Column filters
  const [page, setPage] = useState(1);
  const pageSize = 10;
  
  const [filters, setFilters] = useState({
    name: "",
    phone: "",
    education: "",
    city: "",
    status: ""
  });

  const filtered = leads.filter((l) => {
    // Top-level Search
    if (search) {
      const q = search.toLowerCase();
      if (
        !l.full_name.toLowerCase().includes(q) &&
        !l.email.toLowerCase().includes(q) &&
        !(l.phone || "").includes(q)
      ) return false;
    }

    // Top-level View Filter
    if (globalFilter !== "todos" && l.status !== globalFilter) return false;

    // Advanced Column Filters
    if (filters.name) {
      const fn = filters.name.toLowerCase();
      if (!l.full_name.toLowerCase().includes(fn) && !l.email.toLowerCase().includes(fn)) return false;
    }
    if (filters.phone && !(l.phone || "").includes(filters.phone)) return false;
    if (filters.education && !(l.education_level || "").toLowerCase().includes(filters.education.toLowerCase())) return false;
    if (filters.city && !(l.city || "").toLowerCase().includes(filters.city.toLowerCase())) return false;
    if (filters.status && l.status !== filters.status) return false;

    return true;
  });

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  function handleStatusChange(id: string, status: string) {
    startTransition(async () => {
      await updateLeadStatus(id, status);
      router.refresh();
    });
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data as Record<string, string>[];
        const newLeads = rows.map(r => {
          const name = r["Nombre"] || r["full_name"] || "";
          const email = r["Email"] || r["email"] || "";
          if (!name || !email) return null;

          const rawStatus = (r["Estatus"] || r["status"] || "nuevo").toLowerCase();
          let parsedStatus = "nuevo";
          if (rawStatus.includes("contact")) parsedStatus = "contactado";
          if (rawStatus.includes("seguimiento")) parsedStatus = "en_seguimiento";
          if (rawStatus.includes("ganado")) parsedStatus = "cerrado_ganado";
          if (rawStatus.includes("perdido")) parsedStatus = "cerrado_perdido";

          return {
            full_name: name,
            email: email,
            phone: r["Teléfono"] || r["phone"] || r["Telefono"] || null,
            company: r["Empresa"] || r["company"] || null,
            education_level: r["Grado de Estudios"] || r["education_level"] || r["Grado"] || null,
            city: r["Ciudad"] || r["city"] || null,
            source: r["Fuente"] || r["source"] || "Importado",
            status: parsedStatus
          };
        }).filter(Boolean);

        if (newLeads.length === 0) return alert("El CSV no contiene la estructura esperada: falta Nombre e Email.");
        
        startTransition(async () => {
          const res = await fetch("/api/admin/leads/import", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ leads: newLeads })
          });
          if (res.ok) {
            alert(`✅ ${newLeads.length} leads importados exitosamente.`);
            setPage(1);
            router.refresh();
          } else {
            console.error(await res.json());
            alert("❌ Hubo un error procesando el CSV.");
          }
          if (fileInputRef.current) fileInputRef.current.value = "";
        });
      }
    });
  }

  return (
    <div className="space-y-4">
      {/* Top Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar contactos..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 text-sm text-slate-700 outline-none focus:border-[#9B1D20]"
            />
          </div>
          <div className="relative">
            <select
              value={globalFilter}
              onChange={(e) => { setGlobalFilter(e.target.value); setPage(1); }}
              className="h-10 rounded-xl border border-slate-200 bg-white px-4 py-2 pr-8 text-sm font-medium text-slate-700 outline-none focus:border-[#9B1D20] appearance-none"
            >
              <option value="todos">Todos</option>
              {Object.entries(STATUS_LABELS).map(([value, { label }]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportCSV(filtered)}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <Download className="h-4 w-4" />
            Exportar
          </button>

          <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleImport} />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isPending}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
          >
            <Upload className="h-4 w-4" />
            {isPending ? "Importando..." : "Importar CSV"}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between mt-2">
        <h3 className="text-sm font-bold text-slate-500">Filtros Avanzados Activos</h3>
        <button className="inline-flex h-8 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700">
          Columnas
        </button>
      </div>

      {/* Main Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-white">
                <th className="px-4 py-3 font-bold text-slate-800 w-12 text-center">
                  <input type="checkbox" className="rounded border-slate-300" />
                </th>
                <th className="px-4 py-3 font-bold text-slate-800 min-w-[200px]">Nombre ↑↓</th>
                <th className="px-4 py-3 font-bold text-slate-800">Teléfono</th>
                <th className="px-4 py-3 font-bold text-slate-800">Grado de Estudios</th>
                <th className="px-4 py-3 font-bold text-slate-800">Ciudad</th>
                <th className="px-4 py-3 font-bold text-slate-800">Estatus</th>
              </tr>
              {/* Filter inputs sub-row */}
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-4 py-2"></th>
                <th className="px-4 py-2">
                  <input type="text" placeholder="Filtrar..." value={filters.name} onChange={e => {setFilters({...filters, name: e.target.value}); setPage(1);}} className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-600 outline-none focus:border-slate-400" />
                </th>
                <th className="px-4 py-2">
                  <input type="text" placeholder="Filtrar..." value={filters.phone} onChange={e => {setFilters({...filters, phone: e.target.value}); setPage(1);}} className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-600 outline-none focus:border-slate-400" />
                </th>
                <th className="px-4 py-2">
                  <input type="text" placeholder="Filtrar..." value={filters.education} onChange={e => {setFilters({...filters, education: e.target.value}); setPage(1);}} className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-600 outline-none focus:border-slate-400" />
                </th>
                <th className="px-4 py-2">
                  <input type="text" placeholder="Filtrar..." value={filters.city} onChange={e => {setFilters({...filters, city: e.target.value}); setPage(1);}} className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-600 outline-none focus:border-slate-400" />
                </th>
                <th className="px-4 py-2">
                  <input type="text" placeholder="Filtrar..." value={filters.status} onChange={e => {setFilters({...filters, status: e.target.value}); setPage(1);}} className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-600 outline-none focus:border-slate-400" />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                    No se encontraron leads con estos filtros.
                  </td>
                </tr>
              ) : (
                paginated.map((lead) => {
                  const statusInfo = STATUS_LABELS[lead.status] ?? { label: lead.status, color: "bg-slate-100 text-slate-600", badge: "bg-slate-100 border-slate-200 text-slate-600" };
                  const initials = getInitials(lead.full_name);
                  
                  return (
                    <tr key={lead.id} className="hover:bg-slate-50 transition-colors bg-white group">
                      <td className="px-4 py-4 text-center">
                        <input type="checkbox" className="rounded border-slate-300" />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 flex-col items-center justify-center rounded-md bg-slate-100 border border-slate-200 text-xs font-bold text-slate-600">
                            {initials}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{lead.full_name}</p>
                            <p className="text-xs text-slate-500 hover:text-blue-600 cursor-pointer">{lead.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm font-medium text-slate-700">{lead.phone || <span className="text-slate-300">—</span>}</p>
                      </td>
                      <td className="px-4 py-4">
                        {lead.education_level ? (
                          <span className="inline-flex items-center rounded-full border border-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-600 bg-white">
                            {lead.education_level}
                          </span>
                        ) : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm font-medium text-slate-700">{lead.city || <span className="text-slate-300">—</span>}</p>
                      </td>
                      <td className="px-4 py-4">
                        <div className="relative">
                          {/* We use a select over the badge for quick updates */}
                          <select
                            defaultValue={lead.status}
                            disabled={isPending}
                            onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                            className={`w-full max-w-[140px] rounded-lg px-2.5 py-1 text-xs font-bold border outline-none cursor-pointer appearance-none transition-colors ${statusInfo.badge}`}
                          >
                            {Object.entries(STATUS_LABELS).map(([value, { label }]) => (
                              <option key={value} value={value}>{label}</option>
                            ))}
                          </select>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-white px-4 py-3">
          <p className="text-xs font-medium text-slate-500">
            0 de {filtered.length} fila(s) seleccionada(s).
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500 mr-2">
              Página {page} de {totalPages || 1}
            </span>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="inline-flex h-8 items-center gap-1 rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="inline-flex h-8 items-center gap-1 rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
