import { redirect } from "next/navigation";

export default function AdminSesionesPage() {
  redirect(process.env.NODE_ENV === "development" ? "/admin/dashboard" : "/dashboard");
}
