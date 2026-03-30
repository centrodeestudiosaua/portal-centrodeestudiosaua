import { Download, FileBadge2 } from "lucide-react";

import type { CertificateItem } from "@/components/portal/types";

export function CertificatesCard({
  items,
}: {
  items: CertificateItem[];
}) {
  return (
    <section className="portal-card p-6">
      <h3 className="mb-6 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-primary">
        <FileBadge2 className="h-4 w-4 text-accent" />
        Certificados Listos
      </h3>

      {items.length ? <div className="space-y-3">
        {items.map((item) => (
          <article
            key={item.id}
            className="flex items-center justify-between rounded-none bg-accent/5 p-3"
          >
            <div className="flex items-center gap-3">
              <FileBadge2 className="h-4 w-4 text-accent" />
              <span className="text-xs font-bold text-primary">{item.title}</span>
            </div>
            <button
              type="button"
              disabled={!item.fileUrl}
              className="text-primary transition-colors hover:text-secondary"
              aria-label={`Descargar ${item.title}`}
            >
              <Download className="h-4 w-4" />
            </button>
          </article>
        ))}
      </div> : (
        <p className="text-sm text-muted-foreground">
          Tus certificados apareceran aqui cuando completes tus programas.
        </p>
      )}
    </section>
  );
}
