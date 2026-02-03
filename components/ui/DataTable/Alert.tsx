// components\ui\DataTable\Alert.tsx
import Swal from "sweetalert2"

interface AlertOptions {
  title: string
  text: string
  icon: "success" | "error" | "warning" | "info" | "question"
}

// Configuración común para que el alert aparezca sobre modales/drawers
const baseConfig = {
  confirmButtonColor: "#e74c3c",
  customClass: {
    container: 'swal-on-top',
  },
}

export const showAlert = ({ title, text, icon }: AlertOptions) => {
  return Swal.fire({
    title,
    text,
    icon,
    ...baseConfig,
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
    cancelButtonColor: "#6c757d",
    confirmButtonText,
    cancelButtonText,
    ...baseConfig,
  })
}

