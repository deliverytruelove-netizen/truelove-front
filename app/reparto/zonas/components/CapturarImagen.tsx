"use client"

import React, { useEffect, useRef, useState } from "react"
import Webcam from "react-webcam"
import { Camera } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type * as faceapi from '@vladmandic/face-api';

interface CapturarImagenProps {
  onCapture: (imageSrc: string) => void;
}

export function CapturarImagen({ onCapture }: CapturarImagenProps) {
  const [isOpen, setIsOpen] = useState(false)
  const webcamRef = useRef<Webcam>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isModelLoaded, setIsModelLoaded] = useState(false)
  const [faceDetected, setFaceDetected] = useState(false)
  const [message, setMessage] = useState("Cargando modelos...")
  const [modelLoadError, setModelLoadError] = useState(false)
  const [faceapi, setFaceapi] = useState<typeof import('@vladmandic/face-api') | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && isOpen && !faceapi) {
      import('@vladmandic/face-api').then((api: typeof import('@vladmandic/face-api')) => {
        setFaceapi(api)
      }).catch((error) => {
        console.error("Error loading face-api:", error)
        setModelLoadError(true)
        setMessage("Error al cargar la librería de detección facial")
      })
    }
  }, [isOpen, faceapi])

  useEffect(() => {
    let isMounted = true
    const loadModels = async () => {
      if (!faceapi) return

      try {
        const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models' // Loading models from GitHub
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
        ])
        
        if (isMounted) {
          setIsModelLoaded(true)
          setModelLoadError(false)
          setMessage("Posiciona tu rostro en el centro")
        }
      } catch (error) {
        console.error("Error al cargar los modelos:", error)
        if (isMounted) {
          setModelLoadError(true)
          setMessage("Error al cargar los modelos. Por favor, recarga la página.")
        }
      }
    }

    if (faceapi && isOpen) {
      loadModels()
    }

    return () => {
      isMounted = false
    }
  }, [isOpen, faceapi])

  useEffect(() => {
    let intervalId: NodeJS.Timeout

    const detectFace = async () => {
      if (!faceapi || !webcamRef.current || !canvasRef.current || !isModelLoaded) return

      const video = webcamRef.current.video
      const canvas = canvasRef.current
      
      if (faceapi && video && video.readyState === 4) {
        // Set canvas dimensions to match video
        const displaySize = { width: video.videoWidth, height: video.videoHeight }
        faceapi.matchDimensions(canvas, displaySize)

        try {
          const detections = await faceapi.detectAllFaces(
            video,
            new faceapi.TinyFaceDetectorOptions()
          ).withFaceLandmarks() as faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection }>[];

          // Clear previous drawings
          const ctx = canvas.getContext('2d')
          ctx?.clearRect(0, 0, canvas.width, canvas.height)

          if (detections && detections.length === 1) {
            // Draw facial landmarks
            const resizedDetections = faceapi.resizeResults(detections, displaySize)
            
            // Draw face detection box
            faceapi.draw.drawDetections(canvas, resizedDetections)
            
            // Draw facial landmarks
            faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)

            // Add custom overlay elements
            ctx!.strokeStyle = '#4ade80' // Green color for the frame
            ctx!.lineWidth = 2
            ctx!.strokeRect(50, 50, canvas.width - 100, canvas.height - 100)

            setFaceDetected(true)
            setMessage("¡Rostro detectado correctamente!")
          } else {
            setFaceDetected(false)
            setMessage(detections.length === 0 
              ? "No se detectó ningún rostro" 
              : "Solo debe haber un rostro en la imagen")
          }
        } catch (error) {
          console.error("Error en la detección:", error)
          setMessage("Error en la detección facial")
        }
      }
    }

    if (isOpen && isModelLoaded && !modelLoadError) {
      intervalId = setInterval(detectFace, 100)
    }

    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [isOpen, isModelLoaded, modelLoadError, faceapi])

  const captureImage = React.useCallback(() => {
    if (!faceDetected) {
      setMessage("Por favor, asegúrate que tu rostro esté correctamente detectado")
      return
    }
    
    const imageSrc = webcamRef.current?.getScreenshot()
    if (imageSrc) {
      onCapture(imageSrc)
      setIsOpen(false)
    }
  }, [webcamRef, onCapture, faceDetected])

  return (
    <>
      <Button 
        type="button"
        variant="outline" 
        onClick={() => setIsOpen(true)}
        className="w-full py-8"
      >
        <Camera className="h-6 w-6 mr-2" />
        Tomar foto
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Capturar Selfie</DialogTitle>
          </DialogHeader>
          <div className="relative">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={{
                width: 720,
                height: 480,
                facingMode: "user"
              }}
              className="w-full rounded-lg transform scale-x-[-1]"
            />
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full transform scale-x-[-1]"
            />
          </div>
          <p className={`text-center my-2 text-sm font-medium ${
            modelLoadError ? 'text-red-600' : 'text-gray-600'
          }`}>
            {message}
          </p>
          <div className="flex justify-between gap-2">
            <Button 
              type="button"
              variant="outline" 
              onClick={() => setIsOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              onClick={captureImage} 
              className="bg-red-600 hover:bg-red-500"
              disabled={!faceDetected || modelLoadError}
            >
              Capturar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

