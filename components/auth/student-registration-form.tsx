"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  PHONE_COUNTRIES,
  formatLocalPhone,
  getPhoneCountry,
  isValidFullName,
  isValidLocalPhone,
  normalizeLocalPhone,
  toE164Phone,
} from "@/lib/phone";

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function StudentRegistrationForm() {
  const supabase = createClient();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneCountry, setPhoneCountry] = useState("MX");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const trimmedName = fullName.trim();
    const normalizedEmail = normalizeEmail(email);
    const canonicalPhone = toE164Phone(phone, phoneCountry);

    if (!isValidFullName(trimmedName)) {
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

    if (!isValidLocalPhone(phone, phoneCountry)) {
      setError(`Captura un telefono valido para ${getPhoneCountry(phoneCountry).label}.`);
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
            phone: canonicalPhone,
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
          Telefono *
        </Label>
        <div className="grid grid-cols-[122px_minmax(0,1fr)] gap-3">
          <select
            value={phoneCountry}
            onChange={(event) => setPhoneCountry(event.target.value)}
            className="h-12 rounded-[10px] border border-[#e7e2d9] bg-[#fbfbfc] px-3 text-sm font-semibold text-slate-900 outline-none focus:border-[#9B3328]"
          >
            {PHONE_COUNTRIES.map((country) => (
              <option key={country.code} value={country.code}>
                {country.flag} {country.dialCode}
              </option>
            ))}
          </select>
          <Input
            type="tel"
            value={formatLocalPhone(phone, phoneCountry)}
            onChange={(event) => setPhone(normalizeLocalPhone(event.target.value, phoneCountry))}
            placeholder={getPhoneCountry(phoneCountry).placeholder}
            autoComplete="tel-national"
            inputMode="numeric"
            required
            className="h-12 rounded-[10px] border-[#e7e2d9] bg-[#fbfbfc] text-slate-900 placeholder:text-slate-400"
          />
        </div>
      </div>

      <div>
        <Label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
          Contrasena *
        </Label>
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Minimo 6 caracteres"
            autoComplete="new-password"
            required
            className="h-12 rounded-[10px] border-[#e7e2d9] bg-[#fbfbfc] pr-11 text-slate-900 placeholder:text-slate-400"
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-400 hover:text-slate-700"
            aria-label={showPassword ? "Ocultar contrasena" : "Mostrar contrasena"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div>
        <Label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
          Confirmar contrasena *
        </Label>
        <div className="relative">
          <Input
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Repite tu contrasena"
            autoComplete="new-password"
            required
            className="h-12 rounded-[10px] border-[#e7e2d9] bg-[#fbfbfc] pr-11 text-slate-900 placeholder:text-slate-400"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((value) => !value)}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-400 hover:text-slate-700"
            aria-label={showConfirmPassword ? "Ocultar contrasena" : "Mostrar contrasena"}
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
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
