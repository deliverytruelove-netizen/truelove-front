// components/HomePage.tsx
"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
  Zap,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Star,
} from "lucide-react";
import RegistrationForm from "@/components/registerLocal/RegistrationForm";
import DocumentoMoto from "@/src/assets/img/documentoMoto.jpg";
import { formatStatValue, type LandingStats } from "@/services/landingService";

export default function HomePage({ stats }: { stats: LandingStats }) {
  const valueBullets = [
    {
      icon: Zap,
      title: "Activación en 24h",
      desc: "Comienza a recibir pedidos inmediatamente.",
    },
    {
      icon: Clock,
      title: "Entregas en < 25 min",
      desc: "Flota rápida y eficiente en tu zona.",
    },
    {
      icon: ShieldCheck,
      title: "Pagos 100% Claros",
      desc: "Sin comisiones ocultas ni sorpresas.",
    },
  ];

  return (
    <div id="registro" className="relative w-full bg-slate-950 overflow-hidden scroll-mt-20">
      {/* Background Image Container with DocumentoMoto */}
      <div className="absolute inset-0 z-0">
        <Image
          src={DocumentoMoto}
          alt="Motorizados True Love Delivery"
          fill
          className="object-cover object-center lg:object-left brightness-[0.85]"
          priority
          sizes="100vw"
        />
        {/* Cinematic Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/40 hidden lg:block" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/90 to-slate-950/50 lg:hidden" />
        {/* Subtle accent glow */}
        <div className="absolute top-1/4 left-10 w-96 h-96 bg-[#D9043D]/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24 min-h-[calc(100vh-80px)] flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column: Headline & Value Proposition */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="lg:col-span-7 text-center lg:text-left pt-4 lg:pt-0"
          >
            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs sm:text-sm font-semibold tracking-wide uppercase mb-6 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#FF5C7A] animate-ping" />
              <span>Red de Delivery para Negocios</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.1] tracking-tight">
              Haz crecer tu negocio{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF5C7A] via-[#FF8787] to-white">
                con True Love
              </span>
            </h1>

            {/* Subheading */}
            <p className="mt-5 text-base sm:text-lg lg:text-xl text-slate-200/90 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
              Súmate a la red de delivery más confiable y ágil de tu ciudad.
              Más pedidos diarios, pagos transparentes y un equipo de motorizados dedicado a tu servicio.
            </p>

            {/* Value Props Pills / Grid */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto lg:mx-0">
              {valueBullets.map((bullet, index) => {
                const Icon = bullet.icon;
                return (
                  <motion.div
                    key={bullet.title}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                    className="flex items-start gap-3 p-3.5 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 text-left"
                  >
                    <div className="p-2 rounded-lg bg-[#D9043D]/20 text-[#FF5C7A] shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-white">
                        {bullet.title}
                      </h2>
                      <p className="text-xs text-slate-300 mt-0.5">
                        {bullet.desc}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Social Proof / Trust Banner */}
            <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-center lg:justify-start gap-6">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-rose-500 border-2 border-slate-900 flex items-center justify-center text-white text-xs font-bold">
                    🍕
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-400 to-cyan-500 border-2 border-slate-900 flex items-center justify-center text-white text-xs font-bold">
                    🍔
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-400 to-indigo-500 border-2 border-slate-900 flex items-center justify-center text-white text-xs font-bold">
                    🍣
                  </div>
                </div>
                <div className="text-left">
                  <div className="flex items-center text-amber-400 text-xs">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs text-slate-300 font-medium mt-0.5">
                    {formatStatValue(stats.negocios_activos)} Comercios Asociados
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Registro 100% gratuito</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Registration Form in Modern Glass Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="lg:col-span-5 w-full max-w-lg mx-auto"
          >
            <div className="relative">
              {/* Card Ambient Glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-[#D9043D]/30 to-[#FF5C7A]/20 rounded-3xl blur-xl opacity-75" />
              
              <div className="relative">
                <RegistrationForm />
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
