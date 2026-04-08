import { connection } from "next/server";
import { redirect } from "next/navigation";

import { AdminSettingsPage } from "@/components/admin/admin-settings-page";
import { getPortalUser } from "@/lib/portal/data";

function formatDate(value: string | null) {
  if (!value) return "No disponible";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No disponible";

  return date.toLocaleString("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function AdminAjustesRoute() {
  await connection();
  const user = await getPortalUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <AdminSettingsPage
      user={{
        fullName: user.profile?.full_name || user.email || "Administrador AUA",
        email: user.email,
        role: user.profile?.role || "admin",
        membershipLabel: user.profile?.membership_label || "Administrador activo",
        createdAtLabel: formatDate(user.createdAt),
        emailConfirmedLabel: user.emailConfirmedAt ? "Confirmado" : "Pendiente",
      }}
    />
  );
}
