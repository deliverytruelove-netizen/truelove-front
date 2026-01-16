
// app/socio/admin/info-socio/components/BusinessInfoModal.tsx
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
import type { BusinessInfo, ApiResponse } from "@/app/admin/socios/types/Socios.types";

interface BusinessInfoModalProps {
  currentData: BusinessInfo | null;
  onUpdate: (data: BusinessInfo) => Promise<ApiResponse<unknown>>;
  onClose: () => void;
}

interface BusinessInfoFormData {
  nombre: string;
  total_sucursales: string; // Keep as string for input handling
  metodo_contacto: string;
  telefono: string;
  tipo_pago_digital: string; // Keep as string for select handling
  numero_pago_digital: string | null;
  nombre_titular_pago_digital: string | null;
}

export default function BusinessInfoModal({
  currentData,
  onUpdate,
  onClose,
}: BusinessInfoModalProps) {
  const [formData, setFormData] = useState<BusinessInfoFormData>({
    nombre: "",
    total_sucursales: "1",
    metodo_contacto: "",
    telefono: "",
    tipo_pago_digital: "0",
    numero_pago_digital: "",
    nombre_titular_pago_digital: "",
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (currentData) {
      setFormData({
        nombre: currentData.nombre || "",
        total_sucursales: String(currentData.total_sucursales || 1),
        metodo_contacto: currentData.metodo_contacto || "",
        telefono: currentData.telefono || "",
        tipo_pago_digital: String(currentData.tipo_pago_digital || 0),
        numero_pago_digital: currentData.numero_pago_digital || "",
        nombre_titular_pago_digital: currentData.nombre_titular_pago_digital || "",
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
      // Convert string values to appropriate types before sending
      const dataToSend: BusinessInfo = {
        nombre: formData.nombre.trim(),
        total_sucursales: parseInt(formData.total_sucursales, 10),
        metodo_contacto: formData.metodo_contacto.trim(),
        telefono: formData.telefono.trim(),
        tipo_pago_digital: parseInt(formData.tipo_pago_digital, 10),
        numero_pago_digital: formData.numero_pago_digital ? formData.numero_pago_digital.trim() : null,
        nombre_titular_pago_digital: formData.nombre_titular_pago_digital ? formData.nombre_titular_pago_digital.trim() : null,
      };

      // Validate required fields
      if (!dataToSend.nombre) {
        toast({
          title: "Error",
          description: "El nombre del negocio es requerido",
          variant: "destructive",
        });
        return;
      }

      if (dataToSend.total_sucursales < 1) {
        toast({
          title: "Error",
          description: "El total de sucursales debe ser mayor a 0",
          variant: "destructive",
        });
        return;
      }

      if (!dataToSend.metodo_contacto) {
        toast({
          title: "Error",
          description: "El método de contacto es requerido",
          variant: "destructive",
        });
        return;
      }

      if (!dataToSend.telefono) {
        toast({
          title: "Error",
          description: "El teléfono es requerido",
          variant: "destructive",
        });
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
        <DialogTitle>Editar Datos del Negocio</DialogTitle>
        <DialogDescription>
          Actualiza la información de tu negocio aquí.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre del Negocio *</Label>
            <Input
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              placeholder="Ingresa el nombre del negocio"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="total_sucursales">Total Sucursales *</Label>
            <Input
              id="total_sucursales"
              name="total_sucursales"
              type="number"
              min="1"
              value={formData.total_sucursales}
              onChange={handleChange}
              required
              placeholder="Número de sucursales"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="metodo_contacto">Método de Contacto *</Label>
            <Input
              id="metodo_contacto"
              name="metodo_contacto"
              value={formData.metodo_contacto}
              onChange={handleChange}
              required
              placeholder="WhatsApp, Teléfono, etc."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="telefono">Teléfono *</Label>
            <Input
              id="telefono"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              required
              placeholder="Número de teléfono"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="tipo_pago_digital">Tipo de Pago Digital</Label>
          <Select
            key={formData.tipo_pago_digital} // Forzar re-renderizado cuando el valor inicial cambia
            name="tipo_pago_digital"
            defaultValue={formData.tipo_pago_digital}
            onValueChange={(value) => handleSelectChange("tipo_pago_digital", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Ninguno</SelectItem>
              <SelectItem value="1">Yape</SelectItem>
              <SelectItem value="2">Plin</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {parseInt(formData.tipo_pago_digital) > 0 && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="numero_pago_digital">Número de Pago</Label>
              <Input
                id="numero_pago_digital"
                name="numero_pago_digital"
                value={formData.numero_pago_digital || ""}
                onChange={handleChange}
                placeholder="Número del pago digital"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nombre_titular_pago_digital">
                Nombre del Titular
              </Label>
              <Input
                id="nombre_titular_pago_digital"
                name="nombre_titular_pago_digital"
                value={formData.nombre_titular_pago_digital || ""}
                onChange={handleChange}
                placeholder="Dejar vacío para usar tu nombre"
              />
              <p className="text-xs text-muted-foreground">
                Si no registro un nombre, se usará tu nombre completo automáticamente
              </p>
            </div>
          </div>
        )}
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