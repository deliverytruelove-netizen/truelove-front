// components/modals/AsignarPedidosModal.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { actualizarNivelYPedidos } from "@/app/admin/motorizado/services/motorizado.service"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useQueryClient } from "@tanstack/react-query"

interface AsignarPedidosModalProps {
  isOpen: boolean;
  onClose: (pedidosAsignados?: boolean) => void;
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
  const [nivel, setNivel] = useState<number>(1);
  const [pedidosConsecutivos, setPedidosConsecutivos] = useState<number>(2);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  if (!isOpen) return null;

  // Sugerencias de pedidos según nivel
  const sugerenciasPorNivel: Record<number, number> = {
    1: 2, // Principiante
    2: 3, // Intermedio
    3: 4, // Avanzado
    4: 5, // Experto
    5: 6, // Master
  };

  const niveles = [
    { value: 1, label: "Nivel 1 - Principiante", descripcion: "Nuevo, sin experiencia" },
    { value: 2, label: "Nivel 2 - Intermedio", descripcion: "Algo de experiencia" },
    { value: 3, label: "Nivel 3 - Avanzado", descripcion: "Experiencia considerable" },
    { value: 4, label: "Nivel 4 - Experto", descripcion: "Muy experimentado" },
    { value: 5, label: "Nivel 5 - Master", descripcion: "Máxima experiencia" },
  ];

  const handleNivelChange = (nuevoNivel: number) => {
    setNivel(nuevoNivel);
    setPedidosConsecutivos(sugerenciasPorNivel[nuevoNivel]);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await actualizarNivelYPedidos(motorizadoId, nivel, pedidosConsecutivos);
      
      queryClient.invalidateQueries({ queryKey: ["motorizado-details", motorizadoId] });
      
      toast({
        title: "Éxito",
        description: "Nivel y cantidad de pedidos actualizados correctamente",
      });
      onSuccess();
      onClose(true);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo actualizar",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4">Configurar Nivel y Pedidos</h2>
        <p className="text-gray-600 mb-4">
          Configure el nivel de experiencia y pedidos consecutivos para {motorizadoNombre}
        </p>
        
        <div className="space-y-4">
          {/* Selector de Nivel */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nivel de Experiencia
            </label>
            <Select
              value={nivel.toString()}
              onValueChange={(value) => handleNivelChange(parseInt(value))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar nivel" />
              </SelectTrigger>
              <SelectContent>
                {niveles.map((n) => (
                  <SelectItem key={n.value} value={n.value.toString()}>
                    <div className="flex flex-col">
                      <span className="font-medium">{n.label}</span>
                      <span className="text-xs text-gray-500">{n.descripcion}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Input de Pedidos Consecutivos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pedidos Consecutivos (Simultáneos)
            </label>
            <Input
              type="number"
              min="1"
              max="10"
              value={pedidosConsecutivos}
              onChange={(e) => setPedidosConsecutivos(parseInt(e.target.value) || 1)}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              Cantidad máxima de pedidos que puede tomar al mismo tiempo
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Sugerencia:</strong> Nivel {nivel} recomienda {sugerenciasPorNivel[nivel]} pedidos consecutivos
            </p>
          </div>
        </div>
        
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => onClose(false)}>
            Cancelar
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
