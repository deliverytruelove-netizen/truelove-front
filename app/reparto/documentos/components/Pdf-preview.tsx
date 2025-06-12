// app\reparto\documentos\components\Pdf-preview.tsx
import { FileText, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PdfPreviewProps {
  file: File
  onDelete: () => void
}

export function PdfPreview({ file, onDelete }: PdfPreviewProps) {
  // Convertir bytes a MB
  const sizeMB = (file.size / (1024 * 1024)).toFixed(1)

  return (
    <div className="flex items-start gap-3 p-3 md:p-4 bg-white rounded-lg border shadow-sm">
      <div className="flex-shrink-0">
        <div className="w-8 h-8 md:w-10 md:h-10 bg-red-100 rounded-lg flex items-center justify-center">
          <FileText className="w-4 h-4 md:w-6 md:h-6 text-red-600" />
        </div>
      </div>
      <div className="flex-1 min-w-0 pr-2">
        <div className="flex justify-between items-start gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-xs md:text-sm font-medium text-gray-900 truncate break-all">
              {file.name}
            </p>
            <p className="text-xs text-gray-500">PDF • {sizeMB} MB</p>
          </div>
          <div className="flex-shrink-0">
            <Button 
              type="button" 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 hover:bg-gray-100" 
              onClick={onDelete}
            >
              <X className="h-3 w-3 md:h-4 md:w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}