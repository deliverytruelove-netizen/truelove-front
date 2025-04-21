import { cn } from "@/lib/utils"

interface IndicadorPasosProps {
  pasoActual: number
}

export function IndicadorPasos({ pasoActual }: IndicadorPasosProps) {
  return (
    <div className="flex justify-between mb-8">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex flex-col items-center flex-1">
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm mb-1",
              pasoActual === i
                ? "bg-red-600 text-white"
                : pasoActual > i
                  ? "bg-red-400 text-white"
                  : "bg-gray-100 text-gray-400",
            )}
          >
            {i}
          </div>
          <div className="text-xs text-gray-400">
            {i === 1 ? "Ciudad" : i === 2 ? "Vehículo" : i === 3 ? "Documento" : "Contacto"}
          </div>
        </div>
      ))}
    </div>
  )
}
