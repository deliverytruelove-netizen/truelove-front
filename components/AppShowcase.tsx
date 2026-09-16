// components/AppShowcase.tsx
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Smartphone, Store, Bike } from "lucide-react";
import { Button } from "@/components/ui/button";

const appsData = [
  {
    id: "cliente",
    name: "True Love Cliente",
    role: "Para Comensales",
    tag: "Pide Delivery",
    iconSrc: "/apps/truelove-cliente.png",
    color: "from-rose-500 to-red-600",
    description: "Pide tus platos y productos favoritos a domicilio con seguimiento en tiempo real.",
    playStoreUrl: "https://play.google.com/store/apps/details?id=com.truelove.trueloveclient",
    appStoreUrl: "https://apps.apple.com/app/id6759631687",
  },
  {
    id: "socio",
    name: "True Love Socio",
    role: "Para Negocios y Restaurantes",
    tag: "Gestión de Pedidos",
    iconSrc: "/apps/truelove-socio.png",
    color: "from-[#D9043D] to-[#9c0228]",
    description: "Administra tu catálogo, pedidos entrantes y métricas de venta en tiempo real.",
    playStoreUrl: "https://play.google.com/store/apps/details?id=com.truelove.truelovesocio",
    appStoreUrl: "https://apps.apple.com/app/id-truelove-socio",
  },
  {
    id: "repartidor",
    name: "True Love Repartidor",
    role: "Para Motorizados (Bikers)",
    tag: "Genera Ingresos",
    iconSrc: "/apps/truelove-repartidor.png",
    color: "from-amber-500 to-orange-600",
    description: "Acepta pedidos en tu zona con rutas optimizadas y genera ingresos en tu propio horario.",
    playStoreUrl: "https://play.google.com/store/apps/details?id=com.truelove.truelovebiker",
    appStoreUrl: "https://apps.apple.com/app/id-truelove-motorizado",
  },
];

export default function AppShowcase() {
  return (
    <section id="apps" className="relative bg-gradient-to-b from-slate-900 via-slate-950 to-black py-20 lg:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden text-white scroll-mt-20">
      {/* Decorative ambient background glows */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-[#D9043D]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white text-xs sm:text-sm font-bold uppercase tracking-wider mb-4">
            <Smartphone className="w-4 h-4 text-[#FF5C7A]" />
            <span>Ecosistema de Apps True Love</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            Una app diseñada para{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF5C7A] via-[#FF8787] to-amber-400">
              cada necesidad
            </span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300">
            Descarga la aplicación oficial según tu perfil en Google Play Store y Apple App Store.
          </p>
        </motion.div>

        {/* 3 Apps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-16">
          {appsData.map((app, index) => {
            return (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="rounded-3xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 group hover:-translate-y-1 shadow-xl shadow-black/40"
              >
                <div>
                  {/* Top Badge & Icon */}
                  <div className="flex items-center justify-between mb-5">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${app.color} shadow-lg flex items-center justify-center overflow-hidden`}>
                      <Image src={app.iconSrc} alt={app.name} width={48} height={48} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-[11px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-white/10 text-slate-200 border border-white/10">
                      {app.tag}
                    </span>
                  </div>

                  <span className="text-xs font-semibold text-slate-400">
                    {app.role}
                  </span>
                  <h3 className="text-xl font-black text-white mt-1 mb-2.5">
                    {app.name}
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed mb-6">
                    {app.description}
                  </p>
                </div>

                {/* Download Buttons - High Contrast Vector Badges */}
                <div className="space-y-2.5 pt-4 border-t border-slate-800">
                  {/* Google Play Button */}
                  <Link
                    href={app.playStoreUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-slate-950 hover:bg-black border border-slate-700/80 hover:border-slate-500 shadow-sm transition-all duration-200 group/btn"
                  >
                    {/* Google Play Vector Icon */}
                    <div className="w-6 h-6 flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 fill-white transition-transform group-hover/btn:scale-110" viewBox="0 0 16 16">
                        <path d="M14.222 9.374c1.037-.61 1.037-2.137 0-2.748L11.528 5.04 8.32 8l3.207 2.96zm-3.595 2.116L7.583 8.68 1.03 14.73c.201 1.029 1.36 1.61 2.303 1.055zM1 13.396V2.603L6.846 8zM1.03 1.27l6.553 6.05 3.044-2.81L3.333.215C2.39-.341 1.231.24 1.03 1.27"/>
                      </svg>
                    </div>
                    <div className="text-left">
                      <div className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase leading-none">
                        Disponible en
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-white leading-tight mt-0.5 group-hover/btn:text-[#FF5C7A] transition-colors">
                        Google Play
                      </div>
                    </div>
                  </Link>

                  {/* Apple App Store Button */}
                  <Link
                    href={app.appStoreUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-slate-950 hover:bg-black border border-slate-700/80 hover:border-slate-500 shadow-sm transition-all duration-200 group/btn"
                  >
                    {/* Apple Vector Icon */}
                    <div className="w-6 h-6 flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 fill-white transition-transform group-hover/btn:scale-110" viewBox="0 0 16 16">
                        <path d="M11.182.008C11.148-.03 9.923.023 8.857 1.18c-1.066 1.156-.902 2.482-.878 2.516s1.52.087 2.475-1.258.762-2.391.728-2.43m3.314 11.733c-.048-.096-2.325-1.234-2.113-3.422s1.675-2.789 1.698-2.854-.597-.79-1.254-1.157a3.7 3.7 0 0 0-1.563-.434c-.108-.003-.483-.095-1.254.116-.508.139-1.653.589-1.968.607-.316.018-1.256-.522-2.267-.665-.647-.125-1.333.131-1.824.328-.49.196-1.422.754-2.074 2.237-.652 1.482-.311 3.83-.067 4.56s.625 1.924 1.273 2.796c.576.984 1.34 1.667 1.659 1.899s1.219.386 1.843.067c.502-.308 1.408-.485 1.766-.472.357.013 1.061.154 1.782.539.571.197 1.111.115 1.652-.105.541-.221 1.324-1.059 2.238-2.758q.52-1.185.473-1.282"/>
                      </svg>
                    </div>
                    <div className="text-left">
                      <div className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase leading-none">
                        Consíguelo en el
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-white leading-tight mt-0.5 group-hover/btn:text-[#FF5C7A] transition-colors">
                        App Store
                      </div>
                    </div>
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Video Section & CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl bg-gradient-to-r from-[#D9043D] via-[#c20336] to-slate-900 p-8 sm:p-10 lg:p-12 shadow-2xl border border-white/15"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 aspect-video bg-black">
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src="https://www.youtube.com/embed/9uW6zblB-wI"
                  title="TRUE LOVE Delivery Service Video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>

            <div className="lg:col-span-6 text-center lg:text-left">
              <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider mb-4">
                En Toda la Ciudad
              </span>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight">
                Únete hoy a la red que está transformando el delivery
              </h3>
              <p className="mt-3 text-sm sm:text-base text-white/90 leading-relaxed">
                Ya seas un restaurante que busca más pedidos o un motorizado que busca mejores ingresos, True Love tiene la tecnología lista para ti.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-4">
                <Button
                  asChild
                  size="lg"
                  className="bg-white text-[#D9043D] hover:bg-slate-100 font-bold text-sm sm:text-base shadow-xl rounded-full px-7 h-11 transition-all duration-300 hover:scale-105 group"
                >
                  <Link href="#registro" className="flex items-center gap-2">
                    <Store className="w-4 h-4 text-[#D9043D]" />
                    <span>Registra tu Negocio</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="bg-transparent border-white text-white hover:bg-white/15 font-bold text-sm sm:text-base rounded-full px-7 h-11"
                >
                  <Link href="/reparto" className="flex items-center gap-2">
                    <Bike className="w-4 h-4" />
                    <span>Quiero ser Repartidor</span>
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
