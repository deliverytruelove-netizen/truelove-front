// app\admin\metodo-pago\components\gestion-metodos-pago.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { FormularioMetodoPago } from "./formulario-metodo-pago"
import { ConfirmDialog } from "./confirm-dialog"
import { MetodoPagoIcon } from "./metodo-pago-icon"
import { useMetodosPagoQuery } from "../hooks/use-metodos-pago"
import type { MetodoPago } from "../types/metodo-pago.types"

export default function GestionMetodosPago() {
  const { toast } = useToast()
  const { metodosPago, isLoading,  deleteMetodoPago, refetch } =
    useMetodosPagoQuery()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [selectedMetodo, setSelectedMetodo] = useState<MetodoPago | null>(null)

  const handleOpenDialog = (metodoPago?: MetodoPago) => {
    setSelectedMetodo(metodoPago || null)
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setSelectedMetodo(null)
  }

  const handleOpenConfirmDialog = (metodoPago: MetodoPago) => {
    setSelectedMetodo(metodoPago)
    setIsConfirmDialogOpen(true)
  }

  const handleCloseConfirmDialog = () => {
    setIsConfirmDialogOpen(false)
  }

  const handleDelete = async () => {
    if (!selectedMetodo?.id) return

    try {
      await deleteMetodoPago(selectedMetodo.id)
      handleCloseConfirmDialog()
    } catch  {
      toast({
        title: "Error",
        description: "No se pudo eliminar el método de pago",
        variant: "destructive",
      })
    }
  }

  // Aseguramos que metodosPago sea siempre un array para evitar errores
  const metodosArray = Array.isArray(metodosPago) ? metodosPago : []

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => handleOpenDialog()} className="bg-red-500 hover:bg-red-600">
          <Plus className="mr-2 h-4 w-4" /> Nuevo Método
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Método</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metodosArray.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6 text-gray-500">
                      No hay métodos de pago disponibles
                    </TableCell>
                  </TableRow>
                ) : (
                  metodosArray.map((metodoPago) => (
                    <TableRow key={metodoPago.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <MetodoPagoIcon nombre={metodoPago.nombre} className="h-8 w-8 mr-2" />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{metodoPago.nombre}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            metodoPago.estado ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {metodoPago.estado ? "Activo" : "Inactivo"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="icon" onClick={() => handleOpenDialog(metodoPago)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => handleOpenConfirmDialog(metodoPago)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <FormularioMetodoPago
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        metodoPago={selectedMetodo}
        onClose={handleCloseDialog}
        onSuccess={refetch}
      />

      <ConfirmDialog
        isOpen={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
        onConfirm={handleDelete}
        title="Eliminar Método de Pago"
        description={`¿Estás seguro de que deseas eliminar el método de pago "${selectedMetodo?.nombre}"?`}
      />
    </div>
  )
}