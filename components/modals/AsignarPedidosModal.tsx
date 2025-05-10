// components/modals/AsignarPedidosModal.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { actualizarCantidadPedidos } from "@/app/admin/motorizado/services/motorizado.service"
import { useToast } from "@/hooks/use-toast"
import { useQueryClient } from "@tanstack/react-query"

interface AsignarPedidosModalProps {
  isOpen: boolean;
  onClose: () => void;
  motorizadoId: number;
  motorizadoNombre: string;
  onSuccess: () => void;
}

export function AsignarPedidosModal({ 
  isOpen, 
  onClose, 
  motorizadoId, 
  motorizadoNombre,
  onSuccess 
}: AsignarPedidosModalProps) {
  const [cantidadPedidos, setCantidadPedidos] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await actualizarCantidadPedidos(motorizadoId, cantidadPedidos);
      
      // Invalidar la consulta con la sintaxis correcta
      queryClient.invalidateQueries({ queryKey: ["motorizado-details", motorizadoId] });
      
      toast({
        title: "Éxito",
        description: "Cantidad de pedidos asignada correctamente",
      });
      onSuccess();
      onClose();
    } catch  {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo asignar la cantidad de pedidos",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4">Asignar cantidad de pedidos diarios</h2>
        <p className="text-gray-600 mb-4">
          Asigne la cantidad de pedidos diarios que puede tomar {motorizadoNombre}
        </p>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cantidad de pedidos por día
          </label>
          <Input
            type="number"
            min="1"
            value={cantidadPedidos}
            onChange={(e) => setCantidadPedidos(parseInt(e.target.value))}
            className="w-full"
          />
        </div>
        
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose}>
            Asignar más tarde
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isLoading}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            {isLoading ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </div>
    </div>
  );
}