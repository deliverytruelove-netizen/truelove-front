'use client'

import React, { useCallback, useRef, useState, useEffect } from 'react'
import Webcam from 'react-webcam'
import { Button } from "@/components/ui/button"
import { Camera, RotateCcw } from 'lucide-react'
 
interface CapturarImagenProps {
  onCapture: (imageSrc: string) => void
}

export function CapturarImagen({ onCapture }: CapturarImagenProps) {
  const webcamRef = useRef<Webcam>(null)
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')
  const [isMobile, setIsMobile] = useState(false)

  // Detectar si es dispositivo móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Verificar inicialmente
    checkMobile()

    // Agregar listener para cambios de tamaño de ventana
    window.addEventListener('resize', checkMobile)

    // Limpiar listener
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot()
    if (imageSrc) {
      onCapture(imageSrc)
      setIsCameraOpen(false)
    }
  }, [webcamRef, onCapture])

  const toggleCamera = useCallback(() => {
    setFacingMode(prevMode => prevMode === 'user' ? 'environment' : 'user')
  }, [])

  // Si no es móvil, no mostrar nada
  if (!isMobile) {
    return null
  }

  // Si la cámara no está abierta, mostrar solo el botón
  if (!isCameraOpen) {
    return (
      <Button 
        onClick={() => setIsCameraOpen(true)} 
        size="icon"
        className="bg-[#f34739] hover:bg-[#d63c30]"
      >
        <Camera className="h-4 w-4" />
      </Button>
    )
  }

  // Interfaz de la cámara (solo visible en móvil)
  return (
    <div className="space-y-4">
      <div className="relative">
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={{
            facingMode,
            width: 1280,
            height: 720
          }}
          className="w-full rounded-lg"
        />
        <Button 
          onClick={toggleCamera} 
          size="icon"
          className="absolute top-2 right-2 bg-white/50 hover:bg-white/75"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex justify-between">
        <Button onClick={() => setIsCameraOpen(false)} variant="outline">
          Cancelar
        </Button>
        <Button 
          onClick={capture} 
          className="bg-[#f34739] hover:bg-[#d63c30]"
        >
          Capturar foto
        </Button>
      </div>
    </div>
  )
}