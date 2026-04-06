import { connection } from "next/server";

import { PortalSidebar } from "@/components/portal/sidebar";
import { PortalTopbar } from "@/components/portal/topbar";
import { getPortalUser } from "@/lib/portal/data";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();
  const user = await getPortalUser();

  return (
    <div className="portal-shell">
      <PortalSidebar
        user={{
          fullName: user?.profile?.full_name || user?.email || "Alumno AUA",
          email: user?.email,
          membershipLabel: user?.profile?.membership_label,
        }}
      />
      <div className="min-h-screen flex-1 lg:pl-64">
        <div className="sticky top-0 z-20 border-b border-border/70 bg-[rgba(247,248,252,0.92)] backdrop-blur">
          <div className="mx-auto max-w-[1120px] px-4 py-4 sm:px-6 lg:px-8">
            <PortalTopbar email={user?.email} />
          </div>
        </div>
        <div className="mx-auto max-w-[1120px] px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </div>
    </div>
  );
}
