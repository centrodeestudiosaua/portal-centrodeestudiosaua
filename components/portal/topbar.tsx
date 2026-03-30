import { LogOut, Menu } from "lucide-react";

import { LogoutButton } from "@/components/logout-button";

export function PortalTopbar({
  email,
}: {
  email?: string | null;
}) {
  return (
    <header className="mb-8 flex items-center justify-between gap-4">
      <button
        type="button"
        className="inline-flex h-11 w-11 items-center justify-center border border-border bg-card text-primary lg:hidden"
        aria-label="Abrir navegacion"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="hidden lg:block" />

      <div className="ml-auto flex items-center gap-3">
        <span className="hidden text-sm text-muted-foreground sm:inline">
          {email || "alumno@centrodeestudiosaua.com"}
        </span>
        <LogoutButton
          variant="outline"
          className="gap-2 rounded-none border-border bg-card px-4 text-xs font-bold uppercase tracking-[0.18em] text-primary hover:bg-muted"
        >
          <LogOut className="h-4 w-4" />
          Salir
        </LogoutButton>
      </div>
    </header>
  );
}
