// app\reparto\documentos\components\ImagePreview.tsx
"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface ImagePreviewProps {
  src: string
  alt: string
  onDelete: () => void
}

export function ImagePreview({ src, alt, onDelete }: ImagePreviewProps) {
  return (
    <div className="relative mb-4">
      <Button
        type="button"
        variant="destructive"
        size="icon"
        className="absolute top-2 right-2 h-8 w-8 rounded-full z-10"
        onClick={onDelete}
      >
        <X className="h-4 w-4" />
      </Button>
      <Image
        src={src || "/placeholder.svg"}
        alt={alt}
        width={300}
        height={200}
        className="max-w-full h-auto rounded-lg"
      />
    </div>
  )
}

