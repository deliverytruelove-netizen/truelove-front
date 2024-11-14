'use client'

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

interface StepNavigationProps {
  currentStep: number
  totalSteps: number
  onNext: () => void
  onBack: () => void
  isNextDisabled: boolean
}

export default function StepNavigation({
  currentStep,
  totalSteps,
  onNext,
  onBack,
  isNextDisabled
}: StepNavigationProps) {
  const progress = (currentStep / totalSteps) * 100


  return (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-white p-4">
      <div className="mx-auto max-w-7xl flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="text-gray-600 hover:text-gray-900"
        >
          Atrás
        </Button>

        <div className="flex flex-col items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {totalSteps - currentStep} pasos para terminar
          </span>
          <Progress value={progress} className="w-[200px]" />
        </div>

        <Button 
          onClick={onNext}
          disabled={isNextDisabled}
          className="bg-[#f34739] text-white hover:bg-[#d63c30]"
        >
          Continuar
        </Button>
      </div>
    </div>
  )
}