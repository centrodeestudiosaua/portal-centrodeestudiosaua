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
        <div className="mx-auto max-w-[980px] px-4 py-6 sm:px-6 lg:px-0">
          <PortalTopbar email={user?.email} />
          {children}
        </div>
      </div>
    </div>
  );
}
