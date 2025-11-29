"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, Clock, Send } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SoportePage() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    tipoConsulta: "",
    asunto: "",
    mensaje: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_WEB}/soporte/enviar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: "¡Mensaje enviado!",
          description: "Nos pondremos en contacto contigo en un plazo de 24 horas hábiles.",
        });
        setFormData({
          nombre: "",
          apellido: "",
          email: "",
          telefono: "",
          tipoConsulta: "",
          asunto: "",
          mensaje: "",
        });
      } else {
        toast({
          title: "Error al enviar",
          description: data.message || "Hubo un problema al enviar tu consulta. Por favor, intenta nuevamente.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar con el servidor. Por favor, verifica tu conexión e intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        className="fixed top-0 left-0 right-0 h-1.5 bg-[#D9043D] z-50"
        transition={{ duration: 0.5 }}
      />

      <main className="min-h-screen bg-gradient-to-br from-[#D9043D] via-red-600 to-red-700">
        <Navbar />

        <div className="container mx-auto px-4 py-16 md:py-20">
          {/* Header */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center shadow-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.png" alt="TrueLove Logo" className="w-16 h-16 object-contain" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Contáctanos
            </h1>
            <p className="text-white/90 text-lg">
              Estamos aquí para ayudarte en cada paso
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Información de Contacto */}
            <motion.div
              className="lg:col-span-1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="bg-white rounded-2xl p-8 shadow-xl">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span className="text-3xl">👋</span> ¡Hola!
                </h2>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  Déjanos tus datos y cuéntanos tu inquietud. Te daremos una respuesta en un plazo de hasta{" "}
                  <span className="font-bold text-[#D9043D]">24 horas hábiles</span>. Nuestro equipo de soporte está listo para asistirte con cualquier duda o problema que tengas con la aplicación.
                </p>

                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="w-12 h-12 bg-[#D9043D] rounded-xl flex items-center justify-center flex-shrink-0">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Email</p>
                      <a
                        href="mailto:info@deliverytruelove.com"
                        className="text-[#D9043D] hover:underline font-medium"
                      >
                        info@deliverytruelove.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="w-12 h-12 bg-[#D9043D] rounded-xl flex items-center justify-center flex-shrink-0">
                      <Phone className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Teléfono</p>
                      <a
                        href="tel:+51989815260"
                        className="text-[#D9043D] hover:underline font-medium"
                      >
                        +51 989 815 260
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="w-12 h-12 bg-[#D9043D] rounded-xl flex items-center justify-center flex-shrink-0">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Horario</p>
                      <p className="text-gray-900 font-medium">Lunes a Viernes</p>
                      <p className="text-gray-600 text-sm">9:00 AM - 6:00 PM</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Formulario de Soporte */}
            <motion.div
              className="lg:col-span-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="bg-white rounded-2xl p-8 shadow-xl">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Formulario de Soporte
                </h2>
                <p className="text-gray-600 mb-6">
                  Completa el siguiente formulario y nos pondremos en contacto contigo lo antes posible.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        👤 NOMBRE *
                      </label>
                      <Input
                        type="text"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        placeholder="Tu nombre"
                        required
                        className="bg-gray-50 border-gray-200 focus:ring-[#D9043D] focus:border-[#D9043D]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        👤 APELLIDO *
                      </label>
                      <Input
                        type="text"
                        name="apellido"
                        value={formData.apellido}
                        onChange={handleChange}
                        placeholder="Tu apellido"
                        required
                        className="bg-gray-50 border-gray-200 focus:ring-[#D9043D] focus:border-[#D9043D]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      📧 CORREO ELECTRÓNICO *
                    </label>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="ejemplo@correo.com"
                      required
                      className="bg-gray-50 border-gray-200 focus:ring-[#D9043D] focus:border-[#D9043D]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      📱 TELÉFONO
                    </label>
                    <Input
                      type="tel"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      placeholder="+51 999 999 999"
                      className="bg-gray-50 border-gray-200 focus:ring-[#D9043D] focus:border-[#D9043D]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      📋 TIPO DE CONSULTA *
                    </label>
                    <Select
                      value={formData.tipoConsulta}
                      onValueChange={(value) =>
                        setFormData({ ...formData, tipoConsulta: value })
                      }
                      required
                    >
                      <SelectTrigger className="bg-gray-50 border-gray-200 focus:ring-[#D9043D] focus:border-[#D9043D]">
                        <SelectValue placeholder="Selecciona una opción" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="soporte_tecnico">Soporte Técnico</SelectItem>
                        <SelectItem value="problema_pedido">Problema con Pedido</SelectItem>
                        <SelectItem value="registro">Ayuda con Registro</SelectItem>
                        <SelectItem value="pagos">Consulta sobre Pagos</SelectItem>
                        <SelectItem value="sugerencia">Sugerencia</SelectItem>
                        <SelectItem value="otro">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      📝 ASUNTO *
                    </label>
                    <Input
                      type="text"
                      name="asunto"
                      value={formData.asunto}
                      onChange={handleChange}
                      placeholder="Breve descripción del asunto"
                      required
                      className="bg-gray-50 border-gray-200 focus:ring-[#D9043D] focus:border-[#D9043D]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      💬 ESCRIBE TU MENSAJE *
                    </label>
                    <Textarea
                      name="mensaje"
                      value={formData.mensaje}
                      onChange={handleChange}
                      placeholder="Describe tu consulta o problema con el mayor detalle posible..."
                      required
                      rows={6}
                      className="bg-gray-50 border-gray-200 focus:ring-[#D9043D] focus:border-[#D9043D] resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#D9043D] hover:bg-red-700 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        ENVIAR MENSAJE
                      </>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>

        <Footer />
      </main>
    </>
  );
}
