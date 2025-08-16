// app/socio/admin/info-socio/components/BusinessDataModal.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { fetchRucDataService } from "@/services/rucService";
import { Loader2, Search } from "lucide-react";

// Tipos para los datos del modal
interface BusinessData {
  ruc: string;
  razon_social: string;
}

interface BusinessDataModalProps {
  currentData: BusinessData | null;
  onUpdate: (data: BusinessData) => Promise<void>;
  onClose: () => void;
}

export default function BusinessDataModal({
  currentData,
  onUpdate,
  onClose,
}: BusinessDataModalProps) {
  const [formData, setFormData] = useState<BusinessData>({
    ruc: "",
    razon_social: "",
  });
  const [loading, setLoading] = useState(false);
  const [isFetchingRuc, setIsFetchingRuc] = useState(false);
  const { toast } = useToast();

  // Cargar datos iniciales cuando el modal se abre
  useEffect(() => {
    if (currentData) {
      setFormData({
        ruc: currentData.ruc || "",
        razon_social: currentData.razon_social || "",
      });
    }
  }, [currentData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Función para consultar el RUC
  const handleRucLookup = async () => {
    if (formData.ruc.length !== 11) {
      toast({
        title: "RUC inválido",
        description: "El RUC debe tener 11 dígitos.",
        variant: "destructive",
      });
      return;
    }

    setIsFetchingRuc(true);
    try {
      const data = await fetchRucDataService(formData.ruc);
      if (data && data.razonSocial) {
        setFormData((prev) => ({ ...prev, razon_social: data.razonSocial }));
        toast({
          title: "Éxito",
          description: "Razón Social encontrada.",
        });
      } else {
        toast({
          title: "RUC no encontrado",
          description: "No se encontró información para el RUC ingresado.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error de Consulta",
        description: "No se pudo consultar el RUC. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsFetchingRuc(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.ruc || !formData.razon_social) {
      toast({
        title: "Campos requeridos",
        description: "Por favor, completa todos los campos.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      await onUpdate(formData);
    } catch {
      // El manejo de errores se hace en el componente padre
      // console.error("Error al actualizar:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Editar Datos Legales (RUC)</DialogTitle>
        <DialogDescription>
          Actualiza el RUC y la Razón Social de tu negocio.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="ruc">RUC *</Label>
          <div className="flex items-center space-x-2">
            <Input
              id="ruc"
              name="ruc"
              value={formData.ruc}
              onChange={handleChange}
              required
              maxLength={11}
              placeholder="Ingresa los 11 dígitos del RUC"
            />
            <Button
              type="button"
              size="icon"
              onClick={handleRucLookup}
              disabled={isFetchingRuc || formData.ruc.length !== 11}
            >
              {isFetchingRuc ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="razon_social">Razón Social *</Label>
          <Input
            id="razon_social"
            name="razon_social"
            value={formData.razon_social}
            onChange={handleChange}
            required
            placeholder="La Razón Social se autocompletará"
            readOnly={isFetchingRuc}
          />
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading || isFetchingRuc}>
            {loading ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </form>
    </>
  );
}