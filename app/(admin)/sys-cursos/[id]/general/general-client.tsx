"use client";

import Image from "next/image";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Loader2, Save } from "lucide-react";
import { RichTextField } from "@/components/admin/rich-text-field";
import { saveCourseGeneral } from "../course-actions";

type CourseLike = {
  id: string;
  title?: string | null;
  slug?: string | null;
  thumbnail_url?: string | null;
  badge_text?: string | null;
  description?: string | null;
  long_description?: string | null;
};

const FALLBACK_COVER = "/diplomadoamparo.png";

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export default function GeneralTabClient({ course }: { course: CourseLike }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [title, setTitle] = useState(course.title || "");
  const [slug, setSlug] = useState(course.slug || "");
  const [badgeText, setBadgeText] = useState(course.badge_text || "");
  const [description, setDescription] = useState(course.description || "");
  const [longDescription, setLongDescription] = useState(course.long_description || "");
  const [thumbnailUrl, setThumbnailUrl] = useState(course.thumbnail_url || "");
  const [urlInput, setUrlInput] = useState(course.thumbnail_url?.startsWith("http") ? course.thumbnail_url : "");

  const previewImage = useMemo(() => thumbnailUrl || FALLBACK_COVER, [thumbnailUrl]);
  const checklistItems = [
    { label: "Nombre", ready: Boolean(title.trim()) },
    { label: "Slug", ready: Boolean(slug.trim()) },
    { label: "Portada", ready: Boolean(thumbnailUrl.trim()) },
    { label: "Descripción", ready: Boolean(description.trim()) },
  ];

  const inputClassName =
    "w-full rounded-2xl border border-[#ddd4c7] bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-[#9B1D20] focus:ring-4 focus:ring-[#9B1D20]/10";

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData();
    formData.set("title", title.trim());
    formData.set("slug", slug.trim());
    formData.set("badgeText", badgeText.trim());
    formData.set("description", description.trim());
    formData.set("longDescription", longDescription.trim());
    formData.set("thumbnailUrl", thumbnailUrl.trim());

    startTransition(async () => {
      setMessage(null);
      const result = await saveCourseGeneral(course.id, formData);
      if (result.success) {
        setMessage({ type: "success", text: "Configuración general guardada." });
        router.refresh();
      } else {
        setMessage({ type: "error", text: result.error });
      }
    });
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage({ type: "error", text: "Selecciona una imagen válida." });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      setThumbnailUrl(result);
      setUrlInput("");
      setMessage(null);
    };
    reader.readAsDataURL(file);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8 font-sans">
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

      <div className="flex flex-wrap gap-2">
        {checklistItems.map((item) => (
          <span
            key={item.label}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] ${
              item.ready
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-[#e4dacc] bg-[#fbf8f3] text-slate-500"
            }`}
          >
            {item.label}
            <span>{item.ready ? "Listo" : "Falta"}</span>
          </span>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">Nombre del Programa *</label>
          <input required type="text" value={title} onChange={(event) => setTitle(event.target.value)} className={inputClassName} />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">Slug del Curso *</label>
          <div className="space-y-2">
            <input
              required
              type="text"
              value={slug}
              onChange={(event) => setSlug(slugify(event.target.value))}
              className={`${inputClassName} font-mono`}
            />
            <button
              type="button"
              onClick={() => setSlug(slugify(title))}
              className="text-xs font-bold uppercase tracking-widest text-[#9B1D20] hover:underline"
            >
              Generar desde el nombre
            </button>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">Badge Comercial</label>
          <input
            type="text"
            value={badgeText}
            onChange={(event) => setBadgeText(event.target.value)}
            placeholder="Ej. Alta especialización 2026"
            className={inputClassName}
          />
        </div>

        <div className="md:col-span-2">
          <RichTextField
            label="Descripción Corta"
            value={description}
            onChange={setDescription}
            rows={4}
            hint="Esta copia se usa en cards, resúmenes y vistas compactas."
          />
        </div>

        <div className="md:col-span-2">
          <RichTextField
            label="Descripción Larga"
            value={longDescription}
            onChange={setLongDescription}
            rows={8}
          />
        </div>

        <div className="md:col-span-2 rounded-[28px] border border-[#e4dacc] bg-[#fbf8f3] p-5">
          <div className="grid gap-5 xl:grid-cols-[220px_minmax(0,1fr)]">
            <div className="space-y-3">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Portada del Curso</label>
                <label className="flex min-h-[148px] cursor-pointer flex-col items-center justify-center rounded-[24px] border border-dashed border-[#d8ccbb] bg-white px-4 py-6 text-center transition hover:border-[#9B1D20] hover:bg-[#9B1D20]/[0.03]">
                  <ImagePlus className="mb-3 h-5 w-5 text-slate-400" />
                  <span className="text-sm font-bold text-slate-700">Subir imagen</span>
                  <span className="mt-1 text-xs font-medium text-slate-400">PNG o JPG. También puedes pegar una URL pública abajo.</span>
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-slate-500">URL pública opcional</label>
                <input
                  type="url"
                  value={urlInput}
                  onChange={(event) => {
                    const nextValue = event.target.value;
                    setUrlInput(nextValue);
                    setThumbnailUrl(nextValue.trim());
                  }}
                  placeholder="https://..."
                  className={inputClassName}
                />
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Vista previa</p>
              <div className="overflow-hidden rounded-[28px] border border-[#e4dacc] bg-white shadow-sm">
                <div className="relative aspect-[16/9] bg-[#f1ebe2]">
                  <Image
                    src={previewImage}
                    alt={title || "Portada del curso"}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="space-y-2 p-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#9B1D20]">
                    {badgeText || "Programa académico"}
                  </p>
                  <h3 className="text-[17px] font-semibold leading-snug text-slate-900">
                    {title || "Nuevo Programa Académico"}
                  </h3>
                  <p className="line-clamp-3 whitespace-pre-wrap text-sm font-medium leading-6 text-slate-600">
                    {description || "Aquí verás la descripción corta del curso para tienda, cards y resúmenes."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end border-t border-[#e8decf] pt-4">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-slate-800 disabled:opacity-50"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Guardar General
        </button>
      </div>
    </form>
  );
}
