// src/components/ConfirmationAlert.tsx
"use client"

import type React from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

interface ConfirmationAlertProps {
  title: string
  text: string
  onConfirm: () => void
  btnText?: string
  btnStyle?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
}

const ConfirmationAlert: React.FC<ConfirmationAlertProps> = ({
  title,
  text,
  onConfirm,
  btnText = "Cambiar estado",
  btnStyle = "default",
}) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant={btnStyle} size="sm" className="h-8 px-3 text-xs">
          {btnText}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{text}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Confirmar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default ConfirmationAlert

