import { AlertCircle, X } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface DocumentAlertProps {
  onClose: () => void
}

export function DocumentAlert({ onClose }: DocumentAlertProps) {
  return (
    <Alert variant="destructive" className="mt-4 animate-in fade-in slide-in-from-top-1">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>Este documento de identidad ya está registrado o se encuentra en uso.</span>
        <button onClick={onClose} className="ml-2">
          <X className="h-4 w-4" />
        </button>
      </AlertDescription>
    </Alert>
  )
}

