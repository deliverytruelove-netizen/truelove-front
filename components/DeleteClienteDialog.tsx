// components/DeleteClienteDialog.tsx
"use client";

import type React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteClienteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  clienteName: string;
}

export const DeleteClienteDialog: React.FC<DeleteClienteDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  clienteName,
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Se eliminará permanentemente el cliente{" "}
            <span className="font-semibold text-red-600">{clienteName}</span> y todos sus datos
            relacionados (direcciones).
            <br />
            <br />
            <span className="text-yellow-600 font-medium">
              Nota: Los pedidos del cliente se mantendrán como histórico.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700"
          >
            Sí, eliminar cliente
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
