// components\PDFModal.tsx
"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { PdfViewer } from "./PDFver"

interface PDFModalProps {
  isOpen: boolean
  onClose: () => void
  url: string
  title: string
  
}

export function PDFModal({ isOpen, onClose, url, title }: PDFModalProps) {
  // Bloquear el scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }

    return () => {
      document.body.style.overflow = "auto"
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Encabezado */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">{title}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Contenido del PDF - Ahora ocupa todo el espacio disponible */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full">
            <PdfViewer url={url} />
          </div>
        </div>
      </div>
    </div>
  )
}
