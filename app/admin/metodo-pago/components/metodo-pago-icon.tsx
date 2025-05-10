// app\admin\metodo-pago\components\metodo-pago-icon.tsx
import { CreditCard, DollarSign, Smartphone } from "lucide-react"

interface MetodoPagoIconProps {
  nombre: string
  className?: string
}

export function MetodoPagoIcon({ nombre, className = "h-6 w-6" }: MetodoPagoIconProps) {
  const normalizedName = nombre.trim().toUpperCase()

  // Iconos personalizados para métodos de pago específicos
  if (normalizedName.includes("YAPE")) {
    return (
      <div className={`flex items-center justify-center rounded-full bg-purple-100 p-1 ${className}`}>
        <svg viewBox="0 0 24 24" fill="none" className="text-purple-600 h-5 w-5">
          <path
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"
            fill="currentColor"
          />
          <path
            d="M9 10.5c0 .83-.67 1.5-1.5 1.5S6 11.33 6 10.5 6.67 9 7.5 9s1.5.67 1.5 1.5zm9 0c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5.67-1.5 1.5-1.5 1.5.67 1.5 1.5z"
            fill="currentColor"
          />
        </svg>
      </div>
    )
  }

  if (normalizedName.includes("PLIN")) {
    return (
      <div className={`flex items-center justify-center rounded-full bg-blue-100 p-1 ${className}`}>
        <svg viewBox="0 0 24 24" fill="none" className="text-blue-600 h-5 w-5">
          <path
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm0-8h-2V7h2v2zm4 8h-2V9h2v8z"
            fill="currentColor"
          />
        </svg>
      </div>
    )
  }

  if (normalizedName.includes("EFECTIVO")) {
    return (
      <div className={`flex items-center justify-center rounded-full bg-green-100 p-1 ${className}`}>
        <DollarSign className="text-green-600 h-5 w-5" />
      </div>
    )
  }

  if (normalizedName.includes("TARJETA") || normalizedName.includes("POS")) {
    return (
      <div className={`flex items-center justify-center rounded-full bg-red-100 p-1 ${className}`}>
        <CreditCard className="text-red-600 h-5 w-5" />
      </div>
    )
  }

  // Icono predeterminado para otros métodos de pago
  return (
    <div className={`flex items-center justify-center rounded-full bg-gray-100 p-1 ${className}`}>
      <Smartphone className="text-gray-600 h-5 w-5" />
    </div>
  )
}
