// app/socio/admin/info-socio/components/PersonalInfoModal.tsx
import { useState, useEffect } from "react";
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
import { useToast } from "@/hooks/use-toast";
import type { ApiResponse } from "@/app/admin/socios/types/Socios.types";

interface PersonalInfo {
  documentNumber: string;
  name: string;
  lastName: string;
  email: string;
  phone: string;
  posToDriver: number;
  entrega_documento_venta: number;
}

interface PersonalInfoModalProps {
  currentData: PersonalInfo | null;
  onUpdate: (data: PersonalInfo) => Promise<ApiResponse<unknown>>;
  onClose: () => void;
}

interface PersonalInfoFormData {
  documentNumber: string;
  name: string;
  lastName: string;
  email: string;
  phone: string;
  posToDriver: string;
  entrega_documento_venta: string;
}

export default function PersonalInfoModal({
  currentData,
  onUpdate,
  onClose,
}: PersonalInfoModalProps) {
  const [formData, setFormData] = useState<PersonalInfoFormData>({
    documentNumber: "",
    name: "",
    lastName: "",
    email: "",
    phone: "",
    posToDriver: "0",
    entrega_documento_venta: "0",
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (currentData) {
      // Limpiar el teléfono si tiene el prefijo 51
      let cleanPhone = currentData.phone || "";
      if (cleanPhone.startsWith("51") && cleanPhone.length === 11) {
        cleanPhone = cleanPhone.substring(2);
      }
      
      setFormData({
        documentNumber: currentData.documentNumber || "",
        name: currentData.name || "",
        lastName: currentData.lastName || "",
        email: currentData.email || "",
        phone: cleanPhone,
        posToDriver: String(currentData.posToDriver || 0),
        entrega_documento_venta: String(currentData.entrega_documento_venta || 0),
      });
    }
  }, [currentData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Validar DNI (8 dígitos)
      if (!/^\d{8}$/.test(formData.documentNumber.trim())) {
        toast({
          title: "Error",
          description: "El DNI debe tener exactamente 8 dígitos",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Validar email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        toast({
          title: "Error",
          description: "El correo electrónico no es válido",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Validar teléfono (9 dígitos)
      if (!/^\d{9}$/.test(formData.phone.trim())) {
        toast({
          title: "Error",
          description: "El teléfono debe tener exactamente 9 dígitos",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Convert string values to appropriate types before sending
      const dataToSend: PersonalInfo = {
        documentNumber: formData.documentNumber.trim(),
        name: formData.name.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        posToDriver: parseInt(formData.posToDriver, 10),
        entrega_documento_venta: parseInt(formData.entrega_documento_venta, 10),
      };

      // Validate required fields
      if (!dataToSend.documentNumber) {
        toast({
          title: "Error",
          description: "El número de documento es requerido",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (!dataToSend.name) {
        toast({
          title: "Error",
          description: "El nombre es requerido",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (!dataToSend.lastName) {
        toast({
          title: "Error",
          description: "El apellido es requerido",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (!dataToSend.email) {
        toast({
          title: "Error",
          description: "El correo electrónico es requerido",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (!dataToSend.phone) {
        toast({
          title: "Error",
          description: "El teléfono es requerido",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      await onUpdate(dataToSend);
    } catch (error) {
      // Error handling is done in parent component
      console.error("Error en handleSubmit:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Editar Información Personal</DialogTitle>
        <DialogDescription>
          Actualiza tu información personal aquí. El DNI y correo serán validados.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="documentNumber">DNI *</Label>
            <Input
              id="documentNumber"
              name="documentNumber"
              value={formData.documentNumber}
              onChange={handleChange}
              required
              maxLength={8}
              placeholder="12345678"
            />
            <p className="text-xs text-gray-500">Debe tener 8 dígitos</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="correo@ejemplo.com"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Ingresa tu nombre"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Apellido *</Label>
            <Input
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              placeholder="Ingresa tu apellido"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Teléfono *</Label>
          <Input
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            maxLength={9}
            placeholder="987654321"
          />
          <p className="text-xs text-gray-500">Debe tener 9 dígitos</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="posToDriver">POS para Motorizado</Label>
          <Select
            key={formData.posToDriver}
            name="posToDriver"
            defaultValue={formData.posToDriver}
            onValueChange={(value) => handleSelectChange("posToDriver", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una opción" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">No facilita POS</SelectItem>
              <SelectItem value="1">POS Estilos</SelectItem>
              <SelectItem value="2">POS Visa</SelectItem>
              <SelectItem value="3">Envía ambos POS</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="entrega_documento_venta">Entrega Documento de Venta</Label>
          <Select
            key={formData.entrega_documento_venta}
            name="entrega_documento_venta"
            defaultValue={formData.entrega_documento_venta}
            onValueChange={(value) => handleSelectChange("entrega_documento_venta", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una opción" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">No emite documentos de venta</SelectItem>
              <SelectItem value="1">Sí emite documentos de venta</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </form>
    </>
  );
}
