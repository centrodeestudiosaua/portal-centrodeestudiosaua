"use client";

import { useRef } from "react";
import { List, Pilcrow, TextCursorInput } from "lucide-react";

type RichTextFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  hint?: string;
};

function injectSnippet(value: string, snippet: string, selectionStart: number, selectionEnd: number) {
  const before = value.slice(0, selectionStart);
  const selected = value.slice(selectionStart, selectionEnd);
  const after = value.slice(selectionEnd);
  const next = `${before}${snippet}${selected}${after}`;
  const nextCursor = selectionStart + snippet.length;
  return { next, nextCursor };
}

export function RichTextField({
  label,
  value,
  onChange,
  placeholder,
  rows = 6,
  hint,
}: RichTextFieldProps) {
  const ref = useRef<HTMLTextAreaElement | null>(null);

  function insert(snippet: string) {
    const textarea = ref.current;
    if (!textarea) return;
    const { selectionStart, selectionEnd } = textarea;
    const { next, nextCursor } = injectSnippet(value, snippet, selectionStart, selectionEnd);
    onChange(next);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(nextCursor, nextCursor);
    });
  }

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <label className="block text-sm font-semibold text-slate-700">{label}</label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => insert("• ")}
            className="inline-flex items-center gap-1 rounded-xl border border-[#ddd4c7] bg-white px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-600 transition hover:border-[#9B1D20]/30 hover:text-[#9B1D20]"
          >
            <List className="h-3.5 w-3.5" />
            Viñeta
          </button>
          <button
            type="button"
            onClick={() => insert("\n\n")}
            className="inline-flex items-center gap-1 rounded-xl border border-[#ddd4c7] bg-white px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-600 transition hover:border-[#9B1D20]/30 hover:text-[#9B1D20]"
          >
            <Pilcrow className="h-3.5 w-3.5" />
            Salto
          </button>
          <button
            type="button"
            onClick={() => insert("### ")}
            className="inline-flex items-center gap-1 rounded-xl border border-[#ddd4c7] bg-white px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-600 transition hover:border-[#9B1D20]/30 hover:text-[#9B1D20]"
          >
            <TextCursorInput className="h-3.5 w-3.5" />
            Título
          </button>
        </div>
      </div>
      <textarea
        ref={ref}
        rows={rows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-[#ddd4c7] bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-[#9B1D20] focus:ring-4 focus:ring-[#9B1D20]/10"
      />
      {hint ? <p className="mt-1.5 text-xs font-medium text-slate-400">{hint}</p> : null}
    </div>
  );
}
