"use client"

import type React from "react"

import { useState, useEffect } from "react"
import type { DetallesMotorizado } from "@/app/admin/motorizado/types/motorizado.types"
import { Button } from "@/components/ui/button"
import { User, MapPin, CreditCard, Mail, Phone, Calendar, Car, FileText, X } from "lucide-react"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"
import { PdfViewer } from "../PDFver"

// Interfaces para las props de los componentes
interface DetallesMotorizadoModalProps {
  isOpen: boolean
  onClose: () => void
  data: DetallesMotorizado | undefined | null
  onAprobar: (id: number) => void
}

interface InfoItemProps {
  icon: React.ReactNode
  label: string
  value: string | number | null
}

interface FileDisplayProps {
  src: string | null
  alt: string
  title: string
}

// Componente para los botones de las pestañas
const TabButton = ({
  isActive,
  icon,
  label,
  onClick,
}: {
  isActive: boolean
  icon: React.ReactNode
  label: string
  onClick: () => void
}) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
      isActive ? "bg-white shadow-md text-red-600" : "hover:bg-white/50 text-gray-600"
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
)

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
)

// Componente para mostrar archivos (imágenes o PDFs)
const FileDisplay = ({ src, alt, title }: FileDisplayProps) => {
  const [showFullSize, setShowFullSize] = useState(false)

  if (!src) return <p className="text-gray-500">Archivo no disponible</p>

  try {
    const fullUrl = src.startsWith("http") ? src : `/storage/${src.replace(/^\/?(storage\/)?/, "")}`

    // Determinar si es un PDF basado en la extensión o el tipo de contenido
    const isPdf = fullUrl.toLowerCase().endsWith(".pdf")

    return (
      <>
        <div className="flex flex-col items-center w-full">
          {isPdf ? (
            // Mostrar PDF directamente incrustado
            <div className="w-full aspect-[4/3] rounded-lg overflow-hidden border border-gray-200">
              <PdfViewer url={fullUrl} />
            </div>
          ) : (
            // Mostrar vista previa de imagen
            <div
              className="relative w-full aspect-[4/3] cursor-pointer transition-transform hover:scale-[1.02]"
              onClick={() => setShowFullSize(true)}
            >
              <Image
                src={fullUrl || "/placeholder.svg"}
                alt={alt}
                fill
                className="object-cover rounded-lg"
                unoptimized
              />
            </div>
          )}
        </div>

        {/* Modal para vista ampliada (solo para imágenes) */}
        {!isPdf && showFullSize && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80"
            onClick={() => setShowFullSize(false)}
          >
            <div className="relative flex flex-col items-center max-w-[90vw] max-h-[90vh]">
              <h3 className="text-white text-xl font-medium mb-4">{title}</h3>

              <div className="relative" style={{ width: "80vw", height: "70vh" }}>
                <Image
                  src={fullUrl || "/placeholder.svg"}
                  alt={alt}
                  fill
                  className="object-contain rounded-lg"
                  unoptimized
                  priority
                />
              </div>

              <Button
                variant="secondary"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowFullSize(false)
                }}
                className="mt-4 px-8"
              >
                Volver
              </Button>

              <button
                className="absolute -top-2 -right-2 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowFullSize(false)
                }}
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>
        )}
      </>
    )
  } catch (error) {
    console.log(`Error al mostrar el archivo: ${error}`)
    return <p className="text-gray-500">Error al cargar el archivo</p>
  }
}

// Componente para los títulos de las imágenes
const ImageTitle = ({ children }: { children: React.ReactNode }) => (
  <h4 className="font-geist-sans text-lg font-semibold mb-3 text-gray-800 flex items-center gap-2 justify-center">
    <FileText className="h-5 w-5 text-red-600" />
    {children}
  </h4>
)

// Componente principal del modal
export function DetallesMotorizadoModal({ isOpen, onClose, data, onAprobar }: DetallesMotorizadoModalProps) {
  const [activeTab, setActiveTab] = useState("registros")
  const { toast } = useToast()

  // Bloquear el scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }

    return () => {
      document.body.style.overflow = "auto"
    }
  }, [isOpen])

  if (!data || !isOpen) return null

  // Manejador para aprobar al motorizado
  const handleAprobar = async () => {
    try {
      await onAprobar(data.id)
      toast({
        title: "Éxito",
        description: "Se aprobó el motorizado y se enviaron las credenciales por correo electrónico.",
        action: (
          <Button variant="outline" onClick={onClose} className="bg-white hover:bg-gray-100">
            OK
          </Button>
        ),
      })
    } catch (error) {
      console.log(`Error Motorizado: ${error}`)
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo aprobar el motorizado o enviar las credenciales.",
      })
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Encabezado fijo */}
        <div className="bg-gradient-to-r from-red-500 to-rose-600 text-white p-6 rounded-t-lg">
          <h2 className="text-2xl font-bold">Detalles del Motorizado</h2>
        </div>

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
                    <InfoItem icon={<Phone className="w-5 h-5" />} label="Teléfono" value={data.personal.phone} />
                    <InfoItem
                      icon={<FileText className="w-5 h-5" />}
                      label="Documento"
                      value={`${data.personal.tipo_documento}: ${data.personal.nro_documento}`}
                    />
                  </div>

                  {/* Imágenes del documento una al lado de la otra */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {data.personal.documento_imagen_frente && (
                      <div>
                        <ImageTitle>Frente del Documento</ImageTitle>
                        <FileDisplay
                          src={data.personal.documento_imagen_frente || "/placeholder.svg"}
                          alt="Frente del Documento"
                          title="Frente del Documento de Identidad"
                        />
                      </div>
                    )}
                    {data.personal.documento_imagen_reverso && (
                      <div>
                        <ImageTitle>Reverso del Documento</ImageTitle>
                        <FileDisplay
                          src={data.personal.documento_imagen_reverso || "/placeholder.svg"}
                          alt="Reverso del Documento"
                          title="Reverso del Documento de Identidad"
                        />
                      </div>
                    )}
                  </div>
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
                    <InfoItem icon={<User className="w-5 h-5" />} label="Género" value={data.datosPersonales.genero} />
                    {/* departamento */}
                    <InfoItem
                      icon={<MapPin className="w-5 h-5" />}
                      label="Departamento"
                      value={data.datosPersonales.departamento || "No especificado"}
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
                      src={data.datosPersonales.url_selfie || "/placeholder.svg"}
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
                    <InfoItem icon={<Car className="w-5 h-5" />} label="Placa" value={data.registroVehiculo.placa} />
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
                        src={data.registroVehiculo.imagen_placa || "/placeholder.svg"}
                        alt="Placa"
                        title="Placa del Vehículo"
                      />
                    </div>
                    <div>
                      <ImageTitle>Fotografía de la Licencia</ImageTitle>
                      <FileDisplay
                        src={data.registroVehiculo.imagen_licencia || "/placeholder.svg"}
                        alt="Licencia"
                        title="Licencia de Conducir"
                      />
                    </div>
                    <div>
                      <ImageTitle>Fotografía del Seguro</ImageTitle>
                      <FileDisplay
                        src={data.registroVehiculo.imagen_seguro || "/placeholder.svg"}
                        alt="Seguro"
                        title="Seguro del Vehículo"
                      />
                    </div>
                    <div>
                      <ImageTitle>Fotografía de la Tarjeta de Propiedad</ImageTitle>
                      <FileDisplay
                        src={data.registroVehiculo.imagen_tarjeta_propiedad || "/placeholder.svg"}
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
                    <InfoItem icon={<User className="w-5 h-5" />} label="Titular" value={data.datosBancarios.titular} />
                    <InfoItem icon={<FileText className="w-5 h-5" />} label="DNI" value={data.datosBancarios.dni} />
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
                        src={data.datosBancarios.imagen_cuenta || "/placeholder.svg"}
                        alt="Documento de la Cuenta Bancaria"
                        title="Documento de la Cuenta Bancaria"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Mensaje cuando no hay datos disponibles */}
              {(!data.datosPersonales && activeTab === "personal") ||
                (!data.registroVehiculo && activeTab === "vehiculo") ||
                (!data.datosBancarios && activeTab === "bancarios" && (
                  <div className="h-full flex items-center justify-center py-8">
                    <p className="text-gray-500 text-center text-lg">No hay datos disponibles</p>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Pie fijo */}
        <div className="bg-gray-50 border-t p-6 flex justify-end gap-3 rounded-b-lg">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
          {!data.aprobado && (
            <Button onClick={handleAprobar} className="bg-red-500 hover:bg-red-600 text-white">
              Aprobar Motorizado
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

