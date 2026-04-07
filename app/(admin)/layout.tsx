import { connection } from "next/server";
import { redirect } from "next/navigation";

import { AdminSidebar } from "@/components/admin/sidebar";
import { PortalTopbar } from "@/components/portal/topbar";
import { getPortalUser } from "@/lib/portal/data";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();
  const user = await getPortalUser();

  // Protección server-side: solo admins
  if (!user) {
    redirect("/login");
  }

  if (user.profile?.role !== "admin") {
    redirect("/login");
  }

  return (
    <div className="portal-shell flex h-screen overflow-hidden overscroll-none bg-[rgba(247,248,252,1)]">
      <AdminSidebar
        user={{
          fullName: user.profile?.full_name || user.email || "Admin AUA",
          email: user.email,
        }}
      />
      <div className="flex flex-1 flex-col h-screen overflow-hidden lg:pl-64">
        {/* Topbar fixed at the top of the flex container */}
        <div className="z-20 shrink-0 border-b border-border/70 bg-[rgba(247,248,252,0.92)] backdrop-blur">
          <div className="mx-auto max-w-[1200px] px-4 py-4 sm:px-6 lg:px-8">
            <PortalTopbar email={user.email} />
          </div>
        </div>
        
        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto overscroll-none">
          <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
