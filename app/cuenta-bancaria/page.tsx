'use client'

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Navbar from "@/components/ui/navbar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from 'react'
import ImagenCuenta from "@/public/img/negocio.jpg"
import { CapturarImagen } from "./components/CapturarImagen"

export default function CuentaBancariaPage() {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length <= 2) {
      setSelectedFiles(e.target.files);
      setCapturedImage(null);
    }
  };

  const handleCapture = (imageSrc: string) => {
    setCapturedImage(imageSrc);
    setSelectedFiles(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar>
        <div className="flex items-center gap-2 md:gap-4">
          <Button asChild variant="ghost" className="text-xs md:text-sm">
            <Link href="/">¿Tienes preguntas?</Link>
          </Button>
          <Button
            asChild
            variant="default"
            className="bg-[#f34739] text-white hover:bg-[#d63c30] text-xs md:text-sm"
          >
            <Link href="/">Guardar y salir</Link>
          </Button>
        </div>
      </Navbar>

      <div className="flex flex-col md:flex-row flex-1">
        <div className="hidden md:block w-full md:w-1/2 h-48 md:h-auto relative">
          <Image
            src={ImagenCuenta}
            alt="Banco"
            layout="fill"
            objectFit="cover"
          />
        </div>

        <div className="w-full md:w-1/2 bg-white">
          <ScrollArea className="h-[calc(100vh-4rem)] md:h-[calc(100vh-4rem)]">
            <div className="p-4 md:p-8 max-w-xl mx-auto space-y-6 md:space-y-8">
              <div className="md:block hidden">
                <h1 className="text-xl md:text-2xl font-bold">Imagen cuenta bancaria</h1>
                <p className="text-sm md:text-base text-gray-500 mt-2">
                  Necesitamos verificar tu información.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="titular" className="text-sm md:text-base">Titular de Cuenta Bancaria *</Label>
                  <Input
                    id="titular"
                    placeholder="Ingresa el nombre del titular"
                    className="text-sm md:text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dni" className="text-sm md:text-base">DNI *</Label>
                  <Input
                    id="dni"
                    placeholder="Ingresa el número de DNI"
                    className="text-sm md:text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="banco" className="text-sm md:text-base">Nombre del banco *</Label>
                  <Select>
                    <SelectTrigger className="text-sm md:text-base">
                      <SelectValue placeholder="Selecciona tu banco" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bcp">BANCO DE CREDITO DEL PERU</SelectItem>
                      <SelectItem value="interbank">INTERBANK</SelectItem>
                      <SelectItem value="bbva">BBVA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tipo-cuenta" className="text-sm md:text-base">Tipo de Cuenta Bancaria *</Label>
                  <Select>
                    <SelectTrigger className="text-sm md:text-base">
                      <SelectValue placeholder="Selecciona el tipo de cuenta" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ahorro">Cuenta de Ahorro</SelectItem>
                      <SelectItem value="corriente">Cuenta Corriente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numero-cuenta" className="text-sm md:text-base">Número de Cuenta Bancaria *</Label>
                  <Input
                    id="numero-cuenta"
                    placeholder="Ingresa el número de cuenta"
                    className="text-sm md:text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm md:text-base">Imagen de cuenta bancaria *</Label>
                  <div className="border-2 border-dashed rounded-lg p-4 text-center space-y-4">
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-xs md:text-sm text-gray-500">
                        Adjuntar en formato JPEG, PDF o PNG.
                        Tamaño máximo del archivo: 4 MB. Puedes subir un máximo de 2 archivos
                      </p>
                      <Input
                        type="file"
                        onChange={handleFileSelect}
                        accept=".jpg,.jpeg,.png,.pdf"
                        multiple
                        max={2}
                        className="hidden"
                        id="file-upload"
                      />
                      <Label
                        htmlFor="file-upload"
                        className="cursor-pointer inline-flex items-center justify-center rounded-md text-xs md:text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 md:h-9 px-3 md:px-4 py-2"
                      >
                        Seleccionar archivo
                      </Label>
                      {selectedFiles && (
                        <div className="text-xs md:text-sm text-gray-500">
                          {Array.from(selectedFiles).map((file, index) => (
                            <p key={index}>{file.name}</p>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-xs md:text-sm text-gray-500">
                        O captura una imagen con tu cámara
                      </p>
                      <CapturarImagen onCapture={handleCapture} />
                    </div>
                    {capturedImage && (
                      <div className="mt-4">
                        <p className="text-xs md:text-sm text-gray-500 mb-2">Imagen capturada:</p>
                        <img src={capturedImage} alt="Captured" className="max-w-full h-auto rounded-lg" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-3 md:p-4 rounded-lg space-y-2">
                <p className="text-xs md:text-sm text-blue-800">
                  El justificante bancario debe incluir los cinco datos anteriores. Consulte el
                  ejemplo siguiente como referencia.
                </p>
                <p className="text-xs md:text-sm text-blue-800">
                  Puede seleccionar y cargar varias imágenes o documentos si los cinco datos
                  están en páginas o pantallas separadas.
                </p>
              </div>

              <div className="flex justify-end pt-4">
                <Button className="bg-red-500 hover:bg-pink-600 text-xs md:text-sm">
                  Continuar
                </Button>
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}

