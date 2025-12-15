"use client";

import React from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function TerminosYCondiciones() {
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
              Términos y condiciones
            </h1>
            <div className="w-full h-px bg-gray-300 mb-6"></div>

            {/* Introducción */}
            <div className="space-y-3 mb-8">
              <p className="text-gray-700 text-base leading-relaxed">
                Bienvenido a TrueLove, una aplicación móvil de delivery de comida operada en Departamento de Lima, provincia de Huaura, distrito de Huacho. Al utilizar nuestra aplicación, aceptas cumplir con los siguientes términos y condiciones.
              </p>
            </div>

            {/* Secciones */}
            <div className="space-y-6">
              {/* 1. Uso de la Aplicación */}
              <section>
                <h2 className="text-lg font-bold text-gray-900 mb-2">
                  1. Uso de la Aplicación
                </h2>
                <p className="text-gray-700 text-base leading-relaxed">
                  TrueLove es un servicio que te permite pedir comida de diversos restaurantes locales y recibirla en la dirección que indiques.
                </p>
              </section>

              {/* 2. Cuenta de Usuario */}
              <section>
                <h2 className="text-lg font-bold text-gray-900 mb-2">
                  2. Cuenta de Usuario
                </h2>
                <p className="text-gray-700 text-base leading-relaxed">
                  Para utilizar TrueLove, necesitas crear una cuenta con tus datos reales. Eres responsable de mantener la confidencialidad de tu cuenta.
                </p>
              </section>

              {/* 3. Pagos y Tarifas */}
              <section>
                <h2 className="text-lg font-bold text-gray-900 mb-2">
                  3. Pagos y Tarifas
                </h2>
                <p className="text-gray-700 text-base leading-relaxed">
                  Nuestra aplicación incluye una pasarela de pagos integrada. Los precios de los productos y los costos de envío se mostrarán antes de confirmar tu pedido.
                </p>
              </section>

              {/* 4. Uso de Datos y Privacidad */}
              <section>
                <h2 className="text-lg font-bold text-gray-900 mb-2">
                  4. Uso de Datos y Privacidad
                </h2>
                <p className="text-gray-700 text-base leading-relaxed">
                  Recopilamos cierta información, como tu ubicación, para poder realizar las entregas. También podríamos solicitar acceso a la cámara de tu dispositivo para funciones específicas (por ejemplo, escanear códigos QR). Siempre podrás revisar nuestra política de privacidad para más detalles.
                </p>
              </section>

              {/* 5. Responsabilidades del Usuario */}
              <section>
                <h2 className="text-lg font-bold text-gray-900 mb-2">
                  5. Responsabilidades del Usuario
                </h2>
                <p className="text-gray-700 text-base leading-relaxed">
                  Te comprometes a usar TrueLove de manera lícita y a no realizar actividades fraudulentas.
                </p>
              </section>

              {/* 6. Cupones y Promociones */}
              <section>
                <h2 className="text-lg font-bold text-gray-900 mb-2">
                  6. Cupones y Promociones
                </h2>
                <p className="text-gray-700 text-base leading-relaxed">
                  TrueLove puede ofrecer cupones, concursos y eventos promocionales ocasionalmente. Cada cupón o promoción tendrá sus propios términos y condiciones específicos, los cuales se indicarán en el momento de la oferta. El uso de cupones está sujeto a las reglas que indiquemos y no son acumulables, salvo que se especifique lo contrario.
                </p>
              </section>

              {/* 7. Publicidad */}
              <section>
                <h2 className="text-lg font-bold text-gray-900 mb-2">
                  7. Publicidad
                </h2>
                <p className="text-gray-700 text-base leading-relaxed">
                  Dentro de la aplicación, podemos mostrar publicidad propia o de terceros. Al usar TrueLove, aceptas recibir este tipo de publicidad, que puede estar basada en tus preferencias o ubicación.
                </p>
              </section>

              {/* 8. Medios de Pago */}
              <section>
                <h2 className="text-lg font-bold text-gray-900 mb-2">
                  8. Medios de Pago
                </h2>
                <p className="text-gray-700 text-base leading-relaxed">
                  Además de la pasarela de pagos integrada, aceptamos diversos medios de pago electrónicos, que se detallarán en la sección correspondiente de la app. Es tu responsabilidad asegurarte de que los datos de pago proporcionados sean correctos y estén actualizados.
                </p>
              </section>

              {/* 9. Ley Aplicable y Jurisdicción */}
              <section>
                <h2 className="text-lg font-bold text-gray-900 mb-2">
                  9. Ley Aplicable y Jurisdicción
                </h2>
                <p className="text-gray-700 text-base leading-relaxed">
                  Estos términos se rigen por las leyes de la República del Perú. Cualquier disputa o conflicto que surja en relación con estos términos se resolverá en los tribunales competentes de Lima, Perú.
                </p>
              </section>

              {/* 10. Uso Autorizado de la Plataforma */}
              <section>
                <h2 className="text-lg font-bold text-gray-900 mb-2">
                  10. Uso Autorizado de la Plataforma
                </h2>
                <p className="text-gray-700 text-base leading-relaxed">
                  La plataforma debe ser utilizada únicamente para los fines previstos, es decir, solicitar y recibir servicios de TrueLove de comida. Cualquier uso no autorizado podrá resultar en la suspensión o cancelación de la cuenta.
                </p>
              </section>

              {/* 11. Modificaciones de los Términos */}
              <section>
                <h2 className="text-lg font-bold text-gray-900 mb-2">
                  11. Modificaciones de los Términos
                </h2>
                <p className="text-gray-700 text-base leading-relaxed">
                  Nos reservamos el derecho de modificar estos términos en cualquier momento. Te notificaremos sobre cambios importantes a través de la aplicación.
                </p>
              </section>
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
