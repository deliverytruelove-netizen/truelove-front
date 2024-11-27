'use client'

import React, { useCallback, useRef, useState } from 'react'
import Webcam from 'react-webcam'
import { Button } from "@/components/ui/button"
import { Camera, RotateCcw } from 'lucide-react'
 
interface CameraCaptureProps {
  onCapture: (imageSrc: string) => void;
  children?: React.ReactNode;
}

export const CapturarImagen: React.FC<CameraCaptureProps> = ({ onCapture, children }) => {
  const webcamRef = useRef<Webcam>(null)
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot()
    if (imageSrc) {
      if (facingMode === 'user') {
        // Flip the image horizontally for front camera
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          canvas.width = img.width
          canvas.height = img.height
          const ctx = canvas.getContext('2d')
          ctx?.scale(-1, 1)
          ctx?.drawImage(img, -img.width, 0)
          onCapture(canvas.toDataURL())
        }
        img.src = imageSrc
      } else {
        onCapture(imageSrc)
      }
      setIsCameraOpen(false)
    }
  }, [webcamRef, onCapture, facingMode])

  const toggleCamera = useCallback(() => {
    setFacingMode(prevMode => prevMode === 'user' ? 'environment' : 'user')
  }, [])

  if (!isCameraOpen) {
    return (
      <div className="flex justify-center">
        {children || (
          <Button 
            onClick={() => setIsCameraOpen(true)} 
            size="icon"
            className="bg-red-500 hover:bg-red-600"
          >
            <Camera className="h-4 w-4" />
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={{ facingMode: facingMode }}
          mirrored={facingMode === 'user'}
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
        <Button onClick={capture} className="bg-red-500 hover:bg-red-600">
          Capturar foto
        </Button>
      </div>
    </div>
  )
}

