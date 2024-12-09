'use client'

import React, { useCallback, useRef, useState } from 'react'
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

