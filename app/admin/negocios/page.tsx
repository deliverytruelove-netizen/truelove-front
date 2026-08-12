// app\admin\negocios\page.tsx
"use client"

import type React from "react"
import { useState, useEffect, useCallback, useRef } from "react"
import MainLayout from "../components/MainLayout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Building, Search, ImageIcon, Camera, ChevronLeft, ChevronRight } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import Image from "next/image"
import { fetchNegocios, uploadLogo, uploadBanner, type Negocio } from "./services/negocios.service"

type UploadTarget = "logo" | "banner"

const NegociosPage: React.FC = () => {
  const [negocios, setNegocios] = useState<Negocio[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [uploadingKey, setUploadingKey] = useState<string | null>(null)

  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({})

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const loadNegocios = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetchNegocios(currentPage, 12, debouncedSearch)
      setNegocios(response.data)
      setTotalPages(response.meta.last_page)
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err instanceof Error ? err.message : "No se pudo cargar la lista de negocios",
      })
    } finally {
      setLoading(false)
    }
  }, [currentPage, debouncedSearch])

  useEffect(() => {
    loadNegocios()
  }, [loadNegocios])

  const handleFileSelected = async (negocio: Negocio, target: UploadTarget, file: File) => {
    const key = `${negocio.id}-${target}`
    setUploadingKey(key)
    try {
      const nuevaUrl = target === "logo" ? await uploadLogo(negocio.business_id, file) : await uploadBanner(negocio.business_id, file)

      setNegocios((prev) => prev.map((n) => (n.id === negocio.id ? { ...n, [target]: nuevaUrl } : n)))

      toast({
        title: target === "logo" ? "Logo actualizado" : "Banner actualizado",
        description: `${negocio.nombre} ahora tiene un ${target} nuevo.`,
      })
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error al subir la imagen",
        description: err instanceof Error ? err.message : "Intenta de nuevo",
      })
    } finally {
      setUploadingKey(null)
    }
  }

  const triggerPicker = (key: string) => {
    fileInputs.current[key]?.click()
  }

  const renderImageSlot = (negocio: Negocio, target: UploadTarget) => {
    const key = `${negocio.id}-${target}`
    const isUploading = uploadingKey === key
    const src = negocio[target]
    const isLogo = target === "logo"

    return (
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium text-gray-500">{isLogo ? "Logo" : "Banner"}</span>
        <button
          type="button"
          onClick={() => triggerPicker(key)}
          disabled={isUploading}
          className={`group relative overflow-hidden rounded-md border border-dashed border-gray-300 hover:border-red-400 transition-colors ${
            isLogo ? "h-20 w-20" : "h-20 w-full"
          }`}
        >
          {src ? (
            <Image src={src} alt={`${target} de ${negocio.nombre}`} fill className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-100">
              <ImageIcon className="h-6 w-6 text-gray-400" />
            </div>
          )}

          <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors">
            {isUploading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Camera className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </div>
        </button>
        <input
          ref={(el) => {
            fileInputs.current[key] = el
          }}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/gif"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            e.target.value = ""
            if (file) handleFileSelected(negocio, target, file)
          }}
        />
      </div>
    )
  }

  return (
    <MainLayout>
      <div className="w-full px-0 sm:container sm:mx-auto sm:px-4 py-3 sm:py-4">
        <Card className="shadow-md rounded-none sm:rounded-lg">
          <CardHeader className="bg-white border-b p-3 sm:p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4">
              <div>
                <CardTitle className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <Building className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
                  Fotos de Negocios
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm mt-1">
                  Haz clic sobre el logo o el banner de un negocio para reemplazarlo al instante.
                </CardDescription>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Buscar negocio..."
                  className="pl-8 text-sm"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setCurrentPage(1)
                  }}
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-3 sm:p-6">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
              </div>
            ) : negocios.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No se encontraron negocios con ese filtro</div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {negocios.map((negocio) => (
                    <div key={negocio.id} className="rounded-lg border p-3 flex flex-col gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">{negocio.nombre}</p>
                        <p className="text-xs text-gray-500 truncate">{negocio.empresa}</p>
                      </div>

                      <div className="flex gap-3">
                        {renderImageSlot(negocio, "logo")}
                        <div className="flex-1">{renderImageSlot(negocio, "banner")}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center mt-6 pt-4 border-t">
                  <span className="text-xs sm:text-sm text-gray-500">
                    Página {currentPage} de {totalPages}
                  </span>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="h-8 w-8"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="h-8 w-8"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}

export default NegociosPage
