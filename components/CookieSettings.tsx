"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Cookie, Check, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getCookieConsent, setCookieConsent, resetCookieConsent } from "@/lib/cookies";

export default function CookieSettings() {
  const [consent, setConsent] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const currentConsent = getCookieConsent();
    setConsent(currentConsent);
  }, []);

  const handleSavePreferences = (newConsent: "all" | "necessary") => {
    setCookieConsent(newConsent);
    setConsent(newConsent);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleReset = () => {
    resetCookieConsent();
    setConsent(null);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      window.location.reload();
    }, 2000);
  };

  return (
    <div className="w-full">
      {/* Mensaje de éxito */}
      {showSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3"
        >
          <Check className="w-5 h-5 text-green-600" />
          <p className="text-green-800 font-medium">
            Preferencias guardadas correctamente
          </p>
        </motion.div>
      )}

      <Card className="border-none shadow-none bg-transparent">
        <CardContent className="p-0">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#D9043D] rounded-lg flex items-center justify-center">
              <Cookie className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">
                Gestiona tus Preferencias
              </h3>
              <p className="text-xs text-gray-600">
                Estado: {consent === "all" ? "Todas aceptadas" : consent === "necessary" ? "Solo necesarias" : "No configurado"}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Cookies necesarias */}
            <div className="bg-gray-50 rounded-lg p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Cookies Necesarias
                  </h3>
                  <p className="text-sm text-gray-600">
                    Estas cookies son esenciales para el funcionamiento básico del sitio web. 
                    Incluyen cookies de sesión, autenticación y seguridad.
                  </p>
                </div>
                <div className="ml-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Siempre activas
                  </span>
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Ejemplos: Sesión de usuario, carrito de compras, preferencias de idioma
              </div>
            </div>

            {/* Cookies de análisis */}
            <div className="bg-gray-50 rounded-lg p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Cookies de Análisis y Rendimiento
                  </h3>
                  <p className="text-sm text-gray-600">
                    Nos ayudan a entender cómo los visitantes interactúan con nuestro sitio web, 
                    recopilando información de forma anónima.
                  </p>
                </div>
                <div className="ml-4">
                  {consent === "all" ? (
                    <Check className="w-6 h-6 text-green-600" />
                  ) : (
                    <X className="w-6 h-6 text-gray-400" />
                  )}
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Ejemplos: Google Analytics, métricas de uso, análisis de comportamiento
              </div>
            </div>

            {/* Cookies de marketing */}
            <div className="bg-gray-50 rounded-lg p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Cookies de Marketing y Publicidad
                  </h3>
                  <p className="text-sm text-gray-600">
                    Se utilizan para mostrar anuncios relevantes y medir la efectividad 
                    de nuestras campañas publicitarias.
                  </p>
                </div>
                <div className="ml-4">
                  {consent === "all" ? (
                    <Check className="w-6 h-6 text-green-600" />
                  ) : (
                    <X className="w-6 h-6 text-gray-400" />
                  )}
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Ejemplos: Facebook Pixel, Google Ads, remarketing
              </div>
            </div>

            {/* Cookies de personalización */}
            <div className="bg-gray-50 rounded-lg p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Cookies de Personalización
                  </h3>
                  <p className="text-sm text-gray-600">
                    Permiten recordar tus preferencias y personalizar tu experiencia 
                    en el sitio web.
                  </p>
                </div>
                <div className="ml-4">
                  {consent === "all" ? (
                    <Check className="w-6 h-6 text-green-600" />
                  ) : (
                    <X className="w-6 h-6 text-gray-400" />
                  )}
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Ejemplos: Tema oscuro/claro, ubicación guardada, preferencias de visualización
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => handleSavePreferences("necessary")}
              variant="outline"
              className="sm:w-auto px-8 border-gray-300 hover:bg-gray-50"
            >
              Solo Necesarias
            </Button>
            <Button
              onClick={() => handleSavePreferences("all")}
              className="sm:w-auto px-8 bg-[#D9043D] hover:bg-red-700 text-white"
            >
              Aceptar Todas
            </Button>
          </div>

          {consent && (
            <div className="mt-4 text-center">
              <button
                onClick={handleReset}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Restablecer preferencias
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Información adicional */}
      <Card className="border-none shadow-none mt-6 bg-gray-50">
        <CardContent className="p-5">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            ¿Qué son las cookies?
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo 
            cuando visitas un sitio web. Se utilizan ampliamente para hacer que los sitios 
            web funcionen de manera más eficiente y proporcionar información a los propietarios del sitio.
          </p>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            ¿Cómo gestionar las cookies?
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            Puedes controlar y/o eliminar las cookies como desees. Puedes eliminar todas las 
            cookies que ya están en tu dispositivo y puedes configurar la mayoría de los 
            navegadores para evitar que se coloquen. Sin embargo, si haces esto, es posible 
            que tengas que ajustar manualmente algunas preferencias cada vez que visites un sitio.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
