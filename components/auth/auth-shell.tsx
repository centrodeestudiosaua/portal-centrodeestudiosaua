"use client";

import Image from "next/image";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-primary px-6 py-10">
      <div className="absolute inset-0 opacity-15">
        <Image
          src="/diplomadoamparo.png"
          alt="Centro de Estudios AUA"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(234,179,8,0.14),transparent_35%),linear-gradient(180deg,rgba(14,16,38,0.88),rgba(20,21,45,0.96))]" />

      <div className="relative w-full max-w-md">
        <div className="overflow-hidden rounded-[28px] border border-white/10 bg-white shadow-[0_30px_80px_rgba(8,11,27,0.25)]">
          <div className="bg-[linear-gradient(180deg,rgba(28,27,57,0.98),rgba(36,33,69,0.95))] px-8 py-9 text-center text-white">
            <div className="mx-auto flex w-fit items-center gap-3">
              <span className="text-4xl font-bold tracking-[0.12em] text-white">AUA</span>
              <div className="h-8 w-px bg-white/15" />
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/80">
                Centro de Estudios
                <br />
                Juridicos
              </span>
            </div>
            <h1 className="mt-8 text-4xl font-bold">{title}</h1>
            <p className="mt-3 text-sm leading-7 text-white/72">{subtitle}</p>
          </div>

          <div className="px-8 py-8">{children}</div>
        </div>

        <p className="mt-6 text-center text-[10px] font-bold uppercase tracking-[0.22em] text-white/45">
          © 2026 AUA Centro de Estudios
        </p>
      </div>
    </div>
  );
}
