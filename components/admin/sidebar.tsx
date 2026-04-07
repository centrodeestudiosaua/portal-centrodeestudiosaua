"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  CreditCard,
  Video,
  BookOpen,
  BarChart3,
  Settings,
  Shield,
} from "lucide-react";

import { cn } from "@/lib/utils";

const adminNavItems = [
  { label: "Dashboard",  href: "/admin",          icon: LayoutDashboard,  exact: true },
  { label: "Leads",      href: "/admin/leads",     icon: Users },
  { label: "Alumnos",   href: "/admin/alumnos",   icon: GraduationCap },
  { label: "Pagos",     href: "/admin/pagos",     icon: CreditCard },
  { label: "Sesiones",  href: "/admin/sesiones",  icon: Video },
  { label: "Cursos",    href: "/admin/cursos",    icon: BookOpen },
  { label: "Reportes",  href: "/admin/reportes",  icon: BarChart3 },
];

const adminSettingsItem = { label: "Ajustes", href: "/admin/ajustes", icon: Settings };

export function AdminSidebar({
  user,
}: {
  user?: { fullName: string; email?: string | null };
}) {
  const pathname = usePathname();

  const initials =
    user?.fullName
      ?.split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((c) => c[0]?.toUpperCase())
      .join("") || "A";

  return (
    <aside className="hidden w-64 bg-[hsl(var(--portal-sidebar))] text-white lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:flex-col">
      {/* Logo */}
      <div className="border-b border-white/10 px-6 py-7">
        <div className="flex justify-center">
          <Image
            src="/logo.png"
            alt="Centro de Estudios AUA"
            width={108}
            height={58}
            priority
            className="object-contain"
            style={{ width: "108px", height: "auto" }}
          />
        </div>
        {/* Admin badge */}
        <div className="mt-3 flex justify-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#9B1D20]/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#e87b7e]">
            <Shield className="h-3 w-3" />
            Panel Admin
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-6">
        <ul className="space-y-1">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(item.href + "/");

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
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="mt-auto border-t border-white/10 px-6 py-6">
        <Link
          href={adminSettingsItem.href}
          className="flex items-center gap-4 text-sm font-medium text-[hsl(var(--portal-sidebar-muted))] transition-colors hover:text-white"
        >
          <adminSettingsItem.icon className="h-4 w-4" />
          <span>{adminSettingsItem.label}</span>
        </Link>

        <div className="mt-8 rounded-2xl border border-white/8 bg-white/[0.03] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#9B1D20] text-sm font-bold text-white">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-white">
                {user?.fullName || "Admin AUA"}
              </p>
              <p className="truncate text-[10px] uppercase tracking-[0.16em] text-[hsl(var(--portal-sidebar-muted))]">
                {user?.email || "Administrador"}
              </p>
            </div>
          </div>
          <div className="mt-4 border-t border-white/8 pt-4">
            <p className="text-[10px] uppercase tracking-[0.16em] text-[hsl(var(--portal-sidebar-muted))]">
              Administrador
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
