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
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-[#1a1a35] px-6 py-10">
      <div className="absolute inset-0 opacity-[0.08]">
        <Image
          src="/diplomadoamparo.png"
          alt="Centro de Estudios AUA"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_left_center,rgba(197,160,89,0.08),transparent_22%),linear-gradient(180deg,rgba(18,18,35,0.92),rgba(26,26,53,0.98))]" />

      <div className="relative w-full max-w-[530px]">
        <div className="overflow-hidden rounded-[18px] bg-white shadow-[0_34px_90px_rgba(8,11,27,0.34)] ring-0">
          <div className="relative overflow-hidden bg-[linear-gradient(180deg,rgba(28,27,57,0.98),rgba(36,33,69,0.95))] px-10 py-9 text-center text-white">
            <div className="absolute inset-0 opacity-[0.08]">
              <Image
                src="/diplomadoamparo.png"
                alt=""
                fill
                priority
                className="object-cover object-center"
                sizes="530px"
              />
            </div>
            <Image
              src="/logo.png"
              alt="AUA Centro de Estudios Juridicos"
              width={190}
              height={62}
              priority
              className="relative mx-auto"
              style={{ width: "190px", height: "auto" }}
            />
            <h1 className="relative mt-8 font-sans text-[1.55rem] font-bold leading-none tracking-[-0.01em] sm:text-[1.7rem]">
              {title}
            </h1>
            <p className="relative mt-3 font-sans text-[12px] leading-5 text-white/68">
              {subtitle}
            </p>
          </div>

          <div className="px-8 py-7 sm:px-8">{children}</div>
        </div>

        <p className="mt-8 text-center text-[9px] font-bold uppercase tracking-[0.22em] text-white/30">
          © 2026 AUA Centro de Estudios
        </p>
      </div>
    </div>
  );
}
