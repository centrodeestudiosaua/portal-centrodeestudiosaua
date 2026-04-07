import { cn } from "@/lib/utils";

import type { DashboardStat } from "@/components/portal/types";

const toneStyles = {
  info: {
    icon: "bg-[rgba(197,160,89,0.14)] text-accent",
  },
  success: {
    icon: "bg-[rgba(145,26,38,0.10)] text-secondary",
  },
};

export function StatCard({ stat }: { stat: DashboardStat }) {
  const Icon = stat.icon;

  return (
    <article className="portal-card flex min-w-[220px] items-center gap-4 p-4">
      <div
        className={cn(
          "rounded-none p-2",
          toneStyles[stat.tone].icon,
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
          {stat.label}
        </p>
        <p className="text-2xl font-bold text-primary">{stat.value}</p>
      </div>
    </article>
  );
}
