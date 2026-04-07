"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Clock3, Loader2, Save } from "lucide-react";
import { saveCourseCalendario } from "../course-actions";

type CourseLike = {
  id: string;
  start_date?: string | null;
  end_date?: string | null;
  enrollment_deadline?: string | null;
  urgency_text?: string | null;
  timezone?: string | null;
  modality?: string | null;
  duration?: string | null;
};

const TIMEZONES = [
  { value: "America/Tijuana", label: "Baja California (Tijuana)" },
  { value: "America/Mexico_City", label: "Ciudad de Mexico" },
  { value: "America/Hermosillo", label: "Sonora" },
  { value: "America/Monterrey", label: "Monterrey" },
  { value: "America/Bogota", label: "Bogota" },
];

const MODALITIES = [
  { value: "live_zoom", label: "En vivo por Zoom" },
  { value: "hybrid", label: "Híbrido" },
  { value: "self_paced", label: "Autogestionado" },
  { value: "presential", label: "Presencial" },
];

function toDateInput(value?: string | null) {
  if (!value) return "";
  const isoMatch = value.match(/^\d{4}-\d{2}-\d{2}/);
  if (isoMatch) return isoMatch[0];
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString().slice(0, 10);
}

function formatStartDateLabel(dateValue: string) {
  if (!dateValue) return "";
  const date = new Date(`${dateValue}T12:00:00`);
  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function diffInMonths(startDate: string, endDate: string) {
  if (!startDate || !endDate) return null;
  const start = new Date(`${startDate}T12:00:00`);
  const end = new Date(`${endDate}T12:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return null;
  const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;
  return months;
}

export default function CalendarioTabClient({ course }: { course: CourseLike }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [startDate, setStartDate] = useState(toDateInput(course.start_date));
  const [endDate, setEndDate] = useState(toDateInput(course.end_date));
  const [deadline, setDeadline] = useState(toDateInput(course.enrollment_deadline));
  const [timezone, setTimezone] = useState(course.timezone || "America/Tijuana");
  const [modality, setModality] = useState(
    MODALITIES.find((item) => item.label === course.modality)?.value || "live_zoom",
  );
  const [urgencyText, setUrgencyText] = useState(course.urgency_text || "");
  const [customDuration, setCustomDuration] = useState(course.duration || "");

  const derivedStartLabel = useMemo(() => formatStartDateLabel(startDate), [startDate]);
  const derivedDurationLabel = useMemo(() => {
    if (customDuration.trim()) return customDuration.trim();
    const months = diffInMonths(startDate, endDate);
    if (!months) return "";
    return months === 1 ? "1 mes" : `${months} meses`;
  }, [customDuration, startDate, endDate]);

  const modalityLabel = useMemo(() => {
    return MODALITIES.find((item) => item.value === modality)?.label || "";
  }, [modality]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData();
    formData.set("startDate", startDate);
    formData.set("endDate", endDate);
    formData.set("enrollmentDeadline", deadline);
    formData.set("timezone", timezone);
    formData.set("modality", modality);
    formData.set("urgencyText", urgencyText.trim());
    formData.set("startDateLabel", derivedStartLabel);
    formData.set("durationLabel", derivedDurationLabel);
    formData.set("modalityLabel", modalityLabel);

    startTransition(async () => {
      setMessage(null);
      const res = await saveCourseCalendario(course.id, formData);
      if (res.success) {
        setMessage({ type: "success", text: "Calendario guardado." });
        router.refresh();
      } else {
        setMessage({ type: "error", text: res.error });
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      {message ? (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm font-medium ${
            message.type === "error"
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          {message.text}
        </div>
      ) : null}
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-bold text-slate-700">Fecha real de inicio *</label>
            <input
              required
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none transition-all focus:border-[#9B1D20] focus:ring-4 focus:ring-[#9B1D20]/10"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-bold text-slate-700">Fecha real de cierre</label>
            <input
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none transition-all focus:border-[#9B1D20] focus:ring-4 focus:ring-[#9B1D20]/10"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-bold text-slate-700">Cierre de inscripciones</label>
            <input
              type="date"
              value={deadline}
              onChange={(event) => setDeadline(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none transition-all focus:border-[#9B1D20] focus:ring-4 focus:ring-[#9B1D20]/10"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-bold text-slate-700">Zona horaria *</label>
            <select
              value={timezone}
              onChange={(event) => setTimezone(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none transition-all focus:border-[#9B1D20] focus:ring-4 focus:ring-[#9B1D20]/10"
            >
              {TIMEZONES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-bold text-slate-700">Modalidad *</label>
            <select
              value={modality}
              onChange={(event) => setModality(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none transition-all focus:border-[#9B1D20] focus:ring-4 focus:ring-[#9B1D20]/10"
            >
              {MODALITIES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-bold text-slate-700">Duración visible</label>
            <input
              type="text"
              value={customDuration}
              onChange={(event) => setCustomDuration(event.target.value)}
              placeholder="Se calcula sola si la dejas vacía"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none transition-all focus:border-[#9B1D20] focus:ring-4 focus:ring-[#9B1D20]/10"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1.5 block text-sm font-bold text-slate-700">Texto de urgencia comercial</label>
            <input
              type="text"
              value={urgencyText}
              onChange={(event) => setUrgencyText(event.target.value)}
              placeholder="Ej. Cupo limitado | Últimos lugares"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none transition-all focus:border-[#9B1D20] focus:ring-4 focus:ring-[#9B1D20]/10"
            />
          </div>
        </div>

        <aside className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Vista operacional</p>
          <div className="mt-4 space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-start gap-3">
              <CalendarDays className="mt-0.5 h-4 w-4 text-[#9B1D20]" />
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Inicio visible</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{derivedStartLabel || "Define la fecha de inicio"}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock3 className="mt-0.5 h-4 w-4 text-[#9B1D20]" />
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Duración visible</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{derivedDurationLabel || "Sin duración visible todavía"}</p>
              </div>
            </div>
            <div className="rounded-xl bg-slate-50 px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Modalidad visible</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{modalityLabel}</p>
            </div>
            <div className="rounded-xl bg-slate-50 px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Zona operativa</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{timezone}</p>
            </div>
          </div>
        </aside>
      </div>

      <div className="flex justify-end border-t border-slate-100 pt-4">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-slate-800 disabled:opacity-50"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Guardar Calendario
        </button>
      </div>
    </form>
  );
}
