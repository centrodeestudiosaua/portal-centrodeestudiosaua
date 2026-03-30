import Link from "next/link";

import { Button } from "@/components/ui/button";

export function PlaceholderPage({
  eyebrow,
  title,
  description,
  ctaHref = "/dashboard",
  ctaLabel = "Volver al dashboard",
}: {
  eyebrow: string;
  title: string;
  description: string;
  ctaHref?: string;
  ctaLabel?: string;
}) {
  return (
    <section className="portal-card max-w-4xl p-10">
      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-accent">
        {eyebrow}
      </p>
      <h1 className="mt-4 text-4xl font-bold text-primary">{title}</h1>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
        {description}
      </p>
      <div className="mt-8">
        <Button
          asChild
          className="rounded-none bg-primary px-6 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white hover:bg-secondary"
        >
          <Link href={ctaHref}>{ctaLabel}</Link>
        </Button>
      </div>
    </section>
  );
}
