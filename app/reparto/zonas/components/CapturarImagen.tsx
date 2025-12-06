// app\reparto\zonas\components\CapturarImagen.tsx
"use client"

import React, { useEffect, useRef, useState } from "react"
import Webcam from "react-webcam"
import { Camera } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface CapturarImagenProps {
  onCapture: (imageSrc: string) => void;
}

export function CapturarImagen({ onCapture }: CapturarImagenProps) {
  const [isOpen, setIsOpen] = useState(false)
  const webcamRef = useRef<Webcam>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isModelLoaded, setIsModelLoaded] = useState(false)
  const [faceDetected, setFaceDetected] = useState(false)
  const [message, setMessage] = useState("Cargando detector facial...")
  const [modelLoadError, setModelLoadError] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const faceDetectorRef = useRef<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [MediaPipe, setMediaPipe] = useState<any>(null)

  // Cargar MediaPipe dinámicamente solo en el cliente
  useEffect(() => {
    if (typeof window !== 'undefined' && isOpen && !MediaPipe) {
      import('@mediapipe/tasks-vision').then((module) => {
        setMediaPipe(module)
      }).catch((error) => {
        console.error("Error loading MediaPipe:", error)
        setModelLoadError(true)
        setMessage("Error al cargar la librería de detección facial")
      })
    }
  }, [isOpen, MediaPipe])

  // Inicializar el detector
  useEffect(() => {
    let isMounted = true

    const initializeDetector = async () => {
      if (!MediaPipe) return

      try {
        const { FaceDetector, FilesetResolver } = MediaPipe

        // Cargar el modelo de MediaPipe
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        )

        const detector = await FaceDetector.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite",
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          minDetectionConfidence: 0.5
        })

        if (isMounted) {
          faceDetectorRef.current = detector
          setIsModelLoaded(true)
          setModelLoadError(false)
          setMessage("Posiciona tu rostro en el centro")
        }
      } catch (error) {
        console.error("Error al inicializar el detector:", error)
        if (isMounted) {
          setModelLoadError(true)
          setMessage("Error al cargar el modelo. Por favor, recarga la página.")
        }
      }
    }

    if (MediaPipe && isOpen && !faceDetectorRef.current) {
      initializeDetector()
    }

    return () => {
      isMounted = false
    }
  }, [MediaPipe, isOpen])

  // Detectar rostros
  useEffect(() => {
    let intervalId: NodeJS.Timeout
    let lastVideoTime = -1

    const detectFace = () => {
      if (!faceDetectorRef.current || !webcamRef.current || !canvasRef.current || !isModelLoaded) return

      const video = webcamRef.current.video
      const canvas = canvasRef.current

      if (video && video.readyState === 4 && video.currentTime !== lastVideoTime) {
        lastVideoTime = video.currentTime

        try {
          // Detectar rostros
          const detections = faceDetectorRef.current.detectForVideo(video, performance.now())

          // Configurar canvas
          const ctx = canvas.getContext('2d')
          if (!ctx) return

          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
          ctx.clearRect(0, 0, canvas.width, canvas.height)

          if (detections.detections && detections.detections.length === 1) {
            const detection = detections.detections[0]
            const bbox = detection.boundingBox

            // Dibujar rectángulo verde alrededor del rostro
            ctx.strokeStyle = '#4ade80'
            ctx.lineWidth = 3
            ctx.strokeRect(bbox.originX, bbox.originY, bbox.width, bbox.height)

            // Dibujar puntos clave (keypoints) si existen
            if (detection.keypoints) {
              ctx.fillStyle = '#4ade80'
              detection.keypoints.forEach((keypoint: { x: number; y: number }) => {
                ctx.beginPath()
                ctx.arc(keypoint.x, keypoint.y, 3, 0, 2 * Math.PI)
                ctx.fill()
              })
            }

            // Marco de guía
            ctx.strokeStyle = '#4ade80'
            ctx.lineWidth = 2
            ctx.setLineDash([10, 5])
            ctx.strokeRect(50, 50, canvas.width - 100, canvas.height - 100)
            ctx.setLineDash([])

            setFaceDetected(true)
            setMessage("¡Rostro detectado correctamente!")
          } else {
            setFaceDetected(false)
            setMessage(detections.detections.length === 0
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
  }, [isOpen, isModelLoaded, modelLoadError])

  // Limpiar el detector al cerrar
  useEffect(() => {
    if (!isOpen && faceDetectorRef.current) {
      faceDetectorRef.current.close()
      faceDetectorRef.current = null
      setIsModelLoaded(false)
      setFaceDetected(false)
      setMessage("Cargando detector facial...")
    }
  }, [isOpen])

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
