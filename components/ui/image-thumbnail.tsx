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
    // Normalizar la ruta
    let fullUrl = src;
    
    // Si ya es una URL completa, la dejamos como está
    if (src.startsWith("http://") || src.startsWith("https://")) {
      fullUrl = src;
    }
    // Si ya comienza con /storage/, la dejamos como está
    else if (src.startsWith("/storage/")) {
      fullUrl = src;
    }
    // Si contiene /storage/ en alguna parte, extraemos desde ahí
    else if (src.includes("/storage/")) {
      const storageIndex = src.indexOf("/storage/");
      fullUrl = src.substring(storageIndex);
    }
    // Si no tiene /storage/, lo agregamos
    else {
      fullUrl = `/storage/${src.replace(/^\//, "")}`;
    }

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
          src={fullUrl || "/placeholder.svg"}
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
