// components\ui\StepNavigation.tsx
"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { updateRegistrationStep } from "@/services/registrationTokenService"

interface StepNavigationProps {
  currentStep: number
  totalSteps: number
  onNext: () => void
  onBack?: () => void
  isNextDisabled?: boolean
  stepName?: string
}

export default function StepNavigation({
  currentStep,
  totalSteps,
  onNext,
  onBack,
  isNextDisabled = false,
  stepName,
}: StepNavigationProps) {
  const router = useRouter()

  const steps = [
    { id: 1, name: "Detalles del negocio", path: "/acercaNegocio" },
    { id: 2, name: "Ubicación", path: "/ubicar-local" },
    { id: 3, name: "Datos Claves", path: "/datosClaves" },
    { id: 4, name: "Datos Bancarios", path: "/datosBancarios" },
    { id: 5, name: "planes", path: "/planes" },
    { id: 6, name: "revisar Datos", path: "/revisarDatos" },
  ]

  // Función para manejar la navegación hacia atrás
  const handleBackNavigation = async () => {
    if (onBack) {
      // Si hay una función onBack personalizada, usarla
      onBack()
      return
    }

    // Si no hay función personalizada, navegar al paso anterior en la secuencia
    if (currentStep > 1) {
      try {
        const previousStep = steps[currentStep - 2]
        if (previousStep) {
          // Actualizar el token con el paso anterior
          await updateRegistrationStep(previousStep.path)
          // Navegar al paso anterior
          router.push(previousStep.path)
        }
      } catch (error) {
        console.error("Error al navegar hacia atrás:", error)
      }
    }
  }

  return (
    <div className="w-full bg-white border-t shadow-lg">
      <div className="mx-auto max-w-7xl px-4 py-2">
        <div className="flex items-center justify-between h-full">
          {/* Contenedor para las vistas de pasos */}
          <div>
            {/* Vista de escritorio */}
            <div className="hidden md:flex items-center gap-4">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                        step.id < currentStep
                          ? "border-[#f34739] bg-[#f34739] text-white"
                          : step.id === currentStep
                          ? "border-[#f34739] text-[#f34739]"
                          : "border-gray-300 text-gray-300"
                      }`}
                    >
                      <span className="text-sm font-medium">{step.id}</span>
                    </div>
                    <span
                      className={`mt-1 whitespace-nowrap text-xs ${
                        step.id === currentStep
                          ? "font-medium text-[#f34739]"
                          : "text-gray-500"
                      }`}
                    >
                      {step.name}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`mx-2 h-0.5 w-12 ${
                        step.id < currentStep ? "bg-[#f34739]" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Vista móvil */}
            <div className="md:hidden flex items-center gap-2">
              <span className="text-sm font-medium text-[#f34739]">
                Paso {currentStep} de {totalSteps}
              </span>
              <span className="text-sm text-gray-500">
                {stepName || steps[currentStep - 1].name}
              </span>
            </div>
          </div>

          {/* Contenedor para los botones */}
          <div className="flex items-center gap-4">
            {currentStep > 1 && (
              <Button
                variant="outline"
                onClick={handleBackNavigation}
                className="min-w-[120px]"
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Atrás
              </Button>
            )}

            <Button
              onClick={onNext}
              disabled={isNextDisabled}
              className="min-w-[120px] bg-[#f34739] text-white hover:bg-[#d63c30]"
            >
              Continuar
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}