// app\reparto\components\EmailChangeDialog.tsx
"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

interface EmailChangeDialogProps {
  isOpen: boolean
  onClose: () => void
  onUseOriginal: () => void
  onUseNew: () => void
  originalEmail: string
}

export function EmailChangeDialog({ isOpen, onClose, onUseOriginal, onUseNew, originalEmail }: EmailChangeDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            <DialogTitle>Correo electrónico diferente</DialogTitle>
          </div>
          <DialogDescription>
            Anteriormente te registraste con el correo
            <span className="font-semibold text-amber-600 block mt-1">{originalEmail}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-gray-500">¿Deseas cambiar a un nuevo correo?</p>
        </div>
        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2">
          <Button type="button" variant="outline" onClick={onUseOriginal} className="sm:w-auto w-full">
            No, usar el correo original
          </Button>
          <Button type="button" onClick={onUseNew} className="bg-amber-500 hover:bg-amber-600 sm:w-auto w-full">
            Sí, usar nuevo correo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
