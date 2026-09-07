// components/HowItWorks.tsx
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, FileText, PhoneCall, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";

const steps = [
  {
    number: "01",
    icon: FileText,
    title: "Completa el Registro",
    description: "Llena el formulario con los datos básicos de tu negocio. Es 100% gratuito y toma menos de 2 minutos.",
  },
  {
    number: "02",
    icon: PhoneCall,
    title: "Validamos tu Catálogo",
    description: "Nuestro equipo se pone en contacto para verificar tus datos y dejar tu menú o productos listos para vender.",
  },
  {
    number: "03",
    icon: Rocket,
    title: "¡Empieza a Vender!",
    description: "Recibe pedidos de clientes reales. Nuestra red de motorizados se encarga de recoger y entregar a tiempo.",
  },
];

export default function HowItWorks() {
  return (
    <section id="como-funciona" className="relative bg-slate-900 py-20 lg:py-28 px-4 sm:px-6 lg:px-8 scroll-mt-20 overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#D9043D]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-3.5 py-1.5 rounded-full bg-white/10 text-white border border-white/15 text-xs sm:text-sm font-bold tracking-wide uppercase mb-4">
            Proceso Simple y Rápido
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            Comienza a vender en solo{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF5C7A] to-[#FF8787]">
              3 simples pasos
            </span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300">
            Sin trámites engorrosos ni pérdidas de tiempo. Nos encargamos de todo para que vendas desde el primer día.
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 relative">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.12 }}
                className="relative rounded-3xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-[#D9043D]/40 p-7 sm:p-8 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#D9043D] to-[#FF5C7A] text-white flex items-center justify-center shadow-lg shadow-[#D9043D]/30 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-7 h-7" />
                    </div>
                    <span className="text-3xl font-black text-white/20 group-hover:text-[#FF5C7A]/50 transition-colors">
                      {step.number}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-3">
                    {step.title}
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Call to action button */}
        <div className="text-center mt-16">
          <Button
            asChild
            size="lg"
            className="bg-gradient-to-r from-[#D9043D] via-[#e21b50] to-[#b8032f] hover:from-[#c20336] hover:to-[#9c0228] text-white font-bold text-base shadow-xl shadow-[#D9043D]/30 rounded-full px-8 h-12 transition-all duration-300 hover:scale-105 group"
          >
            <Link href="#registro" className="flex items-center gap-2">
              <span>Quiero registrar mi negocio ahora</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
