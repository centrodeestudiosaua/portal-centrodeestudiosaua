"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, Calendar, CreditCard, List, Video, ShoppingCart, Key, Eye } from "lucide-react";

export default function CourseBuilderNav({ courseId }: { courseId: string }) {
  const pathname = usePathname();

  const tabs = [
    { label: "General", href: `/sys-cursos/${courseId}/general`, icon: Settings },
    { label: "Calendario", href: `/sys-cursos/${courseId}/calendario`, icon: Calendar },
    { label: "Pagos y Stripe", href: `/sys-cursos/${courseId}/pagos`, icon: CreditCard },
    { label: "Temario", href: `/sys-cursos/${courseId}/temario`, icon: List },
    { label: "Sesiones en Vivo", href: `/sys-cursos/${courseId}/sesiones`, icon: Video },
    { label: "Checkout", href: `/sys-cursos/${courseId}/checkout`, icon: ShoppingCart },
    { label: "Integración", href: `/sys-cursos/${courseId}/stripe`, icon: Key },
    { label: "Vista Previa", href: `/sys-cursos/${courseId}/preview`, icon: Eye },
  ];

  return (
    <nav className="h-full p-4 space-y-1 overflow-y-auto">
      <div className="mb-4 px-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Constructor de Cursos</p>
      </div>
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
              isActive
                ? "bg-[#9B1D20]/10 text-[#9B1D20]"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <Icon className={`h-4 w-4 ${isActive ? "text-[#9B1D20]" : "text-slate-400"}`} />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
