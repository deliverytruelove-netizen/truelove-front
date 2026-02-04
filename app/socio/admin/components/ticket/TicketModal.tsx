"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { Printer, Loader2 } from "lucide-react"
import type { PedidoActivo, Pedido } from "../../services/pedido.service"

interface TicketModalProps {
  pedido: PedidoActivo | Pedido
  localName?: string
  trigger?: React.ReactNode
}

const API_URL = process.env.NEXT_PUBLIC_API_WEB

export function TicketModal({ pedido, trigger }: TicketModalProps) {
  const [open, setOpen] = useState(false)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setIsLoading(true)
      // URL del PDF generado por el backend
      const url = `${API_URL}/pedido/${pedido.id}/ticket`
      setPdfUrl(url)
      setIsLoading(false)
    } else {
      setPdfUrl(null)
    }
  }, [open, pedido.id])

  return (
    <>
      {trigger ? (
        <div onClick={() => setOpen(true)}>{trigger}</div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setOpen(true)}
          className="gap-1"
        >
          <Printer className="h-4 w-4" />
          Ticket
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-4xl h-[90vh] p-0 gap-0 overflow-hidden">
          {/* Visor de PDF nativo del navegador */}
          {isLoading ? (
            <div className="flex-1 bg-gray-100 flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
                <span className="text-sm text-gray-600">Cargando ticket...</span>
              </div>
            </div>
          ) : pdfUrl ? (
            <iframe
              src={pdfUrl}
              className="w-full h-full border-0"
              title={`Ticket Pedido #${pedido.id}`}
            />
          ) : (
            <div className="flex-1 bg-gray-100 flex items-center justify-center h-full">
              <div className="text-gray-600 text-sm">Error al cargar el PDF</div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
