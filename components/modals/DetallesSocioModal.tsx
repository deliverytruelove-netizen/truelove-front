// components\modals\DetallesSocioModal.tsx
"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import type {
  DetallesSocio,
} from "@/app/admin/socios/types/Socios.types";
import { Button } from "@/components/ui/button";
import {
  User,
  Briefcase,
  MapPin,
  CreditCard,
  Mail,
  Phone,
  Calendar,
  Building,
  FileText,
  FileCheck,
  CheckCircle,
  SquareTerminal,
  X,
  Coins,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import NextImage from "next/image";
import { PDFViewer } from "../PDFViewer";
import { verPeriodosDeSocio, obtenerEstadoPagosSocio, calcularPeriodo, type EstadoPagosSocio } from "@/app/admin/cuotas-socios/services/cuota-admin.service";
import type { Periodo } from "@/app/socio/admin/cuotas/types/pago-cuota.types";
import EditarDiaPagoModal from "./EditarDiaPagoModal";
import AsignarCuotaModal from "./AsignarCuotaModal";

interface DetallesSocioModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: DetallesSocio | undefined | null;
  onAprobar: (id: number) => void;
}

interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}

const InfoItem = ({ icon, label, value }: InfoItemProps) => (
  <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 rounded-lg">
    <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs sm:text-sm text-gray-500">{label}</p>
      <p className="text-xs sm:text-sm font-medium truncate">{value}</p>
    </div>
  </div>
);

const TabButton = ({
  isActive,
  icon,
  label,
  onClick,
}: {
  isActive: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-lg transition-all text-xs sm:text-sm ${
      isActive
        ? "bg-white shadow-md text-red-600"
        : "hover:bg-white/50 text-gray-600"
    }`}
  >
    <span className="shrink-0">{icon}</span>
    <span className="truncate">{label}</span>
  </button>
);

// Función para determinar si un archivo es un PDF basado en su extensión
const isPdfFile = (url: string): boolean => {
  return url.toLowerCase().endsWith(".pdf");
};

// Función para formatear el tipo de documento
const formatDocumentType = (type: string): string => {
  switch (type) {
    case "DNI":
      return "DNI";
    case "CARNET_EXTRANJERIA":
      return "Carnet de Extranjería";
    case "PASAPORTE":
      return "Pasaporte";
    default:
      return type;
  }
};

// Añadir esta función después de las funciones existentes y antes del componente principal
const useAnimatedUnmount = (show: boolean, duration = 300) => {
  const [shouldRender, setShouldRender] = useState(show);
  const [isLeaving, setIsLeaving] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (show) {
      setShouldRender(true);
      setIsLeaving(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    } else {
      setIsLeaving(true);
      timeoutRef.current = setTimeout(() => {
        setShouldRender(false);
        timeoutRef.current = null;
      }, duration);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [show, duration]);

  return { shouldRender, isLeaving };
};

export function DetallesSocioModal({
  isOpen,
  onClose,
  data,
  onAprobar,
}: DetallesSocioModalProps) {
  const [activeTab, setActiveTab] = useState<
    | "personal"
    | "negocio"
    | "establecimiento"
    | "bancarios"
    | "cuenta_bancaria"
    | "documentos"
    | "cuotas"
  >("personal");
  const [error, setError] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAprobado, setIsAprobado] = useState<boolean>(false);
  const [showNotification, setShowNotification] = useState<boolean>(false);
  const [periodos, setPeriodos] = useState<Periodo[]>([]);
  const [estadoPagos, setEstadoPagos] = useState<EstadoPagosSocio | null>(null);
  const [loadingCuotas, setLoadingCuotas] = useState(false);
  const [showEditarDiaPagoModal, setShowEditarDiaPagoModal] = useState(false);
  const [showCambiarCuotaModal, setShowCambiarCuotaModal] = useState(false);
  const { shouldRender: renderNotification, isLeaving: isNotificationLeaving } =
    useAnimatedUnmount(showNotification, 300);

  // Actualizar el estado local de aprobación cuando cambian los datos
  useEffect(() => {
    if (data) {
      console.log("Estado de aprobación del socio:", data.aprobado);
      const aprobadoStatus = Boolean(data.aprobado);
      setIsAprobado(aprobadoStatus);

      // Cargar estado de pagos si está aprobado
      if (aprobadoStatus && data.id) {
        cargarEstadoPagos(data.id);
      } else {
        setShowNotification(false);
      }
    }
  }, [data]);

  // Cargar períodos y estado de pagos
  const cargarEstadoPagos = async (socioId: number) => {
    try {
      const estado = await obtenerEstadoPagosSocio(socioId);
      setEstadoPagos(estado);
      setShowNotification(true);
    } catch (error) {
      console.error("Error al cargar estado de pagos:", error);
      setEstadoPagos(null);
      setShowNotification(false);
    }
  };

  // Cargar períodos cuando se cambia al tab de cuotas
  useEffect(() => {
    if (activeTab === "cuotas" && data?.id && data.personal?.cuota_socio_id) {
      const cargarPeriodos = async () => {
        setLoadingCuotas(true);
        try {
          const periodosData = await verPeriodosDeSocio(data.id);
          setPeriodos(periodosData);
        } catch (error) {
          console.error("Error al cargar períodos:", error);
        } finally {
          setLoadingCuotas(false);
        }
      };
      cargarPeriodos();
    }
  }, [activeTab, data?.id, data?.personal?.cuota_socio_id]);

  // Resetear el tab activo cuando cambia el socio
  useEffect(() => {
    if (isOpen) {
      setActiveTab("personal");
    }
  }, [isOpen, data?.id]);

  // Bloquear el scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  const { shouldRender, isLeaving } = useAnimatedUnmount(isOpen);

  if (!shouldRender || !data) return null;

  const handleAprobar = () => {
    if (!data.id) {
      setError("Error: ID de socio no encontrado");
      return;
    }
    onAprobar(data.id);
    // Actualizar el estado local inmediatamente para reflejar el cambio en la UI
    setIsAprobado(true);
    setShowNotification(true);
    onClose();
  };

  const handleCloseError = () => {
    setError(null);
  };

  const handleCloseNotification = () => {
    setShowNotification(false);
  };

  const handleImageClick = (imageSrc: string) => {
    // Solo permitir ampliar imágenes, no PDFs
    if (!isPdfFile(imageSrc)) {
      setSelectedImage(imageSrc);
      setShowImageModal(true);
    }
  };
  const formatPosType = (posValue: number): string => {
    switch (posValue) {
      case 0:
        return "No facilita POS";
      case 1:
        return "POS Estilos";
      case 2:
        return "POS Visa";
      default:
        return "No especificado";
    }
  };

  const formatDocumentSale = (value: number): string => {
    switch (value) {
      case 0:
        return "No emite documentos de venta";
      case 1:
        return "Sí emite documentos de venta";
      default:
        return "No especificado";
    }
  };

  const formatTipoPagoDigital = (tipo?: number) => {
    switch (tipo) {
      case 1:
        return "Yape";
      case 2:
        return "Plin";
      default:
        return "No especificado";
    }
  };


  const renderContent = () => {
    switch (activeTab) {
      case "personal":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.documentType && data.documentNumber && (
              <InfoItem
                icon={<FileCheck className="w-5 h-5" />}
                label="Documento"
                value={`${formatDocumentType(data.documentType)}: ${
                  data.documentNumber
                }`}
              />
            )}
            {data.personal && (
              <>
                <InfoItem
                  icon={<User className="w-5 h-5" />}
                  label="Nombre Completo"
                  value={`${data.personal.name || ""} ${
                    data.personal.lastName || ""
                  }`}
                />
                <InfoItem
                  icon={<Mail className="w-5 h-5" />}
                  label="Correo Electrónico"
                  value={data.personal.email || ""}
                />
                <InfoItem
                  icon={<Phone className="w-5 h-5" />}
                  label="Teléfono"
                  value={data.personal.phone || ""}
                />
                <InfoItem
                  icon={<Building className="w-5 h-5" />}
                  label="Tipo de Negocio"
                  value={data.personal.businessType || ""}
                />
                {data.personal.created_at && (
                  <InfoItem
                    icon={<Calendar className="w-5 h-5" />}
                    label="Fecha de Registro"
                    value={new Date(data.personal.created_at).toLocaleString()}
                  />
                )}
                <InfoItem
                  icon={<SquareTerminal className="w-5 h-5" />}
                  label="POS"
                  value={formatPosType(data.personal.posToDriver)}
                />
                <InfoItem
                  icon={<FileText className="w-5 h-5" />}
                  label="Emite documentos de venta (facturas/boletas)"
                  value={formatDocumentSale(
                    data.personal.entrega_documento_venta
                  )}
                />
              </>
            )}
          </div>
        );
      case "negocio":
        return data.business ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoItem
              icon={<Building className="w-5 h-5" />}
              label="Nombre del Negocio"
              value={data.business.nombre || ""}
            />
            <InfoItem
              icon={<Building className="w-5 h-5" />}
              label="Total Sucursales"
              value={(data.business.total_sucursales || 0).toString()}
            />
            <InfoItem
              icon={<Phone className="w-5 h-5" />}
              label="Método de Contacto"
              value={data.business.metodo_contacto || ""}
            />
            <InfoItem
              icon={<Phone className="w-5 h-5" />}
              label="Teléfono del Negocio"
              value={data.business.telefono || ""}
            />
            <InfoItem
              icon={<CreditCard className="w-5 h-5" />}
              label="Método de Pago Digital"
              value={formatTipoPagoDigital(data.business.tipo_pago_digital)}
            />
            {data.business.tipo_pago_digital !== 0 &&
              data.business.numero_pago_digital && (
                <InfoItem
                  icon={<Phone className="w-5 h-5" />}
                  label="Número de Pago Digital"
                  value={data.business.numero_pago_digital}
                />
              )}
            {data.business.tipo_pago_digital !== 0 &&
              data.business.nombre_titular_pago_digital && (
                <InfoItem
                  icon={<User className="w-5 h-5" />}
                  label="Nombre del Titular (yape/plin)"
                  value={data.business.nombre_titular_pago_digital}
                />
              )}
            {data.businessData && (
              <>
                <InfoItem
                  icon={<Briefcase className="w-5 h-5" />}
                  label="RUC"
                  value={data.businessData.ruc || ""}
                />
                <InfoItem
                  icon={<Briefcase className="w-5 h-5" />}
                  label="Razón Social"
                  value={data.businessData.razon_social || ""}
                />
              </>
            )}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">
            No hay datos del negocio disponibles
          </p>
        );

      case "establecimiento":
        return data.establishment ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoItem
              icon={<Building className="w-5 h-5" />}
              label="Nombre del Establecimiento"
              value={data.establishment.nombre_establecimiento || ""}
            />
            <InfoItem
              icon={<MapPin className="w-5 h-5" />}
              label="Dirección"
              value={data.establishment.direccion_completa || ""}
            />
            <InfoItem
              icon={<MapPin className="w-5 h-5" />}
              label="Ciudad"
              value={data.establishment.ciudad || ""}
            />
            <InfoItem
              icon={<MapPin className="w-5 h-5" />}
              label="Código Postal"
              value={data.establishment.codigo_postal || ""}
            />
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">
            No hay datos del establecimiento disponibles
          </p>
        );
      case "bancarios":
        return data.bankData ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoItem
              icon={<User className="w-5 h-5" />}
              label="Titular de la Cuenta"
              value={data.bankData.titular_cuenta || ""}
            />
            <InfoItem
              icon={<CreditCard className="w-5 h-5" />}
              label="Número de Cuenta"
              value={data.bankData.numero_cuenta || ""}
            />
            <InfoItem
              icon={<Building className="w-5 h-5" />}
              label="Banco"
              value={data.bankData.nombre_banco || ""}
            />
            <InfoItem
              icon={<CreditCard className="w-5 h-5" />}
              label="Tipo de Cuenta"
              value={data.bankData.tipo_cuenta || ""}
            />
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">
            No hay datos bancarios disponibles
          </p>
        );
      case "cuenta_bancaria":
        return data.cuentaBancaria ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoItem
                icon={<User className="w-5 h-5" />}
                label="Titular de la Cuenta"
                value={data.cuentaBancaria.titular_cuenta || ""}
              />
              <InfoItem
                icon={<CreditCard className="w-5 h-5" />}
                label="DNI"
                value={data.cuentaBancaria.dni || ""}
              />
              <InfoItem
                icon={<Building className="w-5 h-5" />}
                label="Banco"
                value={data.cuentaBancaria.banco || ""}
              />
              <InfoItem
                icon={<CreditCard className="w-5 h-5" />}
                label="Tipo de Cuenta"
                value={data.cuentaBancaria.tipo_cuenta || ""}
              />
              <InfoItem
                icon={<CreditCard className="w-5 h-5" />}
                label="Número de Cuenta"
                value={data.cuentaBancaria.numero_cuenta || ""}
              />
            </div>
            {data.cuentaBancaria.imagenes_cuenta &&
              data.cuentaBancaria.imagenes_cuenta.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-center">
                    Imágenes de la Cuenta
                  </h3>
                  <div className="flex flex-col items-center">
                    {data.cuentaBancaria.imagenes_cuenta.map(
                      (imagen, index) => {
                        // Verificar si es un PDF o una imagen
                        if (isPdfFile(imagen)) {
                          return (
                            <div
                              key={index}
                              className="w-full max-w-3xl mx-auto"
                            >
                              <PDFViewer
                                url={`/storage/${imagen}`}
                                title="Documento Bancario"
                              />
                            </div>
                          );
                        } else {
                          return (
                            <div
                              key={index}
                              className="relative aspect-square w-full max-w-md mx-auto cursor-pointer mb-4"
                              onClick={() => handleImageClick(imagen)}
                            >
                              <NextImage
                                src={`/storage/${imagen}`}
                                alt={`Imagen de cuenta bancaria ${index + 1}`}
                                width={800}
                                height={600}
                                className="object-cover rounded-lg"
                              />
                            </div>
                          );
                        }
                      }
                    )}
                  </div>
                </div>
              )}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">
            No hay datos de la cuenta bancaria disponibles
          </p>
        );
      case "cuotas":
        if (!data.personal?.cuota_socio_id) {
          return (
            <div className="flex flex-col items-center justify-center py-12">
              <Coins className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-500 text-center">
                Este socio no tiene una cuota asignada
              </p>
            </div>
          );
        }

        if (loadingCuotas) {
          return (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
          );
        }

        const formatFecha = (fecha: string) => {
          // Parsear la fecha como fecha local, no UTC
          const [year, month, day] = fecha.split('T')[0].split('-');
          const dateLocal = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          return dateLocal.toLocaleDateString("es-PE", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });
        };

        const getEstadoBadge = (estado: string) => {
          switch (estado) {
            case "pendiente":
              return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "vencido":
              return "bg-red-100 text-red-800 border-red-200";
            case "pagado":
              return "bg-green-100 text-green-800 border-green-200";
            default:
              return "bg-gray-100 text-gray-800 border-gray-200";
          }
        };

        return (
          <div className="space-y-4">
            {/* Información de la cuota y día de pago */}
            {estadoPagos?.cuota && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Coins className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 shrink-0" />
                    <div className="min-w-0">
                      <h3 className="font-semibold text-blue-900 text-sm sm:text-base">Información de Cuota</h3>
                      <p className="text-xs sm:text-sm text-blue-700">
                        {estadoPagos.cuota.periodicidad.charAt(0).toUpperCase() + estadoPagos.cuota.periodicidad.slice(1)} -{" "}
                        {estadoPagos.cuota.tipo_cuota === "porcentaje" ? (
                          <span className="text-purple-600 font-semibold">
                            {Number(estadoPagos.cuota.porcentaje_comision || 0).toFixed(2)}% comisión
                            {estadoPagos.cuota.minimo_pedidos && ` (Mín. ${estadoPagos.cuota.minimo_pedidos} ped.)`}
                          </span>
                        ) : (
                          `S/ ${Number(estadoPagos.cuota.monto_cuota).toFixed(2)}`
                        )}
                      </p>
                      {estadoPagos.cuota.tipo_cuota === "porcentaje" ? (
                        <p className="text-xs sm:text-sm text-blue-700 font-medium">
                          <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 inline mr-1" />
                          Vencimiento: al fin de cada periodo
                        </p>
                      ) : estadoPagos.cuota.dia_pago ? (
                        <p className="text-xs sm:text-sm text-blue-700 font-medium">
                          <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 inline mr-1" />
                          Día de pago: {(() => {
                            const diaPago = estadoPagos.cuota.dia_pago
                            const periodicidad = estadoPagos.cuota.periodicidad

                            switch (periodicidad) {
                              case "semanal":
                                const diasSemana = ["", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
                                return `${diasSemana[diaPago]} de cada semana`

                              case "quincenal":
                                return `Día ${diaPago} de cada quincena`

                              case "mensual":
                              case "diario":
                              default:
                                return `${diaPago} de cada mes`
                            }
                          })()}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  {estadoPagos.cuota.tipo_cuota === "porcentaje" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowCambiarCuotaModal(true)}
                      className="text-purple-600 border-purple-300 hover:bg-purple-50 shrink-0 text-xs sm:text-sm"
                    >
                      <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      <span className="sm:hidden">Cambiar</span>
                      <span className="hidden sm:inline">Cambiar Cuota</span>
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowEditarDiaPagoModal(true)}
                      className="text-blue-600 border-blue-300 hover:bg-blue-50 shrink-0 text-xs sm:text-sm"
                    >
                      <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      <span className="sm:hidden">Editar</span>
                      <span className="hidden sm:inline">Editar Día de Pago</span>
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Resumen */}
            {estadoPagos && (() => {
              // Para porcentaje: solo contar períodos que ya iniciaron
              const esPorcentaje = estadoPagos.cuota?.tipo_cuota === "porcentaje"
              let pagados = estadoPagos.periodos_pagados
              let pendientes = estadoPagos.periodos_pendientes
              let vencidos = estadoPagos.periodos_vencidos

              if (esPorcentaje && periodos.length > 0) {
                const hoy = new Date(); hoy.setHours(0, 0, 0, 0)
                const periodosIniciados = periodos.filter(p => {
                  const inicio = new Date(p.periodo_inicio); inicio.setHours(0, 0, 0, 0)
                  return inicio <= hoy
                })
                pagados = periodosIniciados.filter(p => p.estado === "pagado").length
                pendientes = periodosIniciados.filter(p => p.estado === "pendiente").length
                vencidos = periodosIniciados.filter(p => p.estado === "vencido").length
              }

              return (
                <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-2 sm:p-4">
                    <div className="flex items-center gap-1 sm:gap-2 mb-1">
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 shrink-0" />
                      <span className="text-xs sm:text-sm font-medium text-green-900">Pagados</span>
                    </div>
                    <p className="text-xl sm:text-2xl font-bold text-green-700">{pagados}</p>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 sm:p-4">
                    <div className="flex items-center gap-1 sm:gap-2 mb-1">
                      <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 shrink-0" />
                      <span className="text-xs sm:text-sm font-medium text-yellow-900 truncate">{esPorcentaje ? "Por cobrar" : "Pendientes"}</span>
                    </div>
                    <p className="text-xl sm:text-2xl font-bold text-yellow-700">{pendientes}</p>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-2 sm:p-4">
                    <div className="flex items-center gap-1 sm:gap-2 mb-1">
                      <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 shrink-0" />
                      <span className="text-xs sm:text-sm font-medium text-red-900">Vencidos</span>
                    </div>
                    <p className="text-xl sm:text-2xl font-bold text-red-700">{vencidos}</p>
                  </div>
                </div>
              )
            })()}

            {/* Lista de períodos */}
            <div>
              <h3 className="text-sm sm:text-lg font-semibold mb-3 sm:mb-4">
                {estadoPagos?.cuota ?
                  estadoPagos.cuota.tipo_cuota === "porcentaje"
                    ? "Historial de Comisiones"
                    : `Períodos ${estadoPagos.cuota.periodicidad.charAt(0).toUpperCase() + estadoPagos.cuota.periodicidad.slice(1)}es`
                  : 'Períodos de Pago'
                }
              </h3>
              <div className="space-y-2 sm:space-y-3 max-h-96 overflow-y-auto">
                {periodos
                  .filter((periodo) => {
                    if (estadoPagos?.cuota?.tipo_cuota === "porcentaje") {
                      const hoy = new Date()
                      hoy.setHours(0, 0, 0, 0)
                      const inicio = new Date(periodo.periodo_inicio)
                      inicio.setHours(0, 0, 0, 0)
                      const tieneActividad = periodo.estado !== "pendiente" || periodo.fecha_calculo || Number(periodo.total_ventas || 0) > 0 || Number(periodo.monto_esperado || 0) > 0
                      return inicio <= hoy || tieneActividad
                    }
                    return true
                  })
                  .sort((a, b) => a.numero_periodo - b.numero_periodo)
                  .map((periodo) => (
                  <div
                    key={periodo.id}
                    className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow"
                  >
                    {/* Header: número + badge estado */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                          <span className="text-gray-700 font-bold text-xs sm:text-sm">#{periodo.numero_periodo}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 text-sm">Período {periodo.numero_periodo}</p>
                          <p className="text-xs sm:text-sm text-gray-600">
                            {formatFecha(periodo.periodo_inicio)} - {formatFecha(periodo.periodo_fin)}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium border capitalize shrink-0 ${getEstadoBadge(
                          periodo.estado
                        )}`}
                      >
                        {periodo.estado}
                      </span>
                    </div>
                    {/* Monto + detalles */}
                    <div className="flex items-end justify-between gap-2 pl-10 sm:pl-12">
                      <div className="text-sm">
                        <p className="text-base sm:text-lg font-bold text-gray-900">
                          S/ {Number(periodo.monto_esperado).toFixed(2)}
                        </p>
                      </div>
                      {estadoPagos?.cuota?.tipo_cuota === "porcentaje" && (
                        <div className="text-xs text-gray-600 text-right space-y-0.5">
                          <div>Ventas: S/ {Number(periodo.total_ventas || 0).toFixed(2)}</div>
                          <div>Pedidos: {periodo.cantidad_pedidos || 0}</div>
                          {Number(periodo.total_ventas || 0) > 0 && estadoPagos?.cuota?.porcentaje_comision && (
                            <div className="text-purple-600 font-medium">
                              {Number(estadoPagos.cuota.porcentaje_comision)}%: S/ {(Number(periodo.total_ventas || 0) * Number(estadoPagos.cuota.porcentaje_comision) / 100).toFixed(2)}
                            </div>
                          )}
                          {periodo.fecha_calculo ? (
                            <div className="text-green-600 flex items-center gap-1 justify-end">
                              ✓ Calculado
                              <button
                                type="button"
                                title="Recalcular"
                                className="ml-1 p-0.5 hover:bg-gray-100 rounded transition-colors"
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  try {
                                    await calcularPeriodo(periodo.id);
                                    if (data?.id) {
                                      const periodosData = await verPeriodosDeSocio(data.id);
                                      setPeriodos(periodosData);
                                      cargarEstadoPagos(data.id);
                                    }
                                  } catch (err) {
                                    console.error("Error al recalcular:", err);
                                  }
                                }}
                              >
                                <RefreshCw className="w-3 h-3 text-gray-400 hover:text-gray-600" />
                              </button>
                            </div>
                          ) : (
                            <div className="text-yellow-600">⚠ Sin calcular</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {/* Mensaje si no hay períodos visibles para porcentaje */}
                {estadoPagos?.cuota?.tipo_cuota === "porcentaje" && periodos.filter((p) => {
                  const hoy = new Date(); hoy.setHours(0,0,0,0)
                  const inicio = new Date(p.periodo_inicio); inicio.setHours(0,0,0,0)
                  const tieneActividad = p.estado !== "pendiente" || p.fecha_calculo || Number(p.total_ventas || 0) > 0 || Number(p.monto_esperado || 0) > 0
                  return inicio <= hoy || tieneActividad
                }).length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                    <Coins className="w-12 h-12 mb-3" />
                    <p className="text-sm font-medium text-gray-500">Sin períodos activos aún</p>
                    <p className="text-xs mt-1 text-center max-w-xs">
                      {periodos.length > 0
                        ? `El primer período inicia el ${formatFecha(periodos.sort((a, b) => a.numero_periodo - b.numero_periodo)[0].periodo_inicio)}. Las comisiones se calcularán automáticamente.`
                        : "Los períodos aparecerán conforme avancen las fechas de cobro."
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {/* Modal principal */}
      {isOpen && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-opacity duration-300 ${
            isLeaving ? "opacity-0" : "opacity-100"
          }`}
        >
          <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] mx-2 sm:mx-4 flex flex-col relative">
            {/* Encabezado fijo */}
            <div className="bg-gradient-to-r from-red-500 to-rose-600 text-white p-4 sm:p-6 rounded-t-lg">
              <h2 className="text-lg sm:text-2xl font-bold">Detalles del Socio</h2>
            </div>

            {/* Notificación de estado - Posicionada en la esquina superior derecha con animaciones */}
            {isAprobado && renderNotification && (
              <div
                className={`absolute z-[60] top-2 right-2 sm:top-8 sm:right-6 max-w-[calc(100%-1rem)] sm:max-w-md w-auto ${
                  estadoPagos?.esta_al_dia
                    ? "bg-green-50 border-green-200"
                    : (estadoPagos?.periodos_vencidos ?? 0) > 0
                    ? "bg-red-50 border-red-200"
                    : estadoPagos?.cuota?.tipo_cuota === "porcentaje"
                    ? "bg-blue-50 border-blue-200"
                    : (estadoPagos?.periodos_pendientes ?? 0) > 0
                    ? "bg-yellow-50 border-yellow-200"
                    : "bg-blue-50 border-blue-200"
                } border shadow-lg rounded-md p-3 flex items-center transition-all duration-300 ${
                  isNotificationLeaving
                    ? "opacity-0 translate-y-[-10px]"
                    : "opacity-100 translate-y-0"
                }`}
              >
                <div
                  className={`${
                    estadoPagos?.esta_al_dia
                      ? "bg-green-100"
                      : (estadoPagos?.periodos_vencidos ?? 0) > 0
                      ? "bg-red-100"
                      : estadoPagos?.cuota?.tipo_cuota === "porcentaje"
                      ? "bg-blue-100"
                      : (estadoPagos?.periodos_pendientes ?? 0) > 0
                      ? "bg-yellow-100"
                      : "bg-blue-100"
                  } rounded-full p-2 mr-3`}
                >
                  {estadoPagos?.esta_al_dia ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (estadoPagos?.periodos_vencidos ?? 0) > 0 ? (
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  ) : estadoPagos?.cuota?.tipo_cuota === "porcentaje" ? (
                    <Coins className="h-5 w-5 text-blue-600" />
                  ) : (estadoPagos?.periodos_pendientes ?? 0) > 0 ? (
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                  ) : (
                    <Coins className="h-5 w-5 text-blue-600" />
                  )}
                </div>
                <div className="flex-1">
                  <p
                    className={`font-medium ${
                      estadoPagos?.esta_al_dia
                        ? "text-green-800"
                        : (estadoPagos?.periodos_vencidos ?? 0) > 0
                        ? "text-red-800"
                        : estadoPagos?.cuota?.tipo_cuota === "porcentaje"
                        ? "text-blue-800"
                        : (estadoPagos?.periodos_pendientes ?? 0) > 0
                        ? "text-yellow-800"
                        : "text-blue-800"
                    }`}
                  >
                    {estadoPagos?.esta_al_dia
                      ? "Socio al día con sus pagos"
                      : (estadoPagos?.periodos_vencidos ?? 0) > 0
                      ? `Socio tiene ${estadoPagos?.periodos_vencidos} período${
                          (estadoPagos?.periodos_vencidos ?? 0) > 1 ? "s" : ""
                        } vencido${(estadoPagos?.periodos_vencidos ?? 0) > 1 ? "s" : ""}`
                      : estadoPagos?.cuota?.tipo_cuota === "porcentaje"
                      ? "Cuota de comisión activa"
                      : (estadoPagos?.periodos_pendientes ?? 0) > 0
                      ? `Socio tiene ${estadoPagos?.periodos_pendientes} período${
                          (estadoPagos?.periodos_pendientes ?? 0) > 1 ? "s" : ""
                        } pendiente${(estadoPagos?.periodos_pendientes ?? 0) > 1 ? "s" : ""}`
                      : "Socio sin cuota asignada"}
                  </p>
                  {estadoPagos?.cuota?.tipo_cuota === "porcentaje" && (estadoPagos?.periodos_vencidos ?? 0) === 0 ? (
                    <p className="text-sm text-blue-600">
                      Se calculará automáticamente conforme avancen los períodos
                    </p>
                  ) : (estadoPagos?.total_adeudado ?? 0) > 0 ? (
                    <p
                      className={`text-sm ${
                        (estadoPagos?.periodos_vencidos ?? 0) > 0 ? "text-red-600" : "text-yellow-600"
                      }`}
                    >
                      Total adeudado: S/ {estadoPagos?.total_adeudado?.toFixed(2)}
                    </p>
                  ) : null}
                </div>
                <button
                  onClick={handleCloseNotification}
                  className={`ml-3 ${
                    estadoPagos?.esta_al_dia
                      ? "text-green-600 hover:text-green-800"
                      : (estadoPagos?.periodos_vencidos ?? 0) > 0
                      ? "text-red-600 hover:text-red-800"
                      : estadoPagos?.cuota?.tipo_cuota === "porcentaje"
                      ? "text-blue-600 hover:text-blue-800"
                      : (estadoPagos?.periodos_pendientes ?? 0) > 0
                      ? "text-yellow-600 hover:text-yellow-800"
                      : "text-blue-600 hover:text-blue-800"
                  } focus:outline-none transition-transform hover:scale-110`}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}


            {/* Contenido con scroll */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-3 sm:p-6">
                {/* Pestañas de navegación */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1 sm:gap-2 p-1.5 sm:p-2 bg-gray-100 rounded-lg mb-4 sm:mb-6">
                  <TabButton
                    isActive={activeTab === "personal"}
                    icon={<User className="w-5 h-5" />}
                    label="Personal"
                    onClick={() => setActiveTab("personal")}
                  />
                  <TabButton
                    isActive={activeTab === "negocio"}
                    icon={<Briefcase className="w-5 h-5" />}
                    label="Negocio"
                    onClick={() => setActiveTab("negocio")}
                  />
                  <TabButton
                    isActive={activeTab === "establecimiento"}
                    icon={<MapPin className="w-5 h-5" />}
                    label="Establecimiento"
                    onClick={() => setActiveTab("establecimiento")}
                  />
                  <TabButton
                    isActive={activeTab === "bancarios"}
                    icon={<CreditCard className="w-5 h-5" />}
                    label="Datos Bancarios"
                    onClick={() => setActiveTab("bancarios")}
                  />
                  <TabButton
                    isActive={activeTab === "cuenta_bancaria"}
                    icon={<FileText className="w-5 h-5" />}
                    label="Cuenta Bancaria"
                    onClick={() => setActiveTab("cuenta_bancaria")}
                  />
                  <TabButton
                    isActive={activeTab === "cuotas"}
                    icon={<Coins className="w-5 h-5" />}
                    label="Cuotas"
                    onClick={() => setActiveTab("cuotas")}
                  />
                </div>

                <div className="mt-3 sm:mt-6">{renderContent()}</div>
              </div>
            </div>

            {/* Pie fijo */}
            <div className="bg-gray-50 border-t p-3 sm:p-6 flex justify-end gap-3 rounded-b-lg">
              <Button variant="outline" onClick={onClose}>
                Cerrar
              </Button>
              {!isAprobado && (
                <Button
                  onClick={handleAprobar}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  Aprobar Socio
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de error */}
      {error && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-2">Error</h3>
            <p className="text-gray-700 mb-4">{error}</p>
            <div className="flex justify-end">
              <Button onClick={handleCloseError} variant="outline">
                OK
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de imagen ampliada */}
      {showImageModal && selectedImage && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80"
          onClick={() => setShowImageModal(false)}
        >
          <div className="relative max-w-3xl max-h-[90vh]">
            <NextImage
              src={`/storage/${selectedImage}`}
              alt="Imagen de cuenta bancaria ampliada"
              width={800}
              height={600}
              className="object-contain"
            />
          </div>
        </div>
      )}

      {/* Modal de editar día de pago (solo monto_fijo) */}
      {showEditarDiaPagoModal && estadoPagos?.cuota && data && (
        <EditarDiaPagoModal
          isOpen={showEditarDiaPagoModal}
          cuota={estadoPagos.cuota}
          socioNombre={`${data.personal?.name || ""} ${data.personal?.lastName || ""}`.trim()}
          periodos={periodos}
          onClose={() => setShowEditarDiaPagoModal(false)}
          onSuccess={() => {
            setShowEditarDiaPagoModal(false);
            if (data.id) {
              cargarEstadoPagos(data.id);
            }
          }}
        />
      )}

      {/* Modal de cambiar cuota (reasignar a otra cuota) */}
      {showCambiarCuotaModal && data && (
        <AsignarCuotaModal
          isOpen={showCambiarCuotaModal}
          socioId={data.id}
          socioNombre={`${data.personal?.name || ""} ${data.personal?.lastName || ""}`.trim()}
          onClose={() => setShowCambiarCuotaModal(false)}
          onSuccess={() => {
            setShowCambiarCuotaModal(false);
            if (data.id) {
              cargarEstadoPagos(data.id);
            }
          }}
        />
      )}
    </>
  );
}
