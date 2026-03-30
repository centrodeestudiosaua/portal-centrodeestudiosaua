import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                Revisa tu correo para activar la cuenta
              </CardTitle>
              <CardDescription>Te enviamos un enlace de confirmacion</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Tu registro ya fue creado. Abre el correo mas reciente y confirma
                tu cuenta antes de iniciar sesion. Si el enlace expira, vuelve a
                registrarte para generar uno nuevo.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
