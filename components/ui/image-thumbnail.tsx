"use client"

import { useState } from "react"
import Image from "next/image"
import { ImageViewer } from "./image-viewer"

interface ImageThumbnailProps {
  src: string | null
  alt: string
  title: string
  className?: string
}

export function ImageThumbnail({ src, alt, title, className = "" }: ImageThumbnailProps) {
  const [showViewer, setShowViewer] = useState(false)

  if (!src) return <p className="text-gray-500">Imagen no disponible</p>

  try {
    const fullUrl = src.startsWith("http") ? src : `/storage/${src.replace(/^\/?(storage\/)?/, "")}`

    return (
      <>
        <div className="flex flex-col items-center w-full">
          <div
            className={`relative w-full aspect-[4/3] cursor-pointer transition-transform hover:scale-[1.02] ${className}`}
            onClick={() => setShowViewer(true)}
          >
            <Image src={fullUrl || "/placeholder.svg"} alt={alt} fill className="object-cover rounded-lg" unoptimized />
          </div>
        </div>

        <ImageViewer
          src={src || "/placeholder.svg"}
          alt={alt}
          title={title}
          isOpen={showViewer}
          onClose={() => setShowViewer(false)}
        />
      </>
    )
  } catch (error) {
    console.log(`Error al mostrar la imagen: ${error}`)
    return <p className="text-gray-500">Error al cargar la imagen</p>
  }
}
