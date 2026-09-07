// components/AppShowcase.tsx
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Smartphone, Store, Bike, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

const appsData = [
  {
    id: "cliente",
    name: "True Love Cliente",
    role: "Para Comensales",
    tag: "Pide Delivery",
    icon: ShoppingBag,
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
    icon: Store,
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
    icon: Bike,
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
            const Icon = app.icon;
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
                    <div className={`w-12 h-12 p-2.5 rounded-2xl bg-gradient-to-tr ${app.color} text-white shadow-lg flex items-center justify-center`}>
                      <Icon className="w-6 h-6" />
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
                      <svg className="w-5 h-5 transition-transform group-hover/btn:scale-110" viewBox="0 0 512 512">
                        <path fill="#4285F4" d="M32.5 13.7C20.6 20.3 12 33.7 12 50.4v411.2c0 16.7 8.6 30.1 20.5 36.7l228.6-242.3L32.5 13.7z"/>
                        <path fill="#FBBC04" d="M374.8 178.6L241.1 256l133.7 77.4 56.4-32.6c16.3-9.4 16.3-24.9 0-34.3l-56.4-87.9z"/>
                        <path fill="#EA4335" d="M32.5 498.3c7.2 4 15.6 4.9 23.9.1l318.4-184.2L241.1 256 32.5 498.3z"/>
                        <path fill="#34A853" d="M374.8 178.6L56.4 13.6c-8.3-4.8-16.7-3.9-23.9.1L241.1 256l133.7-77.4z"/>
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
                      <svg className="w-5 h-5 fill-white transition-transform group-hover/btn:scale-110" viewBox="0 0 170 170">
                        <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.6-7.79-11.72-14.24-6.3-9.84-11.25-20.91-14.86-33.22-3.61-12.31-5.42-24.13-5.42-35.46 0-14.07 3.5-25.99 10.5-35.76 7-9.77 15.99-14.78 26.96-15.02 5.01 0 10.42 1.34 16.23 4.02 5.8 2.68 9.5 4.09 11.08 4.23 1.83-.28 5.75-1.8 11.77-4.57 6.01-2.77 11.38-4.04 16.09-3.81 12.32.61 22.09 5.09 29.31 13.43-10.79 6.53-16.07 15.65-15.84 27.35.23 9.17 3.63 16.89 10.2 23.16 6.57 6.27 14.44 9.87 23.61 10.8-2.29 6.74-5.06 13.68-8.32 20.82zM119.22 33.15c0-6.73 2.45-13.14 7.35-19.22 4.9-6.09 11-10.36 18.29-12.82.76 1.41 1.14 3.04 1.14 4.88 0 6.62-2.52 13.06-7.56 19.33-5.04 6.27-11.2 10.46-18.49 12.58-.22-1.63-.73-3.21-.73-4.75z"/>
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
