// app\socio\admin\info-socio\page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import BusinessInfoModal from "./components/BusinessInfoModal"
import BusinessDataModal from "./components/BusinessDataModal"
import BankDataModal from "./components/BankDataModal"
import BankAccountModal from "./components/BankAccountModal"


import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { User, Building, MapPin, CreditCard, Banknote, FileText, Eye, Download, Edit } from 'lucide-react'
import { Dialog, DialogContent  } from "@/components/ui/dialog"
import AddressEditorModal from "./components/AddressEditorModal"
import { Button } from "@/components/ui/button";
import NextImage from "next/image";
import type { DetallesSocio, BankAccountFormData, BusinessInfo, DatosNegocioFormData, DatosBancariosFormData, ApiResponse} from "@/app/admin/socios/types/Socios.types";

import { socioService } from "@/app/socio/admin/services/socio.service";
import { PDFModal } from "@/components/PDFModal";

// Función para determinar si un archivo es un PDF
const isPdfFile = (url: string): boolean => {
  return url.toLowerCase().endsWith(".pdf");
};

// Tipo para los datos que puede recibir SeccionDatos
type SeccionDatosData =
  | DetallesSocio["personal"]
  | DetallesSocio["business"]
  | DetallesSocio["establishment"]
  | DetallesSocio["businessData"]
  | DetallesSocio["bankData"]
  | DetallesSocio["cuentaBancaria"]
  | DetallesSocio["documentosPdfExtranjero"]
  | null;

// Componente para mostrar secciones de datos
interface SeccionDatosProps {
  title: string;
  data: SeccionDatosData;
  icon?: React.ReactNode;
  isClient: boolean;
  showEditButton?: boolean;
  onEditClick?: () => void;
}

const SeccionDatos = ({
  title,
  data,
  icon,
  // isClient,
  showEditButton = false,
  onEditClick,
}: SeccionDatosProps) => {
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showPDFModal, setShowPDFModal] = useState(false);

  const [selectedPDF, setSelectedPDF] = useState<{
    url: string;
    title: string;
  } | null>(null);

  if (!data) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center">
            {icon && <div className="mr-2">{icon}</div>}
            <div>
              <CardTitle className="text-sm font-medium">{title}</CardTitle>
            </div>
          </div>
         {showEditButton && (
  <Button
    variant="ghost"
    size="sm"
    className="h-8 w-8 p-0 hover:bg-gray-100"
    onClick={() => {
      if (onEditClick) {
        onEditClick();
      } else {
        console.log(`Editar ${title}`);
      }
    }}
  >
    <Edit className="w-4 h-4" />
  </Button>
)}
        </CardHeader>
      </Card>
    );
  }

  const handleImageClick = (imageSrc: string) => {
    if (!isPdfFile(imageSrc)) {
      setSelectedImage(imageSrc);
      setShowImageModal(true);
    }
  };

  const handlePDFView = (pdfUrl: string, pdfTitle: string) => {
    setSelectedPDF({ url: `/storage/${pdfUrl}`, title: pdfTitle });
    setShowPDFModal(true);
  };

  const handlePDFDownload = async (pdfUrl: string, fileName: string) => {
    try {
      const response = await fetch(`/storage/${pdfUrl}`);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Error al descargar el PDF:", error);
    }
  };

  return (
    <>
      <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
  <div className="flex items-center">
    {icon && <div className="mr-2">{icon}</div>}
    <div>
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
    </div>
  </div>
{showEditButton && (
  <Button
    variant="ghost"
    size="sm"
    className="h-8 w-8 p-0 hover:bg-gray-100"
    onClick={() => {
      if (onEditClick) {
        onEditClick();
      } else {
        console.log(`Editar ${title}`);
      }
    }}
  >
    <Edit className="w-4 h-4" />
  </Button>
)}
</CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(data as Record<string, unknown>).map(
              ([key, value]) => {
                const formattedKey = key
                  .replace(/_/g, " ")
                  .replace(/([A-Z])/g, " $1")
                  .replace(/^./, (str) => str.toUpperCase());

                let formattedValue: string | number | React.ReactNode =
                  String(value);

                if (Array.isArray(value)) {
                  if (key === "imagenes_cuenta" && value.length > 0) {
                    return (
                      <div key={key} className="space-y-2">
                        <span className="text-sm text-muted-foreground font-medium">
                          Documentos de cuenta:
                        </span>
                        <div className="space-y-2">
                          {value.map((imagen: string, index: number) => {
                            if (isPdfFile(imagen)) {
                              const pdfTitle = `Documento Bancario ${
                                index + 1
                              }`;
                              const fileName = `documento_bancario_${
                                index + 1
                              }.pdf`;

                              return (
                                <div
                                  key={`pdf-${index}-${imagen.slice(-10)}`}
                                  className="w-full border rounded-lg p-4"
                                >
                                  {/* Header con botones */}
                                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
                                    <h4 className="text-lg font-semibold flex-1 min-w-0">
                                      {pdfTitle}
                                    </h4>
                                    <div className="flex gap-2 flex-shrink-0">
                                      {/* Botón Ver PDF - Oculto en móvil */}
                                      <Button
                                        onClick={() =>
                                          handlePDFView(imagen, pdfTitle)
                                        }
                                        variant="outline"
                                        size="sm"
                                        className="hidden md:flex text-blue-600 hover:text-blue-700 flex-shrink-0"
                                      >
                                        <Eye className="w-4 h-4 mr-2" />
                                        Ver PDF
                                      </Button>

                                      {/* Botón Descargar - Responsivo */}
                                      <Button
                                        onClick={() =>
                                          handlePDFDownload(imagen, fileName)
                                        }
                                        variant="outline"
                                        size="sm"
                                        className="text-blue-600 hover:text-blue-700 flex-shrink-0 w-full sm:w-auto"
                                      >
                                        <Download className="w-4 h-4 mr-2" />
                                        <span className="hidden sm:inline">
                                          Descargar PDF
                                        </span>
                                        <span className="sm:hidden">
                                          Descargar
                                        </span>
                                      </Button>
                                    </div>
                                  </div>

                                  {/* Solo el nombre del PDF */}
                                  <div className="w-full p-4 bg-gray-50 rounded-lg text-center">
                                    <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm font-medium text-gray-900">
                                      {fileName}
                                    </p>
                                  </div>
                                </div>
                              );
                            } else {
                              return (
                                <div
                                  key={`img-${index}-${imagen.slice(-10)}`}
                                  className="space-y-1"
                                >
                                  <div
                                    className="relative w-full h-32 cursor-pointer border rounded-lg overflow-hidden hover:opacity-80 transition-opacity"
                                    onClick={() => handleImageClick(imagen)}
                                  >
                                    <NextImage
                                      src={`/storage/${imagen}`}
                                      alt={`Imagen de cuenta ${index + 1}`}
                                      fill
                                      className="object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all flex items-center justify-center">
                                      <Eye className="w-6 h-6 text-white opacity-0 hover:opacity-100 transition-opacity" />
                                    </div>
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleImageClick(imagen)}
                                    className="w-full"
                                  >
                                    <Eye className="w-4 h-4 mr-2" />
                                    Ver imagen completa
                                  </Button>
                                </div>
                              );
                            }
                          })}
                        </div>
                      </div>
                    );
                  }
                  formattedValue =
                    value.length > 0
                      ? `${value.length} elemento(s)`
                      : "Sin elementos";
                } else if (typeof value === "boolean") {
                  formattedValue = value ? "Sí" : "No";
                } else if (value === null || value === undefined) {
                  formattedValue = "No especificado";
                } else if (key === "posToDriver") {
                  const posTypes: Record<number, string> = {
                    0: "No facilita POS",
                    1: "POS Estilos",
                    2: "POS Visa",
                    3: "Envía ambos POS",
                  };
                  formattedValue = posTypes[value as number] || String(value);
                } else if (key === "entrega_documento_venta") {
                  const documentTypes: Record<number, string> = {
                    0: "No emite documentos de venta",
                    1: "Sí emite documentos de venta",
                  };
                  formattedValue =
                    documentTypes[value as number] || String(value);
                } else if (key === "tipo_pago_digital") {
                  const tiposPago: Record<number, string> = {
                    0: "Ninguno",
                    1: "Yape",
                    2: "Plin",
                  };
                  formattedValue = tiposPago[value as number] || String(value);
                } else if (key === "created_at" && typeof value === "string") {
                  formattedValue = new Date(value).toLocaleDateString("es-ES");
                }

                if (key === "imagenes_cuenta" && Array.isArray(value)) {
                  return null;
                }

                return (
                  <div key={key} className="flex justify-between items-start">
                    <span className="text-sm text-muted-foreground font-medium">
                      {formattedKey}:
                    </span>
                    <span className="text-sm text-right max-w-[60%] break-words">
                      {String(formattedValue)}
                    </span>
                  </div>
                );
              }
            )}
          </div>
        </CardContent>
      </Card>

      {showImageModal && selectedImage && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80"
          onClick={() => setShowImageModal(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh] p-4">
            <NextImage
              src={`/storage/${selectedImage}`}
              alt="Imagen ampliada"
              width={800}
              height={600}
              className="object-contain max-w-full max-h-full"
            />
            <Button
              variant="outline"
              className="absolute top-4 right-4 bg-white/90 hover:bg-white"
              onClick={() => setShowImageModal(false)}
            >
              Cerrar
            </Button>
          </div>
        </div>
      )}

      {showPDFModal && selectedPDF && (
        <PDFModal
          isOpen={showPDFModal}
          onClose={() => setShowPDFModal(false)}
          url={selectedPDF.url}
          title={selectedPDF.title}
        />
      )}
    </>
  );
};

const SkeletonCard = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-4 w-[200px]" />
    </CardHeader>
    <CardContent>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </CardContent>
  </Card>
);

export default function InfoSocioPage() {
  const [socio, setSocio] = useState<DetallesSocio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false)
  const [isBusinessInfoModalOpen, setIsBusinessInfoModalOpen] = useState(false)
  const [isBusinessDataModalOpen, setIsBusinessDataModalOpen] = useState(false)
  const [isBankDataModalOpen, setIsBankDataModalOpen] = useState(false)
  const [isBankAccountModalOpen, setIsBankAccountModalOpen] = useState(false)

  useEffect(() => {
    setIsClient(true);
  }, []);

  const fetchPerfil = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await socioService.getProfile();

      if (response.status !== "success") {
        throw new Error(
          response.message || "La respuesta de la API no fue exitosa"
        );
      }

      setSocio(response.data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Ocurrió un error inesperado.";
      setError(errorMessage);
      toast({
        title: "Error al Cargar Perfil",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchPerfil();
  }, [fetchPerfil]);
  const handleAddressUpdate = (newAddress: string) => {
  // Aquí puedes actualizar los datos del socio si es necesario
  console.log("Dirección actualizada:", newAddress)
  setIsAddressModalOpen(false)
  // Opcional: recargar datos del socio
}
const handleBusinessInfoUpdate = async (data: BusinessInfo): Promise<ApiResponse<unknown>> => {
  try {
    const response = await socioService.updateBusinessInfo(data);
    toast({
      title: "Éxito",
      description: "Datos del negocio actualizados correctamente",
    });
    setIsBusinessInfoModalOpen(false);
    fetchPerfil(); // Recargar datos
    return response; // Return the API response
  } catch (error) {
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "Error al actualizar",
      variant: "destructive",
    });
    throw error; 
  }
}

const handleBusinessDataUpdate = async (data: DatosNegocioFormData) => {
  try {
    await socioService.updateBusinessData(data)
    toast({
      title: "Éxito",
      description: "Datos legales actualizados correctamente",
    })
    setIsBusinessDataModalOpen(false)
    fetchPerfil()
  } catch (error) {
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "Error al actualizar",
      variant: "destructive",
    })
  }
}

const handleBankDataUpdate = async (data: DatosBancariosFormData) => {


  try {
    await socioService.updateBankData(data)
    toast({
      title: "Éxito",
      description: "Datos bancarios actualizados correctamente",
    })
    setIsBankDataModalOpen(false)
    fetchPerfil()
  } catch (error) {
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "Error al actualizar",
      variant: "destructive",
    })
  }
}

const handleBankAccountUpdate = async (data: BankAccountFormData) => {
  try {
    await socioService.updateBankAccount(data)
    toast({
      title: "Éxito",
      description: "Cuenta bancaria actualizada correctamente",
    })
    setIsBankAccountModalOpen(false)
    fetchPerfil()
  } catch (error) {
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "Error al actualizar",
      variant: "destructive",
    })
  }
}



  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <Skeleton className="h-8 w-[300px] mb-2" />
            <Skeleton className="h-4 w-[400px]" />
          </div>
          <Skeleton className="h-6 w-[120px]" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!socio) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertDescription>
            No se encontraron datos del socio.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {socio.personal?.name} {socio.personal?.lastName}
          </h1>
          <p className="text-muted-foreground">
            Información completa del perfil del socio
          </p>
        </div>
        <Badge variant="default" className="mt-4 md:mt-0 self-start">
          Perfil Activo
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <SeccionDatos
          title="Información Personal"
          data={socio.personal}
          icon={<User className="w-4 h-4" />}
          isClient={isClient}
        />
      <SeccionDatos 
  title="Datos del Negocio" 
  data={socio.business} 
  icon={<Building className="w-4 h-4" />}
  isClient={isClient}
  showEditButton={true}
  onEditClick={() => setIsBusinessInfoModalOpen(true)}
/>


       <SeccionDatos
  title="Dirección del Establecimiento"
  data={socio.establishment}
  icon={<MapPin className="w-4 h-4" />}
  isClient={isClient}
  showEditButton={true}
  onEditClick={() => setIsAddressModalOpen(true)}
/>
        <SeccionDatos
  title="Datos Legales (RUC)"
  data={socio.businessData}
  icon={<FileText className="w-4 h-4" />}
  isClient={isClient}
  showEditButton={true}
  onEditClick={() => setIsBusinessDataModalOpen(true)}
/>
       <SeccionDatos
  title="Datos Bancarios (Declarados)"
  data={socio.bankData}
  icon={<CreditCard className="w-4 h-4" />}
  isClient={isClient}
  showEditButton={true}
  onEditClick={() => setIsBankDataModalOpen(true)}
/>
        <SeccionDatos
  title="Cuenta Bancaria (Verificación)"
  data={socio.cuentaBancaria}
  icon={<Banknote className="w-4 h-4" />}
  isClient={isClient}
  showEditButton={true}
  onEditClick={() => setIsBankAccountModalOpen(true)}
/>
      </div>

      {socio.documentosPdfExtranjero && (
        <div className="mt-6">
          <SeccionDatos
            title="Documentos PDF (Extranjero)"
            data={socio.documentosPdfExtranjero}
            icon={<FileText className="w-4 h-4" />}
            isClient={isClient}
          />
        </div>
      )}
      {/* Modal de editar dirección */}
<Dialog open={isAddressModalOpen} onOpenChange={setIsAddressModalOpen}>
  <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden p-0">
    <AddressEditorModal
      currentAddress={socio.establishment?.direccion_completa || ""}
      onAddressUpdate={handleAddressUpdate}
      onClose={() => setIsAddressModalOpen(false)}
    />
  </DialogContent>
</Dialog>

{/* Modales de edición */}
<Dialog open={isBusinessInfoModalOpen} onOpenChange={setIsBusinessInfoModalOpen}>
  <DialogContent className="max-w-2xl">
    <BusinessInfoModal
      currentData={socio.business}
      onUpdate={handleBusinessInfoUpdate}
      onClose={() => setIsBusinessInfoModalOpen(false)}
    />
  </DialogContent>
</Dialog>

<Dialog open={isBusinessDataModalOpen} onOpenChange={setIsBusinessDataModalOpen}>
  <DialogContent className="max-w-2xl">
    <BusinessDataModal
      currentData={socio.businessData}
      onUpdate={handleBusinessDataUpdate}
      onClose={() => setIsBusinessDataModalOpen(false)}
    />
  </DialogContent>
</Dialog>

<Dialog open={isBankDataModalOpen} onOpenChange={setIsBankDataModalOpen}>
  <DialogContent className="max-w-2xl">
    <BankDataModal
      currentData={socio.bankData ? {
        titular_cuenta: socio.bankData.titular_cuenta,
        numero_cuenta: socio.bankData.numero_cuenta,
        nombre_banco: socio.bankData.nombre_banco,
        tipo_cuenta: socio.bankData.tipo_cuenta,
        documento_titular: "",
        codigo_cci: "",
      } : null}
      onUpdate={handleBankDataUpdate}
      onClose={() => setIsBankDataModalOpen(false)}
    />
  </DialogContent>
</Dialog>

<Dialog open={isBankAccountModalOpen} onOpenChange={setIsBankAccountModalOpen}>
  <DialogContent className="max-w-2xl">
    <BankAccountModal
      currentData={socio.cuentaBancaria}
      onUpdate={handleBankAccountUpdate}
      onClose={() => setIsBankAccountModalOpen(false)}
    />
  </DialogContent>
</Dialog>

    </div>
  );
}
