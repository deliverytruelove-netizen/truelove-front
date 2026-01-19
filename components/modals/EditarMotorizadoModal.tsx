// components/modals/EditarMotorizadoModal.tsx
"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Truck, FileText, Upload, Image as ImageIcon, Eye } from "lucide-react";
import type { DetallesMotorizado } from "@/app/admin/motorizado/types/motorizado.types";
import { useToast } from "@/hooks/use-toast";
import NextImage from "next/image";

interface EditarMotorizadoModalProps {
  isOpen: boolean;
  onClose: () => void;
  motorizado: DetallesMotorizado;
  onSaveVehiculo: (data: {
    placa: string;
    licencia_conducir: string;
    seguro: string;
    tarjeta_propiedad: string;
  }) => Promise<void>;
  onSaveDocumentos: (data: Record<string, string>) => Promise<void>;
}

// Función para normalizar rutas de archivos
const normalizeFilePath = (src: string): string => {
  if (!src) return "";
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  if (src.includes("/storage/")) {
    const storageIndex = src.indexOf("/storage/");
    return src.substring(storageIndex);
  }
  if (!src.startsWith("/")) {
    return `/storage/${src}`;
  }
  return src;
};

// Función para determinar si es PDF
const isPdfFile = (url: string): boolean => {
  return url.toLowerCase().endsWith(".pdf");
};

// Componente para mostrar preview de documento
interface DocumentPreviewProps {
  src?: string;
  alt: string;
  onReplace: () => void;
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({ src, alt, onReplace }) => {
  if (!src) {
    return (
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-500">Sin documento</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={onReplace}
        >
          <Upload className="w-4 h-4 mr-2" />
          Subir
        </Button>
      </div>
    );
  }

  const normalizedPath = normalizeFilePath(src);
  const isPdf = isPdfFile(normalizedPath);

  return (
    <div className="relative group">
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        {isPdf ? (
          <div className="bg-gray-100 p-4 text-center">
            <FileText className="w-16 h-16 text-red-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Documento PDF</p>
            <a
              href={normalizedPath}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline flex items-center justify-center gap-1 mt-2"
            >
              <Eye className="w-3 h-3" />
              Ver documento
            </a>
          </div>
        ) : (
          <NextImage
            src={normalizedPath}
            alt={alt}
            width={300}
            height={200}
            className="w-full h-48 object-cover"
          />
        )}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full mt-2"
        onClick={onReplace}
      >
        <Upload className="w-4 h-4 mr-2" />
        Reemplazar
      </Button>
    </div>
  );
};

export const EditarMotorizadoModal: React.FC<EditarMotorizadoModalProps> = ({
  isOpen,
  onClose,
  motorizado,
  onSaveVehiculo,
  onSaveDocumentos,
}) => {
  const [activeTab, setActiveTab] = useState<"vehiculo" | "documentos">("vehiculo");
  const [formDataVehiculo, setFormDataVehiculo] = useState({
    placa: "",
    licencia_conducir: "",
    seguro: "",
    tarjeta_propiedad: "",
  });
  const [documentos, setDocumentos] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fileInputRefs = {
    documento_frente: useRef<HTMLInputElement>(null),
    documento_reverso: useRef<HTMLInputElement>(null),
    placa: useRef<HTMLInputElement>(null),
    licencia: useRef<HTMLInputElement>(null),
    seguro: useRef<HTMLInputElement>(null),
    tarjeta: useRef<HTMLInputElement>(null),
    cuenta_bancaria: useRef<HTMLInputElement>(null),
  };

  useEffect(() => {
    if (motorizado?.registroVehiculo) {
      setFormDataVehiculo({
        placa: motorizado.registroVehiculo.placa || "",
        licencia_conducir: motorizado.registroVehiculo.licencia_conducir || "",
        seguro: motorizado.registroVehiculo.seguro || "",
        tarjeta_propiedad: motorizado.registroVehiculo.tarjeta_propiedad || "",
      });
    }
  }, [motorizado]);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    field: string
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tamaño (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Archivo muy grande",
        description: "El archivo no debe superar 5MB",
        variant: "destructive",
      });
      return;
    }

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      setDocumentos((prev) => ({ ...prev, [field]: base64 }));
      toast({
        title: "Archivo cargado",
        description: `${file.name} listo para guardar`,
      });
    } catch (error) {
      console.error("Error al cargar archivo:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar el archivo",
        variant: "destructive",
      });
    }
  };

  const handleSubmitVehiculo = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      await onSaveVehiculo(formDataVehiculo);
      toast({
        title: "Éxito",
        description: "Datos del vehículo actualizados correctamente",
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitDocumentos = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      const dataToSend: Record<string, string> = {};
      
      if (documentos.documento_frente) dataToSend.documento_imagen_frente = documentos.documento_frente;
      if (documentos.documento_reverso) dataToSend.documento_imagen_reverso = documentos.documento_reverso;
      if (documentos.placa) dataToSend.imagen_placa = documentos.placa;
      if (documentos.licencia) dataToSend.imagen_licencia = documentos.licencia;
      if (documentos.seguro) dataToSend.imagen_seguro = documentos.seguro;
      if (documentos.tarjeta) dataToSend.imagen_tarjeta_propiedad = documentos.tarjeta;
      if (documentos.cuenta_bancaria) dataToSend.imagen_cuenta_bancaria = documentos.cuenta_bancaria;

      if (Object.keys(dataToSend).length === 0) {
        toast({
          title: "Sin cambios",
          description: "No se han seleccionado documentos para actualizar",
          variant: "destructive",
        });
        setIsSaving(false);
        return;
      }

      await onSaveDocumentos(dataToSend);
      toast({
        title: "Éxito",
        description: "Documentos actualizados correctamente",
      });
      setDocumentos({});
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  // Si no tiene registro de vehículo, mostrar mensaje
  if (!motorizado?.registroVehiculo) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
          <div className="text-center">
            <Truck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Sin Registro de Vehículo</h3>
            <p className="text-gray-600 mb-4">
              Este motorizado no tiene datos de vehículo registrados (puede ser bicicleta o moto eléctrica).
            </p>
            <Button onClick={onClose} variant="outline">
              Cerrar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Encabezado */}
        <div className="bg-gradient-to-r from-red-500 to-rose-600 text-white p-6 rounded-t-lg">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Editar Motorizado</h2>
              <p className="text-sm opacity-90 mt-1">
                {motorizado.personal.name} {motorizado.personal.lastName}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="flex">
            <button
              onClick={() => setActiveTab("vehiculo")}
              className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === "vehiculo"
                  ? "border-b-2 border-red-500 text-red-600 bg-white"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <Truck className="w-4 h-4 inline mr-2" />
              Datos del Vehículo
            </button>
            <button
              onClick={() => setActiveTab("documentos")}
              className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === "documentos"
                  ? "border-b-2 border-red-500 text-red-600 bg-white"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              Documentos
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {activeTab === "vehiculo" ? (
            <form onSubmit={handleSubmitVehiculo} className="space-y-4">
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Tipo de Vehículo:</strong> {motorizado.personal.vehiculo || "No especificado"}
                </p>
              </div>

              <div>
                <Label htmlFor="placa">Placa *</Label>
                <Input
                  id="placa"
                  value={formDataVehiculo.placa}
                  onChange={(e) =>
                    setFormDataVehiculo({ ...formDataVehiculo, placa: e.target.value.toUpperCase() })
                  }
                  required
                  className="mt-1"
                  placeholder="Ej: ABC-123"
                />
              </div>

              <div>
                <Label htmlFor="licencia_conducir">Licencia de Conducir *</Label>
                <Input
                  id="licencia_conducir"
                  value={formDataVehiculo.licencia_conducir}
                  onChange={(e) =>
                    setFormDataVehiculo({ ...formDataVehiculo, licencia_conducir: e.target.value })
                  }
                  required
                  className="mt-1"
                  placeholder="Número de licencia"
                />
              </div>

              <div>
                <Label htmlFor="seguro">Número de Seguro *</Label>
                <Input
                  id="seguro"
                  value={formDataVehiculo.seguro}
                  onChange={(e) =>
                    setFormDataVehiculo({ ...formDataVehiculo, seguro: e.target.value })
                  }
                  required
                  className="mt-1"
                  placeholder="Número de póliza de seguro"
                />
              </div>

              <div>
                <Label htmlFor="tarjeta_propiedad">Tarjeta de Propiedad *</Label>
                <Input
                  id="tarjeta_propiedad"
                  value={formDataVehiculo.tarjeta_propiedad}
                  onChange={(e) =>
                    setFormDataVehiculo({ ...formDataVehiculo, tarjeta_propiedad: e.target.value })
                  }
                  required
                  className="mt-1"
                  placeholder="Número de tarjeta de propiedad"
                />
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmitDocumentos} className="space-y-6">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Nota:</strong> Solo sube los documentos que deseas actualizar. Los demás permanecerán sin cambios.
                </p>
              </div>

              {/* Documentos de Identidad */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-red-600" />
                  Documentos de Identidad
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-2 block">Documento Frente</Label>
                    <input
                      ref={fileInputRefs.documento_frente}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, "documento_frente")}
                      className="hidden"
                    />
                    <DocumentPreview
                      src={motorizado.personal.documento_imagen_frente}
                      alt="Documento Frente"
                      onReplace={() => fileInputRefs.documento_frente.current?.click()}
                    />
                  </div>

                  <div>
                    <Label className="mb-2 block">Documento Reverso</Label>
                    <input
                      ref={fileInputRefs.documento_reverso}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, "documento_reverso")}
                      className="hidden"
                    />
                    <DocumentPreview
                      src={motorizado.personal.documento_imagen_reverso}
                      alt="Documento Reverso"
                      onReplace={() => fileInputRefs.documento_reverso.current?.click()}
                    />
                  </div>
                </div>
              </div>

              {/* Documentos del Vehículo */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-red-600" />
                  Documentos del Vehículo
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-2 block">Imagen de Placa</Label>
                    <input
                      ref={fileInputRefs.placa}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, "placa")}
                      className="hidden"
                    />
                    <DocumentPreview
                      src={motorizado.registroVehiculo.imagen_placa}
                      alt="Placa"
                      onReplace={() => fileInputRefs.placa.current?.click()}
                    />
                  </div>

                  <div>
                    <Label className="mb-2 block">Imagen de Licencia</Label>
                    <input
                      ref={fileInputRefs.licencia}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, "licencia")}
                      className="hidden"
                    />
                    <DocumentPreview
                      src={motorizado.registroVehiculo.imagen_licencia}
                      alt="Licencia"
                      onReplace={() => fileInputRefs.licencia.current?.click()}
                    />
                  </div>

                  <div>
                    <Label className="mb-2 block">Imagen de Seguro</Label>
                    <input
                      ref={fileInputRefs.seguro}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, "seguro")}
                      className="hidden"
                    />
                    <DocumentPreview
                      src={motorizado.registroVehiculo.imagen_seguro}
                      alt="Seguro"
                      onReplace={() => fileInputRefs.seguro.current?.click()}
                    />
                  </div>

                  <div>
                    <Label className="mb-2 block">Imagen de Tarjeta de Propiedad</Label>
                    <input
                      ref={fileInputRefs.tarjeta}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, "tarjeta")}
                      className="hidden"
                    />
                    <DocumentPreview
                      src={motorizado.registroVehiculo.imagen_tarjeta_propiedad}
                      alt="Tarjeta de Propiedad"
                      onReplace={() => fileInputRefs.tarjeta.current?.click()}
                    />
                  </div>
                </div>
              </div>

              {/* Documento de Cuenta Bancaria */}
              {motorizado.datosBancarios && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-red-600" />
                    Documento de Cuenta Bancaria
                  </h3>
                  
                  <div>
                    <Label className="mb-2 block">Imagen/PDF de Cuenta Bancaria</Label>
                    <input
                      ref={fileInputRefs.cuenta_bancaria}
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => handleFileUpload(e, "cuenta_bancaria")}
                      className="hidden"
                    />
                    <DocumentPreview
                      src={motorizado.datosBancarios.imagen_cuenta}
                      alt="Cuenta Bancaria"
                      onReplace={() => fileInputRefs.cuenta_bancaria.current?.click()}
                    />
                  </div>
                </div>
              )}
            </form>
          )}
        </div>

        {/* Pie fijo */}
        <div className="bg-gray-50 border-t p-6 flex justify-end gap-3 rounded-b-lg">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button
            onClick={activeTab === "vehiculo" ? handleSubmitVehiculo : handleSubmitDocumentos}
            disabled={isSaving}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            {isSaving ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </div>
    </div>
  );
};
