import { CalendarClock } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { UpcomingClassItem } from "@/components/portal/types";

export function UpcomingClassesCard({
  items,
}: {
  items: UpcomingClassItem[];
}) {
  return (
    <section className="portal-card p-6">
      <h3 className="mb-6 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-primary">
        <CalendarClock className="h-4 w-4 text-accent" />
        Proximas Clases
      </h3>

      <div className="space-y-4">
        {items.map((item) => (
          <article
            key={item.id}
            className={`flex gap-4 border-l-2 p-3 transition-colors hover:bg-muted/30 ${
              item.highlighted ? "border-secondary" : "border-border"
            }`}
          >
            <div className="flex min-w-[50px] flex-col items-center justify-center bg-muted p-2 text-center">
              <span className="text-[10px] font-bold uppercase text-muted-foreground">
                {item.month}
              </span>
              <span className="text-lg font-bold text-primary">{item.day}</span>
            </div>
            <div>
              <h4 className="text-sm font-bold leading-tight text-primary">
                {item.title}
              </h4>
              <p className="mt-1 text-xs text-muted-foreground">{item.meta}</p>
            </div>
          </article>
        ))}
      </div>

      <Button
        variant="outline"
        className="mt-6 w-full rounded-none border-border py-2 text-xs font-bold uppercase tracking-[0.18em] text-primary hover:bg-muted"
      >
        Ver Calendario Completo
      </Button>
    </section>
  );
}
