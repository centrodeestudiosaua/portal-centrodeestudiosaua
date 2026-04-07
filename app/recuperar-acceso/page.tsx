import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/forgot-password-form";

export default function Page() {
  return (
    <AuthShell
      title="Recupera tu acceso"
      subtitle="Ingresa tu correo y te enviaremos un enlace branded para restablecer tu contrasena."
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
