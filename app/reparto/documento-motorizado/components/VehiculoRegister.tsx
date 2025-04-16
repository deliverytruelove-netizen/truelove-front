// app\reparto\documento-motorizado\components\VehiculoRegister.tsx
"use client";

import type React from "react";

import { useState, useEffect, useCallback } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Image from "next/image";
import { Camera, Upload, Loader2 } from "lucide-react";
import { CameraCapture } from "./CapturarCamara";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { createRepartoToken } from "@/services/repartoTokenService";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";

const formSchema = z.object({
  placa: z.string().min(6, "La placa debe tener al menos 6 caracteres"),
  licenciaConducir: z
    .string()
    .min(8, "El número de licencia debe tener al menos 8 caracteres"),
  seguro: z
    .string()
    .min(8, "El número de seguro debe tener al menos 8 caracteres"),
  tarjetaPropiedad: z
    .string()
    .min(8, "El número de tarjeta debe tener al menos 8 caracteres"),
});

export function VehicleRegistrationForm() {
  const router = useRouter();
  const [repartoRegistroId, setRepartoRegistroId] = useState<string | null>(
    null
  );
  const [images, setImages] = useState<{ [key: string]: string }>({});
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [currentField, setCurrentField] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      placa: "",
      licenciaConducir: "",
      seguro: "",
      tarjetaPropiedad: "",
    },
  });
  const cargarDatosExistentes = useCallback(
    async (id: string) => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_WEB}/registro-vehiculo/${id}`
        );

        if (!response.ok) {
          // Si no hay datos, simplemente continuamos sin mostrar error
          if (response.status === 404) {
            setIsLoading(false);
            return;
          }
          throw new Error("Error al obtener datos del vehículo");
        }

        const data = await response.json();

        // Si hay datos de vehículo, establecerlos
        if (data.registro_vehiculo) {
          const vehiculo = data.registro_vehiculo;

          // Establecer valores del formulario
          form.setValue("placa", vehiculo.placa);
          form.setValue("licenciaConducir", vehiculo.licencia_conducir);
          form.setValue("seguro", vehiculo.seguro);
          form.setValue("tarjetaPropiedad", vehiculo.tarjeta_propiedad);

          // Establecer imágenes
          const imagenesActualizadas: { [key: string]: string } = {};

          if (vehiculo.imagenes.imagen_placa) {
            imagenesActualizadas.placa = vehiculo.imagenes.imagen_placa;
          }

          if (vehiculo.imagenes.imagen_licencia) {
            imagenesActualizadas.licenciaConducir =
              vehiculo.imagenes.imagen_licencia;
          }

          if (vehiculo.imagenes.imagen_seguro) {
            imagenesActualizadas.seguro = vehiculo.imagenes.imagen_seguro;
          }

          if (vehiculo.imagenes.imagen_tarjeta_propiedad) {
            imagenesActualizadas.tarjetaPropiedad =
              vehiculo.imagenes.imagen_tarjeta_propiedad;
          }

          setImages(imagenesActualizadas);
        }
      } catch (error) {
        console.error("Error al cargar datos existentes:", error);
        // No mostramos toast aquí porque podría ser un registro nuevo
      } finally {
        setIsLoading(false);
      }
    },
    [form]
  );

  useEffect(() => {
    const id = sessionStorage.getItem("repartoRegistroId");
    if (!id) {
      toast({
        title: "Error",
        description: "No se encontró el ID del registro",
        variant: "destructive",
      });
      router.push("/reparto/registro");
    } else {
      setRepartoRegistroId(id);
      // Cargar datos existentes
      cargarDatosExistentes(id);

      // SOLUCIÓN: Asegurar que el paso actual sea documento-motorizado
      const currentStep = sessionStorage.getItem("repartoCurrentStep");
      if (currentStep !== "/reparto/documento-motorizado") {
        console.log("Actualizando paso actual a documento-motorizado");
        sessionStorage.setItem(
          "repartoCurrentStep",
          "/reparto/documento-motorizado"
        );

        // Intentar actualizar el token si existe
        try {
          const token =
            localStorage.getItem("repartoToken") ||
            sessionStorage.getItem("repartoToken");
          if (token && id) {
            createRepartoToken(id, "/reparto/documento-motorizado")
              .then(() => {
                console.log("Token actualizado al cargar la página");
              })
              .catch((err) => {
                console.error("Error al actualizar token al cargar:", err);
              });
          }
        } catch (error) {
          console.error("Error al verificar token existente:", error);
        }
      }
    }
  }, [router, toast, cargarDatosExistentes]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!repartoRegistroId) {
      toast({
        title: "Error",
        description: "No se encontró el ID del registro",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();

      // Append reparto_registro_id
      formData.append("reparto_registro_id", repartoRegistroId);

      // Append text fields
      Object.entries(values).forEach(([key, value]) => {
        formData.append(key, value);
      });

      // Append image fields - solo si son nuevas imágenes (base64)
      Object.entries(images).forEach(([key, value]) => {
        if (value.startsWith("data:")) {
          const imageFile = dataURLtoFile(value, `${key}.jpg`);
          formData.append(`${key}_imagen`, imageFile);
        }
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_WEB}/registro-vehiculo`,
        {
          method: "POST",
          body: formData,
        }
      );

      // Después de recibir la respuesta exitosa
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.mensaje || "Error al enviar el formulario");
      }

      const data = await response.json();
      console.log("Respuesta del servidor:", data);
      toast({
        title: "Registro exitoso",
        description: "El vehículo ha sido registrado correctamente.",
      });
      try {
        // Crear token para el siguiente paso
        const newToken = await createRepartoToken(
          repartoRegistroId,
          "/reparto/registro-exitoso"
        );

        if (newToken) {
          // Actualizar sessionStorage
          sessionStorage.setItem(
            "repartoCurrentStep",
            "/reparto/registro-exitoso"
          );
          sessionStorage.setItem("repartoRegistroId", repartoRegistroId);

          // Usar window.location para forzar la recarga completa
          window.location.href = "/reparto/registro-exitoso";
        } else {
          throw new Error("Error al crear el token");
        }
      } catch (tokenError) {
        console.error("Error al crear el token:", tokenError);
        // En caso de error, intentar redirección directa
        window.location.href = "/reparto/registro-exitoso";
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Error al registrar el vehículo",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleCapture = (field: string) => {
    setCurrentField(field);
    setIsCameraOpen(true);
  };

  const handleFileUpload = (
    field: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages((prev) => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const dataURLtoFile = (dataurl: string, filename: string): File => {
    const arr = dataurl.split(",");
    const mime = arr[0].match(/:(.*?);/)?.[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  if (!repartoRegistroId) return null;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-red-500" />
          <p className="mt-4 text-gray-600">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="placa"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Placa del Vehículo</FormLabel>
              <FormControl>
                <Input placeholder="Ingrese la placa" {...field} />
              </FormControl>
              <FormDescription>
                Ingrese la placa de su vehículo sin espacios
              </FormDescription>
              <FormMessage />
              <div className="flex gap-2 mt-2">
                <DocumentUpload
                  field="placa"
                  image={images.placa}
                  onCapture={handleCapture}
                  onFileUpload={handleFileUpload}
                />
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="licenciaConducir"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Licencia de Conducir</FormLabel>
              <FormControl>
                <Input
                  placeholder="Número de licencia"
                  {...field}
                  maxLength={20}
                />
              </FormControl>
              <FormDescription>
                Ingrese el número de su licencia de conducir
              </FormDescription>
              <FormMessage />
              <div className="flex gap-2 mt-2">
                <DocumentUpload
                  field="licenciaConducir"
                  image={images.licenciaConducir}
                  onCapture={handleCapture}
                  onFileUpload={handleFileUpload}
                />
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="seguro"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Seguro del Vehículo</FormLabel>
              <FormControl>
                <Input placeholder="Número de póliza" {...field} />
              </FormControl>
              <FormDescription>
                Ingrese el número de póliza del seguro
              </FormDescription>
              <FormMessage />
              <div className="flex gap-2 mt-2">
                <DocumentUpload
                  field="seguro"
                  image={images.seguro}
                  onCapture={handleCapture}
                  onFileUpload={handleFileUpload}
                />
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tarjetaPropiedad"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tarjeta de Propiedad</FormLabel>
              <FormControl>
                <Input placeholder="Número de tarjeta" {...field} />
              </FormControl>
              <FormDescription>
                Ingrese el número de la tarjeta de propiedad
              </FormDescription>
              <FormMessage />
              <div className="flex gap-2 mt-2">
                <DocumentUpload
                  field="tarjetaPropiedad"
                  image={images.tarjetaPropiedad}
                  onCapture={handleCapture}
                  onFileUpload={handleFileUpload}
                />
              </div>
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full bg-[#f34739] hover:bg-[#d63c30] text-white"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Guardando..." : "Guardar Información"}
        </Button>
      </form>

      <Dialog open={isCameraOpen} onOpenChange={setIsCameraOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tomar Foto</DialogTitle>
          </DialogHeader>
          <CameraCapture
            onCapture={(imageSrc) => {
              setImages((prev) => ({ ...prev, [currentField]: imageSrc }));
              setIsCameraOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </Form>
  );
}

function DocumentUpload({
  field,
  image,
  onCapture,
  onFileUpload,
}: {
  field: string;
  image?: string;
  onCapture: (field: string) => void;
  onFileUpload: (field: string, e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onCapture(field)}
      >
        <Camera className="w-4 h-4 mr-2" />
        Tomar Foto
      </Button>
      <div className="relative">
        <Button type="button" variant="outline" size="sm" className="relative">
          <Upload className="w-4 h-4 mr-2" />
          Subir Archivo
          <input
            type="file"
            className="absolute inset-0 opacity-0 cursor-pointer"
            accept="image/*"
            onChange={(e) => onFileUpload(field, e)}
          />
        </Button>
      </div>
      {image && (
        <Card className="mt-2">
          <CardContent className="p-2">
            <Image
              src={image || "/placeholder.svg"}
              alt="Documento"
              width={200}
              height={200}
              className="max-h-32 object-contain"
            />
          </CardContent>
        </Card>
      )}
    </>
  );
}
