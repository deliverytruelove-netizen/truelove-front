// components/Footer.tsx
"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Facebook, Twitter, Instagram, Mail, Phone, ShoppingBag, Store, Bike } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/src/assets/img/logotipo.png";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 text-slate-300 py-14 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Logo & Description */}
          <motion.div
            className="lg:col-span-2 flex flex-col items-center md:items-start"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="p-2 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/15 mb-4">
              <Image
                src={Logo}
                alt="TRUE LOVE logo"
                width={140}
                height={50}
                className="h-9 w-auto object-contain"
              />
            </div>
            <p className="text-sm text-center md:text-left text-slate-400 mt-2 leading-relaxed max-w-sm">
              Entregando excelencia, puntualidad y soporte dedicado en cada pedido. Conectamos comensales, comercios y repartidores en una sola plataforma.
            </p>
            <div className="flex space-x-3 mt-5">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>

          {/* Quick links */}
          <motion.div
            className="flex flex-col items-center md:items-start"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Navegación
            </h3>
            <nav className="flex flex-col space-y-2.5 text-sm">
              <Link
                href="/"
                className="text-slate-400 hover:text-[#FF5C7A] transition-colors"
              >
                Inicio
              </Link>
              <Link
                href="/#registro"
                className="text-slate-400 hover:text-[#FF5C7A] transition-colors"
              >
                Para Negocios
              </Link>
              <Link
                href="/reparto"
                className="text-slate-400 hover:text-[#FF5C7A] transition-colors"
              >
                Repartidores
              </Link>
              <Link
                href="/#apps"
                className="text-slate-400 hover:text-[#FF5C7A] transition-colors"
              >
                Nuestras Apps
              </Link>
              <Link
                href="/soporte"
                className="text-slate-400 hover:text-[#FF5C7A] transition-colors"
              >
                Centro de Ayuda
              </Link>
            </nav>
          </motion.div>

          {/* Download Apps Section */}
          <motion.div
            className="flex flex-col items-center md:items-start"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Apps Oficiales
            </h3>
            <div className="flex flex-col space-y-3 text-xs w-full">
              {/* Cliente */}
              <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10">
                <div className="flex items-center gap-1.5 font-bold text-white mb-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-[#FF5C7A]" />
                  <span>True Love Cliente</span>
                </div>
                <div className="flex gap-2">
                  <Link
                    href="https://play.google.com/store/apps/details?id=com.truelove.trueloveclient"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-white underline text-[11px]"
                  >
                    Play Store
                  </Link>
                  <span className="text-slate-600">|</span>
                  <Link
                    href="https://apps.apple.com/app/id6759631687"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-white underline text-[11px]"
                  >
                    App Store
                  </Link>
                </div>
              </div>

              {/* Socio */}
              <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10">
                <div className="flex items-center gap-1.5 font-bold text-white mb-1.5">
                  <Store className="w-3.5 h-3.5 text-rose-400" />
                  <span>True Love Socio</span>
                </div>
                <div className="flex gap-2">
                  <Link
                    href="https://play.google.com/store/apps/details?id=com.truelove.truelovesocio"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-white underline text-[11px]"
                  >
                    Play Store
                  </Link>
                  <span className="text-slate-600">|</span>
                  <Link
                    href="https://apps.apple.com/app/id-truelove-socio"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-white underline text-[11px]"
                  >
                    App Store
                  </Link>
                </div>
              </div>

              {/* Repartidor */}
              <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10">
                <div className="flex items-center gap-1.5 font-bold text-white mb-1.5">
                  <Bike className="w-3.5 h-3.5 text-amber-400" />
                  <span>True Love Repartidor</span>
                </div>
                <div className="flex gap-2">
                  <Link
                    href="https://play.google.com/store/apps/details?id=com.truelove.truelovebiker"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-white underline text-[11px]"
                  >
                    Play Store
                  </Link>
                  <span className="text-slate-600">|</span>
                  <Link
                    href="https://apps.apple.com/app/id-truelove-motorizado"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-white underline text-[11px]"
                  >
                    App Store
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Legal & Contact information */}
          <motion.div
            className="flex flex-col items-center md:items-start"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Legal & Contacto
            </h3>
            <nav className="flex flex-col space-y-2 text-sm text-slate-400 mb-5">
              <Link
                href="/politicas-de-privacidad"
                className="hover:text-[#FF5C7A] transition-colors"
              >
                Política de Privacidad
              </Link>
              <Link
                href="/terminos-y-condiciones"
                className="hover:text-[#FF5C7A] transition-colors"
              >
                Términos y Condiciones
              </Link>
              <Link
                href="/politica-de-uso-de-cookies"
                className="hover:text-[#FF5C7A] transition-colors"
              >
                Política de Cookies
              </Link>
            </nav>

            <div className="space-y-2 text-xs text-slate-400">
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#FF5C7A]" />
                <span>info@deliverytruelove.com</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#FF5C7A]" />
                <span>+51 989 815 260</span>
              </p>
            </div>
          </motion.div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-6 border-t border-slate-800/80 text-center text-slate-500 text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>
            &copy; {currentYear} TRUE LOVE. Todos los derechos reservados.
          </p>
          <p>
            Desarrollado con excelencia por{" "}
            <span className="text-[#FF5C7A] font-semibold">MDCM Solutions</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
