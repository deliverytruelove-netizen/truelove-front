'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface VisualCaptchaProps {
  isOpen: boolean
  onVerify: (success: boolean) => void
  onClose: () => void
}

const VERIFICATION_STEPS = [
  {
    target: '/captcha/caballo-dibujo.jpg',
    question: '¿Cuál de estas imágenes corresponde al animal mostrado ?',
    options: [
      '/captcha/caballo.jpg',
      '/captcha/vaca.jpg',
      '/captcha/gallina.jpg',
      '/captcha/perro.jpg',
      '/captcha/gato.jpg',
      '/captcha/oveja.jpg'
    ],
    correctIndex: 0
  },
  {
    target: '/captcha/perro-dibujo.jpg',
    question: 'Selecciona la fotografía que muestra el mismo animal del dibujo',
    options: [
      '/captcha/gato.jpg',
      '/captcha/vaca.jpg',
      '/captcha/perro.jpg',
      '/captcha/oveja.jpg',
      '/captcha/caballo.jpg',
      '/captcha/gallina.jpg'
    ],
    correctIndex: 2
  },
  {
    target: '/captcha/gato-dibujo.jpg',
    question: 'Selecciona la imagen que coincide con el animal ilustrado',
    options: [
      '/captcha/gallina.jpg',
      '/captcha/gato.jpg',
      '/captcha/oveja.jpg',
      '/captcha/caballo.jpg',
      '/captcha/perro.jpg',
      '/captcha/vaca.jpg'
    ],
    correctIndex: 1
  }
]

export function VisualCaptcha({ isOpen, onVerify, onClose }: VisualCaptchaProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedImage, setSelectedImage] = useState<number | null>(null)
  const [attempts, setAttempts] = useState(0)
  const maxAttempts = 3

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0)
      setSelectedImage(null)
      setAttempts(0)
    }
  }, [isOpen])

  const handleImageClick = (index: number) => {
    setSelectedImage(index)
  }

  const resetStep = () => {
    const newStep = Math.floor(Math.random() * VERIFICATION_STEPS.length)
    setCurrentStep(newStep)
    setSelectedImage(null)
  }

  const handleVerify = () => {
    if (selectedImage === VERIFICATION_STEPS[currentStep].correctIndex) {
      if (currentStep === 2) {
        onVerify(true)
      } else {
        setCurrentStep(prev => prev + 1)
        setSelectedImage(null)
      }
    } else {
      setAttempts(prev => prev + 1)
      setSelectedImage(null)
      
      if (attempts + 1 >= maxAttempts) {
        onVerify(false)
      } else {
        resetStep()
      }
    }
  }

  const currentVerification = VERIFICATION_STEPS[currentStep]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Verificación de seguridad - Paso {currentStep + 1} de 3</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="p-4 border rounded-lg">
            <p className="text-sm text-gray-600 mb-2">{currentVerification.question}</p>
            <Image
              src={currentVerification.target}
              alt="Imagen objetivo"
              width={200}
              height={200}
              className="border rounded object-contain mx-auto"
            />
          </div>
          
          <div className="grid grid-cols-3 gap-4 ">
            {currentVerification.options.map((src, index) => (
              <button
                key={index}
                onClick={() => handleImageClick(index)}
                className={`p-2 border rounded hover:border-red-700 transition-all aspect-square ${
                  selectedImage === index ? 'border-red-600 ring-2 ring-red-600' : ''
                }`}
              >
                <Image
                  src={src}
                  alt={`Opción ${index + 1}`}
                  width={120}
                  height={120}
                  className="rounded object-contain w-full h-full"
                />
              </button>
            ))}
          </div>

          {attempts > 0 && (
            <p className="text-sm text-red-500">
              Intento {attempts} de {maxAttempts}. Por favor, intenta de nuevo.
            </p>
          )}

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
            className='bg-red-600 hover:bg-red-800'
              onClick={handleVerify} 
              disabled={selectedImage === null}
            >
              {currentStep === 2 ? 'Verificar' : 'Siguiente'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

