"use client"

import type React from "react"
import { useCallback, useRef, useState } from "react"
import Webcam from "react-webcam"
import { Button } from "@/components/ui/button"

interface CameraCaptureProps {
  onCapture: (imageSrc: string) => void
}

export const CapturarImagen: React.FC<CameraCaptureProps> = ({ onCapture }) => {
  const webcamRef = useRef<Webcam>(null)
  const [isCameraOpen, setIsCameraOpen] = useState(false)

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot()
    if (imageSrc) {
      onCapture(imageSrc)
      setIsCameraOpen(false)
    }
  }, [webcamRef, onCapture])

  if (!isCameraOpen) {
    return (
      <Button id="camera-button" onClick={() => setIsCameraOpen(true)} className="w-full bg-red-500 hover:bg-red-600">
        Abrir cámara
      </Button>
    )
  }

  return (
    <div className="space-y-4">
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        videoConstraints={{ facingMode: "environment" }}
        className="w-full rounded-lg"
      />
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
