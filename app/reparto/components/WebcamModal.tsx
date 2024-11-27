"use client"

import React from "react"
import Webcam from "react-webcam"
import { X } from 'lucide-react'
import { Button } from "@/components/ui/button"

interface WebcamModalProps {
  isOpen: boolean
  onClose: () => void
  onCapture: (imageSrc: string) => void
}

export default function WebcamModal({ isOpen, onClose, onCapture }: WebcamModalProps) {
  const webcamRef = React.useRef<Webcam>(null)

  const captureImage = React.useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot()
    if (imageSrc) {
      onCapture(imageSrc)
      onClose()
    }
  }, [webcamRef, onCapture, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Capturar imagen</h3>
          <Button variant="ghost" onClick={onClose}>
            <X className="h-6 w-6" />
          </Button>
        </div>
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={{
            width: 720,
            height: 480,
            facingMode: "user"
          }}
          className="w-full rounded-lg"
        />
        <Button onClick={captureImage} className="w-full mt-4 bg-red-600 hover:bg-red-500">
          Capturar
        </Button>
      </div>
    </div>
  )
}

