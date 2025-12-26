// components\PDFViewer.tsx
"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, Eye, ExternalLink } from "lucide-react"
import { PDFModal } from "./PDFModal"

interface PDFViewerProps {
  url: string | null
  title: string
  downloadName?: string
}

export const PDFViewer: React.FC<PDFViewerProps> = ({ url, title, downloadName }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  if (!url) {
    return (
      <div className="border rounded-lg p-4">
        <h4 className="text-lg font-semibold mb-2">{title}</h4>
        <div className="text-gray-500 p-4 text-center">No hay documento disponible</div>
      </div>
    )
  }

  const handleDownload = async () => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = downloadUrl
      link.download = downloadName || `${title.toLowerCase().replace(/ /g, "_")}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      console.error("Error al descargar el PDF:", error)
    }
  }

  const openInNewTab = () => {
    window.open(url, '_blank')
  }

  const openModal = () => {
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-lg font-semibold">{title}</h4>
        <div className="flex gap-2">
          <Button onClick={openModal} variant="outline" size="sm" className="text-blue-600 hover:text-blue-700">
            <Eye className="w-4 h-4 mr-2" />
            Ver PDF
          </Button>
          <Button onClick={openInNewTab} variant="outline" size="sm" className="text-green-600 hover:text-green-700">
            <ExternalLink className="w-4 h-4 mr-2" />
            Abrir
          </Button>
          <Button onClick={handleDownload} variant="outline" size="sm" className="text-blue-600 hover:text-blue-700">
            <Download className="w-4 h-4 mr-2" />
            Descargar
          </Button>
        </div>
      </div>
      
      {/* Vista previa simple con iframe */}
      <div className="flex flex-col items-center">
        <div className="w-full h-64 border rounded-lg overflow-hidden bg-gray-50">
          <iframe
            src={`${url}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
            className="w-full h-full"
            title={title}
          />
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Vista previa del documento
        </p>
      </div>

      {/* Modal para ver el PDF completo */}
      <PDFModal isOpen={isModalOpen} onClose={closeModal} url={url} title={title} />
    </div>
  )
}
