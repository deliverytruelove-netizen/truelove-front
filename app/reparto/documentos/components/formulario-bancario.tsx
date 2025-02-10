"use client"

import { useState, type FormEvent, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { CapturarImagen } from "./CapturarImagen"
import { FileText, ImageIcon } from "lucide-react"
import { PdfPreview } from "./Pdf-preview"

interface Banco {
  id: number
  nombre: string
}

interface TipoCuenta {
  id: number
  nombre: string
}

interface ApiError {
  mensaje: string
}

interface ApiResponse {
  mensaje: string
  cuenta_bancaria: {
    id: number
    titular: string
    dni: number
    banco_id: string
    tipo_cuenta_id: string
    numero_cuenta: string
    url_imagen_cuenta: string
    created_at: string
    updated_at: string
  }
}

export function FormularioBancario() {
  const router = useRouter()
  const [repartoRegistroId, setRepartoRegistroId] = useState<string | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const [filePreview, setFilePreview] = useState<string[]>([])
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [bancos, setBancos] = useState<Banco[]>([])
  const [tiposCuenta, setTiposCuenta] = useState<TipoCuenta[]>([])
  const [isMobile, setIsMobile] = useState(false)
  const [fileType, setFileType] = useState<"image" | "pdf">("image")
  const [formData, setFormData] = useState({
    titular: "",
    dni: "",
    banco_id: "",
    tipo_cuenta_id: "",
    numero_cuenta: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    const id = sessionStorage.getItem("repartoRegistroId")
    if (!id) {
      toast.error("No se encontró el ID del registro")
      router.push("/reparto/registro")
    } else {
      setRepartoRegistroId(id)
    }
  }, [router])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bancosResponse, tiposCuentaResponse] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_WEB}/bancos`),
          fetch(`${process.env.NEXT_PUBLIC_API_WEB}/tipos-cuenta`),
        ])

        if (!bancosResponse.ok || !tiposCuentaResponse.ok) {
          throw new Error("Error al cargar datos")
        }

        const bancosData = await bancosResponse.json()
        const tiposCuentaData = await tiposCuentaResponse.json()

        setBancos(bancosData)
        setTiposCuenta(tiposCuentaData)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast.error("Error al cargar los datos. Por favor, recarga la página.")
      }
    }

    if (repartoRegistroId) {
      fetchData()
    }
  }, [repartoRegistroId])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length <= 2) {
      const files = Array.from(e.target.files)
      const validFiles = files.every((file) => {
        const fileType = file.type.toLowerCase()
        if (fileType === "image") {
          return fileType.includes("image")
        } else {
          return fileType === "application/pdf"
        }
      })

      if (!validFiles) {
        setErrors({
          ...errors,
          imagen: fileType === "image" ? "Solo se permiten archivos de imagen" : "Solo se permiten archivos PDF",
        })
        return
      }

      setSelectedFiles(e.target.files)
      setCapturedImage(null)
      setErrors({ ...errors, imagen: "" })

      const previews: string[] = []
      files.forEach((file) => {
        if (file.type.includes("image")) {
          const reader = new FileReader()
          reader.onloadend = () => {
            previews.push(reader.result as string)
            setFilePreview([...previews])
          }
          reader.readAsDataURL(file)
        } else if (file.type === "application/pdf") {
          previews.push("pdf")
          setFilePreview([...previews])
        }
      })
    } else {
      setErrors({ ...errors, imagen: "Puedes subir un máximo de 2 archivos" })
    }
  }

  const handleCapture = (imageSrc: string) => {
    setCapturedImage(imageSrc)
    setSelectedFiles(null)
    setFilePreview([])
    setErrors({ ...errors, imagen: "" })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    if (id === "dni") {
      const numericValue = value.replace(/\D/g, "").slice(0, 8)
      setFormData({ ...formData, [id]: numericValue })
    } else {
      setFormData({ ...formData, [id]: value })
    }
    setErrors({ ...errors, [id]: "" })
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    })
    setErrors({ ...errors, [name]: "" })
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}
    if (!formData.titular) newErrors.titular = "El titular es requerido"
    if (!formData.dni) newErrors.dni = "El DNI es requerido"
    if (formData.dni.length !== 8) newErrors.dni = "El DNI debe tener 8 dígitos"
    if (!formData.banco_id) newErrors.banco_id = "Selecciona un banco"
    if (!formData.tipo_cuenta_id) newErrors.tipo_cuenta_id = "Selecciona un tipo de cuenta"
    if (!formData.numero_cuenta) newErrors.numero_cuenta = "El número de cuenta es requerido"
    if (!selectedFiles && !capturedImage) newErrors.imagen = "El documento bancario es requerido"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error("Por favor, complete todos los campos obligatorios correctamente")
      return
    }

    if (!repartoRegistroId) {
      toast.error("No se encontró el ID del registro")
      return
    }

    setIsSubmitting(true)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append("reparto_registro_id", repartoRegistroId)
      formDataToSend.append("titular", formData.titular)
      formDataToSend.append("dni", formData.dni)
      formDataToSend.append("banco_id", formData.banco_id)
      formDataToSend.append("tipo_cuenta_id", formData.tipo_cuenta_id)
      formDataToSend.append("numero_cuenta", formData.numero_cuenta)

      if (selectedFiles) {
        Array.from(selectedFiles).forEach((file) => {
          formDataToSend.append("imagen_cuenta", file)
        })
      } else if (capturedImage) {
        const response = await fetch(capturedImage)
        const blob = await response.blob()
        const file = new File([blob], "imagen_capturada.jpg", { type: "image/jpeg" })
        formDataToSend.append("imagen_cuenta", file)
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_WEB}/cuenta-bancaria`, {
        method: "POST",
        body: formDataToSend,
      })

      const data: ApiResponse | ApiError = await response.json()

      if (!response.ok) {
        throw new Error("mensaje" in data ? data.mensaje : "Error al guardar la cuenta bancaria")
      }

      toast.success("mensaje" in data ? data.mensaje : "Cuenta bancaria guardada exitosamente")

      sessionStorage.setItem("repartoRegistroId", repartoRegistroId)
      router.push("/reparto/documento-motorizado")
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error("Ocurrió un error al guardar la cuenta bancaria. Por favor, intente nuevamente.")
      }
      console.error("Error al guardar cuenta bancaria:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!repartoRegistroId) return null

  return (
    <ScrollArea className="h-[calc(100vh-4rem)] md:h-[calc(100vh-4rem)]">
      <form onSubmit={handleSubmit} className="p-4 md:p-8 max-w-xl mx-auto space-y-6 md:space-y-8">
        <div className="hidden md:block">
          <h1 className="text-xl md:text-2xl font-bold">Imagen cuenta bancaria</h1>
          <p className="text-sm md:text-base text-gray-500 mt-2">Necesitamos verificar tu información.</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="titular" className="text-sm md:text-base">
              Titular de Cuenta Bancaria *
            </Label>
            <Input
              id="titular"
              value={formData.titular}
              onChange={handleInputChange}
              placeholder="Ingresa el nombre del titular"
              className="text-sm md:text-base"
              required
            />
            {errors.titular && <p className="text-red-500 text-xs mt-1">{errors.titular}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dni" className="text-sm md:text-base">
              DNI *
            </Label>
            <Input
              id="dni"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={formData.dni}
              onChange={handleInputChange}
              placeholder="Ingresa el número de DNI (8 dígitos)"
              className="text-sm md:text-base"
              required
              maxLength={8}
            />
            {errors.dni && <p className="text-red-500 text-xs mt-1">{errors.dni}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="banco_id" className="text-sm md:text-base">
              Nombre del banco *
            </Label>
            <Select value={formData.banco_id} onValueChange={(value) => handleSelectChange("banco_id", value)} required>
              <SelectTrigger className="text-sm md:text-base">
                <SelectValue placeholder="Selecciona tu banco" />
              </SelectTrigger>
              <SelectContent>
                {bancos.map((banco) => (
                  <SelectItem key={banco.id} value={String(banco.id)}>
                    {banco.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.banco_id && <p className="text-red-500 text-xs mt-1">{errors.banco_id}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipo_cuenta_id" className="text-sm md:text-base">
              Tipo de Cuenta Bancaria *
            </Label>
            <Select
              value={formData.tipo_cuenta_id}
              onValueChange={(value) => handleSelectChange("tipo_cuenta_id", value)}
              required
            >
              <SelectTrigger className="text-sm md:text-base">
                <SelectValue placeholder="Selecciona el tipo de cuenta" />
              </SelectTrigger>
              <SelectContent>
                {tiposCuenta.map((tipo) => (
                  <SelectItem key={tipo.id} value={String(tipo.id)}>
                    {tipo.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.tipo_cuenta_id && <p className="text-red-500 text-xs mt-1">{errors.tipo_cuenta_id}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="numero_cuenta" className="text-sm md:text-base">
              Número de Cuenta Bancaria *
            </Label>
            <Input
              id="numero_cuenta"
              value={formData.numero_cuenta}
              onChange={handleInputChange}
              placeholder="Ingresa el número de cuenta"
              className="text-sm md:text-base"
              required
            />
            {errors.numero_cuenta && <p className="text-red-500 text-xs mt-1">{errors.numero_cuenta}</p>}
          </div>

          <div className="space-y-2">
            <Label className="text-sm md:text-base">Documento bancario *</Label>

            {/* Selector de tipo de archivo */}
            <div className="flex gap-2 mb-4">
              <Button
                type="button"
                variant={fileType === "image" ? "default" : "outline"}
                onClick={() => {
                  setFileType("image")
                  setSelectedFiles(null)
                  setFilePreview([])
                  setCapturedImage(null)
                }}
                className="flex items-center gap-2"
              >
                <ImageIcon className="w-4 h-4" />
                Imagen
              </Button>
              <Button
                type="button"
                variant={fileType === "pdf" ? "default" : "outline"}
                onClick={() => {
                  setFileType("pdf")
                  setSelectedFiles(null)
                  setFilePreview([])
                  setCapturedImage(null)
                }}
                className="flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                PDF
              </Button>
            </div>

            <div className="border-2 border-dashed rounded-lg p-4 text-center space-y-4">
              <div className="flex flex-col items-center gap-2">
                {(!selectedFiles || fileType === "image") && (
                  <>
                    <p className="text-xs md:text-sm text-gray-500">
                      {fileType === "image" ? "Adjuntar en formato JPEG o PNG" : "Adjuntar en formato PDF"}
                    </p>
                    <Input
                      type="file"
                      onChange={handleFileSelect}
                      accept={fileType === "image" ? ".jpg,.jpeg,.png" : ".pdf"}
                      multiple={fileType === "image"}
                      className="hidden"
                      id="file-upload"
                    />
                    <Label
                      htmlFor="file-upload"
                      className="cursor-pointer inline-flex items-center justify-center rounded-md text-xs md:text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 md:h-9 px-3 md:px-4 py-2"
                    >
                      Seleccionar archivo
                    </Label>
                  </>
                )}
              </div>

              {/* Mostrar opción de cámara solo si está en modo imagen */}
              {isMobile && fileType === "image" && (
                <div className="flex flex-col items-center gap-2">
                  <p className="text-xs md:text-sm text-gray-500">O captura una imagen con tu cámara</p>
                  <CapturarImagen onCapture={handleCapture} />
                </div>
              )}

              {/* Vista previa de archivos */}
              {filePreview.length > 0 && (
                <div className="mt-4">
                  {filePreview.map((preview, index) => {
                    if (preview === "pdf" && selectedFiles) {
                      const file = Array.from(selectedFiles)[index]
                      return (
                        <PdfPreview
                          key={index}
                          file={file}
                          onDelete={() => {
                            const updatedFiles = Array.from(selectedFiles).filter((_, i) => i !== index)
                            const newFileList = new DataTransfer()
                            updatedFiles.forEach((file) => newFileList.items.add(file))
                            setSelectedFiles(updatedFiles.length > 0 ? newFileList.files : null)
                            setFilePreview(filePreview.filter((_, i) => i !== index))
                          }}
                        />
                      )
                    } else {
                      return (
                        <Image
                          key={index}
                          src={preview || "/placeholder.svg"}
                          alt={`Vista previa ${index + 1}`}
                          width={300}
                          height={200}
                          className="max-w-full h-auto rounded-lg"
                        />
                      )
                    }
                  })}
                </div>
              )}

              {/* Vista previa de imagen capturada */}
              {capturedImage && (
                <div className="mt-4">
                  <p className="text-xs md:text-sm text-gray-500 mb-2">Imagen capturada:</p>
                  <Image
                    src={capturedImage || "/placeholder.svg"}
                    alt="Captured"
                    width={300}
                    height={200}
                    className="max-w-full h-auto rounded-lg"
                  />
                </div>
              )}
            </div>
            {errors.imagen && <p className="text-red-500 text-xs mt-1">{errors.imagen}</p>}
          </div>
        </div>

        <div className="bg-blue-50 p-3 md:p-4 rounded-lg space-y-2">
          <p className="text-xs md:text-sm text-blue-800">
            El justificante bancario debe incluir los cinco datos anteriores. Consulte el ejemplo siguiente como
            referencia.
          </p>
          <p className="text-xs md:text-sm text-blue-800">
            Puede seleccionar y cargar varias imágenes o documentos si los cinco datos están en páginas o pantallas
            separadas.
          </p>
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" className="bg-[#f34739] text-white hover:bg-[#d63c30]" disabled={isSubmitting}>
            {isSubmitting ? "Enviando..." : "Enviar"}
          </Button>
        </div>
      </form>
    </ScrollArea>
  )
}

