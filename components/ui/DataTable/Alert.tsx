// Alert.tsx
import Swal from "sweetalert2"

interface AlertOptions {
  title: string
  text: string
  icon: "success" | "error" | "warning" | "info" | "question"
}

export const showAlert = ({ title, text, icon }: AlertOptions) => {
  return Swal.fire({
    title,
    text,
    icon,
    confirmButtonColor: "#e74c3c",
  })
}

export const confirmAlert = ({
  title,
  text,
  icon,
  showCancelButton = true,
  confirmButtonText = "Aceptar",
  cancelButtonText = "Cancelar",
}: AlertOptions & {
  showCancelButton?: boolean
  confirmButtonText?: string
  cancelButtonText?: string
}) => {
  return Swal.fire({
    title,
    text,
    icon,
    showCancelButton,
    confirmButtonColor: "#e74c3c",
    cancelButtonColor: "#6c757d",
    confirmButtonText,
    cancelButtonText,
  })
}

