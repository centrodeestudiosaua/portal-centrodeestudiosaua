"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { 
  Scale, 
  GraduationCap, 
  PenTool, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  Lock, 
  MessageCircleQuestion,
  Users,
  FileText
} from "lucide-react";

import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { StripeElementsCheckout } from "@/components/portal/stripe-elements-checkout";
import type { PurchaseOption } from "@/lib/portal/data";

const COURSE_ID = "4ff94e83-7bff-4cc1-80a2-f7a99d2da4c5";
const COURSE_SLUG = "diplomado-en-amparo";

const PURCHASE_OPTIONS: Record<string, PurchaseOption> = {
  "pago-unico": {
    code: "one_time",
    label: "Pago unico",
    description: "$14,800.00",
    priceId: "price_1T9fW12KWOdMBeNKuOCgyOae",
    mode: "payment",
  },
  "3-meses": {
    code: "three_month",
    label: "3 mensualidades",
    description: "$4,933.34",
    priceId: "price_1TDwUY2KWOdMBeNKavY4yyOd",
    mode: "subscription",
  },
  "6-meses": {
    code: "monthly",
    label: "6 mensualidades",
    description: "$2,466.67",
    priceId: "price_1TDwUZ2KWOdMBeNKOWlqgSTA",
    mode: "subscription",
  },
};

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function onlyDigits(value: string) {
  return value.replace(/\D/g, "").slice(0, 10);
}

function formatPhone(value: string) {
  const digits = onlyDigits(value);

  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(value));
}

function isValidPhone(value: string) {
  return onlyDigits(value).length === 10;
}

function getPlanSummary(option: PurchaseOption) {
  if (option.code === "one_time") {
    return {
      amount: option.description,
      chargeSummary: `Se cobrara hoy ${option.description} en un solo pago para activar tu acceso.`,
      submitLabel: `Pagar ${option.description}`,
      title: "Pago unico",
    };
  }

  if (option.code === "three_month") {
    return {
      amount: option.description,
      chargeSummary: `Se cobrara hoy la primera mensualidad de ${option.description}. Los 2 cargos restantes quedaran programados conforme al calendario del diplomado.`,
      submitLabel: `Pagar ${option.description}`,
      title: "3 mensualidades",
    };
  }

  return {
    amount: option.description,
    chargeSummary: `Se cobrara hoy la primera mensualidad de ${option.description}. Los pagos restantes quedaran programados conforme al calendario del diplomado.`,
    submitLabel: `Pagar ${option.description}`,
    title: "6 mensualidades",
  };
}

export default function DiplomadoEnAmparoPage() {
  const [paymentOption, setPaymentOption] = useState("6-meses");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [showPayment, setShowPayment] = useState(false);

  const selectedOption = useMemo(
    () => PURCHASE_OPTIONS[paymentOption] ?? PURCHASE_OPTIONS["6-meses"],
    [paymentOption],
  );
  const normalizedEmail = normalizeEmail(email);
  const formattedPhone = formatPhone(phone);
  const canContinue =
    Boolean(name.trim()) && isValidEmail(normalizedEmail) && isValidPhone(phone);
  const selectedPlan = getPlanSummary(selectedOption);

  useEffect(() => {
    setShowPayment(false);
  }, [paymentOption]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Top Banner */}
      <div className="bg-[#B91C1C] text-white text-center py-2 text-xs font-bold tracking-[0.2em] uppercase">
        INSCRIPCIONES ABIERTAS
      </div>

      {/* Header */}
      <header className="bg-[#151528] py-6 flex justify-center">
        <Link href="/">
          <img 
            src="/logo.png" 
            alt="AUA Centro de Estudios" 
            className="h-20 w-auto object-contain"
          />
        </Link>
      </header>

      {/* Hero Section */}
      <section className="relative bg-[#151528] pt-12 pb-20 md:pt-16 md:pb-32 overflow-hidden text-white border-b border-slate-800">
        <div className="absolute inset-0 z-0 opacity-20 bg-center bg-cover bg-no-repeat MixAndMatch" style={{ backgroundImage: "url('/diplomadoamparo.png')" }} />
        
        <div className="container relative z-10 px-6 md:px-10 max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-12 lg:gap-8">
          
          {/* Left Column - Hero Content */}
          <div className="flex-1 min-w-0 lg:pr-8">
            <div className="inline-flex items-center gap-2 border border-[#C5A55D]/40 rounded-full px-4 py-1.5 mb-8 bg-[#151528]/50 backdrop-blur-sm">
              <Scale className="w-4 h-4 text-[#C5A55D]" />
              <span className="text-[#C5A55D] text-xs font-semibold tracking-wider uppercase">Alta Especialización 2026</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-8 font-sans">
              Diplomado en <br />
              <span className="text-[#C5A55D] font-serif italic font-normal tracking-wide">Amparo</span>
            </h1>

            <p className="text-slate-300 text-lg md:text-xl leading-relaxed mb-10 max-w-2xl font-light">
              Un programa de amparo de alto nivel, diseñado para la actualización profesional de abogados postulantes. Nuestro enfoque principal es la técnica procesal, el litigio estratégico y la argumentación jurídica aplicada a problemas reales.
            </p>

            <div className="inline-flex items-center gap-3 border border-[#C5A55D]/30 rounded-md px-4 py-2.5 md:px-5 md:py-3 mb-8 bg-[#1E1C3A]/50">
              <PenTool className="w-5 h-5 text-[#C5A55D]" />
              <span className="text-xs sm:text-sm md:text-base font-medium text-[#EAD896]">Incluye Taller Práctico: Elaboración de Demanda de Amparo Directo e Indirecto</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="flex items-center gap-3 bg-[#1E1C3A]/40 border border-slate-700/50 rounded-md px-4 py-3">
                <Calendar className="w-5 h-5 text-slate-400" />
                <span className="text-sm font-medium text-slate-200">Inicia: 23 de abril, 2026</span>
              </div>
              <div className="flex items-center gap-3 bg-[#1E1C3A]/40 border border-slate-700/50 rounded-md px-4 py-3">
                <Clock className="w-5 h-5 text-slate-400" />
                <span className="text-sm font-medium text-slate-200">6 meses | Jueves | 5:00 p.m. a 8:00 p.m. | Hora de Baja California</span>
              </div>
            </div>
          </div>

          {/* Right Column - Desktop only spacing, card is built below contextually */}
          <div className="w-full lg:w-[460px] xl:w-[480px] shrink-0 hidden lg:block"></div>
        </div>
      </section>

      {/* Main Content & Sticky Card Layout */}
      <section className="container px-6 md:px-10 max-w-[1400px] mx-auto py-12 md:py-20 relative z-20 flex flex-col lg:flex-row gap-12 lg:gap-10">
        
        {/* Left Column - Main Body */}
        <div className="flex-1 min-w-0">
          
          <div className="mb-16">
            <h3 className="text-[#9B1D20] text-sm font-bold tracking-[0.15em] uppercase mb-4">Sobre el Diplomado</h3>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1F2937] mb-8 font-display">Domina el Control Constitucional</h2>
            
            <div className="pl-6 border-l-2 border-[#C5A55D] mb-12">
              <p className="text-slate-600 text-lg leading-relaxed">
                El Diplomado en Juicio de Amparo ha sido diseñado con un rigor técnico de vanguardia, orientado a dotar al postulante de las herramientas teóricas y estratégicas indispensables para dominar el control de constitucionalidad en sus vertientes directa e indirecta. No se trata solo de conocer la norma, sino de articularla con precisión quirúrgica en la práctica forense.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="flex flex-col gap-4">
                <div className="w-12 h-12 bg-[#1A1A35] rounded-xl flex items-center justify-center">
                  <PenTool className="w-6 h-6 text-[#C5A55D]" />
                </div>
                <h4 className="font-bold text-[#1F2937] text-lg">Metodología Práctica</h4>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Talleres de litigación estratégica para perfeccionar la redacción y estructuración de demandas de amparo.
                </p>
              </div>
              <div className="flex flex-col gap-4">
                <div className="w-12 h-12 bg-[#1A1A35] rounded-xl flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-[#C5A55D]" />
                </div>
                <h4 className="font-bold text-[#1F2937] text-lg">Claustro de Élite</h4>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Jueces de Distrito y Magistrados de Circuito en activo y en retiro, especialistas en amparo.
                </p>
              </div>
              <div className="flex flex-col gap-4">
                <div className="w-12 h-12 bg-[#1A1A35] rounded-xl flex items-center justify-center">
                  <Scale className="w-6 h-6 text-[#C5A55D]" />
                </div>
                <h4 className="font-bold text-[#1F2937] text-lg">Valor Curricular</h4>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Diploma avalado por el Centro de Estudios AUA con 72 horas de especialización certificada.
                </p>
              </div>
            </div>

            {/* The full paragraphs the user wanted are placed here instead of the columns */}
            <div className="space-y-6 mt-8">
              <div>
                <h4 className="font-bold text-[#1F2937] text-lg mb-2">Metodología Práctica y Argumentativa</h4>
                <p className="text-slate-600 leading-relaxed">
                  A través de talleres de litigación estratégica, los participantes perfeccionarán la técnica de redacción y estructuración de demandas de amparo. El programa guía paso a paso al jurista en la construcción de conceptos de violación sólidos, permitiéndole desarrollar una argumentación jurídica técnica, eficaz y orientada a la protección máxima de los derechos fundamentales de sus representados.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-[#1F2937] text-lg mb-2">Excelencia Académica y Criterio Jurisdiccional</h4>
                <p className="text-slate-600 leading-relaxed">
                  La formación está respaldada por un cuerpo docente de primer nivel, integrado por Jueces de Distrito y Magistrados de Circuito —tanto en activo como en retiro y especialistas en amparo—. Esta cercanía con la judicatura federal ofrece una oportunidad única: comprender la génesis de los criterios jurisprudenciales y las mejores prácticas operativas directamente de quienes han delineado el rumbo de la justicia constitucional en México.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-[#1F2937] text-lg mb-2">Estrategia Forense y Redacción</h4>
                <p className="text-slate-600 leading-relaxed">
                  Ejercicios de redacción real orientados a la estrategia forense. Aprenderás a identificar el acto reclamado y a articular defensas constitucionales paso a paso, transformando la teoría en demandas de Amparo Indirecto y Directo con estándares de excelencia jurisprudencial.
                </p>
              </div>
            </div>
          </div>

          <div className="mb-20">
            <h3 className="text-[#9B1D20] text-sm font-bold tracking-[0.15em] uppercase mb-4">Programa Académico 2026</h3>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1F2937] mb-8 font-display">Temario y Claustro Docente</h2>

            <Accordion 
              type="single" 
              collapsible 
              className="bg-white rounded-2xl border shadow-sm w-full divide-y divide-slate-100"
              onValueChange={(value) => {
                if (value) {
                  setTimeout(() => {
                    const element = document.getElementById(value);
                    if (element) {
                      const y = element.getBoundingClientRect().top + window.scrollY - 100;
                      window.scrollTo({ top: y, behavior: 'smooth' });
                    }
                  }, 300);
                }
              }}
            >
              {/* Módulo 1 */}
              <AccordionItem value="item-1" id="item-1" className="border-none">
                <AccordionTrigger className="px-6 py-5 hover:bg-slate-50/50 hover:no-underline rounded-t-2xl [&[data-state=open]]:bg-slate-50/50">
                  <div className="flex items-center gap-4 text-left">
                    <span className="bg-[#9B1D20] text-white text-sm font-bold px-3 py-1.5 rounded flex-shrink-0">01</span>
                    <div className="space-y-1">
                      <h3 className="font-bold text-lg text-slate-900">Introducción al Juicio de Amparo</h3>
                      <p className="text-sm text-slate-500 font-normal">4 sesiones</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 pt-2 bg-slate-50/50 rounded-b-2xl">
                  <div className="space-y-8 mt-4">
                    <div className="grid grid-cols-[130px_1fr] md:grid-cols-[150px_1fr] gap-6 md:gap-8">
                      <div className="text-slate-800 font-bold text-sm tracking-wide text-right pr-6 border-r border-slate-200">
                        <span className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Fecha</span>
                        Jueves 23 de abril
                      </div>
                      <div className="space-y-4">
                        <h4 className="font-bold text-slate-900">PRIMER MÓDULO</h4>
                        <ul className="space-y-3">
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Concepto</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Fundamento Constitucional y legal</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Supremacía constitucional y bloque de constitucionalidad</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Control de constitucionalidad y convencionalidad</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Control difuso y concentrado</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                        </ul>
                        <div className="bg-white border rounded-lg p-4 flex items-center gap-4 mt-2 shadow-sm">
                          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center shrink-0">
                            <GraduationCap className="w-5 h-5 text-[#C5A55D]" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-[#C5A55D] tracking-wider uppercase mb-0.5">Ponente Magistral</p>
                            <p className="font-bold text-slate-900 text-sm">Mgdo. Juan Carlos Ortega Castro</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-[130px_1fr] md:grid-cols-[150px_1fr] gap-6 md:gap-8">
                      <div className="text-slate-800 font-bold text-sm tracking-wide text-right pr-6 border-r border-slate-200">
                        <span className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Fecha</span>
                        Jueves 30 de abril
                      </div>
                      <div className="space-y-4">
                        <h4 className="font-bold text-slate-900">Las partes en el Juicio de Amparo</h4>
                        <ul className="space-y-3">
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Autoridades responsables</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Parte quejosa</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Terceros interesados</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Ministerio Público</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Tercer extraño</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Intereses tutelados en el Juicio de Amparo. Legitimación y personería</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Interés Jurídico y Legitimo. Interés simple</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Interés como derecho subjetivo</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                        </ul>
                        <div className="bg-white border rounded-lg p-4 flex items-center gap-4 mt-2 shadow-sm">
                          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center shrink-0">
                            <GraduationCap className="w-5 h-5 text-[#C5A55D]" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-[#C5A55D] tracking-wider uppercase mb-0.5">Ponente Magistral</p>
                            <p className="font-bold text-slate-900 text-sm">Jueza Rebeca Jazmín Rodríguez Pujol</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-[130px_1fr] md:grid-cols-[150px_1fr] gap-6 md:gap-8">
                      <div className="text-slate-800 font-bold text-sm tracking-wide text-right pr-6 border-r border-slate-200">
                        <span className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Fecha</span>
                        Jueves 07 de mayo
                      </div>
                      <div className="space-y-4">
                        <h4 className="font-bold text-slate-900">Principios Rectores del Juicio de Amparo</h4>
                        <ul className="space-y-3">
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Principio de estricto derecho</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Principio de definitividad</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Principio de relatividad</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Principio de suplencia de la queja deficiente</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Principio de Audiencia</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                        </ul>
                        <div className="bg-white border rounded-lg p-4 flex items-center gap-4 mt-2 shadow-sm">
                          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center shrink-0">
                            <GraduationCap className="w-5 h-5 text-[#C5A55D]" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-[#C5A55D] tracking-wider uppercase mb-0.5">Ponente Magistral</p>
                            <p className="font-bold text-slate-900 text-sm">Mgda. Rebeca Florentina Pujol Rosas</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-[130px_1fr] md:grid-cols-[150px_1fr] gap-6 md:gap-8">
                      <div className="text-slate-800 font-bold text-sm tracking-wide text-right pr-6 border-r border-slate-200">
                        <span className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Fecha</span>
                        Jueves 14 de mayo
                      </div>
                      <div className="space-y-4">
                        <h4 className="font-bold text-slate-900">Causales de improcedencia y sobreseimiento</h4>
                        <ul className="space-y-3">
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Causales de improcedencia</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Causales de sobreseimiento</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">El sobreseimiento y su relación con la Improcedencia</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Efectos de la resolución de sobreseimiento</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Oportunidad procesal para decretar el sobreseimiento</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                        </ul>
                        <div className="bg-white border rounded-lg p-4 flex items-center gap-4 mt-2 shadow-sm">
                          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center shrink-0">
                            <GraduationCap className="w-5 h-5 text-[#C5A55D]" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-[#C5A55D] tracking-wider uppercase mb-0.5">Ponente Magistral</p>
                            <p className="font-bold text-slate-900 text-sm">Juez Armando Sánchez Castillo</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-slate-200 flex items-center gap-3 text-slate-500 text-sm">
                    <Lock className="w-4 h-4" />
                    <span>Contenido, clases y materiales disponibles al inscribirte en este programa.</span>
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              {/* Módulo 2 */}
              <AccordionItem value="item-2" id="item-2" className="border-none">
                <AccordionTrigger className="px-6 py-5 hover:bg-slate-50/50 hover:no-underline [&[data-state=open]]:bg-slate-50/50">
                  <div className="flex items-center gap-4 text-left">
                    <span className="bg-[#9B1D20] text-white text-sm font-bold px-3 py-1.5 rounded flex-shrink-0">02</span>
                    <div className="space-y-1">
                      <h3 className="font-bold text-lg text-slate-900">Amparo Indirecto</h3>
                      <p className="text-sm text-slate-500 font-normal">3 sesiones</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 pt-2 bg-slate-50/50">
                  <div className="space-y-8 mt-4">
                    <div className="grid grid-cols-[130px_1fr] md:grid-cols-[150px_1fr] gap-6 md:gap-8">
                      <div className="text-slate-800 font-bold text-sm tracking-wide text-right pr-6 border-r border-slate-200">
                        <span className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Fecha</span>
                        Jueves 21 de mayo
                      </div>
                      <div className="space-y-4">
                        <h4 className="font-bold text-slate-900">Análisis de la Procedencia del Amparo Indirecto (Art. 107 L.A.)</h4>
                        <ul className="space-y-3">
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Actos en Juicio cuya Ejecución sea de Imposible Reparación</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Actos que Afecten a Personas Extrañas al Procedimiento</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Actos Dictados Fuera de Juicio o Después de Concluido</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">El Principio de Definitividad y Excepciones</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                        </ul>
                        <div className="bg-white border rounded-lg p-4 flex items-center gap-4 mt-2 shadow-sm">
                          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center shrink-0">
                            <GraduationCap className="w-5 h-5 text-[#C5A55D]" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-[#C5A55D] tracking-wider uppercase mb-0.5">Ponente Magistral</p>
                            <p className="font-bold text-slate-900 text-sm">Dr. Johnny Morales Martínez</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-[130px_1fr] md:grid-cols-[150px_1fr] gap-6 md:gap-8">
                      <div className="text-slate-800 font-bold text-sm tracking-wide text-right pr-6 border-r border-slate-200">
                        <span className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Fecha</span>
                        Jueves 28 de mayo
                      </div>
                      <div className="space-y-4">
                        <h4 className="font-bold text-slate-900">Trámite y sustanciación del Juicio de Amparo Indirecto</h4>
                        <ul className="space-y-3">
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Demanda de amparo Indirecto: Requisitos. Forma. Presentación</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Oportunidad de la presentación. Ampliación</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Auto Inicial. Auto aclaratorio</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Desechamiento o de admisión</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Auto de prevención, por no presentada o admisión</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Informe justificado. Vista informe justificado</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Ampliación demandada. Pruebas y alegatos. Sentencia</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                        </ul>
                        <div className="bg-white border rounded-lg p-4 flex items-center gap-4 mt-2 shadow-sm">
                          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center shrink-0">
                            <GraduationCap className="w-5 h-5 text-[#C5A55D]" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-[#C5A55D] tracking-wider uppercase mb-0.5">Ponente Magistral</p>
                            <p className="font-bold text-slate-900 text-sm">Mgdo. Jesús Báez Rivas</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-[130px_1fr] md:grid-cols-[150px_1fr] gap-6 md:gap-8">
                      <div className="text-slate-800 font-bold text-sm tracking-wide text-right pr-6 border-r border-slate-200">
                        <span className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Fecha</span>
                        Jueves 04 de junio
                      </div>
                      <div className="space-y-4">
                        <h4 className="font-bold text-slate-900">Taller Práctico de Redacción de Demanda de Amparo Indirecto</h4>
                        <ul className="space-y-3">
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Énfasis en Omisiones y Dilaciones</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Anatomía de la demanda y requisitos del Art. 108 de la L.A</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Fijación estratégica del Acto Reclamado ante actos negativos u omisiones</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Redacción del antecedentes bajo protesta de decir verdad sin generar prevención</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Construcción del concepto de violación por vulneración al Art. 17 Constitucional (Justicia pronta y expedita)</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Evita prevenciones. Conecta con la realidad de los juzgados</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                        </ul>
                        <div className="bg-white border rounded-lg p-4 flex items-center gap-4 mt-2 shadow-sm">
                          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center shrink-0">
                            <GraduationCap className="w-5 h-5 text-[#C5A55D]" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-[#C5A55D] tracking-wider uppercase mb-0.5">Ponente Magistral</p>
                            <p className="font-bold text-slate-900 text-sm">Juez Raúl falcón Arce</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Módulo 3 */}
              <AccordionItem value="item-3" id="item-3" className="border-none">
                <AccordionTrigger className="px-6 py-5 hover:bg-slate-50/50 hover:no-underline [&[data-state=open]]:bg-slate-50/50">
                  <div className="flex items-center gap-4 text-left">
                    <span className="bg-[#9B1D20] text-white text-sm font-bold px-3 py-1.5 rounded flex-shrink-0">03</span>
                    <div className="space-y-1">
                      <h3 className="font-bold text-lg text-slate-900">Amparo Directo</h3>
                      <p className="text-sm text-slate-500 font-normal">4 sesiones</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 pt-2 bg-slate-50/50">
                  <div className="space-y-8 mt-4">
                    <div className="grid grid-cols-[130px_1fr] md:grid-cols-[150px_1fr] gap-6 md:gap-8">
                      <div className="text-slate-800 font-bold text-sm tracking-wide text-right pr-6 border-r border-slate-200">
                        <span className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Fecha</span>
                        Jueves 11 de junio
                      </div>
                      <div className="space-y-4">
                        <h4 className="font-bold text-slate-900">EL JUICIO DE AMPARO DIRECTO</h4>
                        <ul className="space-y-3">
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Competencia. Procedencia.</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Legitimación para promoverlo</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Demanda</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Sustanciación</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Sentencia</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                        </ul>
                        <div className="bg-white border rounded-lg p-4 flex items-center gap-4 mt-2 shadow-sm">
                          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center shrink-0">
                            <GraduationCap className="w-5 h-5 text-[#C5A55D]" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-[#C5A55D] tracking-wider uppercase mb-0.5">Ponente Magistral</p>
                            <p className="font-bold text-slate-900 text-sm">Jueza Juana Fuentes Velázquez</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-[130px_1fr] md:grid-cols-[150px_1fr] gap-6 md:gap-8">
                      <div className="text-slate-800 font-bold text-sm tracking-wide text-right pr-6 border-r border-slate-200">
                        <span className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Fecha</span>
                        Jueves 18 de junio
                      </div>
                      <div className="space-y-4">
                        <h4 className="font-bold text-slate-900">Distintos tipos de Concepto de Violación en el Amparo Directo</h4>
                        <ul className="space-y-3">
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Violaciones en la resolución reclamada: Formales y de fondo</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Violaciones Procesales. Supuestos legales</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Requisitos para su estudio. Preparación de su impugnación</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Ausencia de preclusión</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Criterios para determinar el orden de estudio de los conceptos de violación</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                        </ul>
                        <div className="bg-white border rounded-lg p-4 flex items-center gap-4 mt-2 shadow-sm">
                          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center shrink-0">
                            <GraduationCap className="w-5 h-5 text-[#C5A55D]" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-[#C5A55D] tracking-wider uppercase mb-0.5">Ponente Magistral</p>
                            <p className="font-bold text-slate-900 text-sm">Magistrado en Retiro Fernando Rangel Ramírez</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-[130px_1fr] md:grid-cols-[150px_1fr] gap-6 md:gap-8">
                      <div className="text-slate-800 font-bold text-sm tracking-wide text-right pr-6 border-r border-slate-200">
                        <span className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Fecha</span>
                        Jueves 25 de junio
                      </div>
                      <div className="space-y-4">
                        <h4 className="font-bold text-slate-900">Estructura de la Demanda de Amparo Directo</h4>
                        <ul className="space-y-3">
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Encabezado y datos del quejoso</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Autoridades responsables</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Acto reclamado</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Conceptos de violación</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">AMPARO ADHESIVO. Procedencia. Tramite. Resolución</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                        </ul>
                        <div className="bg-white border rounded-lg p-4 flex items-center gap-4 mt-2 shadow-sm">
                          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center shrink-0">
                            <GraduationCap className="w-5 h-5 text-[#C5A55D]" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-[#C5A55D] tracking-wider uppercase mb-0.5">Ponente Magistral</p>
                            <p className="font-bold text-slate-900 text-sm">Juez Armando Sánchez Castillo</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-[130px_1fr] md:grid-cols-[150px_1fr] gap-6 md:gap-8">
                      <div className="text-slate-800 font-bold text-sm tracking-wide text-right pr-6 border-r border-slate-200">
                        <span className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Fecha</span>
                        Viernes 03 de julio
                      </div>
                      <div className="space-y-4">
                        <h4 className="font-bold text-slate-900">Particularidades del Amparo en Materia Laboral</h4>
                        <ul className="space-y-3">
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">La Suplencia de la Queja</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Procedencia del Amparo Directo</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Omisiones Procesales</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">La Suspensión en Materia Laboral</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                        </ul>
                        <div className="bg-white border rounded-lg p-4 flex items-center gap-4 mt-2 shadow-sm">
                          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center shrink-0">
                            <GraduationCap className="w-5 h-5 text-[#C5A55D]" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-[#C5A55D] tracking-wider uppercase mb-0.5">Ponente Magistral</p>
                            <p className="font-bold text-slate-900 text-sm">Jueza Juana Fuentes Velázquez</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Módulo 4 */}
              <AccordionItem value="item-4" id="item-4" className="border-none">
                <AccordionTrigger className="px-6 py-5 hover:bg-slate-50/50 hover:no-underline [&[data-state=open]]:bg-slate-50/50">
                  <div className="flex items-center gap-4 text-left">
                    <span className="bg-[#9B1D20] text-white text-sm font-bold px-3 py-1.5 rounded flex-shrink-0">04</span>
                    <div className="space-y-1">
                      <h3 className="font-bold text-lg text-slate-900">Suspensión, Recursos y Argumentación</h3>
                      <p className="text-sm text-slate-500 font-normal">3 sesiones</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 pt-2 bg-slate-50/50">
                  <div className="space-y-8 mt-4">
                    <div className="grid grid-cols-[130px_1fr] md:grid-cols-[150px_1fr] gap-6 md:gap-8">
                      <div className="text-slate-800 font-bold text-sm tracking-wide text-right pr-6 border-r border-slate-200">
                        <span className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Fecha</span>
                        Jueves 10 de julio
                      </div>
                      <div className="space-y-4">
                        <h4 className="font-bold text-slate-900">Suspensión del acto reclamado en el Amparo Indirecto y Directo</h4>
                        <ul className="space-y-3">
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Suspensión de oficio y de plano. (Para que se pide la suspensión)</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Procedencia. Efectos de la suspensión</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Requisitos de eficacia. Medidas de aseguramiento</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Garantía y contra garantía</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Tramite. Audiencia Incidental y resolución</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                        </ul>
                        <div className="bg-white border rounded-lg p-4 flex items-center gap-4 mt-2 shadow-sm">
                          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center shrink-0">
                            <GraduationCap className="w-5 h-5 text-[#C5A55D]" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-[#C5A55D] tracking-wider uppercase mb-0.5">Ponente Magistral</p>
                            <p className="font-bold text-slate-900 text-sm">Dr. Johnny Morales Martínez</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-[130px_1fr] md:grid-cols-[150px_1fr] gap-6 md:gap-8">
                      <div className="text-slate-800 font-bold text-sm tracking-wide text-right pr-6 border-r border-slate-200">
                        <span className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Fecha</span>
                        Jueves 06 de agosto
                      </div>
                      <div className="space-y-4">
                        <h4 className="font-bold text-slate-900">Medios de Impugnación</h4>
                        <ul className="space-y-3">
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Revisión. Procedencia. Legitimación. Resolución</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Queja. Procedencia. Interposición</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Reglas para su resolución</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Reclamación. Procedencia. Interposición. Resolución</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                        </ul>
                        <div className="bg-white border rounded-lg p-4 flex items-center gap-4 mt-2 shadow-sm">
                          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center shrink-0">
                            <GraduationCap className="w-5 h-5 text-[#C5A55D]" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-[#C5A55D] tracking-wider uppercase mb-0.5">Ponente Magistral</p>
                            <p className="font-bold text-slate-900 text-sm">Magistrado en Retiro Fernando Rangel Ramírez</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-[130px_1fr] md:grid-cols-[150px_1fr] gap-6 md:gap-8">
                      <div className="text-slate-800 font-bold text-sm tracking-wide text-right pr-6 border-r border-slate-200">
                        <span className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Fecha</span>
                        Jueves 13 de agosto
                      </div>
                      <div className="space-y-4">
                        <h4 className="font-bold text-slate-900">Argumentación</h4>
                        <ul className="space-y-3">
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Argumentación jurídica y conceptos de violación</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Principio de estricto derecho, suplencia de la queja y causa de pedir</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Excepción del principio de definitividad</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                        </ul>
                        <div className="bg-white border rounded-lg p-4 flex items-center gap-4 mt-2 shadow-sm">
                          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center shrink-0">
                            <GraduationCap className="w-5 h-5 text-[#C5A55D]" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-[#C5A55D] tracking-wider uppercase mb-0.5">Ponente Magistral</p>
                            <p className="font-bold text-slate-900 text-sm">Mtro. Sebastián Leopoldo Ramírez García</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Módulo 5 */}
              <AccordionItem value="item-5" id="item-5" className="border-none">
                <AccordionTrigger className="px-6 py-5 hover:bg-slate-50/50 hover:no-underline [&[data-state=open]]:bg-slate-50/50">
                  <div className="flex items-center gap-4 text-left">
                    <span className="bg-[#9B1D20] text-white text-sm font-bold px-3 py-1.5 rounded flex-shrink-0">05</span>
                    <div className="space-y-1">
                      <h3 className="font-bold text-lg text-slate-900">Conceptos de Violación y Acto Reclamado</h3>
                      <p className="text-sm text-slate-500 font-normal">4 sesiones</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 pt-2 bg-slate-50/50">
                  <div className="space-y-8 mt-4">
                    <div className="grid grid-cols-[130px_1fr] md:grid-cols-[150px_1fr] gap-6 md:gap-8">
                      <div className="text-slate-800 font-bold text-sm tracking-wide text-right pr-6 border-r border-slate-200">
                        <span className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Fecha</span>
                        Jueves 20 de agosto
                      </div>
                      <div className="space-y-4">
                        <h4 className="font-bold text-slate-900">Argumentación y Estrategia</h4>
                        <ul className="space-y-3">
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Cómo redactar conceptos de violación claros</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Uso de jurisprudencia y precedentes</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Construcción de argumentos sólidos</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                        </ul>
                        <div className="bg-white border rounded-lg p-4 flex items-center gap-4 mt-2 shadow-sm">
                          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center shrink-0">
                            <GraduationCap className="w-5 h-5 text-[#C5A55D]" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-[#C5A55D] tracking-wider uppercase mb-0.5">Ponente Magistral</p>
                            <p className="font-bold text-slate-900 text-sm">Mtro. Sebastián Leopoldo Ramírez García</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-[130px_1fr] md:grid-cols-[150px_1fr] gap-6 md:gap-8">
                      <div className="text-slate-800 font-bold text-sm tracking-wide text-right pr-6 border-r border-slate-200">
                        <span className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Fecha</span>
                        Jueves 27 de agosto
                      </div>
                      <div className="space-y-4">
                        <h4 className="font-bold text-slate-900">Jurisprudencia</h4>
                        <ul className="space-y-3">
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Concepto. Competencia</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Formación y sustitución. Obligatoriedad</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Interrupción</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Declaratorio general de Inconstitucionalidad</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Procedencia. Procedimiento. Alcance de la declaratoria</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                        </ul>
                        <div className="bg-white border rounded-lg p-4 flex items-center gap-4 mt-2 shadow-sm">
                          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center shrink-0">
                            <GraduationCap className="w-5 h-5 text-[#C5A55D]" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-[#C5A55D] tracking-wider uppercase mb-0.5">Ponente Magistral</p>
                            <p className="font-bold text-slate-900 text-sm">Magistrado en Retiro Fernando Rangel Ramírez</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-[130px_1fr] md:grid-cols-[150px_1fr] gap-6 md:gap-8">
                      <div className="text-slate-800 font-bold text-sm tracking-wide text-right pr-6 border-r border-slate-200">
                        <span className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Fecha</span>
                        Jueves 03 de septiembre
                      </div>
                      <div className="space-y-4">
                        <h4 className="font-bold text-slate-900">Actos reclamados</h4>
                        <ul className="space-y-3">
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Acción, omisión o norma general que vulnera derechos humanos</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">El particular con calidad de autoridad</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                        </ul>
                        <div className="bg-white border rounded-lg p-4 flex items-center gap-4 mt-2 shadow-sm">
                          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center shrink-0">
                            <GraduationCap className="w-5 h-5 text-[#C5A55D]" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-[#C5A55D] tracking-wider uppercase mb-0.5">Ponente Magistral</p>
                            <p className="font-bold text-slate-900 text-sm">Jueza Juana Fuentes Velázquez</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-[130px_1fr] md:grid-cols-[150px_1fr] gap-6 md:gap-8">
                      <div className="text-slate-800 font-bold text-sm tracking-wide text-right pr-6 border-r border-slate-200">
                        <span className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Fecha</span>
                        Jueves 10 de septiembre
                      </div>
                      <div className="space-y-4">
                        <h4 className="font-bold text-slate-900">Errores Comunes y Mejores Prácticas</h4>
                        <ul className="space-y-3">
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Tipo de agravios: Fundados. Infundados</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Inoperantes – inatendibles, insuficientes</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Errores frecuentes en demandas de amparo</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Cómo evitarlos</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Estrategias prácticas para fortalecer la demanda de Amparo</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                        </ul>
                        <div className="bg-white border rounded-lg p-4 flex items-center gap-4 mt-2 shadow-sm">
                          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center shrink-0">
                            <GraduationCap className="w-5 h-5 text-[#C5A55D]" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-[#C5A55D] tracking-wider uppercase mb-0.5">Ponente Magistral</p>
                            <p className="font-bold text-slate-900 text-sm">Magistrado en Retiro Fernando Rangel Ramírez</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Módulo 6 */}
              <AccordionItem value="item-6" id="item-6" className="border-none">
                <AccordionTrigger className="px-6 py-5 hover:bg-slate-50/50 hover:no-underline [&[data-state=open]]:bg-slate-50/50 rounded-b-2xl">
                  <div className="flex items-center gap-4 text-left">
                    <span className="bg-[#9B1D20] text-white text-sm font-bold px-3 py-1.5 rounded flex-shrink-0">06</span>
                    <div className="space-y-1">
                      <h3 className="font-bold text-lg text-slate-900">Sentencia y su Ejecución</h3>
                      <p className="text-sm text-slate-500 font-normal">4 sesiones</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 pt-2 bg-slate-50/50 rounded-b-2xl">
                  <div className="space-y-8 mt-4">
                    <div className="grid grid-cols-[130px_1fr] md:grid-cols-[150px_1fr] gap-6 md:gap-8">
                      <div className="text-slate-800 font-bold text-sm tracking-wide text-right pr-6 border-r border-slate-200">
                        <span className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Fecha</span>
                        Jueves 17 de septiembre
                      </div>
                      <div className="space-y-4">
                        <h4 className="font-bold text-slate-900">Cumplimiento y Ejecución de las sentencias de amparo</h4>
                        <ul className="space-y-3">
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Cumplimiento e inejecución de sentencias de amparo</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Autoridades vinculadas al cumplimiento. Procedimiento</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Repetición del acto reclamado</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Recurso de Inconformidad</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Incidente de Cumplimiento sustituto</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Incidente por exceso o defecto en el cumplimiento de la suspensión</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Denuncia por incumplimiento del declaratorio general de inconstitucionalidad</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Medidas disciplinarias y de apremio, responsabilidad, sanciones y delitos</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                        </ul>
                        <div className="bg-white border rounded-lg p-4 flex items-center gap-4 mt-2 shadow-sm">
                          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center shrink-0">
                            <GraduationCap className="w-5 h-5 text-[#C5A55D]" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-[#C5A55D] tracking-wider uppercase mb-0.5">Ponente Magistral</p>
                            <p className="font-bold text-slate-900 text-sm">Magistrado en Retiro Fernando Rangel Ramírez</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-[130px_1fr] md:grid-cols-[150px_1fr] gap-6 md:gap-8">
                      <div className="text-slate-800 font-bold text-sm tracking-wide text-right pr-6 border-r border-slate-200">
                        <span className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Fecha</span>
                        Jueves 24 de septiembre
                      </div>
                      <div className="space-y-4">
                        <h4 className="font-bold text-slate-900">Requisitos formales que debe contener una sentencia de amparo</h4>
                        <ul className="space-y-3">
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Sentencia de sobreseimiento</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Sentencia que niega el amparo</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Sentencia que concede el amparo</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                        </ul>

                        <h4 className="font-bold text-slate-900 pt-2">Requisitos de fondo de la sentencia</h4>
                        <ul className="space-y-3">
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Congruencia</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Exhaustividad</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Fundamentación y motivación</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                        </ul>

                        <h4 className="font-bold text-slate-900 pt-2">Requisitos de forma de la sentencia</h4>
                        <ul className="space-y-3">
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Vistos</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Resultando</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Considerando</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Puntos resolutivos</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                        </ul>
                        <div className="bg-white border rounded-lg p-4 flex items-center gap-4 mt-2 shadow-sm">
                          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center shrink-0">
                            <GraduationCap className="w-5 h-5 text-[#C5A55D]" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-[#C5A55D] tracking-wider uppercase mb-0.5">Ponente Magistral</p>
                            <p className="font-bold text-slate-900 text-sm">Mgdo. Juan Carlos Ortega Castro</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-[130px_1fr] md:grid-cols-[150px_1fr] gap-6 md:gap-8">
                      <div className="text-slate-800 font-bold text-sm tracking-wide text-right pr-6 border-r border-slate-200">
                        <span className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Fecha</span>
                        Jueves 01 de octubre
                        <div className="mt-2 inline-flex items-center gap-1.5 bg-blue-100 text-blue-600 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wide">
                          <Users className="w-3.5 h-3.5" />
                          Panel / Mesa
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h4 className="font-bold text-slate-900">Experiencias del grupo con el Cumplimiento y Ejecución de las Sentencias de Amparo.</h4>
                        <ul className="space-y-3">
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Cumplimiento Inmediato</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Notificación</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Plazo</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Reparación del daño</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Incumplimiento</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                        </ul>
                        <div className="bg-white border rounded-lg p-4 flex items-center gap-4 mt-2 shadow-sm">
                          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center shrink-0">
                            <GraduationCap className="w-5 h-5 text-[#C5A55D]" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-[#C5A55D] tracking-wider uppercase mb-0.5">Ponente Magistral</p>
                            <p className="font-bold text-slate-900 text-sm">Dr. Johnny Morales Martínez</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-[130px_1fr] md:grid-cols-[150px_1fr] gap-6 md:gap-8">
                      <div className="text-slate-800 font-bold text-sm tracking-wide text-right pr-6 border-r border-slate-200">
                        <span className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Fecha</span>
                        Jueves 08 de octubre
                        <div className="mt-2 inline-flex items-center gap-1.5 bg-[#F9F5EE] border border-[#ECE0BA] text-[#C5A55D] px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wide">
                          <FileText className="w-3.5 h-3.5" />
                          Taller Práctico
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h4 className="font-bold text-slate-900">Elaboración de una Demanda de Amparo.</h4>
                        <ul className="space-y-3">
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Revisión colectiva y retroalimentación</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                          <li className="flex justify-between items-start gap-3">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#C5A55D] shrink-0 mt-0.5"/>
                              <span className="text-slate-600">Consejos prácticos para la vida profesional</span>
                            </div>
                            <Lock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                          </li>
                        </ul>
                        <div className="bg-white border rounded-lg p-4 flex items-center gap-4 mt-2 shadow-sm">
                          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center shrink-0">
                            <GraduationCap className="w-5 h-5 text-[#C5A55D]" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-[#C5A55D] tracking-wider uppercase mb-0.5">Ponente Magistral</p>
                            <p className="font-bold text-slate-900 text-sm">Mgdo. Jesús Báez Rivas</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          

        </div>

        {/* Right Column - Sticky Sidebar */}
        <div className="w-full lg:w-[460px] xl:w-[480px] shrink-0">
          <div className="lg:sticky lg:top-6 rounded-3xl overflow-hidden shadow-xl bg-white border border-slate-100">
            {/* Form Header */}
            <div className="bg-[#151528] px-8 py-10 flex flex-col items-center justify-center text-center">
              <span className="inline-flex items-center gap-1.5 border border-[#C5A55D]/30 rounded-full px-3 py-1 mb-6">
                <span className="text-[#C5A55D] text-[10px] font-bold tracking-widest uppercase">Cupo Altamente Limitado</span>
              </span>
              <h3 className="text-white text-2xl sm:text-3xl font-bold font-display mb-3">Solicita tu Admisión</h3>
              <p className="text-slate-400 text-sm mb-8 leading-relaxed max-w-[280px]">Reserva tu lugar y accede al programa de amparo más completo de México.</p>
              
              <div className="flex items-center gap-2 text-[#C5A55D] text-xs font-bold tracking-widest uppercase">
                <ShieldCheck className="w-4 h-4" /> Pago 100% Seguro con Stripe
              </div>
            </div>

            {/* Form Body */}
            <div className="p-8">
              <h4 className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-5">Modalidad de Inversión</h4>
              
              <RadioGroup value={paymentOption} onValueChange={setPaymentOption} className="gap-3 mb-8">
                {/* Option 1 */}
                <div className={`relative border rounded-xl p-4 flex items-center justify-between cursor-pointer transition-colors ${paymentOption === 'pago-unico' ? 'border-[#9B1D20] bg-red-50/40' : 'border-slate-200 hover:border-slate-300'}`} onClick={() => setPaymentOption('pago-unico')}>
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="pago-unico" id="r1" className={paymentOption === 'pago-unico' ? 'border-[#9B1D20] text-[#9B1D20]' : ''} />
                    <div>
                      <Label htmlFor="r1" className="font-bold text-slate-800 cursor-pointer">Pago Único</Label>
                      <p className="text-xs text-slate-400 mt-0.5">Pago único</p>
                    </div>
                  </div>
                  <span className="font-bold text-slate-800">$14,800.00</span>
                </div>
                
                {/* Option 2 */}
                <div className={`relative border rounded-xl p-4 flex items-center justify-between cursor-pointer transition-colors ${paymentOption === '3-meses' ? 'border-[#9B1D20] bg-red-50/40' : 'border-slate-200 hover:border-slate-300'}`} onClick={() => setPaymentOption('3-meses')}>
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="3-meses" id="r2" className={paymentOption === '3-meses' ? 'border-[#9B1D20] text-[#9B1D20]' : ''} />
                    <div>
                      <Label htmlFor="r2" className="font-bold text-slate-800 cursor-pointer">3 Mensualidades</Label>
                      <p className="text-xs text-slate-400 mt-0.5">3 mensualidades</p>
                    </div>
                  </div>
                  <span className="font-bold text-slate-800">$4,933.34</span>
                </div>

                {/* Option 3 */}
                <div className={`relative border-2 rounded-xl p-4 flex items-center justify-between cursor-pointer transition-colors ${paymentOption === '6-meses' ? 'border-[#9B1D20] bg-red-50/40' : 'border-slate-200 hover:border-slate-300'}`} onClick={() => setPaymentOption('6-meses')}>
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="6-meses" id="r3" className={paymentOption === '6-meses' ? 'border-[#9B1D20] text-[#9B1D20]' : ''} />
                    <div>
                      <Label htmlFor="r3" className="font-bold text-slate-800 cursor-pointer">6 Mensualidades</Label>
                      <p className="text-xs text-slate-400 mt-0.5">6 mensualidades</p>
                    </div>
                  </div>
                  <span className="font-bold text-slate-800">$2,466.67</span>
                </div>
              </RadioGroup>

              <h4 className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-5">Datos del Estudiante</h4>
              
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  if (canContinue) {
                    setShowPayment(true);
                  }
                }}
                className="w-full"
              >
                <div className="space-y-4 mb-6">
                  <div>
                    <Label htmlFor="name" className="text-xs font-bold text-slate-600 mb-1.5 block uppercase tracking-wider">Nombre Completo *</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="Nombre(s) y Apellidos"
                      autoComplete="name"
                      className="h-11 !bg-white border-slate-200 focus-visible:ring-[#9B1D20] !text-black placeholder:text-slate-400"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-xs font-bold text-slate-600 mb-1.5 block uppercase tracking-wider">Correo Electrónico *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={email}
                      onChange={(event) => setEmail(normalizeEmail(event.target.value))}
                      placeholder="tu@correo.com"
                      autoComplete="email"
                      inputMode="email"
                      className="h-11 !bg-white border-slate-200 focus-visible:ring-[#9B1D20] !text-black placeholder:text-slate-400"
                    />
                    {email && !isValidEmail(normalizedEmail) ? (
                      <p className="mt-2 text-xs text-[#9B1D20]">Ingresa un correo valido.</p>
                    ) : null}
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-xs font-bold text-slate-600 mb-1.5 block uppercase tracking-wider">Teléfono *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      value={formattedPhone}
                      onChange={(event) => setPhone(onlyDigits(event.target.value))}
                      placeholder="(664) 800-0011"
                      autoComplete="tel"
                      inputMode="numeric"
                      maxLength={14}
                      className="h-11 !bg-white border-slate-200 focus-visible:ring-[#9B1D20] !text-black placeholder:text-slate-400"
                    />
                    {phone && !isValidPhone(phone) ? (
                      <p className="mt-2 text-xs text-[#9B1D20]">Ingresa un telefono de 10 digitos.</p>
                    ) : null}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!canContinue}
                  className="w-full bg-[#CA8A8B] hover:bg-[#B77A7B] text-white font-bold tracking-wider text-xs uppercase py-4 rounded-md transition-colors shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {showPayment
                    ? `Actualizar datos del cobro ${selectedPlan.amount}`
                    : `Completa tus datos para pagar ${selectedPlan.amount}`}
                </button>
              </form>

              {showPayment ? (
                <div className="mt-6 space-y-4 border-t border-slate-100 pt-6">
                  <div className="rounded-2xl border border-[#9B1D20]/10 bg-red-50/40 px-4 py-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9B1D20]">
                      Resumen del cobro
                    </p>
                    <div className="mt-3 flex items-end justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{selectedPlan.title}</p>
                        <p className="mt-1 text-sm leading-6 text-slate-600">
                          {selectedPlan.chargeSummary}
                        </p>
                      </div>
                      <p className="text-3xl font-bold text-slate-900">{selectedPlan.amount}</p>
                    </div>
                  </div>

                  <StripeElementsCheckout
                    courseId={COURSE_ID}
                    courseSlug={COURSE_SLUG}
                    option={selectedOption}
                    anonymousCustomer={{
                      name: name.trim(),
                      email: normalizedEmail,
                      phone: formattedPhone,
                    }}
                    chargeSummary={selectedPlan.chargeSummary}
                    submitLabel={selectedPlan.submitLabel}
                  />
                </div>
              ) : null}

              <div className="border-t border-slate-100 pt-8">
                <h4 className="text-xs font-bold text-slate-800 tracking-widest uppercase text-center mb-6">Incluido en su inversión:</h4>
                <ul className="space-y-3">
                  {[
                    "Acceso al material y grabaciones 9 meses",
                    "Grabación disponible 24/7",
                    "Acceso al material complementario",
                    "Diploma con valor curricular",
                    "Talleres prácticos incluidos",
                    "Networking con profesionales del sector"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-slate-600">
                      <CheckCircle2 className="w-4 h-4 text-[#C5A55D] shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

            {/* FAQ Full Width Section */}
      <section className="bg-slate-50 py-24 border-t border-slate-200">
        <div className="container px-6 md:px-10 max-w-3xl mx-auto">
          <h3 className="text-[#9B1D20] text-sm font-bold tracking-[0.15em] uppercase text-center mb-6">Preguntas Frecuentes</h3>
          <h2 className="text-3xl md:text-5xl font-bold text-[#1F2937] text-center mb-4 font-display">Resolviendo tus dudas</h2>
          <p className="text-center text-slate-500 text-lg mb-12">Todo lo que necesitas saber sobre el Diplomado en Amparo.</p>

          <Accordion type="single" collapsible className="w-full space-y-4">
            <AccordionItem value="faq-1" className="bg-white border border-slate-200 rounded-2xl px-6 shadow-sm [&[data-state=open]]:border-[#C5A55D] transition-colors">
              <AccordionTrigger className="font-bold text-slate-800 hover:no-underline py-5 text-left md:text-lg">¿A quién va dirigido?</AccordionTrigger>
              <AccordionContent className="text-slate-600 pb-5 leading-relaxed text-base pt-1 border-none">
                A abogados postulantes, catedráticos, integrantes del Poder Judicial, colegios y barras de abogados.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="faq-2" className="bg-white border border-slate-200 rounded-2xl px-6 shadow-sm [&[data-state=open]]:border-[#C5A55D] transition-colors">
              <AccordionTrigger className="font-bold text-slate-800 hover:no-underline py-5 text-left md:text-lg">¿Cuál es la modalidad y duración?</AccordionTrigger>
              <AccordionContent className="text-slate-600 pb-5 leading-relaxed text-base pt-1 border-none">
                Tiene una duración de seis meses y es 100% en línea. Las clases en vivo son los jueves: Horario de 5:00 p.m. a 8:00 p.m. (hora de Baja California). Horario 06:00 PM a 09:00 PM (Hora de CDMX).
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="faq-3" className="bg-white border border-slate-200 rounded-2xl px-6 shadow-sm [&[data-state=open]]:border-[#C5A55D] transition-colors">
              <AccordionTrigger className="font-bold text-slate-800 hover:no-underline py-5 text-left md:text-lg">¿Se ven tanto el amparo directo como el indirecto?</AccordionTrigger>
              <AccordionContent className="text-slate-600 pb-5 leading-relaxed text-base pt-1 border-none">
                Sí, abordamos ambos mediante módulos específicos y detallados para su tramitación, reglas y particularidades, incluyendo talleres de redacción de demandas y análisis de sentencias.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="faq-4" className="bg-white border border-slate-200 rounded-2xl px-6 shadow-sm [&[data-state=open]]:border-[#C5A55D] transition-colors">
              <AccordionTrigger className="font-bold text-slate-800 hover:no-underline py-5 text-left md:text-lg">¿Se aborda el tema de la suspensión del acto reclamado?</AccordionTrigger>
              <AccordionContent className="text-slate-600 pb-5 leading-relaxed text-base pt-1 border-none">
                ¡Por supuesto! Tendremos una clase específica sobre el tema, además de analizar la suspensión, sus incidentes, garantías y contragarantías a lo largo de los módulos.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="faq-5" className="bg-white border border-slate-200 rounded-2xl px-6 shadow-sm [&[data-state=open]]:border-[#C5A55D] transition-colors">
              <AccordionTrigger className="font-bold text-slate-800 hover:no-underline py-5 text-left md:text-lg">¿Qué valor curricular tiene?</AccordionTrigger>
              <AccordionContent className="text-slate-600 pb-5 leading-relaxed text-base pt-1 border-none">
                Al concluir satisfactoriamente, recibirás un diploma con valor curricular por 72 horas, avalada por el Centro de Estudios AUA A.C.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="faq-6" className="bg-white border border-slate-200 rounded-2xl px-6 shadow-sm [&[data-state=open]]:border-[#C5A55D] transition-colors">
              <AccordionTrigger className="font-bold text-slate-800 hover:no-underline py-5 text-left md:text-lg">¿Cuál es la inversión y los requisitos?</AccordionTrigger>
              <AccordionContent className="text-slate-600 pb-5 leading-relaxed text-base pt-1 border-none">
                El costo total es de $14,800.00, con la facilidad de pagar en parcialidades o a meses sin intereses. Para inscribirte, solo necesitas enviarnos una copia escaneada de tu título de licenciatura, certificado de estudios o cédula profesional.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Footer Contact */}
      <section className="bg-[#151528] py-20 border-t border-slate-800">
        <div className="container px-6 md:px-10 mx-auto text-center">
          <div className="w-16 h-16 rounded-full border border-[#C5A55D]/30 flex items-center justify-center mx-auto mb-6">
            <MessageCircleQuestion className="w-6 h-6 text-[#C5A55D]" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 font-display">¿Tienes más preguntas?</h2>
          <p className="text-slate-400 mb-8 max-w-lg mx-auto">
            Contáctanos directamente por WhatsApp para recibir atención personalizada.
          </p>
          <a href="#" className="inline-flex items-center gap-2 bg-[#00D084] hover:bg-[#00B975] text-white font-bold text-xs tracking-widest uppercase px-6 py-3 rounded-md transition-colors shadow-sm">
            <span>💬</span> Hablar con un Asesor
          </a>
        </div>
      </section>

      {/* Actual Footer (Mini) */}
      <footer className="bg-[#121222] py-16 border-t border-slate-800">
        <div className="container px-6 md:px-10 max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 lg:gap-8">
          <div className="col-span-1 md:col-span-1">
            <img src="/logo.png" alt="AUA Logo" className="mb-6 h-8 w-auto object-contain" />
            <p className="text-slate-400 text-xs leading-relaxed max-w-[200px]">
              Referente en formación jurídica de alto nivel. Impulsamos el éxito a través de la excelencia académica.
            </p>
          </div>
          
          <div>
            <h4 className="text-[#C5A55D] text-[10px] font-bold tracking-widest uppercase mb-6">Programas</h4>
            <ul className="space-y-4">
              <li><Link href="#" className="text-slate-400 hover:text-white text-xs transition-colors">Juicio de Amparo</Link></li>
              <li><Link href="#" className="text-slate-400 hover:text-white text-xs transition-colors">Derecho Laboral</Link></li>
              <li><Link href="#" className="text-slate-400 hover:text-white text-xs transition-colors">Derecho Civil</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[#C5A55D] text-[10px] font-bold tracking-widest uppercase mb-6">Institución</h4>
            <ul className="space-y-4">
              <li><Link href="#" className="text-slate-400 hover:text-white text-xs transition-colors">Sobre AUA</Link></li>
              <li><Link href="#" className="text-slate-400 hover:text-white text-xs transition-colors">Metodología</Link></li>
              <li><Link href="#" className="text-slate-400 hover:text-white text-xs transition-colors">Contacto</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[#C5A55D] text-[10px] font-bold tracking-widest uppercase mb-6">Sede Central</h4>
            <p className="text-slate-400 text-xs leading-relaxed tracking-wider uppercase">
              Blvd. Gral. Rodolfo Sánchez<br/>
              Taboada,<br/>
              Tijuana, Baja California 22010
            </p>
          </div>
        </div>

        <div className="container px-6 md:px-10 max-w-[1400px] mx-auto mt-16 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-600 text-[10px] tracking-widest uppercase">
            © 2026 AUA Centro de Estudios. Excelencia Jurídica Global.
          </p>
          <div className="flex gap-6">
            <Link href="#" className="text-slate-600 hover:text-slate-400 text-[10px] transition-colors tracking-widest uppercase">Privacidad</Link>
            <Link href="#" className="text-slate-600 hover:text-slate-400 text-[10px] transition-colors tracking-widest uppercase">Términos</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
