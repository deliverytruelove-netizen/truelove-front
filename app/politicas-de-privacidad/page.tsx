"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Lock, Eye, FileText, Mail, UserCheck, X, Trash2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CookieSettings from "@/components/CookieSettings";

export default function PoliticasPrivacidad() {
  const [selectedSection, setSelectedSection] = React.useState<number | null>(
    null
  );

  const sections = [
    {
      icon: <FileText className="h-6 w-6" />,
      title: "1. Información que Recopilamos",
      summary: "Recopilamos diversos tipos de información para ofrecer un servicio de delivery eficiente y personalizado.",
      categories: {
        "Datos de Identificación Personal": [
          "Nombre completo: Para personalizar la experiencia y la comunicación",
          "Número de teléfono: Para la confirmación de pedidos y comunicación en tiempo real",
          "Correo electrónico: Para envío de confirmaciones, recibos y notificaciones",
        ],
        "Información de Pago": [
          "Datos de tarjetas de crédito o débito en POS: Para procesar pagos de manera segura",
          "Información de plataformas de pago digital: Para facilitar transacciones electrónicas",
        ],
        "Ubicación": [
          "Ubicación en tiempo real: Para localizar al usuario y coordinar entregas rápidas y precisas",
          "Dirección de entrega: Para asegurar que los pedidos lleguen al destino correcto",
        ],
        "Historial y Datos de Uso": [
          "Detalles de pedidos anteriores: Productos solicitados, tiempos de entrega y preferencias",
          "Valoraciones y comentarios: Retroalimentación sobre los servicios recibidos",
          "Interacción con la app: Cómo navegan y sus preferencias personalizadas",
        ],
        "Datos de Dispositivo": [
          "Modelo y sistema operativo: Para garantizar compatibilidad y optimización",
          "Identificadores únicos del dispositivo: Para mejorar seguridad y personalización",
        ],
        "Acceso a Funciones": [
          "Acceso a la Cámara: Para verificar identidad, pedidos y tomar fotos",
        ],
      },
    },
    {
      icon: <Lock className="h-6 w-6" />,
      title: "2. Uso de la Información",
      summary: "Utilizamos tu información para ofrecer un servicio de entrega eficiente y de calidad.",
      items: [
        "Procesar y entregar tus pedidos de manera eficiente",
        "Mejorar la experiencia del usuario y la calidad del servicio",
        "Cumplir con obligaciones legales",
      ],
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "3. Seguridad de la Información",
      summary: "Implementamos medidas robustas para proteger tu información personal.",
      subsections: {
        "Control de Accesos": [
          "Autenticación y Autorización: Mecanismos robustos para garantizar acceso solo a personas autorizadas",
          "Gestión de Permisos: Los accesos se asignan según el principio de menor privilegio",
        ],
        "Protección de Datos": [
          "Cifrado: Los datos sensibles se cifran en tránsito y en reposo",
          "Respaldo de Información: Copias de seguridad periódicas para garantizar disponibilidad",
        ],
        "Gestión de Vulnerabilidades": [
          "Monitoreo Continuo: Herramientas de monitoreo para detectar amenazas",
          "Actualizaciones y Parcheo: Actualizaciones de seguridad oportunas",
        ],
        "Gestión de Incidentes": [
          "Protocolo de respuesta para identificar, contener y resolver incidentes de seguridad",
        ],
      },
    },
    {
      icon: <UserCheck className="h-6 w-6" />,
      title: "4. Derechos del Usuario",
      summary: "Tienes control total sobre tus datos personales.",
      items: [
        "Acceder a tu información personal",
        "Rectificar información incorrecta",
        "Eliminar tu información personal",
        "Gestionar tus preferencias a través de la configuración de la aplicación",
      ],
    },
    {
      icon: <Trash2 className="h-6 w-6" />,
      title: "5. Eliminación de Datos",
      summary: "Respetamos tu privacidad y te ofrecemos la posibilidad de solicitar la eliminación de tus datos personales.",
      description: "En Delivery True Love, respetamos tu privacidad y te ofrecemos la posibilidad de solicitar la eliminación de tus datos personales en cualquier momento. Para hacerlo, puedes enviarnos una solicitud a nuestro correo electrónico soporte@deliverytruelove.com.",
      items: [
        "Proceso de Eliminación: Una vez recibida tu solicitud, procesaremos la eliminación de tus datos en un plazo máximo de 3 días hábiles",
        "Seguridad y Confidencialidad: Durante este proceso, garantizamos la seguridad y confidencialidad de tu información, eliminando todos los datos que no sean necesarios para cumplir con obligaciones legales",
        "Asistencia: Si tienes alguna duda o necesitas asistencia adicional, no dudes en contactarnos a soporte@deliverytruelove.com",
      ],
    },
    {
      icon: <Mail className="h-6 w-6" />,
      title: "6. Cumplimiento Legal y Contacto",
      summary: "Delivery TrueLove cumple con las leyes y regulaciones aplicables en materia de protección de datos.",
      items: [
        "Normativas y Regulaciones: Cumplimiento con leyes de protección de datos",
        "Capacitación Continua: Formación periódica al personal sobre prácticas de seguridad",
        "Privacidad: Protección de la información de usuarios y de la empresa",
      ],
    },
  ];

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

        <div className="container mx-auto px-4 py-16 md:py-20 max-w-6xl">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
              Política de <span className="text-[#D9043D]">Privacidad</span>
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              En Delivery TrueLove, con sede en Huacho, Lima, Perú, valoramos la privacidad de nuestros usuarios y nos comprometemos a proteger su información personal.
            </p>
            <p className="text-sm text-gray-500 mt-3">
              Última actualización: Diciembre 2025
            </p>
          </motion.div>

          {/* Introducción */}
          <motion.div
            className="mb-12 bg-gray-50 rounded-xl p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h2 className="text-xl font-bold text-[#D9043D] mb-3">
              Introducción
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Bienvenido a Delivery TrueLove. Esta Política de Privacidad describe qué datos recopilamos, cómo los usamos y con quién los compartimos cuando utilizas nuestros servicios de delivery. Al usar nuestra plataforma, aceptas las prácticas descritas en esta política. Nos comprometemos a proteger la seguridad de la información de nuestros usuarios y de la empresa.
            </p>
          </motion.div>

          {/* Secciones */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {sections.map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="text-[#D9043D] mt-1">{section.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-2">
                      {section.title}
                    </h3>
                    <p className="text-sm text-gray-600">{section.summary}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedSection(index)}
                  className="w-full mt-4 bg-[#D9043D] hover:bg-red-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
                >
                  Ver detalles
                </button>
              </motion.div>
            ))}
          </div>

          {/* Modal */}
          <AnimatePresence>
            {selectedSection !== null && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/60 z-50"
                  onClick={() => setSelectedSection(null)}
                />
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 30, stiffness: 300 }}
                  className="fixed bottom-0 left-0 right-0 md:inset-0 md:flex md:items-center md:justify-center md:p-4 z-50 pointer-events-none md:pointer-events-auto"
                >
                  <div className="w-full md:w-auto md:max-w-2xl max-h-[85vh] md:max-h-[90vh] bg-white shadow-2xl rounded-t-3xl md:rounded-xl overflow-hidden flex flex-col pointer-events-auto">
                    <div className="bg-[#D9043D] p-4 md:p-5 flex items-center justify-between flex-shrink-0 rounded-t-3xl md:rounded-t-xl">
                      <div className="flex items-center gap-3 text-white">
                        {sections[selectedSection].icon}
                        <h3 className="font-bold text-base md:text-lg">
                          {sections[selectedSection].title}
                        </h3>
                      </div>
                      <button
                        onClick={() => setSelectedSection(null)}
                        className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="overflow-y-auto p-5 md:p-8 flex-1">
                      {sections[selectedSection].description && (
                        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                          <p className="text-gray-700 text-sm leading-relaxed">
                            {sections[selectedSection].description}
                          </p>
                        </div>
                      )}

                      {sections[selectedSection].categories && (
                        <div className="space-y-6">
                          {Object.entries(sections[selectedSection].categories || {}).map(
                            ([category, items], idx) => (
                              <div key={idx}>
                                <h4 className="font-bold text-[#D9043D] mb-3 text-base">
                                  {category}
                                </h4>
                                <ul className="space-y-2.5">
                                  {items.map((item, i) => (
                                    <li key={i} className="flex gap-3 text-gray-700 text-sm leading-relaxed">
                                      <span className="text-[#D9043D] flex-shrink-0 mt-0.5">•</span>
                                      <span>{item}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )
                          )}
                        </div>
                      )}

                      {sections[selectedSection].subsections && (
                        <div className="space-y-6">
                          {Object.entries(sections[selectedSection].subsections || {}).map(
                            ([subsection, items], idx) => (
                              <div key={idx}>
                                <h4 className="font-bold text-[#D9043D] mb-3 text-base">
                                  {subsection}
                                </h4>
                                <ul className="space-y-2.5">
                                  {items.map((item, i) => (
                                    <li key={i} className="flex gap-3 text-gray-700 text-sm leading-relaxed">
                                      <span className="text-[#D9043D] flex-shrink-0 mt-0.5">•</span>
                                      <span>{item}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )
                          )}
                        </div>
                      )}

                      {sections[selectedSection].items && (
                        <ul className="space-y-2.5">
                          {sections[selectedSection].items?.map((item, i) => (
                            <li key={i} className="flex gap-3 text-gray-700 text-sm leading-relaxed">
                              <span className="text-[#D9043D] flex-shrink-0 mt-0.5">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="flex-shrink-0 p-4 md:p-6">
                      <button
                        onClick={() => setSelectedSection(null)}
                        className="w-full bg-[#D9043D] hover:bg-red-700 text-white font-medium py-3.5 rounded-lg transition-colors shadow-lg"
                      >
                        Cerrar
                      </button>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Información Adicional */}
          <motion.div
            className="mb-12 bg-gray-50 rounded-xl p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h2 className="text-xl font-bold text-[#D9043D] mb-4">
              Información Adicional
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Retención de Datos
                </h3>
                <p className="text-gray-700 text-sm">
                  Conservamos tu información personal durante el tiempo necesario para cumplir con los propósitos descritos en esta política, o mientras mantengas una cuenta activa con nosotros.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Capacitación y Concientización
                </h3>
                <p className="text-gray-700 text-sm">
                  Se brinda capacitación periódica al personal sobre prácticas de seguridad de la información para garantizar la protección continua de tus datos.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Alcance de la Política
                </h3>
                <p className="text-gray-700 text-sm">
                  Esta política aplica a todos los usuarios, empleados, colaboradores, contratistas y terceros que tengan acceso a la información de Delivery TrueLove.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Cambios a esta Política
                </h3>
                <p className="text-gray-700 text-sm">
                  Nos reservamos el derecho de actualizar esta Política de Privacidad en cualquier momento. Te notificaremos sobre cambios significativos.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Contacto */}
          <motion.div
            className="mb-12 bg-[#D9043D] text-white rounded-xl p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h2 className="text-2xl font-bold mb-4">
              ¿Preguntas sobre tu Privacidad?
            </h2>
            <p className="mb-4">
              Si tienes preguntas o inquietudes sobre esta política de privacidad, o si deseas ejercer tus derechos de acceso, rectificación o eliminación de datos, contáctanos:
            </p>
            <div className="bg-white/20 rounded-lg p-4">
              <p className="font-semibold mb-2">Email de Soporte:</p>
              <a
                href="mailto:Soporte@deliverytruelove.com"
                className="text-white underline hover:text-gray-100 transition-colors break-all"
              >
                Soporte@deliverytruelove.com
              </a>
            </div>
          </motion.div>

          {/* Configuración de Cookies */}
          <motion.div
            className="mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h2 className="text-2xl font-bold mb-6">
              Configuración de <span className="text-[#D9043D]">Cookies</span>
            </h2>
            <CookieSettings />
          </motion.div>
        </div>

        <Footer />
      </main>
    </>
  );
}
