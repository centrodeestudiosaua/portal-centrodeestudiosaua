"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, ChevronDown, ChevronUp, Layers, Loader2, Plus, Save, Trash2 } from "lucide-react";
import {
  createLesson,
  createModule,
  deleteLesson,
  deleteModule,
  moveLesson,
  moveModule,
  updateLesson,
  updateModule,
} from "../module-actions";

type Lesson = {
  id: string;
  title: string;
  description?: string | null;
  duration_minutes?: number | null;
  sort_order: number;
  is_published?: boolean | null;
};

type Module = {
  id: string;
  title: string;
  description?: string | null;
  sort_order: number;
  course_lessons?: Lesson[];
};

export default function TemarioTabClient({
  courseId,
  modules: rawModules,
}: {
  courseId: string;
  modules: Module[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(rawModules[0]?.id || null);
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [confirmDeleteModuleId, setConfirmDeleteModuleId] = useState<string | null>(null);
  const [confirmDeleteLessonId, setConfirmDeleteLessonId] = useState<string | null>(null);

  const modules = useMemo(
    () => [...rawModules].sort((a, b) => a.sort_order - b.sort_order),
    [rawModules],
  );
  const selectedModule = modules.find((module) => module.id === selectedModuleId) || null;
  const lessons = useMemo(
    () =>
      selectedModule?.course_lessons
        ? [...selectedModule.course_lessons].sort((a, b) => a.sort_order - b.sort_order)
        : [],
    [selectedModule],
  );

  function handleCreateModule() {
    if (!newModuleTitle.trim()) {
      setMessage({ type: "error", text: "Escribe el nombre del módulo." });
      return;
    }

    startTransition(async () => {
      setMessage(null);
      const res = await createModule(courseId, newModuleTitle.trim());
      if (res.error) {
        setMessage({ type: "error", text: res.error });
        return;
      }
      setNewModuleTitle("");
      setMessage({ type: "success", text: "Módulo creado." });
      router.refresh();
    });
  }

  function handleCreateLesson() {
    if (!selectedModuleId) return;
    if (!newLessonTitle.trim()) {
      setMessage({ type: "error", text: "Escribe el nombre del tema." });
      return;
    }

    startTransition(async () => {
      setMessage(null);
      const res = await createLesson(selectedModuleId, courseId, newLessonTitle.trim());
      if (res.error) {
        setMessage({ type: "error", text: res.error });
        return;
      }
      setNewLessonTitle("");
      setMessage({ type: "success", text: "Tema creado." });
      router.refresh();
    });
  }

  return (
    <div className="flex h-[720px] w-full divide-x divide-slate-200">
      <aside className="flex w-[340px] shrink-0 flex-col bg-slate-50/50">
        <div className="border-b border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-slate-400" />
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900">Módulos</h3>
          </div>
          <div className="mt-4 flex gap-2">
            <input
              type="text"
              value={newModuleTitle}
              onChange={(event) => setNewModuleTitle(event.target.value)}
              placeholder="Nuevo módulo"
              className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-[#9B1D20] focus:ring-4 focus:ring-[#9B1D20]/10"
            />
            <button
              type="button"
              disabled={isPending}
              onClick={handleCreateModule}
              className="inline-flex h-[46px] w-[46px] items-center justify-center rounded-xl bg-slate-900 text-white transition hover:bg-slate-800 disabled:opacity-50"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {modules.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-slate-200 px-4 py-8 text-center text-sm font-medium text-slate-400">
              Todavía no hay módulos creados.
            </div>
          ) : (
            <div className="space-y-2">
              {modules.map((module, index) => {
                const isSelected = module.id === selectedModuleId;
                return (
                  <button
                    key={module.id}
                    type="button"
                    onClick={() => setSelectedModuleId(module.id)}
                    className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                      isSelected
                        ? "border-[#9B1D20]/25 bg-white shadow-sm"
                        : "border-transparent bg-transparent hover:border-slate-200 hover:bg-white"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-lg bg-[#9B1D20] px-2 text-xs font-bold text-white">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold leading-tight text-slate-900">{module.title}</p>
                        <p className="mt-1 text-xs font-medium text-slate-500">
                          {module.course_lessons?.length || 0} temas
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </aside>

      <main className="relative flex-1 overflow-y-auto bg-white">
        {isPending ? (
          <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-center border-b border-slate-200 bg-white/90 py-2 text-xs font-bold uppercase tracking-widest text-[#9B1D20] backdrop-blur">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Guardando cambios
          </div>
        ) : null}

        {!selectedModule ? (
          <div className="flex h-full flex-col items-center justify-center px-8 text-center">
            <BookOpen className="mb-4 h-10 w-10 text-slate-300" />
            <p className="text-base font-bold text-slate-700">Selecciona un módulo para editarlo.</p>
            <p className="mt-2 text-sm font-medium text-slate-400">
              Aquí se construye el temario real del curso, sin prompts ni modales improvisados.
            </p>
          </div>
        ) : (
          <div className="space-y-8 p-6">
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

            <section className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900">Configuración del módulo</h3>
                {confirmDeleteModuleId === selectedModule.id ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteModuleId(null)}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold uppercase tracking-widest text-slate-600 transition hover:border-slate-400"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        startTransition(async () => {
                          const res = await deleteModule(selectedModule.id, courseId);
                          if (res.error) {
                            setMessage({ type: "error", text: res.error });
                            return;
                          }
                          setConfirmDeleteModuleId(null);
                          setSelectedModuleId(null);
                          setMessage({ type: "success", text: "Módulo eliminado." });
                          router.refresh();
                        })
                      }
                      className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-xs font-bold uppercase tracking-widest text-red-700 transition hover:bg-red-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Confirmar borrado
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteModuleId(selectedModule.id)}
                    className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-xs font-bold uppercase tracking-widest text-red-700 transition hover:bg-red-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Borrar módulo
                  </button>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-[1fr_220px]">
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-slate-500">Título del módulo</label>
                  <input
                    type="text"
                    defaultValue={selectedModule.title}
                    onBlur={(event) => {
                      const value = event.target.value.trim();
                      if (!value) {
                        setMessage({ type: "error", text: "El módulo no puede quedar sin nombre." });
                        return;
                      }
                      startTransition(async () => {
                        const res = await updateModule(selectedModule.id, courseId, { title: value });
                        if (res.error) {
                          setMessage({ type: "error", text: res.error });
                        } else {
                          router.refresh();
                        }
                      });
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold outline-none focus:border-[#9B1D20] focus:ring-4 focus:ring-[#9B1D20]/10"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={modules[0]?.id === selectedModule.id || isPending}
                    onClick={() =>
                      startTransition(async () => {
                        const res = await moveModule(selectedModule.id, courseId, "up");
                        if (res.error) {
                          setMessage({ type: "error", text: res.error });
                        } else {
                          router.refresh();
                        }
                      })
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3 text-xs font-bold uppercase tracking-widest text-slate-700 transition hover:border-slate-400 disabled:opacity-40"
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                    Subir
                  </button>
                  <button
                    type="button"
                    disabled={modules[modules.length - 1]?.id === selectedModule.id || isPending}
                    onClick={() =>
                      startTransition(async () => {
                        const res = await moveModule(selectedModule.id, courseId, "down");
                        if (res.error) {
                          setMessage({ type: "error", text: res.error });
                        } else {
                          router.refresh();
                        }
                      })
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3 text-xs font-bold uppercase tracking-widest text-slate-700 transition hover:border-slate-400 disabled:opacity-40"
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                    Bajar
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-slate-500">Descripción del módulo</label>
                <textarea
                  rows={3}
                  defaultValue={selectedModule.description || ""}
                  onBlur={(event) =>
                    startTransition(async () => {
                      const res = await updateModule(selectedModule.id, courseId, {
                        description: event.target.value.trim() || "",
                      });
                      if (res.error) {
                        setMessage({ type: "error", text: res.error });
                      } else {
                        router.refresh();
                      }
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-[#9B1D20] focus:ring-4 focus:ring-[#9B1D20]/10 resize-none"
                />
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900">Temas del módulo</h3>
                  <p className="mt-1 text-sm font-medium text-slate-500">
                    Alta y orden de temas del curso sin diálogos ni prompts del navegador.
                  </p>
                </div>
                <div className="flex w-full max-w-xl gap-2">
                  <input
                    type="text"
                    value={newLessonTitle}
                    onChange={(event) => setNewLessonTitle(event.target.value)}
                    placeholder="Nuevo tema"
                    className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-[#9B1D20] focus:ring-4 focus:ring-[#9B1D20]/10"
                  />
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={handleCreateLesson}
                    className="inline-flex h-[46px] items-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-50"
                  >
                    <Plus className="h-4 w-4" />
                    Agregar
                  </button>
                </div>
              </div>

              {lessons.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-slate-200 px-4 py-10 text-center text-sm font-medium text-slate-400">
                  Este módulo aún no tiene temas.
                </div>
              ) : (
                <div className="space-y-4">
                  {lessons.map((lesson, index) => (
                    <article key={lesson.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                      <div className="grid gap-4 lg:grid-cols-[1fr_230px]">
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-lg bg-[#9B1D20]/10 px-2 text-xs font-bold text-[#9B1D20]">
                              T{index + 1}
                            </span>
                            <input
                              type="text"
                              defaultValue={lesson.title}
                              onBlur={(event) => {
                                const value = event.target.value.trim();
                                if (!value) {
                                  setMessage({ type: "error", text: "El tema no puede quedar sin nombre." });
                                  return;
                                }
                                startTransition(async () => {
                                  const res = await updateLesson(lesson.id, courseId, { title: value });
                                  if (res.error) {
                                    setMessage({ type: "error", text: res.error });
                                  } else {
                                    router.refresh();
                                  }
                                });
                              }}
                              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base font-bold outline-none focus:border-[#9B1D20] focus:bg-white"
                            />
                          </div>
                          <textarea
                            rows={3}
                            defaultValue={lesson.description || ""}
                            onBlur={(event) =>
                              startTransition(async () => {
                                const res = await updateLesson(lesson.id, courseId, {
                                  description: event.target.value.trim() || "",
                                });
                                if (res.error) {
                                  setMessage({ type: "error", text: res.error });
                                } else {
                                  router.refresh();
                                }
                              })
                            }
                            placeholder="Descripción corta del tema"
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none focus:border-[#9B1D20] focus:bg-white resize-none"
                          />
                        </div>

                        <div className="space-y-3">
                          <div>
                            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-slate-500">Duración estimada</label>
                            <input
                              type="number"
                              defaultValue={lesson.duration_minutes || ""}
                              onBlur={(event) =>
                              startTransition(async () => {
                                const res = await updateLesson(lesson.id, courseId, {
                                  duration_minutes: event.target.value ? Number(event.target.value) : null,
                                });
                                if (res.error) {
                                  setMessage({ type: "error", text: res.error });
                                } else {
                                  router.refresh();
                                }
                              })
                            }
                              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none focus:border-[#9B1D20] focus:bg-white"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              disabled={index === 0 || isPending}
                              onClick={() =>
                                startTransition(async () => {
                                  const res = await moveLesson(lesson.id, selectedModule.id, courseId, "up");
                                  if (res.error) {
                                    setMessage({ type: "error", text: res.error });
                                  } else {
                                    router.refresh();
                                  }
                                })
                              }
                              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3 text-xs font-bold uppercase tracking-widest text-slate-700 transition hover:border-slate-400 disabled:opacity-40"
                            >
                              <ChevronUp className="h-3.5 w-3.5" />
                              Subir
                            </button>
                            <button
                              type="button"
                              disabled={index === lessons.length - 1 || isPending}
                              onClick={() =>
                                startTransition(async () => {
                                  const res = await moveLesson(lesson.id, selectedModule.id, courseId, "down");
                                  if (res.error) {
                                    setMessage({ type: "error", text: res.error });
                                  } else {
                                    router.refresh();
                                  }
                                })
                              }
                              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3 text-xs font-bold uppercase tracking-widest text-slate-700 transition hover:border-slate-400 disabled:opacity-40"
                            >
                              <ChevronDown className="h-3.5 w-3.5" />
                              Bajar
                            </button>
                          </div>

                          {confirmDeleteLessonId === lesson.id ? (
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteLessonId(null)}
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3 text-xs font-bold uppercase tracking-widest text-slate-600 transition hover:border-slate-400"
                              >
                                Cancelar
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  startTransition(async () => {
                                    const res = await deleteLesson(lesson.id, courseId);
                                    if (res.error) {
                                      setMessage({ type: "error", text: res.error });
                                      return;
                                    }
                                    setConfirmDeleteLessonId(null);
                                    setMessage({ type: "success", text: "Tema eliminado." });
                                    router.refresh();
                                  })
                                }
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-50 px-3 py-3 text-xs font-bold uppercase tracking-widest text-red-700 transition hover:bg-red-100"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                Confirmar
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteLessonId(lesson.id)}
                              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 px-3 py-3 text-xs font-bold uppercase tracking-widest text-red-700 transition hover:bg-red-100"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Borrar tema
                            </button>
                          )}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
