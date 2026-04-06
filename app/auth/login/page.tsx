import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/login-form";

export default function Page() {
  return (
    <AuthShell
      title="Iniciar Sesion"
      subtitle="Ingresa con tu correo y contrasena"
    >
        <LoginForm />
    </AuthShell>
  );
}
