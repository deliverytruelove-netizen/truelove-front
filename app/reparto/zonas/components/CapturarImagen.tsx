"use client"

import React, { useEffect, useRef, useState } from "react"
import Webcam from "react-webcam"
import { Camera } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import * as faceapi from '@vladmandic/face-api'

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

  useEffect(() => {
    const loadModels = async () => {
      try {
        faceapi.env.monkeyPatch({
          Canvas: HTMLCanvasElement,
          Image: HTMLImageElement,
          ImageData: ImageData,
          Video: HTMLVideoElement,
          createCanvasElement: () => document.createElement('canvas'),
          createImageElement: () => document.createElement('img')
        });

        const modelBaseUrl = 'https://raw.githubusercontent.com/vladmandic/face-api/master/model'
        
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(modelBaseUrl),
          faceapi.nets.faceLandmark68Net.loadFromUri(modelBaseUrl)
        ])

        setIsModelLoaded(true)
        setModelLoadError(false)
        setMessage("Posiciona tu rostro en el centro")
      } catch (error) {
        console.error("Error al cargar los modelos:", error)
        setModelLoadError(true)
        setMessage("Error al cargar los modelos. Por favor, recarga la página.")
      }
    }

    if (isOpen) {
      loadModels()
    }

    return () => {
      setIsModelLoaded(false)
      setModelLoadError(false)
      setFaceDetected(false)
    }
  }, [isOpen])

  useEffect(() => {
    let intervalId: NodeJS.Timeout

    const detectFace = async () => {
      if (webcamRef.current && canvasRef.current && isModelLoaded) {
        const video = webcamRef.current.video
        if (video && video.readyState === 4) {
          try {
            const videoWidth = video.videoWidth
            const videoHeight = video.videoHeight
            
            canvasRef.current.width = videoWidth
            canvasRef.current.height = videoHeight

            const detections = await faceapi
              .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({
                inputSize: 320,
                scoreThreshold: 0.5
              }))
              .withFaceLandmarks()

            const ctx = canvasRef.current.getContext('2d')
            if (!ctx) return

            ctx.clearRect(0, 0, videoWidth, videoHeight)

            if (detections && detections.length === 1) {
              const detection = detections[0]
              if (detection && detection.detection && detection.detection.box) {
                faceapi.draw.drawDetections(canvasRef.current, detections)
                faceapi.draw.drawFaceLandmarks(canvasRef.current, detections)
                
                const box = detection.detection.box
                const isCentered = Math.abs(box.x - (videoWidth/2 - box.width/2)) < 50
                const isGoodSize = box.width > videoWidth * 0.2 && box.width < videoWidth * 0.8
                
                if (isCentered && isGoodSize) {
                  setFaceDetected(true)
                  setMessage("¡Rostro detectado correctamente!")
                } else {
                  setFaceDetected(false)
                  setMessage("Centra tu rostro y ajusta la distancia")
                }
              }
            } else {
              setFaceDetected(false)
              setMessage(detections.length === 0 
                ? "No se detectó ningún rostro" 
                : "Solo debe haber un rostro en la imagen")
            }
          } catch (error) {
            if (process.env.NODE_ENV === 'development') {
              console.error("Error en la detección:", error)
            }
            setMessage("Error en la detección facial")
          }
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

