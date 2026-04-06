"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
      <form onSubmit={handleLogin} className="space-y-6">
        <div className="grid gap-2">
          <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Correo electronico
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="tu@correo.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 rounded-[14px]"
          />
        </div>
        <div className="grid gap-2">
          <div className="flex items-center">
            <Label htmlFor="password" className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Contrasena
            </Label>
            <Link
              href="/auth/forgot-password"
              className="ml-auto inline-block text-sm font-semibold text-secondary underline-offset-4 hover:underline"
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
            className="h-12 rounded-[14px]"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" className="h-12 w-full rounded-[14px] bg-secondary text-white hover:bg-secondary/90" disabled={isLoading}>
          {isLoading ? "Ingresando..." : "Iniciar sesion"}
        </Button>
        <div className="text-center text-sm text-muted-foreground">
          El acceso a alumnos se habilita por compra o alta administrativa.
        </div>
      </form>
    </div>
  );
}
