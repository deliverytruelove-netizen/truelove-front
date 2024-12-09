'use client'

import React, { useCallback, useRef, useState, useEffect } from 'react'
import Webcam from 'react-webcam'
import { Button } from "@/components/ui/button"
import { AlertCircle, Camera } from 'lucide-react'
// import Tesseract from 'tesseract.js' // Removed import
import { cn } from "@/lib/utils"
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog"

interface WebcamModalProps {
  isOpen: boolean
  onClose: () => void
  onCapture: (imageData: { imageSrc: string; text: string }) => void
}

export function WebcamModal({ isOpen, onClose, onCapture }: WebcamModalProps) {
  const webcamRef = useRef<Webcam>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [documentoDetectado, setDocumentoDetectado] = useState(false)
  const frameCountRef = useRef(0)

  useEffect(() => {
    if (!isOpen) return;
  
    const detectarDocumento = () => {
      if (webcamRef.current && canvasRef.current) {
        const video = webcamRef.current.video;
        if (video && video.readyState === 4) {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext("2d");
  
          if (ctx) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
  
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  
            const recuadroX = canvas.width * 0.15;
            const recuadroY = canvas.height * 0.15;
            const recuadroWidth = canvas.width * 0.7;
            const recuadroHeight = canvas.height * 0.7;
  
            const imageData = ctx.getImageData(
              recuadroX,
              recuadroY,
              recuadroWidth,
              recuadroHeight
            );
  
            let edges = 0;
            let pixelesAzules = 0;
            const data = imageData.data;
  
            for (let i = 0; i < data.length; i += 4) {
              const r = data[i];
              const g = data[i + 1];
              const b = data[i + 2];
  
              // Ajustar la detección de píxeles azules
              if (b > 150 && g > 100 && g < 180 && r < 130) {
                pixelesAzules++;
              }
  
              // Mejorar la detección de bordes
              if (i % (imageData.width * 4) < imageData.width * 4 - 4) {
                const nextR = data[i + 4];
                const nextG = data[i + 5];
                const nextB = data[i + 6];
                
                const diff = Math.abs(r - nextR) + Math.abs(g - nextG) + Math.abs(b - nextB);
                if (diff > 30) {
                  edges++;
                }
              }
            }
  
            const totalPixeles = recuadroWidth * recuadroHeight;
            const porcentajeAzul = pixelesAzules / totalPixeles;
            const porcentajeBordes = edges / totalPixeles;
  
            const tieneDocumento =
              porcentajeBordes > 0.01 && // Ajustar umbral de bordes
              porcentajeAzul > 0.05; // Ajustar umbral de azul
  
            frameCountRef.current++;
            if (frameCountRef.current >= 5) {
              setDocumentoDetectado(tieneDocumento);
              frameCountRef.current = 0;
            }
          }
        }
      }
    };
  
    const intervalo = setInterval(detectarDocumento, 100);
    return () => clearInterval(intervalo);
  }, [isOpen]);
  
  // Removed procesarTextoDNI function

  const capturar = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot()
    if (imageSrc) {
      onCapture({ imageSrc, text: '' })
      onClose()
    }
  }, [onCapture, onClose])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl p-0">
        <DialogHeader className="p-6">
          <DialogTitle>Capturar DNI</DialogTitle>
          <DialogDescription>
            Coloque su DNI dentro del marco
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative w-full h-[70vh] bg-black">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={{ 
                facingMode: 'environment',
                width: 1920,
                height: 1080,
              }}
              className="absolute inset-0 w-full h-full object-contain"
            />
            <canvas 
              ref={canvasRef} 
              className="absolute inset-0 w-full h-full opacity-0 pointer-events-none"
            />
            <div 
              style={{
                aspectRatio: "0.63",
                width: '70%',
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
              }}
              className={cn(
                "transition-colors duration-300",
                "border-4 border-dashed rounded-lg",
                documentoDetectado ? "border-green-500" : "border-white/70"
              )} 
            />
            {!documentoDetectado && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/75 text-white px-4 py-2 rounded-full flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span>Alinee su DNI dentro del marco</span>
              </div>
            )}
          </div>

          <div className="flex justify-between p-6">
            <Button 
              onClick={onClose} 
              variant="outline"
            >
              Cancelar
            </Button>
            <Button 
              onClick={capturar} 
              className={cn(
                "transition-colors duration-300",
                documentoDetectado 
                  ? "bg-green-500 hover:bg-green-600" 
                  : "bg-gray-300 cursor-not-allowed"
              )}
              disabled={!documentoDetectado}
            >
              <Camera className="mr-2 h-4 w-4" />
              Capturar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

