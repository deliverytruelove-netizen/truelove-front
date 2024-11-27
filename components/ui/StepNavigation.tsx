'use client'

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from 'lucide-react'

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
  const steps = [
    { id: 1, name: "Detalles del negocio" },
    { id: 2, name: "Ubicación" },
    { id: 3, name: "Datos Claves" },
    { id: 4, name: "Datos Bancarios" },
    { id: 5, name: "planes" },
    { id: 6, name: "revisar Datos" },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
      <div className="mx-auto max-w-7xl px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="hidden md:flex items-center gap-4 ml-[15%]"> {/* Added ml-[15%] for right offset */}
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
                      step.id === currentStep ? "font-medium text-[#f34739]" : "text-gray-500"
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

          <div className="md:hidden flex items-center gap-2">
            <span className="text-sm font-medium text-[#f34739]">
              Paso {currentStep} de {totalSteps}
            </span>
            <span className="text-sm text-gray-500">{stepName || steps[currentStep - 1].name}</span>
          </div>

          <div className="flex gap-4 ml-5">
            {currentStep > 1 && onBack && (
              <Button
                variant="outline"
                onClick={onBack}
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

