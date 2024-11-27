import { Button } from "@/components/ui/button";
import { CheckCircle2, ChevronRight } from 'lucide-react';
import { Step } from "../types/business";

interface NavegacionInferiorProps {
  steps: Step[];
  currentStep: number;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function NavegacionInferior({
  steps,
  currentStep,
  onSubmit,
  isSubmitting,
}: NavegacionInferiorProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-10">
      <div className="mx-auto max-w-5xl p-2">
        <div className="flex items-center justify-between">
          <div className="hidden md:flex items-center gap-4 overflow-x-auto py-0">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                      step.completed
                        ? "border-[#f34739] bg-[#f34739] text-white"
                        : step.id === currentStep
                        ? "border-[#f34739] text-[#f34739]"
                        : "border-gray-300 text-gray-300"
                    }`}
                  >
                    {step.completed ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <span className="text-sm font-medium">{step.id}</span>
                    )}
                  </div>
                  <span
                    className={`text-xs mt-1 whitespace-nowrap ${
                      step.id === currentStep
                        ? "text-[#f34739] font-medium"
                        : "text-gray-500"
                    }`}
                  >
                    {step.name}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-12 h-0.5 mx-2 ${
                      step.completed ? "bg-[#f34739]" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="md:hidden flex items-center gap-2">
            <span className="text-sm font-medium text-[#f34739]">
              Paso {currentStep} de {steps.length}
            </span>
            <span className="text-sm text-gray-500">
              {steps[currentStep - 1].name}
            </span>
          </div>

          <Button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="bg-[#f34739] text-white hover:bg-[#d63c30] min-w-[120px]"
          >
            {isSubmitting ? (
              "Enviando..."
            ) : (
              <>
                Continuar
                <ChevronRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

