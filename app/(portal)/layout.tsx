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
    <div className="portal-shell lg:flex">
      <PortalSidebar
        user={{
          fullName: user?.profile?.full_name || user?.email || "Alumno AUA",
          membershipLabel: user?.profile?.membership_label,
        }}
      />
      <div className="min-h-screen flex-1">
        <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8">
          <PortalTopbar email={user?.email} />
          {children}
        </div>
      </div>
    </div>
  );
}
