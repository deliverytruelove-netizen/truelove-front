"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Cookie } from "lucide-react";
import Link from "next/link";

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Verificar si el usuario ya aceptó las cookies
    const cookieConsent = localStorage.getItem("cookieConsent");
    if (!cookieConsent) {
      // Mostrar el banner después de 1 segundo
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem("cookieConsent", "all");
    localStorage.setItem("cookieConsentDate", new Date().toISOString());
    setShowBanner(false);
  };

  const handleRejectAll = () => {
    localStorage.setItem("cookieConsent", "necessary");
    localStorage.setItem("cookieConsentDate", new Date().toISOString());
    setShowBanner(false);
  };

  const handleClose = () => {
    setShowBanner(false);
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <>
          {/* Banner de cookies */}
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[9999] p-4 md:p-6"
          >
            <div className="max-w-6xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="relative p-6 md:p-8">
                {/* Botón cerrar */}
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  aria-label="Cerrar"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                  {/* Icono */}
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-[#D9043D] rounded-2xl flex items-center justify-center shadow-lg">
                      <Cookie className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  {/* Contenido */}
                  <div className="flex-1 space-y-3">
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                      Valoramos tu privacidad
                    </h3>
                    <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                      Usamos cookies para mejorar su experiencia de navegación, mostrarle anuncios o contenidos personalizados y analizar nuestro tráfico. 
                      Al hacer clic en <span className="font-semibold">&quot;Aceptar todo&quot;</span> usted da su consentimiento a nuestro uso de las cookies.
                    </p>
                    <Link 
                      href="/politicas-de-privacidad" 
                      className="inline-flex items-center text-sm text-[#D9043D] hover:text-red-700 font-medium transition-colors"
                    >
                      Política de cookies
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>

                  {/* Botones */}
                  <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto md:flex-shrink-0">
                    <button
                      onClick={handleRejectAll}
                      className="px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors duration-200 whitespace-nowrap"
                    >
                      Solo necesarias
                    </button>
                    <button
                      onClick={handleAcceptAll}
                      className="px-6 py-3 text-sm font-medium text-white bg-[#D9043D] hover:bg-red-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 whitespace-nowrap"
                    >
                      Aceptar todo
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
