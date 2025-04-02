// components/registerLocal/email-change-alert.tsx
import { AlertCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface EmailChangeAlertProps {
  originalEmail: string;
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function EmailChangeAlert({ originalEmail, isOpen, onConfirm, onCancel }: EmailChangeAlertProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            <span>Correo electrónico diferente</span>
          </DialogTitle>
          <DialogDescription className="pt-2">
            Anteriormente te registraste con el correo <strong className="text-amber-600">{originalEmail}</strong>.
          </DialogDescription>
        </DialogHeader>
        <div className="py-2">
          <p>¿Deseas cambiar a un nuevo correo?</p>
        </div>
        <DialogFooter className="flex flex-row justify-end gap-2 sm:justify-end">
          <Button 
            variant="outline" 
            onClick={onCancel}
            className="border-amber-500 text-amber-500 hover:bg-amber-50"
          >
            No, usar el correo original
          </Button>
          <Button 
            variant="default" 
            onClick={onConfirm}
            className="bg-amber-500 hover:bg-amber-600"
          >
            Sí, usar nuevo correo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}