"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { Download, MoreHorizontal, Search, Trash2, Upload, X } from "lucide-react";
import Papa from "papaparse";
import { parsePhoneNumber } from "react-phone-number-input";
import type { Value as PhoneValue } from "react-phone-number-input";

import { PhoneInput } from "@/components/ui/phone-input";

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

async function updateLead(
  id: string,
  payload: Partial<Lead> & { source?: string; notes?: string | null },
) {
  const response = await fetch(`/api/admin/leads/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({ error: "No se pudo guardar." }));
    throw new Error(data.error || "No se pudo guardar.");
  }
}

async function updateLeadStatuses(ids: string[], status: string) {
  const response = await fetch("/api/admin/leads/bulk", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids, status }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({ error: "No se pudo actualizar." }));
    throw new Error(data.error || "No se pudo actualizar.");
  }
}

async function deleteLead(id: string) {
  const response = await fetch(`/api/admin/leads/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({ error: "No se pudo eliminar." }));
    throw new Error(data.error || "No se pudo eliminar.");
  }
}

function getInitials(name: string) {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  if (parts.length === 1) return (parts[0][0] + (parts[0][1] || "")).toUpperCase();
  return "NA";
}

function formatPhoneNumber(phone: string | null) {
  if (!phone) return null;
  const normalized = normalizeLeadPhone(phone);
  const parsed = normalized ? parsePhoneNumber(normalized) : null;
  if (parsed) {
    return parsed.formatInternational();
  }
  return phone;
}

function getPhoneSummary(phone: string | null) {
  const parsed = phone ? parsePhoneNumber(normalizeLeadPhone(phone) || "") : null;
  if (!parsed) return "Sin teléfono";
  return `${parsed.countryCallingCode ? `+${parsed.countryCallingCode} ` : ""}${parsed.formatNational()}`;
}

function normalizeLeadPhone(phone: string | null) {
  if (!phone) return "";

  const raw = phone.trim();
  const digits = raw.replace(/\D/g, "");

  if (raw.startsWith("+")) {
    const parsed = parsePhoneNumber(raw);
    return parsed?.number || raw;
  }

  if (digits.length === 10) {
    return `+52${digits}`;
  }

  if (digits.length === 12 && digits.startsWith("52")) {
    return `+${digits}`;
  }

  if (digits.length > 10 && digits.startsWith("52")) {
    return `+52${digits.slice(2, 12)}`;
  }

  return raw;
}

function splitAlternatePhone(notes: string | null) {
  if (!notes) return { alternatePhone: "", cleanNotes: "" };
  const lines = notes.split("\n");
  const alternateLine = lines.find((line) => line.toLowerCase().startsWith("tel alterno:"));
  const alternatePhone = alternateLine ? alternateLine.replace(/^tel alterno:\s*/i, "").trim() : "";
  const cleanNotes = lines.filter((line) => !line.toLowerCase().startsWith("tel alterno:")).join("\n").trim();
  return { alternatePhone, cleanNotes };
}

function buildNotes(notes: string, alternatePhone: string) {
  const sections = [];
  if (alternatePhone.trim()) sections.push(`Tel alterno: ${alternatePhone.trim()}`);
  if (notes.trim()) sections.push(notes.trim());
  return sections.join("\n");
}

type LeadEditorState = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  alternatePhone: string;
  company: string;
  education_level: string;
  city: string;
  source: string;
  status: string;
  notes: string;
  created_at: string;
};

export function LeadsTable({ leads }: { leads: Lead[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [globalFilter, setGlobalFilter] = useState("todos");
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState("contactado");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<LeadEditorState | null>(null);
  const [editorMessage, setEditorMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

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
  const allFilteredIds = filtered.map((lead) => lead.id);
  const allFilteredSelected = filtered.length > 0 && allFilteredIds.every((id) => selectedIds.includes(id));
  const selectedLeads = filtered.filter((lead) => selectedIds.includes(lead.id));

  function toggleLeadSelection(id: string, checked: boolean) {
    setSelectedIds((current) =>
      checked ? [...new Set([...current, id])] : current.filter((item) => item !== id),
    );
  }

  function toggleAllFiltered(checked: boolean) {
    setSelectedIds((current) => {
      if (checked) {
        return [...new Set([...current, ...allFilteredIds])];
      }

      return current.filter((id) => !allFilteredIds.includes(id));
    });
  }

  function handleStatusChange(id: string, status: string) {
    startTransition(async () => {
      await updateLeadStatus(id, status);
      router.refresh();
    });
  }

  function openEditor(lead: Lead) {
    const { alternatePhone, cleanNotes } = splitAlternatePhone(lead.notes);
    setEditingLead({
      id: lead.id,
      full_name: lead.full_name,
      email: lead.email,
      phone: normalizeLeadPhone(lead.phone),
      alternatePhone: normalizeLeadPhone(alternatePhone),
      company: lead.company || "",
      education_level: lead.education_level || "",
      city: lead.city || "",
      source: lead.source || "",
      status: lead.status,
      notes: cleanNotes,
      created_at: lead.created_at,
    });
    setEditorMessage(null);
    setEditorOpen(true);
  }

  function closeEditor() {
    setEditorOpen(false);
    setEditingLead(null);
    setEditorMessage(null);
  }

  async function handleSaveLead() {
    if (!editingLead) return;

    const normalizedPhone = normalizeLeadPhone(editingLead.phone);
    const normalizedAlternatePhone = editingLead.alternatePhone
      ? normalizeLeadPhone(editingLead.alternatePhone)
      : null;

    if (!normalizedPhone) {
      setEditorMessage({
        type: "error",
        text: "El telefono principal es obligatorio y debe ser valido.",
      });
      return;
    }

    if (editingLead.alternatePhone && !normalizedAlternatePhone) {
      setEditorMessage({
        type: "error",
        text: "El telefono alterno debe ser valido.",
      });
      return;
    }

    startTransition(async () => {
      try {
        await updateLead(editingLead.id, {
          full_name: editingLead.full_name,
          email: editingLead.email,
          phone: normalizedPhone,
          company: editingLead.company || null,
          education_level: editingLead.education_level || null,
          city: editingLead.city || null,
          source: editingLead.source,
          status: editingLead.status,
          notes: buildNotes(editingLead.notes, normalizedAlternatePhone || "") || null,
        });
        setEditorMessage({ type: "success", text: "Lead actualizado correctamente." });
        router.refresh();
      } catch (error) {
        setEditorMessage({
          type: "error",
          text: error instanceof Error ? error.message : "No se pudo guardar el lead.",
        });
      }
    });
  }

  function handleDeleteLead() {
    if (!editingLead) return;

    startTransition(async () => {
      try {
        await deleteLead(editingLead.id);
        closeEditor();
        router.refresh();
      } catch (error) {
        setEditorMessage({
          type: "error",
          text: error instanceof Error ? error.message : "No se pudo eliminar el lead.",
        });
      }
    });
  }

  function handleRowOpen(lead: Lead) {
    openEditor(lead);
  }

  function handleExport() {
    exportCSV(selectedLeads.length > 0 ? selectedLeads : filtered);
  }

  function handleBulkStatusChange() {
    if (selectedIds.length === 0) return;

    startTransition(async () => {
      try {
        await updateLeadStatuses(selectedIds, bulkStatus);
        router.refresh();
      } finally {
        setSelectedIds([]);
      }
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

  useEffect(() => {
    if (!editorOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isPending) {
        closeEditor();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [editorOpen, isPending]);

  const statusOptions = useMemo(() => Object.entries(STATUS_LABELS), []);

  return (
    <>
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
          {selectedIds.length > 0 ? (
            <>
              <select
                value={bulkStatus}
                onChange={(e) => setBulkStatus(e.target.value)}
                className="h-10 rounded-xl border border-slate-200 bg-white px-4 py-2 pr-8 text-sm font-medium text-slate-700 outline-none focus:border-[#9B1D20] appearance-none"
              >
                {statusOptions.map(([value, { label }]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <button
                onClick={handleBulkStatusChange}
                disabled={isPending}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-[#9B1D20] bg-[#9B1D20] px-4 text-sm font-semibold text-white transition hover:bg-[#7d1619] disabled:opacity-50"
              >
                {isPending ? "Moviendo..." : `Mover ${selectedIds.length}`}
              </button>
            </>
          ) : null}
          <button
            onClick={handleExport}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <Download className="h-4 w-4" />
            {selectedLeads.length > 0 ? `Exportar ${selectedLeads.length}` : "Exportar"}
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
                  <input
                    type="checkbox"
                    checked={allFilteredSelected}
                    onChange={(e) => toggleAllFiltered(e.target.checked)}
                    className="rounded border-slate-300"
                  />
                </th>
                <th className="px-4 py-3 font-bold text-slate-800 min-w-[200px]">Nombre ↑↓</th>
                <th className="px-4 py-3 font-bold text-slate-800">Teléfono</th>
                <th className="px-4 py-3 font-bold text-slate-800">Grado de Estudios</th>
                <th className="px-4 py-3 font-bold text-slate-800">Ciudad</th>
                <th className="px-4 py-3 font-bold text-slate-800">Fuente</th>
                <th className="px-4 py-3 font-bold text-slate-800">Fecha</th>
                <th className="px-4 py-3 font-bold text-slate-800">Estatus</th>
                <th className="px-4 py-3 text-right"></th>
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
                <th className="px-4 py-2"></th>
                <th className="px-4 py-2"></th>
                <th className="px-4 py-2">
                  <input type="text" placeholder="Filtrar..." value={filters.status} onChange={e => {setFilters({...filters, status: e.target.value}); setPage(1);}} className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-600 outline-none focus:border-slate-400" />
                </th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-slate-400">
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
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(lead.id)}
                          onChange={(e) => toggleLeadSelection(lead.id, e.target.checked)}
                          onClick={(e) => e.stopPropagation()}
                          className="rounded border-slate-300"
                        />
                      </td>
                      <td
                        className="px-4 py-4 cursor-pointer"
                        onClick={() => handleRowOpen(lead)}
                      >
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
                      <td
                        className="px-4 py-4 cursor-pointer"
                        onClick={() => handleRowOpen(lead)}
                      >
                        {lead.phone ? (
                          <a
                            href={`tel:${lead.phone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="whitespace-nowrap text-sm font-medium text-slate-700 underline decoration-slate-200 underline-offset-4 transition hover:text-[#9B1D20]"
                          >
                            {formatPhoneNumber(lead.phone)}
                          </a>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td
                        className="px-4 py-4 cursor-pointer"
                        onClick={() => handleRowOpen(lead)}
                      >
                        {lead.education_level ? (
                          <span className="inline-flex items-center rounded-full border border-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-600 bg-white">
                            {lead.education_level}
                          </span>
                        ) : <span className="text-slate-300">—</span>}
                      </td>
                      <td
                        className="px-4 py-4 cursor-pointer"
                        onClick={() => handleRowOpen(lead)}
                      >
                        <p className="text-sm font-medium text-slate-700">{lead.city || <span className="text-slate-300">—</span>}</p>
                      </td>
                      <td
                        className="px-4 py-4 cursor-pointer"
                        onClick={() => handleRowOpen(lead)}
                      >
                        <p className="text-sm font-medium text-slate-700">{lead.source || <span className="text-slate-300">—</span>}</p>
                      </td>
                      <td
                        className="px-4 py-4 cursor-pointer"
                        onClick={() => handleRowOpen(lead)}
                      >
                        <p className="text-sm font-medium text-slate-700">
                          {new Date(lead.created_at).toLocaleDateString("es-MX", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </td>
                      <td
                        className="px-4 py-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="relative">
                          {/* We use a select over the badge for quick updates */}
                          <select
                            defaultValue={lead.status}
                            disabled={isPending}
                            onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                            className={`w-full max-w-[140px] rounded-lg px-2.5 py-1 text-xs font-bold border outline-none cursor-pointer appearance-none transition-colors ${statusInfo.badge}`}
                          >
                            {statusOptions.map(([value, { label }]) => (
                              <option key={value} value={value}>{label}</option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td
                        className="px-4 py-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => openEditor(lead)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                          aria-label={`Editar ${lead.full_name}`}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
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
            {selectedLeads.length} de {filtered.length} fila(s) seleccionada(s).
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
    {editorOpen && editingLead ? (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-8">
        <div className="relative w-full max-w-6xl rounded-[30px] border border-[#e8decf] bg-white shadow-2xl">
          <button
            type="button"
            onClick={closeEditor}
            className="absolute right-5 top-5 inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:text-slate-900"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="border-b border-[#efe4d3] px-8 py-6 pr-20">
            <h2 className="text-2xl font-bold text-slate-900">Editar lead</h2>
            <p className="mt-1 text-sm text-slate-500">
              Actualiza contacto, notas comerciales y etapa desde una sola vista.
            </p>
          </div>

          <div className="grid gap-8 px-8 py-6 xl:grid-cols-[1.35fr_0.85fr]">
            <div className="space-y-5 min-w-0">
              <div className="grid gap-4 lg:grid-cols-2">
                <Field label="Nombre completo">
                  <input
                    value={editingLead.full_name}
                    onChange={(e) => setEditingLead({ ...editingLead, full_name: e.target.value })}
                    className="h-12 w-full rounded-[14px] border border-[#e8decf] bg-[#fcfaf6] px-4 text-sm text-slate-900 outline-none transition focus:border-[#caa971]"
                  />
                </Field>
                <Field label="Correo electrónico">
                  <input
                    type="email"
                    value={editingLead.email}
                    onChange={(e) => setEditingLead({ ...editingLead, email: e.target.value })}
                    className="h-12 w-full rounded-[14px] border border-[#e8decf] bg-[#fcfaf6] px-4 text-sm text-slate-900 outline-none transition focus:border-[#caa971]"
                  />
                </Field>
              </div>

              <div className="grid gap-4 xl:grid-cols-2">
                <Field label="Teléfono principal">
                  <PhoneInput
                    defaultCountry="MX"
                    countries={["MX", "US", "AR", "CO"]}
                    international={false}
                    countryCallingCodeEditable={false}
                    value={editingLead.phone as PhoneValue}
                    onChange={(value) => setEditingLead({ ...editingLead, phone: (value as string) || "" })}
                  />
                </Field>
                <Field label="Otro número de contacto">
                  <PhoneInput
                    defaultCountry="MX"
                    countries={["MX", "US", "AR", "CO"]}
                    international={false}
                    countryCallingCodeEditable={false}
                    value={editingLead.alternatePhone as PhoneValue}
                    onChange={(value) => setEditingLead({ ...editingLead, alternatePhone: (value as string) || "" })}
                  />
                </Field>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                <Field label="Grado de estudios">
                  <input
                    value={editingLead.education_level}
                    onChange={(e) => setEditingLead({ ...editingLead, education_level: e.target.value })}
                    className="h-12 w-full rounded-[14px] border border-[#e8decf] bg-[#fcfaf6] px-4 text-sm text-slate-900 outline-none transition focus:border-[#caa971]"
                  />
                </Field>
                <Field label="Ciudad">
                  <input
                    value={editingLead.city}
                    onChange={(e) => setEditingLead({ ...editingLead, city: e.target.value })}
                    className="h-12 w-full rounded-[14px] border border-[#e8decf] bg-[#fcfaf6] px-4 text-sm text-slate-900 outline-none transition focus:border-[#caa971]"
                  />
                </Field>
                <Field label="Origen">
                  <input
                    value={editingLead.source}
                    onChange={(e) => setEditingLead({ ...editingLead, source: e.target.value })}
                    className="h-12 w-full rounded-[14px] border border-[#e8decf] bg-[#fcfaf6] px-4 text-sm text-slate-900 outline-none transition focus:border-[#caa971]"
                  />
                </Field>
              </div>

              <Field label="Notas del seguimiento">
                <textarea
                  value={editingLead.notes}
                  onChange={(e) => setEditingLead({ ...editingLead, notes: e.target.value })}
                  rows={7}
                  className="w-full rounded-[18px] border border-[#e8decf] bg-[#fcfaf6] px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#caa971]"
                  placeholder="Ej. pidió llamada mañana, interesado en beca parcial, referencia de otro alumno..."
                />
              </Field>
            </div>

            <div className="space-y-5 min-w-0">
              <div className="rounded-[24px] border border-[#e8decf] bg-[#fcfaf6] p-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Etapa comercial</p>
                <select
                  value={editingLead.status}
                  onChange={(e) => setEditingLead({ ...editingLead, status: e.target.value })}
                  className="mt-3 h-12 w-full rounded-[14px] border border-[#e8decf] bg-white px-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-[#caa971]"
                >
                  {statusOptions.map(([value, { label }]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="rounded-[24px] border border-[#e8decf] bg-[#fcfaf6] p-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Resumen rápido</p>
                <div className="mt-4 space-y-3 text-sm text-slate-600">
                  <div className="rounded-2xl border border-[#efe4d3] bg-white px-4 py-3">
                    <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Correo</span>
                    <span className="mt-1 block font-medium text-slate-900">{editingLead.email || "Sin correo"}</span>
                  </div>
                  <div className="rounded-2xl border border-[#efe4d3] bg-white px-4 py-3">
                    <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Teléfono</span>
                    <span className="mt-1 block font-medium text-slate-900">
                      {getPhoneSummary(editingLead.phone)}
                    </span>
                  </div>
                  <div className="rounded-2xl border border-[#efe4d3] bg-white px-4 py-3">
                    <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Alta</span>
                    <span className="mt-1 block font-medium text-slate-900">
                      {new Date(editingLead.created_at).toLocaleString("es-MX", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                  </div>
                  <div className="rounded-2xl border border-[#efe4d3] bg-white px-4 py-3">
                    <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Fuente</span>
                    <span className="mt-1 block font-medium text-slate-900">{editingLead.source || "Sin fuente"}</span>
                  </div>
                </div>
              </div>

              {editorMessage ? (
                <div
                  className={`rounded-2xl border px-4 py-3 text-sm ${
                    editorMessage.type === "success"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-red-200 bg-red-50 text-red-700"
                  }`}
                >
                  {editorMessage.text}
                </div>
              ) : null}

              <div className="flex flex-wrap gap-3 xl:justify-end">
                <button
                  type="button"
                  onClick={handleDeleteLead}
                  disabled={isPending}
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-red-200 bg-red-50 px-5 text-xs font-bold uppercase tracking-[0.18em] text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar lead
                </button>
                <button
                  type="button"
                  onClick={closeEditor}
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-xs font-bold uppercase tracking-[0.18em] text-slate-700 transition hover:bg-slate-50"
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  onClick={handleSaveLead}
                  disabled={isPending}
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-[#9B3328] px-5 text-xs font-bold uppercase tracking-[0.18em] text-white transition hover:bg-[#842b22] disabled:opacity-50"
                >
                  {isPending ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    ) : null}
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}
