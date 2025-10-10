"use client"

import { CuotaActiva } from "../types/pago-cuota.types"
import { Coins, Calendar, CreditCard, Building2 } from "lucide-react"

interface CuotaActivaCardProps {
  cuota: CuotaActiva
}

export default function CuotaActivaCard({ cuota }: CuotaActivaCardProps) {
  const getPeriodicidadLabel = (periodicidad: string) => {
    const labels: Record<string, string> = {
      diario: "Diaria",
      semanal: "Semanal",
      quincenal: "Quincenal",
      mensual: "Mensual",
    }
    return labels[periodicidad] || periodicidad
  }

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Cuota Activa</h2>

      <div className="space-y-4">
        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
          <Coins className="w-8 h-8 text-blue-600" />
          <div>
            <p className="text-sm text-gray-600">Monto a Pagar</p>
            <p className="text-2xl font-bold text-blue-600">
              S/ {parseFloat(cuota.monto_cuota?.toString() || "0").toFixed(2)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-gray-500" />
          <div>
            <p className="text-sm text-gray-600">Periodicidad</p>
            <p className="text-base font-medium text-gray-900">{getPeriodicidadLabel(cuota.periodicidad)}</p>
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Datos de la Cuenta
          </h3>

          <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
            <div>
              <p className="text-sm text-gray-600">Banco</p>
              <p className="font-medium text-gray-900">{cuota.banco || "No especificado"}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Número de Cuenta</p>
              <p className="font-mono text-lg font-semibold text-gray-900">{cuota.numero_cuenta}</p>
            </div>

            {cuota.tipo_cuenta && (
              <div>
                <p className="text-sm text-gray-600">Tipo de Cuenta</p>
                <p className="font-medium text-gray-900">{cuota.tipo_cuenta}</p>
              </div>
            )}
          </div>
        </div>

        {cuota.metodos_pago_disponibles && cuota.metodos_pago_disponibles.length > 0 && (
          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Métodos de Pago Disponibles
            </h3>
            <div className="flex flex-wrap gap-2">
              {cuota.metodos_pago_disponibles.map((metodo) => (
                <span
                  key={metodo}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium capitalize"
                >
                  {metodo}
                </span>
              ))}
            </div>
          </div>
        )}

        {cuota.descripcion && (
          <div className="border-t pt-4">
            <p className="text-sm text-gray-600">Descripción</p>
            <p className="text-gray-900 mt-1">{cuota.descripcion}</p>
          </div>
        )}
      </div>
    </div>
  )
}
