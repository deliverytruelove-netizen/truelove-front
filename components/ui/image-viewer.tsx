"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { X, Plus, Minus, RotateCw, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ImageViewerProps {
  src: string | null
  alt: string
  title: string
  isOpen: boolean
  onClose: () => void
}

export function ImageViewer({ src, alt, title, isOpen, onClose }: ImageViewerProps) {
  // Todos los hooks deben estar en el nivel superior, antes de cualquier return
  const [zoomLevel, setZoomLevel] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const imageContainerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [fullUrl, setFullUrl] = useState<string | null>(null)

  // Resetear estados cuando se cierra el visor
  useEffect(() => {
    if (!isOpen) {
      setZoomLevel(1)
      setRotation(0)
      setPosition({ x: 0, y: 0 })
    }
  }, [isOpen])

  // Procesar la URL de la imagen
  useEffect(() => {
    if (src) {
      setFullUrl(src.startsWith("http") ? src : `/storage/${src.replace(/^\/?(storage\/)?/, "")}`)
    } else {
      setFullUrl(null)
    }
  }, [src])

  // Retorno temprano después de todos los hooks
  if (!src || !isOpen) return null

  // Función para manejar el zoom con la rueda del mouse
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()

    // Obtener la posición del cursor relativa al contenedor de la imagen
    const rect = imageContainerRef.current?.getBoundingClientRect()
    if (!rect) return

    // Calcular la posición relativa del cursor dentro de la imagen (0-1)
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height

    // Calcular el nuevo nivel de zoom
    const oldZoom = zoomLevel
    const newZoom =
      e.deltaY < 0
        ? Math.min(zoomLevel + 0.1, 5) // Zoom in (limitado a 5x)
        : Math.max(zoomLevel - 0.1, 0.5) // Zoom out (limitado a 0.5x)

    // Si el zoom no cambió, no hacemos nada más
    if (oldZoom === newZoom) return

    // Actualizar el nivel de zoom
    setZoomLevel(newZoom)

    // Calcular el desplazamiento necesario para mantener el punto bajo el cursor
    if (imageRef.current) {
      // Calcular la nueva posición para mantener el punto bajo el cursor
      const newX = position.x - ((x - 0.5) * (newZoom - oldZoom)) / newZoom
      const newY = position.y - ((y - 0.5) * (newZoom - oldZoom)) / newZoom

      setPosition({ x: newX, y: newY })
    }
  }

  // Función para incrementar el zoom
  const zoomIn = (e: React.MouseEvent) => {
    e.stopPropagation()
    const newZoom = Math.min(zoomLevel + 0.1, 5)
    setZoomLevel(newZoom)
  }

  // Función para decrementar el zoom
  const zoomOut = (e: React.MouseEvent) => {
    e.stopPropagation()
    const newZoom = Math.max(zoomLevel - 0.1, 0.5)
    setZoomLevel(newZoom)
  }

  // Función para rotar la imagen
  const rotateImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    setRotation((prev) => (prev + 90) % 360)
  }

  // Función para resetear zoom y rotación
  const resetView = (e: React.MouseEvent) => {
    e.stopPropagation()
    setZoomLevel(1)
    setRotation(0)
    setPosition({ x: 0, y: 0 })
  }

  // Iniciar arrastre - Ahora permitimos arrastrar a cualquier nivel de zoom
  const handleMouseDown = (e: React.MouseEvent) => {
    // Permitimos arrastrar siempre, sin importar el nivel de zoom
    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })
  }

  // Arrastrar
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && imageContainerRef.current) {
      // Calculamos el factor de movimiento basado en el zoom
      // A menor zoom, menor sensibilidad de movimiento
      const moveFactor = Math.max(0.5, zoomLevel) // Mínimo factor de 0.5 para permitir movimiento incluso a zoom bajo

      const dx = (e.clientX - dragStart.x) / (imageContainerRef.current.clientWidth * moveFactor)
      const dy = (e.clientY - dragStart.y) / (imageContainerRef.current.clientHeight * moveFactor)

      setPosition({
        x: position.x + dx,
        y: position.y + dy,
      })

      setDragStart({ x: e.clientX, y: e.clientY })
    }
  }

  // Terminar arrastre
  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Determinar el cursor apropiado
  const cursorStyle = isDragging ? "cursor-grabbing" : "cursor-grab"

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80"
      onClick={onClose}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div
        className="relative flex flex-col items-center max-w-[90vw] max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado con título y botón de cerrar */}
        <div className="w-full flex items-center justify-between mb-2">
          <h3 className="text-white text-xl font-medium">{title}</h3>
          <button
            className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              onClose()
            }}
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Contenedor principal de la imagen con controles superpuestos */}
        <div className="relative">
          <div
            ref={imageContainerRef}
            className={`relative overflow-hidden ${cursorStyle} rounded-lg`}
            style={{ width: "80vw", height: "70vh" }}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
          >
            <div
              ref={imageRef}
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  transform: `scale(${zoomLevel}) rotate(${rotation}deg) translate(${position.x * 100}%, ${
                    position.y * 100
                  }%)`,
                  transition: isDragging ? "none" : "transform 0.2s ease",
                  width: "100%",
                  height: "100%",
                  position: "relative",
                }}
              >
                {fullUrl && (
                  <Image
                    src={fullUrl || "/placeholder.svg"}
                    alt={alt}
                    fill
                    className="object-contain"
                    unoptimized
                    priority
                    draggable={false}
                  />
                )}
              </div>
            </div>

            {/* Controles de zoom y rotación superpuestos en la parte inferior */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-black/50 backdrop-blur-sm p-2 rounded-full z-10">
              <button
                onClick={zoomIn}
                className="w-8 h-8 flex items-center justify-center bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                title="Acercar"
              >
                <Plus className="h-4 w-4 text-white" />
              </button>
              <div className="px-2 text-white text-sm font-medium">{Math.round(zoomLevel * 100)}%</div>
              <button
                onClick={zoomOut}
                className="w-8 h-8 flex items-center justify-center bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                title="Alejar"
              >
                <Minus className="h-4 w-4 text-white" />
              </button>
              <div className="w-px h-6 bg-white/20 mx-1"></div>
              <button
                onClick={rotateImage}
                className="w-8 h-8 flex items-center justify-center bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                title="Rotar"
              >
                <RotateCw className="h-4 w-4 text-white" />
              </button>
              <div className="px-2 text-white text-sm font-medium">{rotation}°</div>
              <button
                onClick={resetView}
                className="w-8 h-8 flex items-center justify-center bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                title="Restablecer vista"
              >
                <RefreshCw className="h-4 w-4 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Botón de volver en la parte inferior */}
        <div className="mt-4">
          <Button
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation()
              onClose()
            }}
            className="px-8"
          >
            Volver
          </Button>
        </div>
      </div>
    </div>
  )
}
