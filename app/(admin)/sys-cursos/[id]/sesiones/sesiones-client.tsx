"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Clock3, Copy, ExternalLink, Loader2, Save, Trash2, User, Video } from "lucide-react";
import { createSession, deleteSession, updateSession } from "../session-actions";

type SessionLike = {
  id: string;
  title: string;
  description?: string | null;
  starts_at: string;
  meeting_url?: string | null;
  recording_url?: string | null;
  sort_order?: number | null;
  provider?: string | null;
  is_published?: boolean | null;
};

function toDateInput(iso?: string | null) {
  if (!iso) return "";
  return new Date(iso).toISOString().slice(0, 10);
}

function toTimeInput(iso?: string | null) {
  if (!iso) return "";
  return new Date(iso).toISOString().slice(11, 16);
}

function formatDateLabel(value: string) {
  return new Intl.DateTimeFormat("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export default function SesionesTabClient({
  courseId,
  sessions,
}: {
  courseId: string;
  sessions: SessionLike[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [confirmDeleteSessionId, setConfirmDeleteSessionId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [meetingUrl, setMeetingUrl] = useState("");
  const [recordingUrl, setRecordingUrl] = useState("");
  const [description, setDescription] = useState("");
  const [publishNow, setPublishNow] = useState("true");

  async function handleAddSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!title.trim() || !date || !time) {
      setMessage({ type: "error", text: "Completa título, fecha y hora." });
      return;
    }

    const sessionDate = new Date(`${date}T${time}:00`).toISOString();

    startTransition(async () => {
      setMessage(null);
      const result = await createSession(courseId, {
        title: title.trim(),
        description: description.trim(),
        starts_at: sessionDate,
        meeting_url: meetingUrl.trim(),
        recording_url: recordingUrl.trim(),
        provider: "zoom",
        is_published: publishNow === "true",
      });

      if (result.success) {
        setTitle("");
        setDate("");
        setTime("");
        setMeetingUrl("");
        setRecordingUrl("");
        setDescription("");
        setPublishNow("true");
        setMessage({ type: "success", text: "Sesión creada." });
        router.refresh();
      } else {
        setMessage({ type: "error", text: result.error });
      }
    });
  }

  return (
    <div className="space-y-8">
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
      <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
        <div className="mb-5">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900">Nueva sesión en vivo</h3>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Configura fecha, enlace de Zoom y grabación de cada sesión del curso.
          </p>
        </div>

        <form onSubmit={handleAddSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="xl:col-span-3">
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-slate-500">Título de la sesión</label>
            <input
              required
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Ej. Modulo I — Introducción al Juicio de Amparo"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none transition-all focus:border-[#9B1D20] focus:ring-4 focus:ring-[#9B1D20]/10"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-slate-500">Fecha</label>
            <input
              required
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none transition-all focus:border-[#9B1D20] focus:ring-4 focus:ring-[#9B1D20]/10"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-slate-500">Hora de inicio</label>
            <input
              required
              type="time"
              value={time}
              onChange={(event) => setTime(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none transition-all focus:border-[#9B1D20] focus:ring-4 focus:ring-[#9B1D20]/10"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-slate-500">Estado inicial</label>
            <select
              value={publishNow}
              onChange={(event) => setPublishNow(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none transition-all focus:border-[#9B1D20] focus:ring-4 focus:ring-[#9B1D20]/10"
            >
              <option value="true">Publicada</option>
              <option value="false">Oculta</option>
            </select>
          </div>

          <div className="md:col-span-2 xl:col-span-3">
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-slate-500">Enlace de Zoom</label>
            <input
              type="url"
              value={meetingUrl}
              onChange={(event) => setMeetingUrl(event.target.value)}
              placeholder="https://zoom.us/j/..."
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none transition-all focus:border-[#9B1D20] focus:ring-4 focus:ring-[#9B1D20]/10"
            />
          </div>

          <div className="md:col-span-2 xl:col-span-3">
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-slate-500">Grabación</label>
            <input
              type="url"
              value={recordingUrl}
              onChange={(event) => setRecordingUrl(event.target.value)}
              placeholder="https://..."
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none transition-all focus:border-[#9B1D20] focus:ring-4 focus:ring-[#9B1D20]/10"
            />
          </div>

          <div className="md:col-span-2 xl:col-span-3">
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-slate-500">Descripción</label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none transition-all resize-none focus:border-[#9B1D20] focus:ring-4 focus:ring-[#9B1D20]/10"
            />
          </div>

          <div className="md:col-span-2 xl:col-span-3 flex justify-end">
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-50"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Guardar sesión
            </button>
          </div>
        </form>
      </section>

      <section className="space-y-4">
        {sessions.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/70 px-6 py-12 text-center text-sm font-medium text-slate-400">
            Este curso aún no tiene sesiones en vivo programadas.
          </div>
        ) : (
          sessions.map((session) => (
            <article key={session.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${session.is_published ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                      {session.is_published ? "Publicada" : "Oculta"}
                    </span>
                    <h4 className="text-lg font-bold leading-tight text-slate-900">{session.title}</h4>
                  </div>
                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-slate-500">
                    <span className="inline-flex items-center gap-2"><Calendar className="h-4 w-4 text-slate-400" /> {formatDateLabel(session.starts_at)}</span>
                    <span className="inline-flex items-center gap-2"><Clock3 className="h-4 w-4 text-slate-400" /> {toTimeInput(session.starts_at)}</span>
                    {session.sort_order ? <span className="inline-flex items-center gap-2"><User className="h-4 w-4 text-slate-400" /> Sesión {session.sort_order}</span> : null}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {session.meeting_url ? (
                    <>
                      <a
                        href={session.meeting_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold uppercase tracking-widest text-slate-700 transition hover:border-[#9B1D20] hover:text-[#9B1D20]"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Abrir Zoom
                      </a>
                      <button
                        type="button"
                        onClick={() => navigator.clipboard.writeText(session.meeting_url || "")}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold uppercase tracking-widest text-slate-700 transition hover:border-slate-400"
                      >
                        <Copy className="h-3.5 w-3.5" />
                        Copiar link
                      </button>
                    </>
                  ) : (
                    <span className="inline-flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-xs font-bold uppercase tracking-widest text-amber-700">
                      <Video className="h-3.5 w-3.5" />
                      Sin Zoom cargado
                    </span>
                  )}

                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() =>
                      startTransition(async () => {
                        const res = await updateSession(session.id, courseId, {
                          is_published: !session.is_published,
                        });
                        if (res.success) {
                          setMessage({
                            type: "success",
                            text: session.is_published ? "Sesión ocultada." : "Sesión publicada.",
                          });
                          router.refresh();
                        } else {
                          setMessage({ type: "error", text: res.error });
                        }
                      })
                    }
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold uppercase tracking-widest text-slate-700 transition hover:border-slate-400 disabled:opacity-50"
                  >
                    {session.is_published ? "Ocultar" : "Publicar"}
                  </button>

                  {confirmDeleteSessionId === session.id ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteSessionId(null)}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold uppercase tracking-widest text-slate-600 transition hover:border-slate-400"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() =>
                          startTransition(async () => {
                            const res = await deleteSession(session.id, courseId);
                            if (res.success) {
                              setConfirmDeleteSessionId(null);
                              setMessage({ type: "success", text: "Sesión eliminada." });
                              router.refresh();
                            } else {
                              setMessage({ type: "error", text: res.error });
                            }
                          })
                        }
                        className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-xs font-bold uppercase tracking-widest text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Confirmar
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => setConfirmDeleteSessionId(session.id)}
                      className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-xs font-bold uppercase tracking-widest text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Eliminar
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-slate-500">Título</label>
                  <input
                    type="text"
                    defaultValue={session.title}
                    onBlur={(event) => {
                      const nextTitle = event.target.value.trim();
                      if (nextTitle && nextTitle !== session.title) {
                        startTransition(async () => {
                          const res = await updateSession(session.id, courseId, { title: nextTitle });
                          if (res.success) {
                            router.refresh();
                          } else {
                            setMessage({ type: "error", text: res.error });
                          }
                        });
                      }
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none focus:border-[#9B1D20] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-slate-500">Fecha</label>
                  <input
                    type="date"
                    defaultValue={toDateInput(session.starts_at)}
                    onBlur={(event) => {
                      const nextDate = event.target.value;
                      const currentTime = toTimeInput(session.starts_at);
                      if (nextDate) {
                        startTransition(async () => {
                          const res = await updateSession(session.id, courseId, {
                            starts_at: new Date(`${nextDate}T${currentTime}:00`).toISOString(),
                          });
                          if (res.success) {
                            router.refresh();
                          } else {
                            setMessage({ type: "error", text: res.error });
                          }
                        });
                      }
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none focus:border-[#9B1D20] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-slate-500">Hora</label>
                  <input
                    type="time"
                    defaultValue={toTimeInput(session.starts_at)}
                    onBlur={(event) => {
                      const nextTime = event.target.value;
                      const currentDate = toDateInput(session.starts_at);
                      if (nextTime) {
                        startTransition(async () => {
                          const res = await updateSession(session.id, courseId, {
                            starts_at: new Date(`${currentDate}T${nextTime}:00`).toISOString(),
                          });
                          if (res.success) {
                            router.refresh();
                          } else {
                            setMessage({ type: "error", text: res.error });
                          }
                        });
                      }
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none focus:border-[#9B1D20] focus:bg-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-slate-500">Enlace de Zoom</label>
                  <input
                    type="url"
                    defaultValue={session.meeting_url || ""}
                    onBlur={(event) =>
                      startTransition(async () => {
                        const res = await updateSession(session.id, courseId, {
                          meeting_url: event.target.value.trim() || null,
                        });
                        if (res.success) {
                          router.refresh();
                        } else {
                          setMessage({ type: "error", text: res.error });
                        }
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none focus:border-[#9B1D20] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-slate-500">Grabación</label>
                  <input
                    type="url"
                    defaultValue={session.recording_url || ""}
                    onBlur={(event) =>
                      startTransition(async () => {
                        const res = await updateSession(session.id, courseId, {
                          recording_url: event.target.value.trim() || null,
                        });
                        if (res.success) {
                          router.refresh();
                        } else {
                          setMessage({ type: "error", text: res.error });
                        }
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none focus:border-[#9B1D20] focus:bg-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-slate-500">Descripción</label>
                  <textarea
                    rows={3}
                    defaultValue={session.description || ""}
                    onBlur={(event) =>
                      startTransition(async () => {
                        const res = await updateSession(session.id, courseId, {
                          description: event.target.value.trim() || null,
                        });
                        if (res.success) {
                          router.refresh();
                        } else {
                          setMessage({ type: "error", text: res.error });
                        }
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none resize-none focus:border-[#9B1D20] focus:bg-white"
                  />
                </div>
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
