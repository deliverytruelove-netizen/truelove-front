// components/Navbar.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Menu,
  ArrowRight,
  LogIn,
  Store,
  Bike,
  Sparkles,
  HelpCircle,
  Home,
  ChevronRight,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import Logotipo from "@/src/assets/img/logotipo.png";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";

export default function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    {
      label: "Inicio",
      href: "/",
      icon: Home,
      description: "Página principal",
      active: pathname === "/",
    },
    {
      label: "Para Negocios",
      href: isHome ? "#registro" : "/#registro",
      icon: Store,
      description: "Registra tu local y aumenta ventas",
      active: false,
    },
    {
      label: "Repartidores",
      href: "/reparto",
      icon: Bike,
      badge: "¡Gana dinero!",
      description: "Únete a la flota de delivery",
      active: pathname?.startsWith("/reparto"),
    },
    {
      label: "Cómo Funciona",
      href: isHome ? "#como-funciona" : "/#como-funciona",
      icon: Sparkles,
      description: "Conoce el flujo en 3 pasos",
      active: false,
    },
    {
      label: "Apps",
      href: isHome ? "#apps" : "/#apps",
      icon: Smartphone,
      description: "Descarga las 3 apps oficiales",
      active: false,
    },
    {
      label: "Soporte",
      href: "/soporte",
      icon: HelpCircle,
      description: "Atención al cliente y dudas",
      active: pathname === "/soporte",
    },
  ];

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08)] border-b border-slate-200/80"
          : "bg-white/80 backdrop-blur-md border-b border-slate-100"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`flex items-center justify-between transition-all duration-300 ${
            scrolled ? "h-16" : "h-18 md:h-20"
          }`}
        >
          {/* Logo Brand */}
          <Link
            href="/"
            className="flex items-center gap-2 group transition-transform duration-200 hover:scale-[1.02] active:scale-95 flex-shrink-0"
            aria-label="Ir a la página de inicio"
          >
            <div className="relative">
              <Image
                src={Logotipo}
                alt="True Love Logo"
                width={130}
                height={50}
                className="h-10 md:h-11 w-auto object-contain transition-all duration-300"
                priority
              />
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5 bg-slate-100/60 p-1.5 rounded-full border border-slate-200/60 shadow-inner">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`relative px-4 py-2 rounded-full text-xs xl:text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                  link.active
                    ? "bg-white text-[#D9043D] shadow-sm shadow-black/5"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/70"
                }`}
              >
                <span>{link.label}</span>
                {link.badge && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D9043D]/10 text-[#D9043D] border border-[#D9043D]/20 animate-pulse">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions (CTA Buttons) */}
          <div className="hidden sm:flex items-center gap-3">
            <Button
              asChild
              variant="ghost"
              className="text-slate-700 hover:text-[#D9043D] hover:bg-slate-100 font-semibold text-sm rounded-full px-4 h-10 transition-all group"
            >
              <Link href="/login" className="flex items-center gap-1.5">
                <LogIn className="w-4 h-4 text-slate-500 group-hover:text-[#D9043D] transition-colors" />
                <span>Iniciar Sesión</span>
              </Link>
            </Button>

            <Button
              asChild
              className="bg-gradient-to-r from-[#D9043D] via-[#e21b50] to-[#b8032f] hover:from-[#c20336] hover:to-[#9c0228] text-white font-bold text-sm shadow-md shadow-[#D9043D]/25 hover:shadow-lg hover:shadow-[#D9043D]/40 rounded-full px-5 h-10 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group"
            >
              <Link
                href={isHome ? "#registro" : "/#registro"}
                className="flex items-center gap-1.5"
              >
                <span>Registra tu negocio</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>

          {/* Mobile Menu Trigger */}
          <div className="flex items-center gap-2 lg:hidden">
            <Button
              asChild
              size="sm"
              className="sm:hidden bg-[#D9043D] text-white text-xs font-bold rounded-full px-3.5 h-8 shadow-sm"
            >
              <Link href={isHome ? "#registro" : "/#registro"}>
                Registrarse
              </Link>
            </Button>

            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full h-10 w-10 border-slate-200 hover:bg-slate-100 text-slate-800 shadow-sm"
                  aria-label="Abrir menú"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>

              <SheetContent
                side="right"
                className="w-[320px] sm:w-[380px] p-0 flex flex-col bg-white border-l border-slate-100 shadow-2xl"
              >
                {/* Drawer Header */}
                <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex items-center justify-between">
                    <Image
                      src={Logotipo}
                      alt="True Love Logo"
                      width={110}
                      height={40}
                      className="h-9 w-auto object-contain"
                    />
                  </div>
                  <p className="mt-2 text-xs text-slate-500 font-medium">
                    Servicio de delivery excepcional y red de socios
                  </p>
                </div>

                <SheetTitle className="sr-only">Menú de Navegación</SheetTitle>

                {/* Drawer Navigation Links */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1">
                    Navegación
                  </div>

                  {navLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.label}
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className={`group flex items-center justify-between p-3 rounded-xl transition-all duration-200 ${
                          link.active
                            ? "bg-[#D9043D]/10 text-[#D9043D] font-bold border border-[#D9043D]/20"
                            : "hover:bg-slate-50 text-slate-700 hover:text-slate-900 font-semibold"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-lg transition-colors ${
                              link.active
                                ? "bg-[#D9043D] text-white"
                                : "bg-slate-100 text-slate-600 group-hover:bg-[#D9043D]/10 group-hover:text-[#D9043D]"
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{link.label}</span>
                              {link.badge && (
                                <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-[#D9043D] text-white uppercase tracking-wider">
                                  {link.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 font-normal mt-0.5">
                              {link.description}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    );
                  })}
                </div>

                {/* Drawer Footer Actions */}
                <div className="p-4 border-t border-slate-100 bg-slate-50/70 space-y-2.5">
                  <Button
                    asChild
                    className="w-full bg-gradient-to-r from-[#D9043D] to-[#b8032f] hover:from-[#c20336] hover:to-[#9c0228] text-white font-bold h-11 rounded-xl shadow-md shadow-[#D9043D]/20"
                  >
                    <Link
                      href={isHome ? "#registro" : "/#registro"}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-center gap-2"
                    >
                      <Store className="w-4 h-4" />
                      <span>Registra tu negocio</span>
                      <ArrowRight className="w-4 h-4 ml-auto" />
                    </Link>
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    className="w-full border-slate-200 text-slate-700 hover:bg-slate-100 font-bold h-10 rounded-xl"
                  >
                    <Link
                      href="/login"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-center gap-2"
                    >
                      <LogIn className="w-4 h-4 text-slate-500" />
                      <span>Iniciar Sesión</span>
                    </Link>
                  </Button>

                  {/* Help / Trust Badge */}
                  <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Plataforma 100% Segura & Soporte Directo</span>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
