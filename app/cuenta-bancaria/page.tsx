// app\cuenta-bancaria\page.tsx
'use client'

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import Navbar from "@/components/ui/navbar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import ImagenCuenta from "@/public/img/negocio.jpg"
import { CapturarImagen } from "./components/CapturarImagen"
import { updateRegistrationStep, getRegistrationData, getRegistrationToken } from '@/services/registrationTokenService'

export default function CuentaBancariaPage() {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    titular_cuenta: '',
    dni: '',
    banco_id: '',
    tipo_cuenta_id: '',
    numero_cuenta: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const checkRegistrationStep = async () => {
      const data = await getRegistrationData();
      if (!data || data.current_step !== '/cuenta-bancaria') {
        toast({
          title: "Error",
          description: "Por favor complete los pasos anteriores",
          variant: "destructive",
        });
        router.push('/');
      }
    };

    checkRegistrationStep();
  }, [router, toast]);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormErrors({});

    // Validate form
    const errors: Record<string, string> = {};
    if (!formData.titular_cuenta.trim()) errors.titular_cuenta = "El titular de la cuenta es requerido";
    if (!formData.dni.trim()) errors.dni = "El DNI es requerido";
    if (!formData.banco_id) errors.banco_id = "Seleccione un banco";
    if (!formData.tipo_cuenta_id) errors.tipo_cuenta_id = "Seleccione un tipo de cuenta";
    if (!formData.numero_cuenta.trim()) errors.numero_cuenta = "El número de cuenta es requerido";
    if (!selectedFiles && !capturedImage) errors.imagenes_cuenta = "Se requiere una imagen de la cuenta bancaria";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setIsSubmitting(false);
      return;
    }

    const submitData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      submitData.append(key, value);
    });

    if (selectedFiles) {
      Array.from(selectedFiles).forEach((file) => {
        submitData.append('imagenes_cuenta[]', file);
      });
    } else if (capturedImage) {
      const blob = await fetch(capturedImage).then(r => r.blob());
      submitData.append('imagenes_cuenta[]', blob, 'captured_image.jpg');
    }

    try {
      const registrationData = await getRegistrationData()
      if (!registrationData || !registrationData.registration_id) {
        throw new Error("No se encontró el ID de registro del negocio")
      }
      submitData.append("business_registration_id", registrationData.registration_id)
  
      const token = getRegistrationToken()
      if (!token) {
        throw new Error("No se encontró el token de registro")
      }
  
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_WEB}/socios/cuenta-bancaria`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: submitData,
      })
  
      if (!response.ok) {
        const errorData = await response.json()
        if (response.status === 500) {
          throw new Error("Error interno del servidor. Por favor, inténtelo de nuevo más tarde.")
        } else {
          throw new Error(errorData.mensaje || "Error al guardar la cuenta bancaria")
        }
      }
  
      toast({
        title: "Éxito",
        description: "Cuenta bancaria guardada correctamente",
      })
  
      // Actualizar el paso de registro y redirigir al usuario
      await updateRegistrationStep("/verificacion-documentos")
      router.push("/verificacion-documentos")
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "No se pudo guardar la cuenta bancaria. Por favor, inténtelo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

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
            <form onSubmit={handleSubmit} className="p-4 md:p-8 max-w-xl mx-auto space-y-6 md:space-y-8">
              {Object.keys(formErrors).length > 0 && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                  <strong className="font-bold">Por favor, corrija los errores en el formulario.</strong>
                </div>
              )}
              <div className="md:block hidden">
                <h1 className="text-xl md:text-2xl font-bold">Imagen cuenta bancaria</h1>
                <p className="text-sm md:text-base text-gray-500 mt-2">
                  Necesitamos verificar tu información.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="titular_cuenta" className="text-sm md:text-base">Titular de Cuenta Bancaria *</Label>
                  <Input
                    id="titular_cuenta"
                    name="titular_cuenta"
                    placeholder="Ingresa el nombre del titular"
                    className={`text-sm md:text-base ${formErrors.titular_cuenta ? 'border-red-500' : ''}`}
                    value={formData.titular_cuenta}
                    onChange={handleInputChange}
                    required
                  />
                  {formErrors.titular_cuenta && <p className="text-red-500 text-xs mt-1">{formErrors.titular_cuenta}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dni" className="text-sm md:text-base">DNI *</Label>
                  <Input
                    id="dni"
                    name="dni"
                    placeholder="Ingresa el número de DNI"
                    className={`text-sm md:text-base ${formErrors.dni ? 'border-red-500' : ''}`}
                    value={formData.dni}
                    onChange={handleInputChange}
                    required
                  />
                  {formErrors.dni && <p className="text-red-500 text-xs mt-1">{formErrors.dni}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="banco_id" className="text-sm md:text-base">Nombre del banco *</Label>
                  <Select onValueChange={(value) => handleSelectChange('banco_id', value)}>
                    <SelectTrigger className="text-sm md:text-base">
                      <SelectValue placeholder="Selecciona tu banco" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">BANCO DE CREDITO DEL PERU</SelectItem>
                      <SelectItem value="2">INTERBANK</SelectItem>
                      <SelectItem value="3">BBVA</SelectItem>
                    </SelectContent>
                  </Select>
                  {formErrors.banco_id && <p className="text-red-500 text-xs mt-1">{formErrors.banco_id}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tipo_cuenta_id" className="text-sm md:text-base">Tipo de Cuenta Bancaria *</Label>
                  <Select onValueChange={(value) => handleSelectChange('tipo_cuenta_id', value)}>
                    <SelectTrigger className="text-sm md:text-base">
                      <SelectValue placeholder="Selecciona el tipo de cuenta" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Cuenta de Ahorro</SelectItem>
                      <SelectItem value="2">Cuenta Corriente</SelectItem>
                    </SelectContent>
                  </Select>
                  {formErrors.tipo_cuenta_id && <p className="text-red-500 text-xs mt-1">{formErrors.tipo_cuenta_id}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numero_cuenta" className="text-sm md:text-base">Número de Cuenta Bancaria *</Label>
                  <Input
                    id="numero_cuenta"
                    name="numero_cuenta"
                    placeholder="Ingresa el número de cuenta"
                    className={`text-sm md:text-base ${formErrors.numero_cuenta ? 'border-red-500' : ''}`}
                    value={formData.numero_cuenta}
                    onChange={handleInputChange}
                    required
                  />
                  {formErrors.numero_cuenta && <p className="text-red-500 text-xs mt-1">{formErrors.numero_cuenta}</p>}
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
                        <Image src={capturedImage} alt="Captured" width={200} height={200} className="max-w-full h-auto rounded-lg" />
                      </div>
                    )}
                    {formErrors.imagenes_cuenta && <p className="text-red-500 text-xs mt-1">{formErrors.imagenes_cuenta}</p>}
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
                <Button 
                  type="submit" 
                  className="bg-red-500 hover:bg-pink-600 text-xs md:text-sm"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Enviando...' : 'Continuar'}
                </Button>
              </div>
            </form>
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}

