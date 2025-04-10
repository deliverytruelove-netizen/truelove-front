// components\PDFver.tsx
"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"

interface PdfViewerProps {
  url: string
}

export function PdfViewer({ url }: PdfViewerProps) {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simular un tiempo de carga para el iframe
    const timer = setTimeout(() => {
      setLoading(false)
    }, 800)

    return () => clearTimeout(timer)
  }, [url])

  return (
    <div className="relative w-full h-full min-h-[300px]">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-center">
            <Loader2 className="h-10 w-10 animate-spin mx-auto text-red-500 mb-2" />
            <p className="text-gray-600">Cargando documento...</p>
          </div>
        </div>
      )}
      <iframe
        src={`${url}#toolbar=1&navpanes=1&scrollbar=1`}
        className="w-full h-full min-h-[300px] rounded-lg border border-gray-200"
        style={{ display: loading ? "none" : "block" }}
        onLoad={() => setLoading(false)}
        title="PDF Viewer"
        allowFullScreen
      />
    </div>
  )
}
