"use client";

import React from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PoliticasPrivacidad() {
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
              Política de Privacidad
            </h1>
            <div className="w-full h-px bg-gray-300 mb-6"></div>

            {/* Introducción */}
            <div className="space-y-3 mb-8">
              <p className="text-gray-700 text-base leading-relaxed">
                En Delivery TrueLove, con sede en Huacho, Lima, Perú, valoramos la privacidad de nuestros usuarios y nos comprometemos a proteger su información personal.
              </p>
              <p className="text-gray-700 text-base leading-relaxed">
                Bienvenido a Delivery TrueLove. Esta Política de Privacidad describe qué datos recopilamos, cómo los usamos y con quién los compartimos cuando utilizas nuestros servicios de delivery. Al usar nuestra plataforma, aceptas las prácticas descritas en esta política. Nos comprometemos a proteger la seguridad de la información de nuestros usuarios y de la empresa.
              </p>
            </div>

            {/* Secciones */}
            <div className="space-y-6">
              {/* 1. Información que Recopilamos */}
              <section>
                <h2 className="text-lg font-bold text-gray-900 mb-2">
                  1. Información que Recopilamos
                </h2>
                <p className="text-gray-700 text-base leading-relaxed mb-3">
                  Recopilamos diversos tipos de información para ofrecer un servicio de delivery eficiente y personalizado:
                </p>
                <div className="ml-4 space-y-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Datos de Identificación Personal</h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-700 text-base ml-4">
                      <li>Nombre completo: Para personalizar la experiencia y la comunicación</li>
                      <li>Número de teléfono: Para la confirmación de pedidos y comunicación en tiempo real</li>
                      <li>Correo electrónico: Para envío de confirmaciones, recibos y notificaciones</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Información de Pago</h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-700 text-base ml-4">
                      <li>Datos de tarjetas de crédito o débito en POS: Para procesar pagos de manera segura</li>
                      <li>Información de plataformas de pago digital: Para facilitar transacciones electrónicas</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Ubicación</h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-700 text-base ml-4">
                      <li>Ubicación en tiempo real: Para localizar al usuario y coordinar entregas rápidas y precisas</li>
                      <li>Dirección de entrega: Para asegurar que los pedidos lleguen al destino correcto</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Historial y Datos de Uso</h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-700 text-base ml-4">
                      <li>Detalles de pedidos anteriores: Productos solicitados, tiempos de entrega y preferencias</li>
                      <li>Valoraciones y comentarios: Retroalimentación sobre los servicios recibidos</li>
                      <li>Interacción con la app: Cómo navegan y sus preferencias personalizadas</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Datos de Dispositivo</h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-700 text-base ml-4">
                      <li>Modelo y sistema operativo: Para garantizar compatibilidad y optimización</li>
                      <li>Identificadores únicos del dispositivo: Para mejorar seguridad y personalización</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Acceso a Funciones</h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-700 text-base ml-4">
                      <li>Acceso a la Cámara: Para verificar identidad, pedidos y tomar fotos</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* 2. Uso de la Información */}
              <section>
                <h2 className="text-lg font-bold text-gray-900 mb-2">
                  2. Uso de la Información
                </h2>
                <p className="text-gray-700 text-base leading-relaxed mb-2">
                  Utilizamos tu información para ofrecer un servicio de entrega eficiente y de calidad:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 text-base ml-4">
                  <li>Procesar y entregar tus pedidos de manera eficiente</li>
                  <li>Mejorar la experiencia del usuario y la calidad del servicio</li>
                  <li>Cumplir con obligaciones legales</li>
                </ul>
              </section>

              {/* 3. Seguridad de la Información */}
              <section>
                <h2 className="text-lg font-bold text-gray-900 mb-2">
                  3. Seguridad de la Información
                </h2>
                <p className="text-gray-700 text-base leading-relaxed mb-3">
                  Implementamos medidas robustas para proteger tu información personal:
                </p>
                <div className="ml-4 space-y-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Control de Accesos</h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-700 text-base ml-4">
                      <li>Autenticación y Autorización: Mecanismos robustos para garantizar acceso solo a personas autorizadas</li>
                      <li>Gestión de Permisos: Los accesos se asignan según el principio de menor privilegio</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Protección de Datos</h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-700 text-base ml-4">
                      <li>Cifrado: Los datos sensibles se cifran en tránsito y en reposo</li>
                      <li>Respaldo de Información: Copias de seguridad periódicas para garantizar disponibilidad</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Gestión de Vulnerabilidades</h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-700 text-base ml-4">
                      <li>Monitoreo Continuo: Herramientas de monitoreo para detectar amenazas</li>
                      <li>Actualizaciones y Parcheo: Actualizaciones de seguridad oportunas</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Gestión de Incidentes</h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-700 text-base ml-4">
                      <li>Protocolo de respuesta para identificar, contener y resolver incidentes de seguridad</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* 4. Derechos del Usuario */}
              <section>
                <h2 className="text-lg font-bold text-gray-900 mb-2">
                  4. Derechos del Usuario
                </h2>
                <p className="text-gray-700 text-base leading-relaxed mb-2">
                  Tienes control total sobre tus datos personales:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 text-base ml-4">
                  <li>Acceder a tu información personal</li>
                  <li>Rectificar información incorrecta</li>
                  <li>Eliminar tu información personal</li>
                  <li>Gestionar tus preferencias a través de la configuración de la aplicación</li>
                </ul>
              </section>

              {/* 5. Eliminación de Datos */}
              <section>
                <h2 className="text-lg font-bold text-gray-900 mb-2">
                  5. Eliminación de Datos
                </h2>
                <p className="text-gray-700 text-base leading-relaxed mb-2">
                  En Delivery True Love, respetamos tu privacidad y te ofrecemos la posibilidad de solicitar la eliminación de tus datos personales en cualquier momento. Puedes hacerlo a través de nuestra <a href="/eliminar-cuenta" className="text-[#D9043D] hover:underline">página de eliminación de cuenta</a> o enviándonos una solicitud a nuestro correo electrónico <a href="mailto:soporte@deliverytruelove.com" className="text-[#D9043D] hover:underline">soporte@deliverytruelove.com</a>.
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 text-base ml-4">
                  <li>Proceso de Eliminación: Una vez recibida tu solicitud, procesaremos la eliminación de tus datos en un plazo máximo de 3 días hábiles</li>
                  <li>Seguridad y Confidencialidad: Durante este proceso, garantizamos la seguridad y confidencialidad de tu información, eliminando todos los datos que no sean necesarios para cumplir con obligaciones legales</li>
                  <li>Asistencia: Si tienes alguna duda o necesitas asistencia adicional, no dudes en contactarnos a soporte@deliverytruelove.com</li>
                </ul>
              </section>

              {/* 6. Cumplimiento Legal y Contacto */}
              <section>
                <h2 className="text-lg font-bold text-gray-900 mb-2">
                  6. Cumplimiento Legal y Contacto
                </h2>
                <p className="text-gray-700 text-base leading-relaxed mb-2">
                  Delivery TrueLove cumple con las leyes y regulaciones aplicables en materia de protección de datos:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 text-base ml-4">
                  <li>Normativas y Regulaciones: Cumplimiento con leyes de protección de datos</li>
                  <li>Capacitación Continua: Formación periódica al personal sobre prácticas de seguridad</li>
                  <li>Privacidad: Protección de la información de usuarios y de la empresa</li>
                </ul>
              </section>

              {/* 7. Información Adicional */}
              <section>
                <h2 className="text-lg font-bold text-gray-900 mb-2">
                  7. Información Adicional
                </h2>
                <div className="ml-4 space-y-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Retención de Datos</h3>
                    <p className="text-gray-700 text-base leading-relaxed">
                      Conservamos tu información personal durante el tiempo necesario para cumplir con los propósitos descritos en esta política, o mientras mantengas una cuenta activa con nosotros.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Capacitación y Concientización</h3>
                    <p className="text-gray-700 text-base leading-relaxed">
                      Se brinda capacitación periódica al personal sobre prácticas de seguridad de la información para garantizar la protección continua de tus datos.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Alcance de la Política</h3>
                    <p className="text-gray-700 text-base leading-relaxed">
                      Esta política aplica a todos los usuarios, empleados, colaboradores, contratistas y terceros que tengan acceso a la información de Delivery TrueLove.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Cambios a esta Política</h3>
                    <p className="text-gray-700 text-base leading-relaxed">
                      Nos reservamos el derecho de actualizar esta Política de Privacidad en cualquier momento. Te notificaremos sobre cambios significativos.
                    </p>
                  </div>
                </div>
              </section>

              {/* 8. Contacto */}
              <section>
                <h2 className="text-lg font-bold text-gray-900 mb-2">
                  8. ¿Preguntas sobre tu Privacidad?
                </h2>
                <p className="text-gray-700 text-base leading-relaxed mb-2">
                  Si tienes preguntas o inquietudes sobre esta política de privacidad, o si deseas ejercer tus derechos de acceso, rectificación o eliminación de datos, contáctanos:
                </p>
                <p className="text-gray-700 text-base leading-relaxed">
                  <strong>Email de Soporte:</strong> <a href="mailto:soporte@deliverytruelove.com" className="text-[#D9043D] hover:underline">soporte@deliverytruelove.com</a>
                </p>
              </section>

              {/* 9. Cookies */}
              <section>
                <h2 className="text-lg font-bold text-gray-900 mb-2">
                  9. Cookies
                </h2>
                <p className="text-gray-700 text-base leading-relaxed">
                  Para conocer más sobre cómo utilizamos las cookies y cómo puedes gestionar tus preferencias, consulta nuestra <a href="/politica-de-uso-de-cookies" className="text-[#D9043D] hover:underline">Política de Cookies</a>.
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
