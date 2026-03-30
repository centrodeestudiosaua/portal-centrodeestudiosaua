import Link from "next/link";
import { Suspense } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function normalizeErrorMessage(message?: string) {
  if (!message) return "Ocurrio un error no especificado.";

  const lower = message.toLowerCase();

  if (lower.includes("expired") || lower.includes("invalid")) {
    return "El enlace de confirmacion es invalido o ya expiro. Solicita uno nuevo registrandote de nuevo o intenta iniciar sesion si tu cuenta ya quedo activa.";
  }

  if (lower.includes("token")) {
    return "No se pudo validar el enlace de confirmacion. Intenta abrir el correo mas reciente que envio el sistema.";
  }

  return message;
}

async function ErrorContent({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const message = normalizeErrorMessage(params?.error);

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-2xl">No se pudo completar la confirmacion</CardTitle>
        <CardDescription>Revisa el mensaje y vuelve a intentarlo.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm leading-7 text-muted-foreground">{message}</p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild className="rounded-none">
            <Link href="/auth/sign-up">Solicitar nuevo enlace</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-none">
            <Link href="/auth/login">Ir a iniciar sesion</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-xl">
        <Suspense>
          <ErrorContent searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}
