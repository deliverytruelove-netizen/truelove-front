// app\admin\promociones\components\VistaPreviaBanner.tsx
"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { Banner } from "../types/banner.types"
import Image from "next/image"

interface VistaPreviaBannerProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  banner: Banner | null
  formatImageUrl: (imageUrl: string | undefined | File) => string
}

export function VistaPreviaBanner({ isOpen, onOpenChange, banner, formatImageUrl }: VistaPreviaBannerProps) {
  if (!banner) return null

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange} >
      <DialogContent className="sm:max-w-[600px] ">
        <DialogHeader>
          <DialogTitle>Vista Previa del Banner</DialogTitle>
        </DialogHeader>

        <div
          className="p-6 rounded-lg relative overflow-hidden min-h-[350px] flex flex-col justify-center "
          style={{ backgroundColor: banner.color_fondo }}
        >
          {banner.url_imagen && typeof banner.url_imagen === "string" && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <Image
                src={formatImageUrl(banner.url_imagen) || "/placeholder.svg"}
                alt={banner.titulo}
                width={150}
                height={150}
                className="object-contain"
              />
            </div>
          )}

          <div className="text-start space-y-4 max-w-[60%]">
            <h3 className="text-2xl font-bold text-white">{banner.titulo}</h3>
            <p className="text-lg text-white">{banner.subtitulo}</p>

            <div className="mt-4 flex justify-start ">
              <Button className="bg-white text-black rounded-2 hover:bg-gray-200 ">{banner.texto_boton}</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}