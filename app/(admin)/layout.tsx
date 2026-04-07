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
    <div className="portal-shell">
      <AdminSidebar
        user={{
          fullName: user.profile?.full_name || user.email || "Admin AUA",
          email: user.email,
        }}
      />
      <div className="min-h-screen flex-1 lg:pl-64">
        <div className="sticky top-0 z-20 border-b border-border/70 bg-[rgba(247,248,252,0.92)] backdrop-blur">
          <div className="mx-auto max-w-[1200px] px-4 py-4 sm:px-6 lg:px-8">
            <PortalTopbar email={user.email} />
          </div>
        </div>
        <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </div>
    </div>
  );
}
