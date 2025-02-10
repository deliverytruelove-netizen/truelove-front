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
    <div className="flex items-start gap-3 p-4 bg-white rounded-lg border shadow-sm">
      <div className="flex-shrink-0">
        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
          <FileText className="w-6 h-6 text-red-600" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-2">
          <div>
            <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
            <p className="text-xs text-gray-500">PDF • {sizeMB} MB</p>
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" size="icon" className="h-6 w-6 hover:bg-gray-100" onClick={onDelete}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

