"use client";

import React from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CookieSettings from "@/components/CookieSettings";

export default function PoliticaDeCookies() {
  return (
    <>
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        className="fixed top-0 left-0 right-0 h-1.5 bg-[#D9043D] z-50"
        transition={{ duration: 0.5 }}
      />

      <main className="bg-white min-h-screen">
        <Navbar />

        <div className="w-full max-w-6xl mx-auto px-6 sm:px-8 md:px-12 lg:px-16 py-12 md:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Título */}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Política de cookies
            </h1>
            <div className="w-full h-px bg-gray-300 mb-6"></div>

            {/* Introducción */}
            <div className="space-y-3 mb-8">
              <p className="text-gray-700 text-base leading-relaxed">
                En TrueLove utilizamos cookies y tecnologías similares para mejorar tu experiencia en nuestra plataforma, personalizar el contenido, analizar el tráfico y entender cómo nuestros usuarios interactúan con nuestros servicios.
              </p>
              <p className="text-gray-700 text-base leading-relaxed">
                Esta Política de Cookies explica qué son las cookies, cómo las utilizamos, qué tipos de cookies empleamos, y cómo puedes gestionar tus preferencias.
              </p>
            </div>

            {/* Secciones */}
            <div className="space-y-6 mb-10">
              {/* 1. ¿Qué son las cookies? */}
              <section>
                <h2 className="text-lg font-bold text-gray-900 mb-2">
                  1. ¿Qué son las cookies?
                </h2>
                <p className="text-gray-700 text-base leading-relaxed mb-2">
                  Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo (ordenador, tablet o móvil) cuando visitas un sitio web. Se utilizan ampliamente para hacer que los sitios web funcionen de manera más eficiente y proporcionar información a los propietarios del sitio.
                </p>
                <p className="text-gray-700 text-base leading-relaxed">
                  Las cookies permiten que el sitio web recuerde tus acciones y preferencias (como inicio de sesión, idioma, tamaño de fuente y otras preferencias de visualización) durante un período de tiempo, para que no tengas que volver a configurarlas cada vez que regreses al sitio o navegues de una página a otra.
                </p>
              </section>

              {/* 2. ¿Cómo utilizamos las cookies? */}
              <section>
                <h2 className="text-lg font-bold text-gray-900 mb-2">
                  2. ¿Cómo utilizamos las cookies?
                </h2>
                <p className="text-gray-700 text-base leading-relaxed mb-2">
                  TrueLove utiliza cookies para diversos propósitos, incluyendo:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 text-base ml-4">
                  <li>Habilitar ciertas funciones esenciales del sitio web</li>
                  <li>Recordar tus preferencias y configuraciones</li>
                  <li>Entender cómo utilizas nuestro sitio web y mejorar tu experiencia</li>
                  <li>Analizar el rendimiento de nuestros servicios</li>
                  <li>Mostrar publicidad relevante según tus intereses</li>
                  <li>Proteger la seguridad de tu cuenta y prevenir fraudes</li>
                </ul>
              </section>

              {/* 3. Tipos de cookies que utilizamos */}
              <section>
                <h2 className="text-lg font-bold text-gray-900 mb-2">
                  3. Tipos de cookies que utilizamos
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Cookies Necesarias (Siempre activas)
                    </h3>
                    <p className="text-gray-700 text-base leading-relaxed">
                      Estas cookies son esenciales para el funcionamiento básico del sitio web. Incluyen cookies de sesión, autenticación y seguridad. Sin estas cookies, el sitio web no puede funcionar correctamente. Ejemplos: sesión de usuario, carrito de compras, preferencias de idioma.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Cookies de Análisis y Rendimiento
                    </h3>
                    <p className="text-gray-700 text-base leading-relaxed">
                      Nos ayudan a entender cómo los visitantes interactúan con nuestro sitio web, recopilando información de forma anónima. Estas cookies nos permiten contar visitas y fuentes de tráfico para poder medir y mejorar el rendimiento de nuestro sitio. Ejemplos: Google Analytics, métricas de uso, análisis de comportamiento.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Cookies de Marketing y Publicidad
                    </h3>
                    <p className="text-gray-700 text-base leading-relaxed">
                      Se utilizan para mostrar anuncios relevantes y medir la efectividad de nuestras campañas publicitarias. Estas cookies rastrean tu actividad en el sitio web para ayudarnos a mostrar publicidad que sea más relevante para ti. Ejemplos: Facebook Pixel, Google Ads, remarketing.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Cookies de Personalización
                    </h3>
                    <p className="text-gray-700 text-base leading-relaxed">
                      Permiten recordar tus preferencias y personalizar tu experiencia en el sitio web. Estas cookies habilitan funcionalidades mejoradas y más personales. Ejemplos: tema oscuro/claro, ubicación guardada, preferencias de visualización.
                    </p>
                  </div>
                </div>
              </section>

              {/* 4. Duración de las cookies */}
              <section>
                <h2 className="text-lg font-bold text-gray-900 mb-2">
                  4. Duración de las cookies
                </h2>
                <p className="text-gray-700 text-base leading-relaxed mb-2">
                  Las cookies pueden ser de sesión o persistentes:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 text-base ml-4">
                  <li><strong>Cookies de sesión:</strong> Son temporales y se eliminan cuando cierras tu navegador. Se utilizan para mantener tu sesión activa mientras navegas por el sitio.</li>
                  <li><strong>Cookies persistentes:</strong> Permanecen en tu dispositivo durante un período de tiempo específico o hasta que las elimines manualmente. Se utilizan para recordar tus preferencias entre sesiones.</li>
                </ul>
              </section>

              {/* 5. Cookies de terceros */}
              <section>
                <h2 className="text-lg font-bold text-gray-900 mb-2">
                  5. Cookies de terceros
                </h2>
                <p className="text-gray-700 text-base leading-relaxed mb-2">
                  Además de nuestras propias cookies, también utilizamos cookies de terceros de proveedores de servicios de confianza, como:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 text-base ml-4">
                  <li>Google Analytics para análisis de tráfico web</li>
                  <li>Redes sociales (Facebook, Instagram) para funciones de compartir contenido</li>
                  <li>Plataformas de publicidad para mostrar anuncios relevantes</li>
                  <li>Servicios de pago para procesar transacciones de forma segura</li>
                </ul>
                <p className="text-gray-700 text-base leading-relaxed mt-2">
                  Estos terceros pueden utilizar sus cookies para recopilar información sobre tu actividad en línea a través de diferentes sitios web.
                </p>
              </section>

              {/* 6. Cómo gestionar las cookies */}
              <section>
                <h2 className="text-lg font-bold text-gray-900 mb-2">
                  6. Cómo gestionar las cookies
                </h2>
                <p className="text-gray-700 text-base leading-relaxed mb-2">
                  Puedes controlar y gestionar las cookies de varias maneras:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 text-base ml-4">
                  <li><strong>A través de nuestro panel de configuración:</strong> Utiliza las opciones que aparecen más abajo para elegir qué tipos de cookies aceptas.</li>
                  <li><strong>Configuración del navegador:</strong> La mayoría de los navegadores te permiten controlar las cookies a través de sus configuraciones. Puedes configurar tu navegador para rechazar cookies o para que te avise cuando se envíe una cookie.</li>
                  <li><strong>Eliminación manual:</strong> Puedes eliminar todas las cookies que ya están en tu dispositivo a través de la configuración de tu navegador.</li>
                </ul>
                <p className="text-gray-700 text-base leading-relaxed mt-2">
                  Ten en cuenta que si deshabilitas o rechazas las cookies, algunas partes de nuestro sitio web pueden no funcionar correctamente o pueden tener un rendimiento limitado.
                </p>
              </section>

              {/* 7. Actualizaciones de esta política */}
              <section>
                <h2 className="text-lg font-bold text-gray-900 mb-2">
                  7. Actualizaciones de esta política
                </h2>
                <p className="text-gray-700 text-base leading-relaxed">
                  Nos reservamos el derecho de actualizar esta Política de Cookies en cualquier momento. Cualquier cambio será publicado en esta página con una fecha de actualización revisada. Te recomendamos revisar esta política periódicamente para estar informado sobre cómo utilizamos las cookies.
                </p>
              </section>

              {/* 8. Contacto */}
              <section>
                <h2 className="text-lg font-bold text-gray-900 mb-2">
                  8. Contacto
                </h2>
                <p className="text-gray-700 text-base leading-relaxed">
                  Si tienes preguntas sobre nuestra Política de Cookies o sobre cómo utilizamos las cookies, puedes contactarnos en: <a href="mailto:soporte@deliverytruelove.com" className="text-[#D9043D] hover:underline">soporte@deliverytruelove.com</a>
                </p>
              </section>
            </div>

            {/* Configuración de Cookies */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Configuración de Cookies
              </h2>
              <CookieSettings />
            </div>

            {/* Última actualización */}
            <div className="mt-12 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 text-center">
                Última actualización: Diciembre 2025
              </p>
            </div>
          </motion.div>
        </div>

        <Footer />
      </main>
    </>
  );
}
