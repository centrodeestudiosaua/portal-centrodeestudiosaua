import { connection } from "next/server";
import { redirect } from "next/navigation";
import { createClient as createAdminClient } from "@supabase/supabase-js";

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

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  let adminUsers: Array<{
    id: string;
    fullName: string;
    email: string;
    createdAtLabel: string;
    emailConfirmedLabel: string;
  }> = [];

  if (serviceRoleKey && supabaseUrl) {
    const admin = createAdminClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const [{ data: profiles }, listedUsers] = await Promise.all([
      admin
        .from("student_profiles")
        .select("id, full_name, email, created_at")
        .eq("role", "admin")
        .order("created_at", { ascending: true }),
      admin.auth.admin.listUsers({ page: 1, perPage: 500 }),
    ]);

    const authUsersById = new Map(
      (listedUsers.data?.users ?? []).map((listedUser) => [listedUser.id, listedUser]),
    );

    adminUsers = (profiles ?? []).map((profile) => {
      const authUser = authUsersById.get(profile.id);

      return {
        id: profile.id,
        fullName: profile.full_name || profile.email || "Administrador",
        email: profile.email || authUser?.email || "Sin correo",
        createdAtLabel: formatDate(profile.created_at || authUser?.created_at || null),
        emailConfirmedLabel: authUser?.email_confirmed_at ? "Confirmado" : "Pendiente",
      };
    });
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
      adminUsers={adminUsers}
    />
  );
}
