"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useState } from "react";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/request-password-reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error || "No se pudo enviar el correo");
      setSuccess(true);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {success ? (
        <div className="space-y-4 text-center">
          <p className="text-sm leading-7 text-slate-600">
            Si tu cuenta existe, recibiras un correo del portal para definir una nueva contrasena.
          </p>
          <Link
            href="/auth/login"
            className="inline-flex w-full items-center justify-center rounded-[10px] bg-[#9B3328] px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] text-white hover:bg-[#862b22]"
          >
            Volver a iniciar sesion
          </Link>
        </div>
      ) : (
        <form onSubmit={handleForgotPassword} className="space-y-5">
          <div className="grid gap-2">
            <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
              Correo electronico
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@correo.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 rounded-[10px] border-[#e7e2d9] bg-[#fbfbfc] text-slate-900 placeholder:text-slate-400"
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="h-12 w-full rounded-[10px] bg-[#9B3328] text-white hover:bg-[#862b22]" disabled={isLoading}>
            <span className="text-xs font-bold uppercase tracking-[0.18em]">
              {isLoading ? "Enviando..." : "Enviar correo de acceso"}
            </span>
          </Button>
          <div className="text-center text-sm text-slate-500">
            ¿Ya tienes cuenta?{" "}
            <Link href="/auth/login" className="font-semibold text-[#9B3328] hover:underline">
              Inicia sesion
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
