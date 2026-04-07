import Link from "next/link";

export default async function CheckEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; mode?: string }>;
}) {
  const params = await searchParams;
  const email = params.email || "";
  const mode = params.mode || "activation";
  const title =
    mode === "reset"
      ? "Revisa tu correo para restablecer tu acceso"
      : "Tu acceso al portal fue creado";
  const description =
    mode === "reset"
      ? "Te enviamos un correo branded con el enlace para definir una nueva contrasena."
      : "Te enviamos un correo branded para activar tu cuenta y definir tu contrasena del portal.";

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-[#f5f3ee] px-6 py-10">
      <div className="w-full max-w-xl rounded-[28px] border border-[#e7dfd2] bg-white p-10 shadow-[0_24px_70px_rgba(20,19,38,0.08)]">
        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-accent">
          Portal AUA
        </p>
        <h1 className="mt-4 text-4xl font-bold text-primary">{title}</h1>
        <p className="mt-4 text-sm leading-8 text-muted-foreground">{description}</p>
        {email ? (
          <p className="mt-4 text-sm font-semibold text-primary">
            Correo enviado a: {email}
          </p>
        ) : null}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center rounded-[14px] bg-primary px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-white"
          >
            Ir a iniciar sesion
          </Link>
          <Link
            href="/recuperar-acceso"
            className="inline-flex items-center justify-center rounded-[14px] border border-border px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-primary"
          >
            Volver a enviar correo
          </Link>
        </div>
      </div>
    </div>
  );
}
