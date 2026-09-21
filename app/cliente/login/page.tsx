// app/cliente/login/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Loader2, MapPin, Percent, Timer } from "lucide-react";
import { Input } from "@/components/ui/input";
import Logotipo from "@/src/assets/img/logotipo.png";
import { useClienteAuth } from "@/context/ClienteAuthContext";
import { clienteLogin, ClienteAuthError } from "@/services/clienteAuthService";

const perks = [
  { icon: Timer, text: "Sigue tu pedido en tiempo real, desde la cocina hasta tu puerta." },
  { icon: MapPin, text: "Guarda tus direcciones favoritas para pedir en segundos." },
  { icon: Percent, text: "Accede a descuentos y promociones exclusivas para clientes." },
];

export default function ClienteLoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading: authLoading } = useClienteAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace("/cliente/cuenta");
    }
  }, [authLoading, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await clienteLogin(email, password);
      login(response.token, response.cliente);
      router.push("/cliente/cuenta");
    } catch (err) {
      setError(err instanceof ClienteAuthError ? err.message : "No se pudo iniciar sesión");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-950 overflow-hidden flex items-center justify-center p-4 sm:p-6">
      {/* Ambient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#D9043D] via-[#8a0329] to-slate-950" />
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#FF5C7A]/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

      <Link
        href="/"
        className="absolute top-6 left-6 z-20 opacity-90 hover:opacity-100 transition-opacity"
      >
        <Image src={Logotipo} alt="True Love" width={120} height={44} className="h-9 w-auto object-contain brightness-0 invert" />
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 rounded-3xl overflow-hidden shadow-2xl border border-white/10"
      >
        {/* Left branding panel */}
        <div className="hidden lg:flex flex-col justify-between bg-white/[0.06] backdrop-blur-xl p-10 text-white">
          <div>
            <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg mb-6">
              <Image
                src="/apps/truelove-cliente.png"
                alt="True Love Cliente"
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-3xl font-black leading-tight mb-3">
              Pide tu delivery favorito con{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF8787] to-amber-300">
                True Love
              </span>
            </h1>
            <p className="text-sm text-white/70">
              Inicia sesión con tu cuenta de cliente para gestionar tus pedidos y tu perfil.
            </p>
          </div>

          <div className="space-y-5 mt-10">
            {perks.map(({ icon: Icon, text }, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.15 + index * 0.1 }}
                className="flex items-start gap-3"
              >
                <div className="shrink-0 w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-[#FF8787]" />
                </div>
                <p className="text-sm text-white/80 leading-relaxed pt-1.5">{text}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Form panel */}
        <div className="bg-white p-8 sm:p-10 flex flex-col justify-center">
          <div className="lg:hidden flex justify-center mb-6">
            <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-md">
              <Image
                src="/apps/truelove-cliente.png"
                alt="True Love Cliente"
                width={56}
                height={56}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <h2 className="text-2xl font-black text-slate-900 text-center mb-1">Inicia sesión</h2>
          <p className="text-sm text-slate-500 text-center mb-6">Accede a tu cuenta de cliente True Love</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Correo electrónico
              </label>
              <Input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tucorreo@ejemplo.com"
                className="h-11 rounded-xl"
                required
              />
            </div>

            <div className="relative">
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Contraseña
              </label>
              <Input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
                className="h-11 rounded-xl pr-11"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3.5 top-[38px] text-slate-400 hover:text-[#D9043D] transition-colors"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <div className="text-right">
              <Link
                href="/cliente/recuperar-contrasena"
                className="text-sm font-medium text-[#D9043D] hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 bg-gradient-to-r from-[#D9043D] via-[#e21b50] to-[#b8032f] hover:from-[#c20336] hover:to-[#9c0228] text-white font-bold rounded-xl shadow-md shadow-[#D9043D]/25 hover:shadow-lg hover:shadow-[#D9043D]/40 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 disabled:hover:scale-100"
            >
              {isSubmitting ? <Loader2 className="animate-spin h-5 w-5 mx-auto" /> : "Iniciar sesión"}
            </button>

            <p className="text-center text-sm text-slate-500 pt-1">
              ¿Aún no tienes cuenta?{" "}
              <Link href="/cliente/registro" className="text-[#D9043D] font-bold hover:underline">
                Regístrate gratis
              </Link>
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
