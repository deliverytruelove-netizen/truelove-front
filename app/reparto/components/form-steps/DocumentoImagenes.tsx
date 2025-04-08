"use client"

import type * as React from "react"
import Image from "next/image"
import { Camera, Upload } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

interface DocumentoImagenesProps {
  previewImageFrente: string | null
  previewImageReverso: string | null
  fileInputRefFrente: React.RefObject<HTMLInputElement>
  fileInputRefReverso: React.RefObject<HTMLInputElement>
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>, side: "frente" | "reverso") => Promise<void>
  isMobile: boolean
  setIsCameraOpenFrente: (isOpen: boolean) => void
  setIsCameraOpenReverso: (isOpen: boolean) => void
}

export function DocumentoImagenes({
  previewImageFrente,
  previewImageReverso,
  fileInputRefFrente,
  fileInputRefReverso,
  handleFileUpload,
  isMobile,
  setIsCameraOpenFrente,
  setIsCameraOpenReverso,
}: DocumentoImagenesProps) {
  return (
    <div>
      <Label>Imágenes del documento</Label>
      <div className="space-y-4 mt-2">
        <div>
          <Label>Frente del documento</Label>
          <div className="flex space-x-2 mt-2">
            <Button onClick={() => fileInputRefFrente.current?.click()} variant="outline">
              <Upload className="mr-2 h-4 w-4" /> Subir imagen
            </Button>
            {isMobile && (
              <Button onClick={() => setIsCameraOpenFrente(true)} variant="outline">
                <Camera className="mr-2 h-4 w-4" /> Usar cámara
              </Button>
            )}
            <input
              type="file"
              ref={fileInputRefFrente}
              onChange={(e) => handleFileUpload(e, "frente")}
              accept="image/*"
              className="hidden"
            />
          </div>
          {previewImageFrente && (
            <div className="mt-2">
              <p className="text-sm text-green-600 mb-2">Imagen del frente cargada</p>
              <Image
                src={previewImageFrente || "/placeholder.svg"}
                alt="Vista previa del frente del documento"
                width={200}
                height={150}
                className="rounded-md"
                unoptimized
              />
            </div>
          )}
        </div>

        <div>
          <Label>Reverso del documento</Label>
          <div className="flex space-x-2 mt-2">
            <Button onClick={() => fileInputRefReverso.current?.click()} variant="outline">
              <Upload className="mr-2 h-4 w-4" /> Subir imagen
            </Button>
            {isMobile && (
              <Button onClick={() => setIsCameraOpenReverso(true)} variant="outline">
                <Camera className="mr-2 h-4 w-4" /> Usar cámara
              </Button>
            )}
            <input
              type="file"
              ref={fileInputRefReverso}
              onChange={(e) => handleFileUpload(e, "reverso")}
              accept="image/*"
              className="hidden"
            />
          </div>
          {previewImageReverso && (
            <div className="mt-2">
              <p className="text-sm text-green-600 mb-2">Imagen del reverso cargada</p>
              <Image
                src={previewImageReverso || "/placeholder.svg"}
                alt="Vista previa del reverso del documento"
                width={200}
                height={150}
                className="rounded-md"
                unoptimized
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

