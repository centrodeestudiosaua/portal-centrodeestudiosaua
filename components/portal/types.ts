import type { LucideIcon } from "lucide-react";

export type SidebarItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
};

export type DashboardStat = {
  label: string;
  value: string;
  icon: LucideIcon;
  tone: "info" | "success";
};

export type CourseProgressItem = {
  id: string;
  category: string;
  title: string;
  cover: string;
  progress: number;
  lessonsLabel: string;
  lastSeen: string;
  expiry: string;
  href: string;
};

export type UpcomingClassItem = {
  id: string;
  month: string;
  day: string;
  title: string;
  meta: string;
  highlighted?: boolean;
};

export type CertificateItem = {
  id: string;
  title: string;
  fileUrl?: string | null;
};
