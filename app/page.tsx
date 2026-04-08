import { AuthButton } from "@/components/auth-button";
import { Button } from "@/components/ui/button";
import { buildAdminUrl } from "@/lib/admin-url";
import Link from "next/link";
import { Suspense } from "react";

export default function Home() {
  const adminHref =
    process.env.NODE_ENV === "development"
      ? "/admin/dashboard"
      : buildAdminUrl("/dashboard");

  return (
    <main className="min-h-screen bg-primary text-white">
      <nav className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="flex items-center gap-3">
            <span className="text-3xl font-bold tracking-tight text-accent">AUA</span>
            <div className="h-6 w-px bg-white/20" />
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] leading-tight text-white/90">
              Centro de Estudios
              <br />
              Juridicos
            </span>
          </Link>
          <Suspense fallback={<div className="h-10 w-[172px]" />}>
            <AuthButton />
          </Suspense>
        </div>
      </nav>

      <section className="mx-auto grid min-h-[calc(100vh-81px)] max-w-7xl items-center gap-12 px-6 py-16 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="max-w-3xl">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.28em] text-accent">
            Portal Academico
          </p>
          <h1 className="text-5xl font-bold leading-tight md:text-7xl">
            Formacion juridica de alto nivel para cada alumno de AUA.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70">
            Accede a tus cursos, sesiones, materiales, progreso y certificados
            desde un solo lugar. Esta sera la nueva base del portal academico.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Button
              asChild
              className="rounded-none bg-[#9B1D20] px-8 py-6 text-xs font-bold uppercase tracking-[0.18em] text-white hover:bg-[#7a171a]"
            >
              <Link href={adminHref}>Panel Administrador</Link>
            </Button>
            <Button
              asChild
              className="rounded-none bg-accent px-8 py-6 text-xs font-bold uppercase tracking-[0.18em] text-primary hover:bg-[#f4c62c]"
            >
              <Link href="/dashboard">Portal Estudiantes</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="rounded-none border-white/20 bg-transparent px-8 py-6 text-xs font-bold uppercase tracking-[0.18em] text-white hover:bg-white/5"
            >
              <Link href="/auth/login">Iniciar Sesion</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-6">
          <article className="border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-accent">
              Base Lista
            </p>
            <h2 className="mt-3 text-3xl font-bold">Auth y sesiones funcionando</h2>
            <p className="mt-4 text-sm leading-7 text-white/70">
              Vercel, Supabase y rutas protegidas ya estan activos. El siguiente
              paso es construir el dominio academico real.
            </p>
          </article>

          <article className="border border-white/10 bg-white p-8 text-primary">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-secondary">
              Siguiente Iteracion
            </p>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-muted-foreground">
              <li>Dashboard de alumno con datos reales</li>
              <li>Catalogo y detalle de cursos</li>
              <li>Lecciones, sesiones y progreso</li>
              <li>Modelo de datos academico en Supabase</li>
            </ul>
          </article>
        </div>
      </section>
    </main>
  );
}
