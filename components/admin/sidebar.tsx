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

import { getAdminBrowserPath, getAdminLocalPath, getAdminPublicPath } from "@/lib/admin-routes";
import { cn } from "@/lib/utils";

const adminNavItems = [
  { label: "Dashboard", key: "dashboard", href: "/sys-dashboard", icon: LayoutDashboard, exact: true },
  { label: "Leads", key: "leads", href: "/sys-leads", icon: Users },
  { label: "Alumnos", key: "alumnos", href: "/sys-alumnos", icon: GraduationCap },
  { label: "Pagos", key: "pagos", href: "/sys-pagos", icon: CreditCard },
  { label: "Sesiones", key: "sesiones", href: "/sys-sesiones", icon: Video },
  { label: "Cursos", key: "cursos", href: "/sys-cursos", icon: BookOpen },
  { label: "Reportes", key: "reportes", href: "/sys-reportes", icon: BarChart3 },
] as const;

const adminSettingsItem = { label: "Ajustes", key: "ajustes", href: "/sys-ajustes", icon: Settings } as const;

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
  const settingsHref = getAdminBrowserPath(adminSettingsItem.key);

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
            const publicPath = getAdminPublicPath(item.key);
            const localPath = getAdminLocalPath(item.key);
            const isExact = "exact" in item && item.exact;
            const isActive = isExact
              ? pathname === item.href || pathname === publicPath || pathname === localPath
              : pathname === item.href ||
                pathname.startsWith(item.href + "/") ||
                pathname === publicPath ||
                pathname.startsWith(publicPath + "/") ||
                pathname === localPath ||
                pathname.startsWith(localPath + "/");
            const publicHref = getAdminBrowserPath(item.key);

            return (
              <li key={item.href}>
                <Link
                  href={publicHref}
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
          href={settingsHref}
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
