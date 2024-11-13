// components/BottomStepper.tsx
import React from 'react';

interface BottomStepperProps {
  totalSteps: number;
  currentStep: number;
  onBack: () => void;
  onNext: () => void;
}

const BottomStepper: React.FC<BottomStepperProps> = ({ totalSteps, currentStep, onBack, onNext }) => {
  const percentage = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white p-4 border-t border-gray-200">
      <div className="flex justify-between items-center">
        <button
          onClick={onBack}
          className="text-red-500 font-medium"
          disabled={currentStep === 1}
        >
          Atrás
        </button>
        <div className="flex-1 mx-4">
          <div className="relative h-1 bg-gray-300 rounded">
            <div
              style={{ width: `${percentage}%` }}
              className="absolute top-0 h-1 bg-red-500 rounded transition-all duration-300"
            ></div>
          </div>
          <div className="text-center text-sm mt-2">
            {currentStep} de {totalSteps} pasos para terminar
          </div>
        </div>
        <button
          onClick={onNext}
          className="bg-red-500 text-white font-medium px-4 py-2 rounded hover:bg-red-600"
        >
          Continuar
        </button>
      </div>
    </div>
  );
};

export default BottomStepper;
