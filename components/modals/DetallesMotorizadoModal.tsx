// components\modals\DetallesMotorizadoModal.tsx
"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import type { DetallesMotorizado } from "@/app/admin/motorizado/types/motorizado.types";
import { Button } from "@/components/ui/button";
import {
  User,
  MapPin,
  CreditCard,
  Mail,
  Phone,
  Calendar,
  Car,
  FileText,
  X,
  CheckCircle,
  Clipboard,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PDFViewer } from "../PDFViewer";
import { ImageThumbnail } from "@/components/ui/image-thumbnail";
import { AsignarPedidosModal } from "./AsignarPedidosModal";
import { useQueryClient } from "@tanstack/react-query";

// Interfaces para las props de los componentes
interface DetallesMotorizadoModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: DetallesMotorizado | undefined | null;
  onAprobar: (id: number) => void;
  isApproving?: boolean;
}

interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | number | null;
}

interface FileDisplayProps {
  src: string | null;
  alt: string;
  title: string;
  downloadName?: string;
}

// Componente para los botones de las pestañas
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

// Componente para mostrar información con icono
const InfoItem = ({ icon, label, value }: InfoItemProps) => (
  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
    <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600">
      {icon}
    </div>
    <div className="flex-1">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-sm font-medium">{value || "No disponible"}</p>
    </div>
  </div>
);

// Función para determinar si un archivo es un PDF basado en su extensión
const isPdfFile = (url: string): boolean => {
  return url.toLowerCase().endsWith(".pdf");
};

// Función para normalizar la ruta del archivo
const normalizeFilePath = (src: string): string => {
  // Si ya es una ruta relativa que comienza con /storage, la dejamos como está
  if (src.startsWith("/storage/")) {
    return src;
  }

  // Si es una URL completa, extraemos solo la parte de la ruta después de /storage/
  if (src.includes("/storage/")) {
    const storageIndex = src.indexOf("/storage/");
    return src.substring(storageIndex);
  }

  // Si no tiene el prefijo /storage/, lo añadimos
  if (!src.startsWith("/")) {
    return `/storage/${src}`;
  }

  // En cualquier otro caso, asumimos que es una ruta relativa válida
  return src;
};

// Componente para mostrar archivos (imágenes o PDFs)
const FileDisplay = ({ src, alt, title, downloadName }: FileDisplayProps) => {
  if (!src) return <p className="text-gray-500">Archivo no disponible</p>;

  try {
    // Normalizar la ruta del archivo para asegurar que sea una ruta relativa
    const normalizedPath = normalizeFilePath(src);

    // Determinar si es un PDF basado en la extensión
    const isPdf = isPdfFile(normalizedPath);

    return (
      <>
        <div className="flex flex-col items-center w-full">
          {isPdf ? (
            // Usar el componente PDFViewer para PDFs con la ruta normalizada
            <PDFViewer
              url={normalizedPath}
              title={title}
              downloadName={downloadName}
            />
          ) : (
            // Usar el componente ImageThumbnail para imágenes
            <ImageThumbnail
              src={normalizedPath || "/placeholder.svg"}
              alt={alt}
              title={title}
            />
          )}
        </div>
      </>
    );
  } catch (error) {
    console.log(`Error al mostrar el archivo: ${error}`);
    return <p className="text-gray-500">Error al cargar el archivo</p>;
  }
};

// Componente para los títulos de las imágenes
const ImageTitle = ({ children }: { children: React.ReactNode }) => (
  <h4 className="font-geist-sans text-lg font-semibold mb-3 text-gray-800 flex items-center gap-2 justify-center">
    <FileText className="h-5 w-5 text-red-600" />
    {children}
  </h4>
);

// Hook personalizado para animaciones de montaje/desmontaje
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

// Componente principal del modal
export function DetallesMotorizadoModal({
  isOpen,
  onClose,
  data,
  onAprobar,
  isApproving,
}: DetallesMotorizadoModalProps) {
  const [activeTab, setActiveTab] = useState("registros");
  const { toast } = useToast();
  const [isAprobado, setIsAprobado] = useState<boolean>(false);
  const [showNotification, setShowNotification] = useState<boolean>(false);
  const { shouldRender: renderNotification, isLeaving: isNotificationLeaving } =
    useAnimatedUnmount(showNotification, 300);
  const [showAsignarPedidosModal, setShowAsignarPedidosModal] = useState(false);
  const queryClient = useQueryClient();

  // Actualizar el estado local de aprobación cuando cambian los datos
  useEffect(() => {
    if (data) {
      console.log("Estado de aprobación del motorizado:", data.aprobado);
      console.log("Tipo de data.aprobado:", typeof data.aprobado);

      // Como aprobado es boolean, solo necesitamos verificar que sea true
      const aprobadoStatus = data.aprobado === true;
      setIsAprobado(aprobadoStatus);
      setShowNotification(aprobadoStatus);
    }
  }, [data]);

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

  const handleCloseNotification = () => {
    setShowNotification(false);
  };

  if (!data || !isOpen) return null;

  // Manejador para aprobar al motorizado
  const handleAprobar = async () => {
    try {
      await onAprobar(data.id);
      setIsAprobado(true);
      setShowNotification(true);
    } catch (error) {
      console.log(`Error Motorizado: ${error}`);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          "No se pudo aprobar el motorizado o enviar las credenciales.",
      });
    }
  };
  // Añade esta función dentro del componente DetallesMotorizadoModal, justo después de handleAprobar
  const getDocumentoByCategoría = (categoria: string) => {
    if (!data?.personal?.documentos_adicionales) return null;
    return data.personal.documentos_adicionales.find(
      (doc) => doc.categoria === categoria
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col relative">
        {/* Encabezado fijo */}
        <div className="bg-gradient-to-r from-red-500 to-rose-600 text-white p-6 rounded-t-lg">
          <h2 className="text-2xl font-bold">Detalles del Motorizado</h2>
        </div>

        {/* Notificación de motorizado aprobado - Posicionada en la esquina superior derecha con animaciones */}
        {isAprobado && renderNotification && (
          <div
            className={`absolute z-[60] top-4 right-6 max-w-md w-auto bg-green-50 border border-green-200 shadow-lg rounded-md p-3 flex items-center transition-all duration-300 ${
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
                Este motorizado ya ha sido aprobado
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
            <div className="flex flex-wrap gap-2 p-2 bg-gray-100 rounded-lg mb-6 sticky top-0 z-10">
              <TabButton
                isActive={activeTab === "registros"}
                icon={<FileText className="w-5 h-5" />}
                label="Registros"
                onClick={() => setActiveTab("registros")}
              />
              <TabButton
                isActive={activeTab === "personal"}
                icon={<User className="w-5 h-5" />}
                label="Personal"
                onClick={() => setActiveTab("personal")}
              />
              <TabButton
                isActive={activeTab === "vehiculo"}
                icon={<Car className="w-5 h-5" />}
                label="Vehículo"
                onClick={() => setActiveTab("vehiculo")}
              />
              <TabButton
                isActive={activeTab === "bancarios"}
                icon={<CreditCard className="w-5 h-5" />}
                label="Bancarios"
                onClick={() => setActiveTab("bancarios")}
              />
              <TabButton
                isActive={activeTab === "pedidos"}
                icon={<Clipboard className="w-5 h-5" />}
                label="Pedidos"
                onClick={() => setActiveTab("pedidos")}
              />
            </div>

            <div className="space-y-6">
              {/* Pestaña de Registros */}
              {activeTab === "registros" && (
                <div className="space-y-6">
                  {/* Información básica */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoItem
                      icon={<User className="w-5 h-5" />}
                      label="Nombre Completo"
                      value={`${data.personal.name} ${data.personal.lastName}`}
                    />
                    <InfoItem
                      icon={<Mail className="w-5 h-5" />}
                      label="Correo Electrónico"
                      value={data.personal.email}
                    />
                    <InfoItem
                      icon={<Phone className="w-5 h-5" />}
                      label="Teléfono"
                      value={data.personal.phone}
                    />
                    <InfoItem
                      icon={<FileText className="w-5 h-5" />}
                      label="Documento"
                      value={`${data.personal.tipo_documento}: ${data.personal.nro_documento}`}
                    />
                    <InfoItem
                      icon={<FileText className="w-5 h-5" />}
                      label="Departamento"
                      value={`${
                        data.personal.departamento || "No especificado"
                      }`}
                    />
                    <InfoItem
                      icon={<FileText className="w-5 h-5" />}
                      label="Vehículo"
                      value={`${data.personal.vehiculo || "No especificado"}`}
                    />
                  </div>

                  {/* Imágenes del documento una al lado de la otra */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {data.personal.documento_imagen_frente && (
                      <div>
                        <ImageTitle>Frente del Documento</ImageTitle>
                        <FileDisplay
                          src={
                            data.personal.documento_imagen_frente ||
                            "/placeholder.svg"
                          }
                          alt="Frente del Documento"
                          title="Frente del Documento de Identidad"
                        />
                      </div>
                    )}
                    {data.personal.documento_imagen_reverso && (
                      <div>
                        <ImageTitle>Reverso del Documento</ImageTitle>
                        <FileDisplay
                          src={
                            data.personal.documento_imagen_reverso ||
                            "/placeholder.svg"
                          }
                          alt="Reverso del Documento"
                          title="Reverso del Documento de Identidad"
                        />
                      </div>
                    )}
                  </div>
                  {/* Documentos adicionales */}
                  {data.personal.documentos_adicionales &&
                    data.personal.documentos_adicionales.length > 0 && (
                      <>
                        <div className="mt-8 mb-4">
                          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <FileText className="h-5 w-5 text-red-600" />
                            Documentos Adicionales
                          </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Curriculum */}
                          {getDocumentoByCategoría("curriculum") && (
                            <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                              <ImageTitle>Curriculum Vitae</ImageTitle>
                              <FileDisplay
                                src={normalizeFilePath(
                                  getDocumentoByCategoría("curriculum")?.ruta ||
                                    ""
                                )}
                                alt="Curriculum Vitae"
                                // title={
                                //   getDocumentoByCategoría("curriculum")
                                //     ?.nombre || "Curriculum Vitae"
                                // }
                                title=""
                                downloadName={`curriculum_${data.personal.nro_documento}.pdf`}
                              />
                              <p className="text-xs text-gray-500 mt-2 text-center">
                                Subido el:{" "}
                                {getDocumentoByCategoría("curriculum")
                                  ?.fecha_carga || ""}
                              </p>
                            </div>
                          )}
                          {/* Antecedentes Penales */}
                          {getDocumentoByCategoría("antecedentes_penales") && (
                            <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                              <ImageTitle>Antecedentes Penales</ImageTitle>
                              <FileDisplay
                                src={normalizeFilePath(
                                  getDocumentoByCategoría(
                                    "antecedentes_penales"
                                  )?.ruta || ""
                                )}
                                alt="Antecedentes Penales"
                                // title={
                                //   getDocumentoByCategoría(
                                //     "antecedentes_penales"
                                //   )?.nombre || "Antecedentes Penales"
                                // }
                                title=""
                                downloadName={`antecedentes_penales_${data.personal.nro_documento}.pdf`}
                              />
                              <p className="text-xs text-gray-500 mt-2 text-center">
                                Subido el:{" "}
                                {getDocumentoByCategoría("antecedentes_penales")
                                  ?.fecha_carga || ""}
                              </p>
                            </div>
                          )}
                          {/* Antecedentes Policiales */}
                          {getDocumentoByCategoría(
                            "antecedentes_policiales"
                          ) && (
                            <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                              <ImageTitle>Antecedentes Policiales</ImageTitle>
                              <FileDisplay
                                src={normalizeFilePath(
                                  getDocumentoByCategoría(
                                    "antecedentes_policiales"
                                  )?.ruta || ""
                                )}
                                alt="Antecedentes Policiales"
                                // title={
                                //   getDocumentoByCategoría(
                                //     "antecedentes_policiales"
                                //   )?.nombre || "Antecedentes Policiales"
                                // }
                                title=""
                                downloadName={`antecedentes_policiales_${data.personal.nro_documento}.pdf`}
                              />
                              <p className="text-xs text-gray-500 mt-2 text-center">
                                Subido el:{" "}
                                {getDocumentoByCategoría(
                                  "antecedentes_policiales"
                                )?.fecha_carga || ""}
                              </p>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                </div>
              )}

              {/* Pestaña de Datos Personales */}
              {activeTab === "personal" && data.datosPersonales && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoItem
                      icon={<Calendar className="w-5 h-5" />}
                      label="Fecha de Nacimiento"
                      value={data.datosPersonales.fecha_nacimiento}
                    />
                    <InfoItem
                      icon={<User className="w-5 h-5" />}
                      label="Género"
                      value={data.datosPersonales.genero}
                    />
                    {/* departamento */}
                    <InfoItem
                      icon={<MapPin className="w-5 h-5" />}
                      label="Departamento"
                      value={
                        data.datosPersonales.departamento || "No especificado"
                      }
                    />
                    {/* ciudad */}
                    <InfoItem
                      icon={<MapPin className="w-5 h-5" />}
                      label="Distrito"
                      value={data.datosPersonales.distrito}
                    />
                    {/* distrito */}
                    <InfoItem
                      icon={<MapPin className="w-5 h-5" />}
                      label="Provincia"
                      value={data.datosPersonales.provincia}
                    />
                  </div>
                  <div className="w-full max-w-md mx-auto">
                    <ImageTitle>Foto de Perfil del Motorizado</ImageTitle>
                    <FileDisplay
                      src={
                        data.datosPersonales.url_selfie || "/placeholder.svg"
                      }
                      alt="Selfie"
                      title="Foto de Perfil"
                    />
                  </div>
                </div>
              )}

              {/* Pestaña de Vehículo */}
              {activeTab === "vehiculo" && data.registroVehiculo && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoItem
                      icon={<Car className="w-5 h-5" />}
                      label="Placa"
                      value={data.registroVehiculo.placa}
                    />
                    <InfoItem
                      icon={<FileText className="w-5 h-5" />}
                      label="Licencia de Conducir"
                      value={data.registroVehiculo.licencia_conducir}
                    />
                    <InfoItem
                      icon={<FileText className="w-5 h-5" />}
                      label="Seguro"
                      value={data.registroVehiculo.seguro}
                    />
                    <InfoItem
                      icon={<FileText className="w-5 h-5" />}
                      label="Tarjeta de Propiedad"
                      value={data.registroVehiculo.tarjeta_propiedad}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <ImageTitle>Fotografía de la Placa</ImageTitle>
                      <FileDisplay
                        src={
                          data.registroVehiculo.imagen_placa ||
                          "/placeholder.svg"
                        }
                        alt="Placa"
                        title="Placa del Vehículo"
                      />
                    </div>
                    <div>
                      <ImageTitle>Fotografía de la Licencia</ImageTitle>
                      <FileDisplay
                        src={
                          data.registroVehiculo.imagen_licencia ||
                          "/placeholder.svg"
                        }
                        alt="Licencia"
                        title="Licencia de Conducir"
                      />
                    </div>
                    <div>
                      <ImageTitle>Fotografía del Seguro</ImageTitle>
                      <FileDisplay
                        src={
                          data.registroVehiculo.imagen_seguro ||
                          "/placeholder.svg"
                        }
                        alt="Seguro"
                        title="Seguro del Vehículo"
                      />
                    </div>
                    <div>
                      <ImageTitle>
                        Fotografía de la Tarjeta de Propiedad
                      </ImageTitle>
                      <FileDisplay
                        src={
                          data.registroVehiculo.imagen_tarjeta_propiedad ||
                          "/placeholder.svg"
                        }
                        alt="Tarjeta de Propiedad"
                        title="Tarjeta de Propiedad"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Pestaña de Datos Bancarios */}
              {activeTab === "bancarios" && data.datosBancarios && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoItem
                      icon={<User className="w-5 h-5" />}
                      label="Titular"
                      value={data.datosBancarios.titular}
                    />
                    <InfoItem
                      icon={<FileText className="w-5 h-5" />}
                      label="DNI"
                      value={data.datosBancarios.dni}
                    />
                    <InfoItem
                      icon={<CreditCard className="w-5 h-5" />}
                      label="Banco"
                      value={data.datosBancarios.banco}
                    />
                    <InfoItem
                      icon={<CreditCard className="w-5 h-5" />}
                      label="Tipo de Cuenta"
                      value={data.datosBancarios.tipo_cuenta}
                    />
                    <InfoItem
                      icon={<CreditCard className="w-5 h-5" />}
                      label="Número de Cuenta"
                      value={data.datosBancarios.numero_cuenta}
                    />
                  </div>
                  {data.datosBancarios.imagen_cuenta && (
                    <div className="mt-6">
                      <ImageTitle>Documento de la Cuenta Bancaria</ImageTitle>
                      <FileDisplay
                        src={
                          data.datosBancarios.imagen_cuenta ||
                          "/placeholder.svg"
                        }
                        alt="Documento de la Cuenta Bancaria"
                        title="Documento de la Cuenta Bancaria"
                      />
                    </div>
                  )}
                </div>
              )}
              {/* Pestaña de Pedidos */}
              {activeTab === "pedidos" && (
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                      <Clipboard className="h-5 w-5 text-red-600" />
                      Configuración de Pedidos Diarios
                    </h3>

                    <div className="mb-6">
                      <p className="text-sm text-gray-600 mb-2">
                        Cantidad máxima de pedidos que este motorizado puede
                        tomar :
                      </p>

                      <div className="flex items-center gap-4">
                        <div className="bg-red-50 text-red-700 text-2xl font-bold py-3 px-6 rounded-lg border border-red-200 flex-grow text-center">
                          {data.cantidad_pedidos_dias !== undefined
                            ? data.cantidad_pedidos_dias
                            : 0}
                        </div>

                        {isAprobado && (
                          <Button
                            onClick={() => setShowAsignarPedidosModal(true)}
                            className="bg-red-500 hover:bg-red-600 text-white"
                          >
                            Editar cantidad
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Información
                      </h4>
                      <p className="text-sm text-blue-700">
                        Esta configuración limita la cantidad de pedidos que el
                        motorizado puede aceptar. Asegúrese de establecer un
                        valor adecuado según la capacidad y disponibilidad del
                        motorizado.
                      </p>
                    </div>
                  </div>

                  {/* Aquí puedes agregar más secciones relacionadas con pedidos en el futuro */}
                  {/* Por ejemplo: historial de pedidos, estadísticas, etc. */}
                </div>
              )}

              {/* Mensaje cuando no hay datos disponibles */}
              {(!data.datosPersonales && activeTab === "personal") ||
                (!data.registroVehiculo && activeTab === "vehiculo") ||
                (!data.datosBancarios && activeTab === "bancarios" && (
                  <div className="h-full flex items-center justify-center py-8">
                    <p className="text-gray-500 text-center text-lg">
                      No hay datos disponibles
                    </p>
                  </div>
                ))}
            </div>
          </div>
        </div>
        {/* Modal para asignar cantidad de pedidos */}
        {data && (
          <AsignarPedidosModal
            isOpen={showAsignarPedidosModal}
            onClose={() => setShowAsignarPedidosModal(false)}
            motorizadoId={data.id}
            motorizadoNombre={`${data.personal.name} ${data.personal.lastName}`}
            onSuccess={() => {
              // Recargar los datos del motorizado
              queryClient.invalidateQueries({
                queryKey: ["motorizado-details", data.id],
              });
            }}
          />
        )}

        {/* Pie fijo */}
        <div className="bg-gray-50 border-t p-6 flex justify-end gap-3 rounded-b-lg">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
          {!isAprobado && (
            <Button
              onClick={handleAprobar}
              className="bg-red-500 hover:bg-red-600 text-white"
              disabled={isApproving} // Deshabilitar durante la carga
            >
              {isApproving ? "Aprobando motorizado..." : "Aprobar Motorizado"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
