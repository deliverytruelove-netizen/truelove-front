// components/BenefitsSection.tsx
"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { TrendingUp, Wallet, MapPinned, Headset, Sparkles } from "lucide-react";
import Negocio from "@/public/img/negocio.jpg";

const benefits = [
  {
    icon: TrendingUp,
    title: "Más pedidos, sin esfuerzo extra",
    description: "Te conectamos con una base creciente de clientes que buscan tus productos todos los días.",
  },
  {
    icon: Wallet,
    title: "Pagos claros y puntuales",
    description: "Liquidaciones transparentes sin letras chicas. Recibe tu dinero a tiempo siempre.",
  },
  {
    icon: MapPinned,
    title: "Cobertura total en tu ciudad",
    description: "Nuestra red de motorizados cubre radios amplios de entrega para maximizar tu alcance.",
  },
  {
    icon: Headset,
    title: "Soporte dedicado 24/7",
    description: "Un equipo humano y resolutivo disponible para atender cualquier consulta de tu negocio.",
  },
];

export default function BenefitsSection() {
  return (
    <section id="beneficios" className="relative bg-white py-20 lg:py-28 px-4 sm:px-6 lg:px-8 scroll-mt-20 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#D9043D]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-slate-100 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#D9043D]/10 text-[#D9043D] text-xs sm:text-sm font-bold tracking-wide uppercase mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Por qué elegir True Love</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Todo lo que necesitas para{" "}
            <span className="text-[#D9043D]">vender y entregar más</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600">
            Olvídate de la logística compleja y enfócate en lo que mejor sabes hacer: cocinar y preparar los mejores productos.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          {/* Tarjeta Destacada con Imagen Real */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-5 relative rounded-3xl overflow-hidden min-h-[340px] lg:min-h-[420px] shadow-2xl group border border-slate-100 flex flex-col justify-end"
          >
            <Image
              src={Negocio}
              alt="Negocio afiliado a True Love"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105 brightness-[0.9]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            <div className="relative z-10 p-6 sm:p-8">
              <span className="inline-block px-3 py-1 rounded-full bg-[#D9043D] text-white text-[11px] font-bold uppercase tracking-wider mb-3">
                Historias de Éxito
              </span>
              <h3 className="text-white text-2xl sm:text-3xl font-black leading-tight">
                Únete a los restaurantes y tiendas que ya multiplican sus ventas
              </h3>
              <p className="mt-2 text-sm text-slate-200">
                La plataforma diseñada pensando en el crecimiento sostenible de tu negocio.
              </p>
            </div>
          </motion.div>

          {/* Grid de Beneficios */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                  className="rounded-3xl border border-slate-200/80 bg-white/80 backdrop-blur-sm p-6 sm:p-7 shadow-sm hover:shadow-xl hover:border-[#D9043D]/30 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#D9043D]/15 to-[#FF5C7A]/20 text-[#D9043D] flex items-center justify-center mb-5 shadow-sm">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-bold text-lg text-slate-900 mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
