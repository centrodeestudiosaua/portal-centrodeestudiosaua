import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/login-form";

export default function Page() {
  return (
    <AuthShell
      title="Iniciar Sesión"
      subtitle="Ingresa con tu correo y contraseña"
    >
      <LoginForm />
    </AuthShell>
  );
}
