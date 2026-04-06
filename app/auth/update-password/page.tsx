import { Suspense } from "react";

import { AuthShell } from "@/components/auth/auth-shell";
import { UpdatePasswordForm } from "@/components/update-password-form";

export default function Page() {
  return (
    <AuthShell
      title="Define tu contrasena"
      subtitle="Establece la contrasena que usaras para entrar al portal con tu correo."
    >
        <Suspense>
          <UpdatePasswordForm />
        </Suspense>
    </AuthShell>
  );
}
