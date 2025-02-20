import type React from "react"
import { useState } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Download } from "lucide-react"

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@2.16.105/build/pdf.worker.min.js`

interface PDFViewerProps {
  url: string | null
  title: string
}

export const PDFViewer: React.FC<PDFViewerProps> = ({ url, title }) => {
  const [numPages, setNumPages] = useState<number | null>(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [error, setError] = useState<string | null>(null)

  if (!url) {
    return (
      <div className="border rounded-lg p-4">
        <h4 className="text-lg font-semibold mb-2">{title}</h4>
        <div className="text-gray-500 p-4 text-center">No hay documento disponible</div>
      </div>
    )
  }

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages)
    setError(null)
  }

  function onDocumentLoadError(error: Error) {
    console.error("Error loading PDF:", error)
    setError("Error al cargar el PDF. Por favor, intente nuevamente.")
  }

  const handleDownload = async () => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `${title.toLowerCase().replace(/ /g, '_')}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      console.error("Error al descargar el PDF:", error)
      setError("Error al descargar el PDF. Por favor, intente nuevamente.")
    }
  }

  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-lg font-semibold">{title}</h4>
        <Button
          onClick={handleDownload}
          variant="outline"
          size="sm"
          className="text-blue-600 hover:text-blue-700"
        >
          <Download className="w-4 h-4 mr-2" />
          Descargar PDF
        </Button>
      </div>
      <div className="flex flex-col items-center">
        {error ? (
          <div className="text-red-500 p-4">{error}</div>
        ) : (
          <Document
            file={url}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={
              <div className="flex items-center justify-center p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            }
            className="max-w-full"
            options={{
              cMapUrl: "https://unpkg.com/pdfjs-dist@2.16.105/cmaps/",
              cMapPacked: true,
            }}
          >
            <Page pageNumber={pageNumber} width={300} renderTextLayer={false} renderAnnotationLayer={false} />
          </Document>
        )}

        {numPages && numPages > 0 && (
          <div className="flex justify-between items-center w-full mt-4">
            <Button
              onClick={() => setPageNumber(pageNumber - 1)}
              disabled={pageNumber <= 1}
              variant="outline"
              size="sm"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
            </Button>
            <p className="text-sm">
              Página {pageNumber} de {numPages}
            </p>
            <Button
              onClick={() => setPageNumber(pageNumber + 1)}
              disabled={pageNumber >= numPages}
              variant="outline"
              size="sm"
            >
              Siguiente <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
