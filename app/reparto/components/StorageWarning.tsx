// app/reparto/components/StorageWarning.tsx
"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FormDataService } from "@/services/formDataService";

export function StorageWarning() {
  const [showWarning, setShowWarning] = useState(false);
  const [storageInfo, setStorageInfo] = useState({ usado: 0, total: 0 });

  useEffect(() => {
    const checkStorage = () => {
      const { disponible, usado, total } = FormDataService.verificarEspacioDisponible();
      setStorageInfo({ usado, total });
      
      // Mostrar advertencia si está usando más del 70%
      if (!disponible || usado > total * 0.7) {
        setShowWarning(true);
      }
    };

    checkStorage();
  }, []);

  const handleClearCache = () => {
    if (confirm("¿Estás seguro de que quieres limpiar el caché? Perderás el progreso actual del registro.")) {
      FormDataService.limpiarTodosLosDatos();
      setShowWarning(false);
      window.location.reload();
    }
  };

  if (!showWarning) return null;

  const usadoMB = (storageInfo.usado / 1024 / 1024).toFixed(2);
  const totalMB = (storageInfo.total / 1024 / 1024).toFixed(2);
  const porcentaje = ((storageInfo.usado / storageInfo.total) * 100).toFixed(0);

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Almacenamiento casi lleno</AlertTitle>
      <AlertDescription className="mt-2">
        <p className="text-sm mb-3">
          Estás usando {usadoMB}MB de {totalMB}MB ({porcentaje}%). 
          Si tienes problemas al continuar, limpia el caché del navegador.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={handleClearCache}
          className="flex items-center gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Limpiar caché y reiniciar
        </Button>
      </AlertDescription>
    </Alert>
  );
}
