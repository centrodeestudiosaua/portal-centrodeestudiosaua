import { connection } from "next/server";

import { updateStudentProfile } from "@/app/(portal)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getPortalUser } from "@/lib/portal/data";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  await connection();
  const [user, params] = await Promise.all([getPortalUser(), searchParams]);
  const profile = user?.profile;

  return (
    <div className="space-y-8">
      <header>
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-accent">
          Ajustes
        </p>
        <h1 className="mt-3 text-4xl font-bold text-primary">
          Perfil y configuracion de cuenta
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
          Administra tus datos personales y mantén actualizada tu información de
          acceso al portal.
        </p>
      </header>

      {params.saved === "1" ? (
        <section className="border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Tus datos se actualizaron correctamente.
        </section>
      ) : null}

      <div className="grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="portal-card p-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-accent">
            Cuenta
          </p>
          <h2 className="mt-4 text-2xl font-bold text-primary">
            Resumen del alumno
          </h2>

          <div className="mt-8 space-y-5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Nombre completo
              </p>
              <p className="mt-2 text-lg font-semibold text-primary">
                {profile?.full_name || "Sin nombre capturado"}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Correo
              </p>
              <p className="mt-2 text-lg font-semibold text-primary">
                {user?.email || "Sin correo"}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Membresia
              </p>
              <p className="mt-2 text-lg font-semibold text-primary">
                {profile?.membership_label || "Alumno activo"}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Rol
              </p>
              <p className="mt-2 text-lg font-semibold capitalize text-primary">
                {profile?.role || "student"}
              </p>
            </div>
          </div>
        </section>

        <section className="portal-card p-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-accent">
            Editar perfil
          </p>
          <h2 className="mt-4 text-2xl font-bold text-primary">
            Datos personales
          </h2>

          <form action={updateStudentProfile} className="mt-8 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="full_name">Nombre completo</Label>
              <Input
                id="full_name"
                name="full_name"
                defaultValue={profile?.full_name || ""}
                className="h-11 rounded-none border-border bg-background"
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="first_name">Nombre</Label>
                <Input
                  id="first_name"
                  name="first_name"
                  defaultValue={profile?.first_name || ""}
                  className="h-11 rounded-none border-border bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name">Apellidos</Label>
                <Input
                  id="last_name"
                  name="last_name"
                  defaultValue={profile?.last_name || ""}
                  className="h-11 rounded-none border-border bg-background"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                name="phone"
                defaultValue={profile?.phone || ""}
                className="h-11 rounded-none border-border bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo de acceso</Label>
              <Input
                id="email"
                value={user?.email || ""}
                disabled
                className="h-11 rounded-none border-border bg-muted/30"
              />
            </div>

            <Button
              type="submit"
              className="rounded-none bg-primary px-6 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white hover:bg-secondary"
            >
              Guardar cambios
            </Button>
          </form>
        </section>
      </div>
    </div>
  );
}
