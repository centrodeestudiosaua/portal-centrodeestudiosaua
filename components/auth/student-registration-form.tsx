"use client";

import { useState } from "react";
import Link from "next/link";
import { UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function normalizePhone(value: string) {
  return value.replace(/\D/g, "").slice(0, 10);
}

function formatPhone(value: string) {
  const digits = normalizePhone(value);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export function StudentRegistrationForm() {
  const supabase = createClient();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const trimmedName = fullName.trim();
    const normalizedEmail = normalizeEmail(email);
    const normalizedPhone = normalizePhone(phone);

    if (trimmedName.split(/\s+/).filter(Boolean).length < 2) {
      setError("Captura nombre y apellidos.");
      return;
    }

    if (password.length < 6) {
      setError("La contrasena debe tener al menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contrasenas no coinciden.");
      return;
    }

    if (normalizedPhone && normalizedPhone.length !== 10) {
      setError("El telefono debe tener 10 digitos.");
      return;
    }

    setIsLoading(true);

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm?next=/dashboard`,
          data: {
            full_name: trimmedName,
            phone: normalizedPhone || null,
          },
        },
      });

      if (signUpError) throw signUpError;

      router.push("/auth/sign-up-success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear la cuenta.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
          Nombre completo *
        </Label>
        <Input
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          placeholder="Nombre(s) y Apellidos"
          autoComplete="name"
          required
          className="h-12 rounded-[10px] border-[#e7e2d9] bg-[#fbfbfc] text-slate-900 placeholder:text-slate-400"
        />
      </div>

      <div>
        <Label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
          Correo electronico *
        </Label>
        <Input
          type="email"
          value={email}
          onChange={(event) => setEmail(normalizeEmail(event.target.value))}
          placeholder="tu@correo.com"
          autoComplete="email"
          required
          className="h-12 rounded-[10px] border-[#e7e2d9] bg-[#fbfbfc] text-slate-900 placeholder:text-slate-400"
        />
      </div>

      <div>
        <Label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
          Telefono (opcional)
        </Label>
        <Input
          type="tel"
          value={formatPhone(phone)}
          onChange={(event) => setPhone(normalizePhone(event.target.value))}
          placeholder="(000) 000-0000"
          autoComplete="tel"
          inputMode="numeric"
          className="h-12 rounded-[10px] border-[#e7e2d9] bg-[#fbfbfc] text-slate-900 placeholder:text-slate-400"
        />
      </div>

      <div>
        <Label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
          Contrasena *
        </Label>
        <Input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Minimo 6 caracteres"
          autoComplete="new-password"
          required
          className="h-12 rounded-[10px] border-[#e7e2d9] bg-[#fbfbfc] text-slate-900 placeholder:text-slate-400"
        />
      </div>

      <div>
        <Label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
          Confirmar contrasena *
        </Label>
        <Input
          type="password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          placeholder="Repite tu contrasena"
          autoComplete="new-password"
          required
          className="h-12 rounded-[10px] border-[#e7e2d9] bg-[#fbfbfc] text-slate-900 placeholder:text-slate-400"
        />
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <Button
        type="submit"
        disabled={isLoading}
        className="h-12 w-full rounded-[10px] bg-[#9B3328] text-white hover:bg-[#862b22]"
      >
        <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em]">
          <UserPlus className="h-4 w-4" />
          {isLoading ? "Creando cuenta..." : "Crear cuenta gratis"}
        </span>
      </Button>

      <div className="text-center text-sm text-slate-500">
        ¿Ya tienes cuenta?{" "}
        <Link href="/auth/login" className="font-semibold text-[#9B3328] hover:underline">
          Iniciar sesion
        </Link>
      </div>
    </form>
  );
}
