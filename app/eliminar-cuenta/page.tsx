"use client";

import React, { useState } from "react";
import {
  FaTrash,
  FaCheckCircle,
  FaExclamationTriangle,
  FaHeart,
} from "react-icons/fa";
import { Loader2, ArrowLeft, Shield, Mail, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

type Step = "search" | "form" | "retention" | "verification" | "success";

interface ClienteData {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  documento: string;
}

const EliminarCuentaPage: React.FC = () => {
  const [step, setStep] = useState<Step>("search");
  const [documento, setDocumento] = useState("");
  const [clienteData, setClienteData] = useState<ClienteData | null>(null);
  const [motivo, setMotivo] = useState("");
  const [codigo, setCodigo] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailMasked, setEmailMasked] = useState("");
  const [requestId, setRequestId] = useState("");
  const [deletionRequestId, setDeletionRequestId] = useState<number | null>(null);
  const { toast } = useToast();

  // Paso 1: Buscar cliente por documento
  const handleBuscarCliente = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!documento.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Por favor ingresa tu número de documento",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_WEB}/cliente/buscar-documento`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ documento }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setClienteData(data.data);
        setStep("form");
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description:
            data.message || "No se encontró ningún cliente con ese documento",
        });
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          "Hubo un problema al buscar tu cuenta. Intenta nuevamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Paso 2: Mostrar formulario de motivo y continuar a retención
  const handleContinuarARetencion = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("retention");
  };

  // Paso 3: Solicitar eliminación (enviar código)
  const handleSolicitarEliminacion = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_WEB}/cliente/solicitar-eliminacion`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ documento, motivo: motivo || "No especificado" }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setEmailMasked(data.email);
        setDeletionRequestId(data.deletion_request_id);
        setStep("verification");
        toast({
          title: "Código enviado",
          description: `Hemos enviado un código de verificación a ${data.email}`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: data.message,
        });
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          "Hubo un problema al procesar tu solicitud. Intenta nuevamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Paso 4: Verificar código y crear solicitud (NO elimina aún)
  const handleVerificarCodigo = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!codigo.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Por favor ingresa el código de verificación",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_WEB}/cliente/verificar-codigo-eliminacion`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            deletion_request_id: deletionRequestId,
            codigo,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setRequestId(data.request_id);
        setStep("success");
        toast({
          title: "Código verificado",
          description: "Tu solicitud ha sido registrada exitosamente",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: data.message,
        });
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          "Hubo un problema al verificar el código. Intenta nuevamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <FaTrash className="text-red-600 text-2xl" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              Eliminar Cuenta
            </h1>
            <p className="text-gray-600 max-w-lg mx-auto">
              Lamentamos que te vayas. Tu privacidad es importante para
              nosotros.
            </p>
          </div>

          {/* Card principal con diseño mejorado para PC */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Columna izquierda - Info (solo visible en paso search y form) */}
            {(step === "search" || step === "form") && (
              <div className="hidden lg:block lg:col-span-1 space-y-4">
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-red-600" />
                    Proceso seguro
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Verificaremos tu identidad mediante código enviado a tu
                    correo electrónico registrado.
                  </p>
                  <div className="h-1 bg-gradient-to-r from-red-500 to-red-300 rounded-full"></div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FaExclamationTriangle className="w-5 h-5 text-yellow-600" />
                    Importante
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <X className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                      <span>Esta acción es irreversible</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <X className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                      <span>Perderás tu historial de pedidos</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <X className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                      <span>Se eliminarán tus datos personales</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <X className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                      <span>No podrás recuperar tu cuenta</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* Columna principal */}
            <div
              className={
                step === "search" || step === "form"
                  ? "lg:col-span-2"
                  : "lg:col-span-3"
              }
            >
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                {/* Paso 1: Buscar cliente */}
                {step === "search" && (
                  <div className="p-6 sm:p-10">
                    <div className="mb-8">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold">
                          1
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">
                          Buscar tu cuenta
                        </h2>
                      </div>
                      <p className="text-sm text-gray-600 ml-11">
                        Ingresa tu número de documento para localizar tu cuenta
                      </p>
                    </div>

                    <form onSubmit={handleBuscarCliente} className="space-y-6">
                      <div>
                        <label
                          htmlFor="documento"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Número de Documento
                        </label>
                        <Input
                          type="text"
                          name="documento"
                          id="documento"
                          value={documento}
                          onChange={(e) => setDocumento(e.target.value)}
                          placeholder="DNI, CE o Pasaporte"
                          maxLength={20}
                          className="h-12 text-base"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition duration-200 font-medium text-base"
                      >
                        {isLoading ? (
                          <Loader2 className="animate-spin h-5 w-5 mx-auto" />
                        ) : (
                          "Continuar"
                        )}
                      </button>
                    </form>

                    {/* Info boxes para móvil */}
                    <div className="mt-8 space-y-3 lg:hidden">
                      <div className="flex gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-blue-900">
                            Proceso seguro
                          </p>
                          <p className="text-sm text-blue-700">
                            Verificaremos tu identidad mediante código de email
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <FaExclamationTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-yellow-900">
                            Acción irreversible
                          </p>
                          <p className="text-sm text-yellow-700">
                            Una vez eliminada, no podrás recuperar tu cuenta
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Paso 2: Formulario de motivo */}
                {step === "form" && clienteData && (
                  <div className="p-6 sm:p-10">
                    <button
                      onClick={() => {
                        setStep("search");
                        setClienteData(null);
                        setMotivo("");
                      }}
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span className="text-sm font-medium">Volver</span>
                    </button>

                    <div className="mb-8">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold">
                          2
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">
                          Confirmar datos
                        </h2>
                      </div>
                    </div>

                    <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-600 mb-1">
                        Nombre completo
                      </p>
                      <p className="font-medium text-gray-900">
                        {clienteData.nombre} {clienteData.apellido}
                      </p>
                      <p className="text-sm text-gray-600 mt-3 mb-1">
                        Correo electrónico
                      </p>
                      <p className="font-medium text-gray-900">
                        {clienteData.email}
                      </p>
                      <p className="text-sm text-gray-600 mt-3 mb-1">
                        Documento
                      </p>
                      <p className="font-medium text-gray-900">
                        {clienteData.documento}
                      </p>
                    </div>

                    <form
                      onSubmit={handleContinuarARetencion}
                      className="space-y-6"
                    >
                      <div>
                        <label
                          htmlFor="motivo"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          ¿Por qué deseas eliminar tu cuenta? (opcional)
                        </label>
                        <textarea
                          name="motivo"
                          id="motivo"
                          value={motivo}
                          onChange={(e) => setMotivo(e.target.value)}
                          placeholder="Tu opinión nos ayuda a mejorar..."
                          rows={4}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition duration-200 font-medium text-base"
                      >
                        Continuar
                      </button>
                    </form>
                  </div>
                )}

                {/* Paso 3: Retención - ¡No canceles aún! (Modal) */}
                {step === "retention" && (
                  <>
                    {/* Overlay */}
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />

                    {/* Modal */}
                    <div className="fixed inset-0 z-50 overflow-y-auto">
                      <div className="flex min-h-full items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 relative">
                          {/* Header */}
                          <div className="text-center mb-6">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                              <FaHeart className="text-red-600 text-2xl" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                              ¡No canceles aún!
                            </h2>
                            <p className="text-gray-600 text-sm">
                              Tenemos multitud de beneficios para ti
                            </p>
                          </div>

                          {/* Advertencia principal */}
                          <div className="bg-gray-50 rounded-xl p-5 mb-6">
                            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                              <FaExclamationTriangle className="text-red-600" />
                              Recuerda, la eliminación de cuenta es irreversible
                            </h3>
                            <p className="text-sm text-gray-700 mb-3">
                              Al eliminar tu cuenta perderás:
                            </p>
                            <ul className="space-y-2">
                              <li className="flex items-start gap-2 text-sm text-gray-600">
                                <X className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                                <span>Tu historial de pedidos, productos favoritos e información</span>
                              </li>
                              <li className="flex items-start gap-2 text-sm text-gray-600">
                                <X className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                                <span>Acceso a promociones y descuentos exclusivos</span>
                              </li>
                              <li className="flex items-start gap-2 text-sm text-gray-600">
                                <X className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                                <span>Todos tus datos personales y direcciones guardadas</span>
                              </li>
                            </ul>
                          </div>

                          {/* Alternativa */}
                          <div className="bg-blue-50 rounded-xl p-5 mb-6 border border-blue-100">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-white text-sm font-bold">💡</span>
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900 mb-1 text-sm">
                                  Alternativa
                                </h3>
                                <p className="text-sm text-gray-700">
                                  Si no deseas borrar tus datos de manera permanente, puedes
                                  cerrar la aplicación y desinstalarla. Tu cuenta seguirá aquí
                                  cuando decidas regresar.
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Botones apilados */}
                          <div className="space-y-3">
                            <button
                              onClick={() => (window.location.href = "/")}
                              className="w-full bg-green-600 text-white py-3.5 px-6 rounded-xl hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-200 font-semibold shadow-lg"
                            >
                              Mantener mi Cuenta
                            </button>

                            <button
                              onClick={handleSolicitarEliminacion}
                              disabled={isLoading}
                              className="w-full bg-white text-gray-700 py-3 px-6 rounded-xl hover:bg-gray-50 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition duration-200 font-medium"
                            >
                              {isLoading ? (
                                <Loader2 className="animate-spin h-5 w-5 mx-auto text-gray-600" />
                              ) : (
                                "Sí, deseo eliminar mi cuenta"
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Paso 4: Verificación */}
                {step === "verification" && (
                  <div className="p-6 sm:p-10 max-w-2xl mx-auto">
                    <button
                      onClick={() => {
                        setStep("retention");
                        setCodigo("");
                      }}
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span className="text-sm font-medium">Volver</span>
                    </button>

                    <div className="mb-8">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold">
                          3
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">
                          Verificar tu identidad
                        </h2>
                      </div>
                      <p className="text-sm text-gray-600 ml-11">
                        Ingresa el código de 6 caracteres enviado a {emailMasked}
                      </p>
                    </div>

                    <div className="mb-6 flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <Mail className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <p className="text-sm text-blue-800">
                        Revisa tu bandeja de entrada y spam. El código expira en
                        15 minutos.
                      </p>
                    </div>

                    <form onSubmit={handleVerificarCodigo} className="space-y-6">
                      <div>
                        <label
                          htmlFor="codigo"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Código de verificación
                        </label>
                        <Input
                          type="text"
                          name="codigo"
                          id="codigo"
                          value={codigo}
                          onChange={(e) =>
                            setCodigo(e.target.value.toUpperCase())
                          }
                          placeholder="ABC123"
                          maxLength={6}
                          className="text-center text-2xl tracking-[0.5em] font-bold h-16 uppercase"
                        />
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-800 font-medium">
                          ℹ️ Verificación final
                        </p>
                        <p className="text-sm text-blue-700 mt-1">
                          Tu solicitud será revisada por nuestro equipo en un plazo de 24 a 72 horas.
                        </p>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition duration-200 font-medium text-base"
                      >
                        {isLoading ? (
                          <Loader2 className="animate-spin h-5 w-5 mx-auto" />
                        ) : (
                          "Verificar y Enviar Solicitud"
                        )}
                      </button>
                    </form>
                  </div>
                )}

                {/* Paso 5: Solicitud Enviada (tipo Rappi) */}
                {step === "success" && (
                  <div className="p-6 sm:p-10 text-center max-w-2xl mx-auto">
                    <div className="mb-6">
                      <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                        <FaCheckCircle className="text-green-600 text-4xl" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Solicitud Recibida
                      </h2>
                      <p className="text-gray-600 max-w-md mx-auto mb-4">
                        Hemos recibido tu solicitud de eliminación de cuenta.
                      </p>

                      {/* ID de Ticket */}
                      <div className="bg-gray-50 rounded-lg p-4 mb-6 border-2 border-gray-200">
                        <p className="text-sm text-gray-600 mb-1">
                          ID de Solicitud:
                        </p>
                        <p className="text-xl font-bold text-red-600">
                          {requestId}
                        </p>
                      </div>
                    </div>

                    {/* Información del proceso */}
                    <div className="bg-blue-50 rounded-lg p-6 mb-6 text-left border border-blue-200">
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-blue-600" />
                        ¿Qué sigue?
                      </h3>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 font-bold">1.</span>
                          <span>Nuestro equipo revisará tu solicitud en un plazo de <strong>24 a 72 horas</strong>.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 font-bold">2.</span>
                          <span>Recibirás un correo electrónico cuando tu cuenta sea eliminada.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 font-bold">3.</span>
                          <span>Si tienes alguna duda, contáctanos a través de nuestro Centro de ayuda.</span>
                        </li>
                      </ul>
                    </div>

                    {/* Agradecimiento */}
                    <div className="p-4 bg-gray-50 rounded-lg mb-6">
                      <p className="text-sm text-gray-700">
                        ¡Gracias por tu paciencia y comprensión!
                      </p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">
                        Equipo TRUE LOVE
                      </p>
                    </div>

                    <Link
                      href="/"
                      className="inline-flex items-center justify-center bg-red-600 text-white py-3 px-8 rounded-lg hover:bg-red-700 transition duration-200 font-medium"
                    >
                      Volver al Inicio
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer info */}
          {step !== "success" && (
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500">
                ¿Necesitas ayuda?{" "}
                <a
                  href="/soporte"
                  className="text-red-600 hover:text-red-700 font-medium"
                >
                  Contáctanos
                </a>
              </p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default EliminarCuentaPage;
