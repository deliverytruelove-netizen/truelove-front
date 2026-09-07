// components/StatsStrip.tsx
"use client";

import { motion } from "framer-motion";
import { Store, PackageCheck, Timer, Headphones } from "lucide-react";
import { formatStatValue, type LandingStats } from "@/services/landingService";

export default function StatsStrip({ stats }: { stats: LandingStats }) {
  const items = [
    {
      value: formatStatValue(stats.negocios_activos),
      label: "Negocios Activos",
      desc: "Restaurantes y tiendas",
      icon: Store,
    },
    {
      value: formatStatValue(stats.pedidos_entregados),
      label: "Entregas Exitosas",
      desc: "Pedidos completados",
      icon: PackageCheck,
    },
    {
      value: "< 25 min",
      label: "Tiempo Promedio",
      desc: "Rapidez garantizada",
      icon: Timer,
    },
    {
      value: "24/7",
      label: "Soporte Dedicado",
      desc: "Atención personalizada",
      icon: Headphones,
    },
  ];

  return (
    <section className="relative bg-slate-950 py-12 md:py-16 overflow-hidden">
      {/* Top and Bottom Ambient Border Glows */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D9043D]/60 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {items.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="group relative p-5 sm:p-6 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-[#D9043D]/40 transition-all duration-300 text-center flex flex-col items-center justify-center"
              >
                <div className="p-3 rounded-xl bg-[#D9043D]/10 text-[#FF5C7A] mb-3 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                  {stat.value}
                </div>
                <div className="mt-1 text-xs sm:text-sm font-bold text-slate-200 uppercase tracking-wide">
                  {stat.label}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {stat.desc}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
