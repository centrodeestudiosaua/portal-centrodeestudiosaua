import { CalendarDays, CreditCard, LayoutDashboard, Mail, Medal, School, Settings } from "lucide-react";

import type { SidebarItem } from "@/components/portal/types";

export const sidebarItems: SidebarItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Mis Cursos", href: "/courses", icon: School },
  { label: "Mis Pagos", href: "/payments", icon: CreditCard },
  { label: "Certificaciones", href: "/certificates", icon: Medal },
  { label: "Calendario", href: "/calendar", icon: CalendarDays },
  { label: "Mensajes", href: "/messages", icon: Mail },
];

export const settingsItem = {
  label: "Ajustes",
  href: "/settings",
  icon: Settings,
};
