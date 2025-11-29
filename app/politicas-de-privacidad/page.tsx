"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Lock, Eye, FileText, Mail, UserCheck, X } from "lucide-react";
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
      summary:
        "Recopilamos información personal necesaria para registrar socios y motorizados en nuestra plataforma.",
      socios: [
        "Tipo y número de documento (DNI/RUC)",
        "Nombre completo y apellidos",
        "Tipo de negocio",
        "Número de teléfono",
        "Correo electrónico",
      ],
      motorizados: [
        "Departamento de operación",
        "Tipo de vehículo",
        "Tipo y número de documento",
        "Nombres y apellidos",
        "Número de celular",
        "Correo electrónico",
        "Fotografías del documento de identidad (frente y reverso)",
        "Documentos adicionales del vehículo",
      ],
    },
    {
      icon: <Lock className="h-6 w-6" />,
      title: "2. Finalidad del Uso de los Datos",
      summary:
        "Utilizamos tu información para operar nuestros servicios de entrega y mejorar tu experiencia.",
      items: [
        "Registrar y autenticar usuarios",
        "Procesar y coordinar entregas",
        "Comunicarnos sobre el estado de pedidos",
        "Verificar identidad y documentación",
        "Mejorar nuestros servicios",
        "Personalizar la experiencia del usuario",
      ],
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "3. Protección de Datos",
      summary:
        "Implementamos medidas de seguridad para proteger tu información personal.",
      items: [
        "Encriptación de datos sensibles",
        "Almacenamiento seguro de documentos",
        "Acceso restringido solo para personal autorizado",
        "Protocolos de seguridad técnicos",
        "Monitoreo continuo de seguridad",
      ],
    },
    {
      icon: <Eye className="h-6 w-6" />,
      title: "4. Compartir Información con Terceros",
      summary:
        "Solo compartimos tu información cuando es necesario para operar el servicio.",
      items: [
        "Motorizados asignados a entregas",
        "Servicios necesarios para operar la plataforma",
        "Autoridades legales cuando sea requerido por ley",
      ],
    },
    {
      icon: <UserCheck className="h-6 w-6" />,
      title: "5. Derechos del Usuario",
      summary: "Tienes control total sobre tus datos personales.",
      items: [
        "Acceder a tus datos personales",
        "Corregir información incorrecta",
        "Eliminar tu cuenta y datos asociados",
        "Limitar el uso de tus datos",
        "Retirar tu consentimiento",
      ],
    },
    {
      icon: <Mail className="h-6 w-6" />,
      title: "6. Cookies y Tecnologías",
      summary: "Utilizamos cookies para mejorar tu experiencia de navegación.",
      items: [
        "Mejorar tu experiencia de navegación",
        "Recordar tus preferencias",
        "Analizar el uso de nuestra plataforma",
        "Mostrar contenido personalizado",
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
          {/* Header */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
              Política de <span className="text-[#D9043D]">Privacidad</span>
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              En TRUE LOVE, valoramos la privacidad de nuestros usuarios y nos
              comprometemos a proteger la información personal que recolectamos.
            </p>
            <p className="text-sm text-gray-500 mt-3">
              Última actualización: 29 de noviembre de 2025
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
              Bienvenido a TRUE LOVE. Esta Política de Privacidad describe qué
              datos recopilamos, cómo los usamos y con quién los compartimos
              cuando utilizas nuestros servicios de entrega. Al usar nuestra
              plataforma, aceptas las prácticas descritas en esta política.
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
                  className="fixed bottom-0 left-0 right-0 md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[90%] md:max-w-2xl md:bottom-auto md:right-auto max-h-[85vh] bg-white shadow-2xl z-50 flex flex-col rounded-t-3xl md:rounded-xl overflow-hidden"
                >
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

                  <div className="overflow-y-auto p-5 md:p-6">
                    {sections[selectedSection].socios && (
                      <>
                        <div className="mb-6">
                          <h4 className="font-bold text-[#D9043D] mb-3 flex items-center gap-2">
                            <span>🏪</span> Para Socios/Negocios:
                          </h4>
                          <ul className="space-y-2">
                            {sections[selectedSection].socios?.map(
                              (item, i) => (
                                <li
                                  key={i}
                                  className="flex gap-2 text-gray-700"
                                >
                                  <span className="text-[#D9043D]">•</span>
                                  <span>{item}</span>
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                        <div className="mb-6">
                          <h4 className="font-bold text-[#D9043D] mb-3 flex items-center gap-2">
                            <span>🏍️</span> Para Motorizados:
                          </h4>
                          <ul className="space-y-2">
                            {sections[selectedSection].motorizados?.map(
                              (item, i) => (
                                <li
                                  key={i}
                                  className="flex gap-2 text-gray-700"
                                >
                                  <span className="text-[#D9043D]">•</span>
                                  <span>{item}</span>
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      </>
                    )}

                    {sections[selectedSection].items && (
                      <ul className="space-y-2">
                        {sections[selectedSection].items?.map((item, i) => (
                          <li key={i} className="flex gap-2 text-gray-700">
                            <span className="text-[#D9043D]">•</span>
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
                  Conservamos tu información personal durante el tiempo
                  necesario para cumplir con los propósitos descritos en esta
                  política, o mientras mantengas una cuenta activa con nosotros.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Mayoría de Edad
                </h3>
                <p className="text-gray-700 text-sm">
                  Nuestros servicios están destinados exclusivamente a personas
                  mayores de 18 años.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Cambios a esta Política
                </h3>
                <p className="text-gray-700 text-sm">
                  Nos reservamos el derecho de actualizar esta Política de
                  Privacidad en cualquier momento. Te notificaremos sobre
                  cambios significativos.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Seguridad de Documentos
                </h3>
                <p className="text-gray-700 text-sm">
                  Las fotografías de documentos de identidad y vehículos son
                  almacenadas de forma segura y encriptada.
                </p>
              </div>
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
