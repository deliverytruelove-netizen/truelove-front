// components\modals\DetallesSocioModal.tsx
"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import type {
  DetallesSocio,
  DocumentosPdfExtranjero,
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
} from "lucide-react";
import NextImage from "next/image";
import { PDFViewer } from "../PDFViewer";

interface DetallesSocioModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: DetallesSocio | undefined | null;
  onAprobar: (id: number) => void;
  documentosPdfExtranjero?: DocumentosPdfExtranjero;
}

interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}

const InfoItem = ({ icon, label, value }: InfoItemProps) => (
  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
    <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600">
      {icon}
    </div>
    <div className="flex-1">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-sm font-medium">{value}</p>
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
    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
      isActive
        ? "bg-white shadow-md text-red-600"
        : "hover:bg-white/50 text-gray-600"
    }`}
  >
    {icon}
    <span>{label}</span>
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
  >("personal");
  const [error, setError] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAprobado, setIsAprobado] = useState<boolean>(false);
  const [showNotification, setShowNotification] = useState<boolean>(false);
  const { shouldRender: renderNotification, isLeaving: isNotificationLeaving } =
    useAnimatedUnmount(showNotification, 300);

  // Actualizar el estado local de aprobación cuando cambian los datos
  useEffect(() => {
    if (data) {
      console.log("Estado de aprobación del socio:", data.aprobado);
      const aprobadoStatus = Boolean(data.aprobado);
      setIsAprobado(aprobadoStatus);
      setShowNotification(aprobadoStatus);
    }
  }, [data]);

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

  // Verificar si el socio tiene carnet de extranjería para mostrar la pestaña de documentos
  const isExtranjero = data.documentType === "CARNET_EXTRANJERIA";

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
      case "documentos":
        return data.documentosPdfExtranjero ? (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold mb-2">Documentos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PDFViewer
                url={`/storage/${data.documentosPdfExtranjero.antecedentes_penales_pdf}`}
                title="Antecedentes Penales"
              />
              <PDFViewer
                url={`/storage/${data.documentosPdfExtranjero.antecedentes_policiales_pdf}`}
                title="Antecedentes Policiales"
              />
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">
            No hay documentos disponibles
          </p>
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
          <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col relative">
            {/* Encabezado fijo */}
            <div className="bg-gradient-to-r from-red-500 to-rose-600 text-white p-6 rounded-t-lg">
              <h2 className="text-2xl font-bold">Detalles del Socio</h2>
            </div>

            {/* Notificación de socio aprobado - Posicionada en la esquina superior derecha con animaciones */}
            {isAprobado && renderNotification && (
              <div
                className={`absolute z-[60] top-8 right-6 max-w-md w-auto bg-green-50 border border-green-200 shadow-lg rounded-md p-3 flex items-center transition-all duration-300 ${
                  isNotificationLeaving
                    ? "opacity-0 translate-y-[-10px]"
                    : "opacity-100 translate-y-0"
                }`}
              >
                <div className="bg-green-100 rounded-full p-2 mr-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-green-800 font-medium">
                    Este socio ya ha sido aprobado
                  </p>
                </div>
                <button
                  onClick={handleCloseNotification}
                  className="ml-3 text-green-600 hover:text-green-800 focus:outline-none transition-transform hover:scale-110"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}

            {/* Contenido con scroll */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                {/* Pestañas de navegación */}
                <div className="grid grid-cols-1 md:grid-cols-6 gap-2 p-2 bg-gray-100 rounded-lg mb-6">
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
                  {/* Solo mostrar la pestaña de documentos para extranjeros */}
                  {isExtranjero && (
                    <TabButton
                      isActive={activeTab === "documentos"}
                      icon={<FileText className="w-5 h-5" />}
                      label="Documentos"
                      onClick={() => setActiveTab("documentos")}
                    />
                  )}
                </div>

                <div className="mt-6">{renderContent()}</div>
              </div>
            </div>

            {/* Pie fijo */}
            <div className="bg-gray-50 border-t p-6 flex justify-end gap-3 rounded-b-lg">
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
    </>
  );
}
