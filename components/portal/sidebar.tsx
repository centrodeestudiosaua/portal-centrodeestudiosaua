"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { sidebarItems, settingsItem } from "@/components/portal/mock-data";
import { cn } from "@/lib/utils";

export function PortalSidebar({
  user,
}: {
  user?: {
    fullName: string;
    email?: string | null;
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
    <aside className="hidden w-64 bg-[hsl(var(--portal-sidebar))] text-white lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:flex-col">
      <div className="border-b border-white/10 px-6 py-7">
        <div className="flex justify-center">
          <Image
            src="/logo.png"
            alt="Centro de Estudios AUA"
            width={108}
            height={58}
            priority
            className="h-auto w-[108px] object-contain"
          />
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

        <div className="mt-8 rounded-2xl border border-white/8 bg-white/[0.03] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-sm font-bold text-primary">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-white">
                {user?.fullName || "Alumno AUA"}
              </p>
              <p className="truncate text-[10px] uppercase tracking-[0.16em] text-[hsl(var(--portal-sidebar-muted))]">
                {user?.email || user?.membershipLabel || "Alumno Activo"}
              </p>
            </div>
          </div>

          <div className="mt-4 border-t border-white/8 pt-4">
            <p className="text-[10px] uppercase tracking-[0.16em] text-[hsl(var(--portal-sidebar-muted))]">
              {user?.membershipLabel || "Alumno Activo"}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
