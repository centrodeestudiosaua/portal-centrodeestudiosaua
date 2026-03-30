"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { sidebarItems, settingsItem } from "@/components/portal/mock-data";
import { cn } from "@/lib/utils";

export function PortalSidebar({
  user,
}: {
  user?: {
    fullName: string;
    membershipLabel?: string | null;
  };
}) {
  const pathname = usePathname();
  const initials = user?.fullName
    ?.split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((chunk) => chunk[0]?.toUpperCase())
    .join("") || "A";

  return (
    <aside className="hidden w-64 shrink-0 bg-[hsl(var(--portal-sidebar))] text-white lg:flex lg:min-h-screen lg:flex-col">
      <div className="border-b border-white/10 px-6 py-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl font-bold tracking-tight text-accent">AUA</span>
          <div className="h-6 w-px bg-white/20" />
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] leading-tight text-white/90">
            Centro de Estudios
            <br />
            Juridicos
          </span>
        </div>
      </div>

      <nav className="flex-1 py-6">
        <ul className="space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "portal-sidebar-link",
                    isActive && "portal-sidebar-link-active",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                  {item.badge ? (
                    <span className="ml-auto rounded bg-secondary px-1.5 py-0.5 text-[10px] font-bold text-white">
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-auto border-t border-white/10 px-6 py-6">
        <Link
          href={settingsItem.href}
          className="flex items-center gap-4 text-sm font-medium text-[hsl(var(--portal-sidebar-muted))] transition-colors hover:text-white"
        >
          <settingsItem.icon className="h-4 w-4" />
          <span>{settingsItem.label}</span>
        </Link>

        <div className="mt-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-sm font-bold text-primary">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-white">
              {user?.fullName || "Alumno AUA"}
            </p>
            <p className="text-[10px] uppercase tracking-[0.16em] text-[hsl(var(--portal-sidebar-muted))]">
              {user?.membershipLabel || "Alumno Activo"}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
