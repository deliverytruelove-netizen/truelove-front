import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, X, FileText, Image as ImageIcon } from "lucide-react";
import NextImage from "next/image";
import { socioService } from "../../services/socio.service";
import type { BankAccountFormData } from "@/app/admin/socios/types/Socios.types";

interface BankAccountModalProps {
  currentData: {
    titular_cuenta?: string;
    dni?: string;
    banco?: string;
    tipo_cuenta?: string;
    numero_cuenta?: string;
    imagenes_cuenta?: string[];
  } | null;
  onUpdate: (data: BankAccountFormData) => Promise<void>;
  onClose: () => void;
}

interface Banco {
  id: number;
  nombre: string;
}

interface TipoCuenta {
  id: number;
  nombre: string;
}

// Función para abreviar nombres de archivo largos
const abbreviateFileName = (name: string, maxLength = 35) => {
  if (name.length <= maxLength) {
    return name;
  }
  const extensionIndex = name.lastIndexOf('.');
  const hasExtension = extensionIndex !== -1 && name.length - extensionIndex <= 5;

  if (hasExtension) {
    const extension = name.substring(extensionIndex);
    const namePart = name.substring(0, extensionIndex);
    const charsToKeep = maxLength - extension.length - 3; // 3 for "..."
    return namePart.substring(0, charsToKeep) + "..." + extension;
  }

  return name.substring(0, maxLength - 3) + "...";
};

export default function BankAccountModal({
  currentData,
  onUpdate,
  onClose,
}: BankAccountModalProps) {
  const [formData, setFormData] = useState({
    titular_cuenta: "",
    dni: "",
    banco_id: 0,
    tipo_cuenta_id: 0,
    numero_cuenta: "",
  });
  
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [currentDocuments, setCurrentDocuments] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [bancos, setBancos] = useState<Banco[]>([]);
  const [tiposCuenta, setTiposCuenta] = useState<TipoCuenta[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cargar bancos y tipos de cuenta
  useEffect(() => {
    const loadBancosYTipos = async () => {
      try {
        setLoadingData(true);
        const [bancosData, tiposData] = await Promise.all([
          socioService.getBancos(),
          socioService.getTiposCuenta()
        ]);
        setBancos(bancosData);
        setTiposCuenta(tiposData);
      } catch (error) {
        console.error("Error al cargar bancos y tipos:", error);
      } finally {
        setLoadingData(false);
      }
    };

    loadBancosYTipos();
  }, []);

  // Cargar datos actuales
  useEffect(() => {
    if (currentData && bancos.length > 0 && tiposCuenta.length > 0) {
      let bancoId = 0;
      let tipoCuentaId = 0;

      if (currentData.banco) {
        const banco = bancos.find(b => 
          b.nombre.toLowerCase().includes(currentData.banco!.toLowerCase()) ||
          currentData.banco!.toLowerCase().includes(b.nombre.toLowerCase())
        );
        bancoId = banco ? banco.id : 0;
      }

      if (currentData.tipo_cuenta) {
        const tipoCuenta = tiposCuenta.find(tc => 
          tc.nombre.toLowerCase().includes(currentData.tipo_cuenta!.toLowerCase()) ||
          currentData.tipo_cuenta!.toLowerCase().includes(tc.nombre.toLowerCase())
        );
        tipoCuentaId = tipoCuenta ? tipoCuenta.id : 0;
      }

      setFormData({
        titular_cuenta: currentData.titular_cuenta || "",
        dni: currentData.dni || "",
        banco_id: bancoId,
        tipo_cuenta_id: tipoCuentaId,
        numero_cuenta: currentData.numero_cuenta || "",
      });

      setCurrentDocuments(currentData.imagenes_cuenta || []);
    }
  }, [currentData, bancos, tiposCuenta]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: parseInt(value) }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const validTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
        'application/pdf'
      ];
      return validTypes.includes(file.type);
    });

    if (validFiles.length !== files.length) {
      alert('Solo se permiten archivos JPG, PNG, GIF y PDF');
    }
    
    if (validFiles.length > 0) {
      setCurrentDocuments([]);
      setSelectedFiles(validFiles);
    }
  };

  const removeFile = (index: number, isExisting = false) => {
    if (isExisting) {
      setCurrentDocuments(prev => prev.filter((_, i) => i !== index));
    } else {
      setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    }
  };

  const isPdfFile = (fileName: string): boolean => {
    return fileName.toLowerCase().endsWith('.pdf');
  };

  const getFileIcon = (file: File) => {
    if (file.type === 'application/pdf') {
      return <FileText className="w-8 h-8 text-red-500 flex-shrink-0" />;
    }
    return <ImageIcon className="w-8 h-8 text-blue-500 flex-shrink-0" />;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = [];
    if (!formData.titular_cuenta.trim()) errors.push("Titular de la cuenta");
    if (!formData.dni.trim()) errors.push("DNI del titular");
    if (!formData.numero_cuenta.trim()) errors.push("Número de cuenta");
    if (formData.banco_id === 0) errors.push("Banco");
    if (formData.tipo_cuenta_id === 0) errors.push("Tipo de cuenta");

    if (errors.length > 0) {
      alert(`Por favor completa los siguientes campos: ${errors.join(", ")}`);
      return;
    }

    setLoading(true);
    try {
      const dataToSend: BankAccountFormData = {
        titular_cuenta: formData.titular_cuenta.trim(),
        dni: formData.dni.trim(),
        banco_id: formData.banco_id,
        tipo_cuenta_id: formData.tipo_cuenta_id,
        numero_cuenta: formData.numero_cuenta.trim(),
        imagenes_cuenta: selectedFiles.length > 0 ? selectedFiles : undefined
      };
      
      await onUpdate(dataToSend);
    } catch (error) {
      console.error("Error al actualizar:", error);
      alert("Error al actualizar la cuenta bancaria. Por favor intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <>
        <DialogHeader>
          <DialogTitle>Editar Cuenta Bancaria (Verificación)</DialogTitle>
          <DialogDescription>Cargando datos...</DialogDescription>
        </DialogHeader>
        <div className="py-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Editar Cuenta Bancaria (Verificación)</DialogTitle>
        <DialogDescription>
          Actualiza los datos de tu cuenta bancaria y documentos para verificación.
        </DialogDescription>
      </DialogHeader>
      
      <form onSubmit={handleSubmit} className="space-y-4 py-4">
        {/* Form fields... */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="titular_cuenta">Titular de la Cuenta *</Label>
            <Input id="titular_cuenta" name="titular_cuenta" value={formData.titular_cuenta} onChange={handleChange} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dni">DNI del Titular *</Label>
            <Input id="dni" name="dni" value={formData.dni} onChange={handleChange} required />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="banco_id">Banco *</Label>
          <Select name="banco_id" value={formData.banco_id > 0 ? String(formData.banco_id) : ""} onValueChange={(value) => handleSelectChange("banco_id", value)} required>
            <SelectTrigger><SelectValue placeholder="Selecciona un banco" /></SelectTrigger>
            <SelectContent>{bancos.map((banco) => <SelectItem key={banco.id} value={String(banco.id)}>{banco.nombre}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="tipo_cuenta_id">Tipo de Cuenta *</Label>
          <Select name="tipo_cuenta_id" value={formData.tipo_cuenta_id > 0 ? String(formData.tipo_cuenta_id) : ""} onValueChange={(value) => handleSelectChange("tipo_cuenta_id", value)} required>
            <SelectTrigger><SelectValue placeholder="Selecciona un tipo de cuenta" /></SelectTrigger>
            <SelectContent>{tiposCuenta.map((tipo) => <SelectItem key={tipo.id} value={String(tipo.id)}>{tipo.nombre}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="numero_cuenta">Número de Cuenta *</Label>
          <Input id="numero_cuenta" name="numero_cuenta" value={formData.numero_cuenta} onChange={handleChange} required />
        </div>

        {currentDocuments.length > 0 && (
          <div className="space-y-2">
            <Label>Documentos Actuales</Label>
            <div className="grid grid-cols-2 gap-2">
              {currentDocuments.map((doc, index) => (
                <div key={index} className="relative border rounded p-2">
                  {isPdfFile(doc) ? (
                    <div className="flex items-center space-x-2">
                      <FileText className="w-6 h-6 text-red-500" />
                      <span className="text-sm truncate">{abbreviateFileName(doc, 20)}</span>
                    </div>
                  ) : (
                    <NextImage src={`/storage/${doc}`} alt={`Documento ${index + 1}`} width={100} height={60} className="object-cover rounded" />
                  )}
                  <Button type="button" variant="outline" size="sm" className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full" onClick={() => removeFile(index, true)}>
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label>Nuevos Documentos (Opcional)</Label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <input ref={fileInputRef} type="file" multiple accept=".jpg,.jpeg,.png,.gif,.pdf" onChange={handleFileSelect} className="hidden" />
            <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full">
              <Upload className="w-4 h-4 mr-2" />
              Seleccionar archivos (JPG, PNG, GIF, PDF)
            </Button>
          </div>

          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <Label>Archivos seleccionados:</Label>
              <div className="space-y-2">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between space-x-2 p-2 border rounded">
                    <div className="flex items-center space-x-2 min-w-0">
                      {getFileIcon(file)}
                      <span className="text-sm break-all">{abbreviateFileName(file.name)}</span>
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeFile(index, false)} className="flex-shrink-0">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={loading}>{loading ? "Guardando..." : "Guardar Cambios"}</Button>
        </div>
      </form>
    </>
  );
}
