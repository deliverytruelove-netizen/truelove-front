// app\reparto\documento-motorizado\components\CapturarCamara.tsx
'use client'

import { useCallback, useRef } from 'react'
import Webcam from "react-webcam"
import { Button } from "@/components/ui/button"

interface CameraCaptureProps {
  onCapture: (imageSrc: string) => void
}

export function CameraCapture({ onCapture }: CameraCaptureProps) {
  const webcamRef = useRef<Webcam>(null)

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot()
    if (imageSrc) {
      onCapture(imageSrc)
    }
  }, [onCapture])

  return (
    <div className="space-y-4">
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        className="w-full"
      />
      <Button onClick={capture} className="w-full bg-red-600 hover:bg-red-500">
        Capturar Foto
      </Button>
    </div>
  )
}

