"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function UpdatePasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      router.push(searchParams.get("next") || "/dashboard");
      router.refresh();
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleForgotPassword} className="space-y-5">
        <div className="grid gap-2">
          <Label htmlFor="password" className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
            Nueva contrasena
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="Nueva contrasena"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-12 rounded-[10px] border-[#e7e2d9] bg-[#fbfbfc] text-slate-900 placeholder:text-slate-400"
          />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button type="submit" className="h-12 w-full rounded-[10px] bg-[#9B3328] text-white hover:bg-[#862b22]" disabled={isLoading}>
          <span className="text-xs font-bold uppercase tracking-[0.18em]">
            {isLoading ? "Guardando..." : "Guardar contrasena"}
          </span>
        </Button>
      </form>
    </div>
  );
}
