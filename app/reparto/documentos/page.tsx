'use client'

import { useState, FormEvent, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import Navbar from "@/components/ui/navbar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import Moto from "@/src/assets/img/moto1.jpg"
import { CapturarImagen } from "@/app/reparto/zonas/components/CapturarImagen"

interface Banco {
  id: number
  nombre: string
}

export default function RepartoDocumento() {
  const router = useRouter()
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [bancos, setBancos] = useState<Banco[]>([])
  const [formData, setFormData] = useState({
    titular: '',
    dni: '',
    banco_id: '',
    tipo_cuenta_id: '',
    numero_cuenta: '1234567890' 
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<{[key: string]: string}>({})

  useEffect(() => {
    const fetchData = async () => {
      try {
        const bancosResponse = await fetch(`${process.env.NEXT_PUBLIC_API_WEB}/bancos`)
        if (!bancosResponse.ok) throw new Error('Error al cargar bancos')
        const bancosData = await bancosResponse.json()
        setBancos(bancosData)
      } catch (error) {
        console.error('Error fetching data:', error)
        toast.error('Error al cargar los datos. Por favor, recarga la página.')
      }
    }

    fetchData()
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length <= 2) {
      setSelectedFiles(e.target.files)
      setCapturedImage(null)
      setErrors({...errors, imagen: ''})
    } else {
      setErrors({...errors, imagen: 'Puedes subir un máximo de 2 archivos'})
    }
  }

  const handleCapture = (imageSrc: string) => {
    setCapturedImage(imageSrc)
    setSelectedFiles(null)
    setErrors({...errors, imagen: ''})
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    })
    setErrors({...errors, [e.target.id]: ''})
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    })
    setErrors({...errors, [name]: ''})
  }

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}
    if (!formData.titular) newErrors.titular = 'El titular es requerido'
    if (!formData.dni) newErrors.dni = 'El DNI es requerido'
    if (!formData.banco_id) newErrors.banco_id = 'Selecciona un banco'
    if (!formData.tipo_cuenta_id) newErrors.tipo_cuenta_id = 'Selecciona un tipo de cuenta'
    if (!formData.numero_cuenta) newErrors.numero_cuenta = 'El número de cuenta es requerido'
    if (!selectedFiles && !capturedImage) newErrors.imagen = 'La imagen de la cuenta es requerida'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Por favor, complete todos los campos obligatorios');
      return;
    }
  
    setIsSubmitting(true);
  
    try {
      // Simulamos un breve retraso para dar feedback al usuario
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast.success('Formulario completado');
      
      // Redirigir a la página deseada
      router.push('/reparto/documento-motorizado'); // Cambia la ruta según sea necesario
    } catch (error) {
      console.error('Error:', error);
      toast.error('Ocurrió un error. Por favor, intente nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
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
            src={Moto}
            alt="Moto de reparto"
            layout="fill"
            objectFit="cover"
          />
        </div>

        <div className="w-full md:w-1/2 bg-white">
          <ScrollArea className="h-[calc(100vh-4rem)] md:h-[calc(100vh-4rem)]">
            <form onSubmit={handleSubmit} className="p-4 md:p-8 max-w-xl mx-auto space-y-6 md:space-y-8">
              <div className="hidden md:block">
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
                    value={formData.titular}
                    onChange={handleInputChange}
                    placeholder="Ingresa el nombre del titular"
                    className="text-sm md:text-base"
                    required
                  />
                  {errors.titular && <p className="text-red-500 text-xs mt-1">{errors.titular}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dni" className="text-sm md:text-base">DNI *</Label>
                  <Input
                    id="dni"
                    value={formData.dni}
                    onChange={handleInputChange}
                    placeholder="Ingresa el número de DNI"
                    className="text-sm md:text-base"
                    required
                  />
                  {errors.dni && <p className="text-red-500 text-xs mt-1">{errors.dni}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="banco_id" className="text-sm md:text-base">Nombre del banco *</Label>
                  <Select
                    value={formData.banco_id}
                    onValueChange={(value) => handleSelectChange('banco_id', value)}
                    required
                  >
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
                  <Label htmlFor="tipo_cuenta_id" className="text-sm md:text-base">Tipo de Cuenta Bancaria *</Label>
                  <Select
                    value={formData.tipo_cuenta_id}
                    onValueChange={(value) => handleSelectChange('tipo_cuenta_id', value)}
                    required
                  >
                    <SelectTrigger className="text-sm md:text-base">
                      <SelectValue placeholder="Selecciona el tipo de cuenta" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Cuenta de Ahorros</SelectItem>
                      <SelectItem value="2">Cuenta Corriente</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.tipo_cuenta_id && <p className="text-red-500 text-xs mt-1">{errors.tipo_cuenta_id}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numero_cuenta" className="text-sm md:text-base">Número de Cuenta Bancaria *</Label>
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
                        <Image src={capturedImage} alt="Captured" className="max-w-full h-auto rounded-lg" />
                      </div>
                    )}
                  </div>
                  {errors.imagen && <p className="text-red-500 text-xs mt-1">{errors.imagen}</p>}
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
                <Button 
                  type="submit"
                  className="bg-[#f34739] text-white hover:bg-[#d63c30]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar'}
                </Button>
              </div>
            </form>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
