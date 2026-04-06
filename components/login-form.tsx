"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, LogIn } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      router.push("/dashboard");
      router.refresh();
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleLogin} className="space-y-5">
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
        <div className="grid gap-2">
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="password" className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
              Contrasena
            </Label>
            <Link
              href="/auth/forgot-password"
              className="inline-block text-sm font-semibold text-[#9B3328] underline-offset-4 hover:underline"
            >
              Olvidaste tu contrasena?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-12 rounded-[10px] border-[#e7e2d9] bg-[#fbfbfc] text-slate-900"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" className="h-12 w-full rounded-[10px] bg-[#9B3328] text-white hover:bg-[#862b22]" disabled={isLoading}>
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em]">
            <LogIn className="h-4 w-4" />
            {isLoading ? "Ingresando..." : "Iniciar sesion"}
          </span>
        </Button>
        <div className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-300">
          <Lock className="h-3.5 w-3.5" />
          Conexion segura
        </div>
        <div className="text-center text-sm font-semibold text-[#9B3328]">
          <Link href="/auth/forgot-password" className="hover:underline">
            Olvidaste tu contrasena?
          </Link>
        </div>
        <div className="text-center text-sm text-slate-500">
          ¿No tienes cuenta?{" "}
          <Link href="/inscribirse" className="font-semibold text-[#C5A059] hover:underline">
            Crear cuenta
          </Link>
        </div>
      </form>
    </div>
  );
}
