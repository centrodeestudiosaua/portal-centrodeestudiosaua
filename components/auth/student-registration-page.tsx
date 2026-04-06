import Image from "next/image";
import { BookOpen, CircleDollarSign, GraduationCap, ShieldCheck } from "lucide-react";

import { StudentRegistrationForm } from "@/components/auth/student-registration-form";

const benefits = [
  { icon: BookOpen, label: "Clases 100% en vivo y grabadas" },
  { icon: GraduationCap, label: "Valor curricular certificado" },
  { icon: CircleDollarSign, label: "Opciones de pago flexibles" },
  { icon: ShieldCheck, label: "Comunidad de aprendizaje" },
];

export function StudentRegistrationPage() {
  return (
    <div className="min-h-svh overflow-hidden bg-[#1a1a35] text-white">
      <div className="absolute inset-0 opacity-[0.08]">
        <Image
          src="/diplomadoamparo.png"
          alt=""
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
      </div>

      <div className="relative border-b border-white/10 py-8">
        <div className="mx-auto flex max-w-7xl justify-center px-6">
          <Image
            src="/logo.png"
            alt="AUA Centro de Estudios Juridicos"
            width={190}
            height={62}
            priority
            style={{ width: "190px", height: "auto" }}
          />
        </div>
      </div>

      <div className="relative mx-auto grid min-h-[calc(100svh-111px)] max-w-7xl gap-12 px-6 py-14 lg:grid-cols-[1.08fr_420px] lg:items-center">
        <section className="max-w-2xl lg:pl-4">
          <div className="inline-flex items-center rounded-full border border-[#C5A059]/25 bg-white/5 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.24em] text-[#C5A059]">
            Portal Academico 2026
          </div>

          <h1 className="mt-10 text-5xl font-bold leading-none md:text-7xl">
            Explora tu Futuro
            <span className="mt-3 block font-serif text-[#C5A059]">Academico</span>
          </h1>

          <p className="mt-8 max-w-xl border-l border-[#C5A059]/40 pl-6 text-xl leading-10 text-white/75">
            Registrate para acceder al catalogo completo de diplomados especializados en materia juridica y administrativa.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div key={benefit.label} className="flex items-center gap-3 text-sm text-white/82">
                  <Icon className="h-4 w-4 text-[#C5A059]" />
                  <span>{benefit.label}</span>
                </div>
              );
            })}
          </div>
        </section>

        <aside className="lg:justify-self-end">
          <div className="overflow-hidden rounded-[20px] border border-white/10 bg-white shadow-[0_30px_80px_rgba(8,11,27,0.32)]">
            <div className="relative overflow-hidden bg-[linear-gradient(180deg,rgba(28,27,57,0.98),rgba(36,33,69,0.95))] px-6 py-8 text-center text-white">
              <div className="absolute inset-0 opacity-[0.08]">
                <Image
                  src="/diplomadoamparo.png"
                  alt=""
                  fill
                  priority
                  className="object-cover object-center"
                  sizes="420px"
                />
              </div>
              <div className="relative inline-flex items-center rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.24em] text-emerald-300">
                Cuenta gratuita
              </div>
              <h2 className="relative mt-6 text-[2rem] font-bold leading-none">Registro de Estudiante</h2>
              <div className="relative mx-auto mt-5 w-fit rounded-[10px] bg-[#11162f]/80 px-4 py-2 text-xs font-semibold text-white/82">
                Cuenta gratuita requerida para explorar el catalogo.
              </div>
              <div className="relative mt-5 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#C5A059]">
                <ShieldCheck className="h-4 w-4" />
                Tus datos estan protegidos
              </div>
            </div>

            <div className="space-y-6 px-6 py-6">
              <StudentRegistrationForm />

              <div className="rounded-[14px] border border-[#eadfd3] bg-[#faf8f4] p-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#9B3328]">
                  Al inscribirte en un diplomado obtienes:
                </p>
                <ul className="mt-4 space-y-2 text-sm text-slate-600">
                  <li>Clases en vivo</li>
                  <li>Grabaciones</li>
                  <li>Acceso al material del programa</li>
                  <li>Seguimiento academico desde portal</li>
                </ul>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
