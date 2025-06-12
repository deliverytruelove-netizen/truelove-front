"use client";

import type React from "react";

import { useState, type FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
// import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { CapturarImagen } from "./CapturarImagen";
import { FileText, ImageIcon, Loader2, Info, CheckCircle2 } from "lucide-react";
import { PdfPreview } from "./Pdf-preview";
import { ImagePreview } from "./ImagePreview";
// import { createRepartoToken } from "@/services/repartoTokenService"
import { FormDataService } from "@/services/formDataService";


interface Banco {
  id: number;
  nombre: string;
}

interface TipoCuenta {
  id: number;
  nombre: string;
}

// interface CuentaBancaria {
//   id: number
//   titular: string
//   dni: string
//   banco_id: string
//   banco_nombre?: string
//   tipo_cuenta_id: string
//   tipo_cuenta_nombre?: string
//   numero_cuenta: string
//   url_imagen_cuenta: string
// }

// interface ApiError {
//   mensaje: string
// }

// interface ApiResponse {
//   mensaje: string
//   cuenta_bancaria: CuentaBancaria
// }

export function FormularioBancario() {
  const router = useRouter();
  const [repartoRegistroId, setRepartoRegistroId] = useState<string | null>(
    null
  );
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [filePreview, setFilePreview] = useState<string[]>([]);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [bancos, setBancos] = useState<Banco[]>([]);
  const [tiposCuenta, setTiposCuenta] = useState<TipoCuenta[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [fileType, setFileType] = useState<"image" | "pdf">("image");
  const [formData, setFormData] = useState({
    titular: "",
    dni: "",
    banco_id: "",
    tipo_cuenta_id: "",
    numero_cuenta: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [cuentaBancariaId, setCuentaBancariaId] = useState<number | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showFileSelector, setShowFileSelector] = useState(true);
  const [tipoDocumentoOriginal, setTipoDocumentoOriginal] =
    useState<string>("DNI");
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };
  const obtenerLabelDocumento = (tipoDocumento: string): string => {
    switch (tipoDocumento) {
      case "DNI":
        return "DNI";
      case "RUC":
        return "RUC";
      case "CE":
      case "Carnet de Extranjería":
        return "Carnet de Extranjería";
      default:
        return "DNI";
    }
  };

  const obtenerPlaceholderDocumento = (tipoDocumento: string): string => {
    switch (tipoDocumento) {
      case "DNI":
        return "Ingresa el número de DNI (8 dígitos)";
      case "RUC":
        return "Ingresa el número de RUC (11 dígitos)";
      case "CE":
      case "Carnet de Extranjería":
        return "Ingresa el número de Carnet de Extranjería";
      default:
        return "Ingresa el número de DNI (8 dígitos)";
    }
  };

  const obtenerMaxLengthDocumento = (tipoDocumento: string): number => {
    switch (tipoDocumento) {
      case "DNI":
        return 8;
      case "RUC":
        return 11;
      case "CE":
      case "Carnet de Extranjería":
        return 20;
      default:
        return 8;
    }
  };
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

useEffect(() => {
  const id = sessionStorage.getItem("repartoRegistroId");
  if (!id) {
    toast.error("No se encontró el ID del registro");
    router.push("/reparto/registro");
  } else {
    setRepartoRegistroId(id);
    
    // Verificar solo los datos básicos y personales (que son obligatorios)
    const datosBasicos = FormDataService.obtenerDatosBasicos();
    const datosPersonales = FormDataService.obtenerDatosPersonales();
    
    // Solo validar que existan los datos básicos y personales
    if (!datosBasicos || !datosPersonales) {
      toast.error("Faltan datos del registro. Porr favor, comience el proceso nuevamente.");
      router.push("/reparto");
    } else {
      // Cargar datos existentes
      cargarDatosExistentes(id);
    }
  }
}, [router]);

  const cargarDatosExistentes = async (id: string) => {
    try {
      setIsLoading(true);

      // ✅ OBTENER TIPO DE DOCUMENTO DE LOS DATOS BÁSICOS
      const datosBasicos = FormDataService.obtenerDatosBasicos();
      if (datosBasicos && datosBasicos.tipo_documento) {
        setTipoDocumentoOriginal(datosBasicos.tipo_documento);
      }

      // Cargar bancos y tipos de cuenta
      const [bancosResponse, tiposCuentaResponse] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_WEB}/bancos`),
        fetch(`${process.env.NEXT_PUBLIC_API_WEB}/tipos-cuenta`),
      ]);

      if (!bancosResponse.ok || !tiposCuentaResponse.ok) {
        throw new Error("Error al cargar datos de referencia");
      }

      const bancosData = await bancosResponse.json();
      const tiposCuentaData = await tiposCuentaResponse.json();

      setBancos(bancosData);
      setTiposCuenta(tiposCuentaData);

      // Cargar datos de cuenta bancaria si existen
      const cuentaResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_WEB}/cuenta-bancaria/${id}`
      );

      if (!cuentaResponse.ok) {
        // Si no hay datos, simplemente continuamos sin mostrar error
        if (cuentaResponse.status === 404) {
          setIsLoading(false);
          return;
        }
        throw new Error("Error al obtener datos de cuenta bancaria");
      }

      const cuentaData = await cuentaResponse.json();

      // Si hay datos de cuenta bancaria, establecerlos
      if (cuentaData.cuenta_bancaria) {
        const cuenta = cuentaData.cuenta_bancaria;
        setCuentaBancariaId(cuenta.id);

        setFormData({
          titular: cuenta.titular || "",
          dni: cuenta.dni || "",
          banco_id: cuenta.banco_id?.toString() || "",
          tipo_cuenta_id: cuenta.tipo_cuenta_id?.toString() || "",
          numero_cuenta: cuenta.numero_cuenta || "",
        });

        // Si hay imagen de cuenta, establecerla como vista previa
        if (cuenta.url_imagen_cuenta) {
          // Determinar si es PDF o imagen basado en la extensión
          if (cuenta.url_imagen_cuenta.toLowerCase().endsWith(".pdf")) {
            setFileType("pdf");
            setFilePreview(["pdf"]);
            setShowFileSelector(false);
          } else {
            setFileType("image");
            setCapturedImage(cuenta.url_imagen_cuenta);
            setShowFileSelector(false);
          }
        }
      }
    } catch (error) {
      console.error("Error al cargar datos existentes:", error);
      toast.error("Error al cargar datos. Por favor, recarga la página.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length <= 2) {
      const files = Array.from(e.target.files);

      // Primero validar el tipo de archivo
      const validFiles = files.every((file) => {
        if (fileType === "image") {
          return (
            file.type.startsWith("image/") &&
            (file.type.includes("jpeg") || file.type.includes("png"))
          );
        } else {
          return file.type === "application/pdf";
        }
      });

      if (!validFiles) {
        setErrors({
          ...errors,
          imagen:
            fileType === "image"
              ? "Solo se permiten archivos de imagen (JPEG, PNG)"
              : "Solo se permiten archivos PDF",
        });
        return;
      }
      // Agregar validación de tamaño
      const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB en bytes
      const archivosGrandes = files.filter((file) => file.size > MAX_FILE_SIZE);

      if (archivosGrandes.length > 0) {
        const detallesArchivo = archivosGrandes
          .map((file) => `${file.name} (${formatFileSize(file.size)})`)
          .join(", ");

        setErrors({
          ...errors,
          imagen: `El archivo es demasiado grande: ${detallesArchivo}. Tamaño máximo permitido: 4MB.`,
        });
        return;
      }

      setSelectedFiles(e.target.files);
      setCapturedImage(null);
      setErrors({ ...errors, imagen: "" });
      setShowFileSelector(false);

      const previews: string[] = [];
      files.forEach((file) => {
        if (fileType === "image" && file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onloadend = () => {
            previews.push(reader.result as string);
            setFilePreview([...previews]);
          };
          reader.readAsDataURL(file);
        } else if (fileType === "pdf" && file.type === "application/pdf") {
          previews.push("pdf");
          setFilePreview([...previews]);
        }
      });
    } else {
      setErrors({ ...errors, imagen: "Puedes subir un máximo de 2 archivos" });
    }
  };

  const handleCapture = async (imageSrc: string) => {
    try {
      // Calcular tamaño aproximado de la imagen base64
      const base64Size = Math.ceil((imageSrc.length * 3) / 4);
      const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB en bytes

      if (base64Size > MAX_FILE_SIZE) {
        setErrors({
          ...errors,
          imagen: `La imagen capturada es demasiado grande (${formatFileSize(
            base64Size
          )}). Tamaño máximo: 4MB.`,
        });
        return;
      }

      setCapturedImage(imageSrc);
      setSelectedFiles(null);
      setFilePreview([]);
      setErrors({ ...errors, imagen: "" });
      setShowFileSelector(false);
    } catch (error) {
      console.error("Error al procesar la imagen capturada:", error);
      setErrors({
        ...errors,
        imagen: "Error al procesar la imagen. Intente nuevamente.",
      });
    }
  };

  const handleRemoveImage = () => {
    setCapturedImage(null);
    setSelectedFiles(null);
    setFilePreview([]);
    setShowFileSelector(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    if (id === "dni") {
      const numericValue = value.replace(/\D/g, "").slice(0, 18);
      setFormData({ ...formData, [id]: numericValue });
    } else {
      setFormData({ ...formData, [id]: value });
    }
    setErrors({ ...errors, [id]: "" });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
    setErrors({ ...errors, [name]: "" });
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.titular) newErrors.titular = "El titular es requerido";
    if (!formData.dni) newErrors.dni = "El DNI es requerido";
    if (!formData.banco_id) newErrors.banco_id = "Selecciona un banco";
    if (!formData.tipo_cuenta_id)
      newErrors.tipo_cuenta_id = "Selecciona un tipo de cuenta";
    if (!formData.numero_cuenta)
      newErrors.numero_cuenta = "El número de cuenta es requerido";

    // Mantener error de imagen si existe
    if (errors.imagen) {
      newErrors.imagen = errors.imagen;
    } else if (!cuentaBancariaId && !selectedFiles && !capturedImage) {
      newErrors.imagen = "El documento bancario es requerido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // const handleSubmit = async (e: FormEvent) => {
  //   e.preventDefault()

  //   if (!validateForm()) {
  //     toast.error("Por favor, complete todos los campos obligatorios correctamente")
  //     return
  //   }

  //   if (!repartoRegistroId) {
  //     toast.error("No se encontró el ID del registro")
  //     return
  //   }

  //   setIsSubmitting(true)

  //   try {
  //     const formDataToSend = new FormData()

  //     // Si es una actualización, no necesitamos enviar el ID del registro
  //     if (!cuentaBancariaId) {
  //       formDataToSend.append("reparto_registro_id", repartoRegistroId)
  //     }

  //     formDataToSend.append("titular", formData.titular)
  //     formDataToSend.append("dni", formData.dni)
  //     formDataToSend.append("banco_id", formData.banco_id)
  //     formDataToSend.append("tipo_cuenta_id", formData.tipo_cuenta_id)
  //     formDataToSend.append("numero_cuenta", formData.numero_cuenta)

  //     // Solo adjuntar imagen si se seleccionó una nueva
  //     if (selectedFiles) {
  //       Array.from(selectedFiles).forEach((file) => {
  //         formDataToSend.append("imagen_cuenta", file)
  //       })
  //     } else if (capturedImage && capturedImage.startsWith("data:")) {
  //       // Solo procesar la imagen capturada si es una nueva (base64)
  //       const response = await fetch(capturedImage)
  //       const blob = await response.blob()
  //       const file = new File([blob], "imagen_capturada.jpg", {
  //         type: "image/jpeg",
  //       })
  //       formDataToSend.append("imagen_cuenta", file)
  //     }

  //     // Determinar si es una actualización o creación
  //     const url = cuentaBancariaId
  //       ? `${process.env.NEXT_PUBLIC_API_WEB}/cuenta-bancaria/${cuentaBancariaId}`
  //       : `${process.env.NEXT_PUBLIC_API_WEB}/cuenta-bancaria`

  //     const response = await fetch(url, {
  //       method: "POST",
  //       body: formDataToSend,
  //     })

  //     const data: ApiResponse | ApiError = await response.json()

  //     if (!response.ok) {
  //       throw new Error("mensaje" in data ? data.mensaje : "Error al guardar la cuenta bancaria")
  //     }

  //     toast.success("mensaje" in data ? data.mensaje : "Cuenta bancaria guardada exitosamente")

  //     // SOLUCIÓN: Actualizar el token con el siguiente paso antes de redirigir
  //     try {
  //     // Crear un nuevo token directamente
  //     if (repartoRegistroId) {
  //       const newToken = await createRepartoToken(repartoRegistroId, "/reparto/documento-motorizado")

  //       if (newToken) {
  //         // Actualizar el paso actual en sessionStorage
  //         sessionStorage.setItem("repartoCurrentStep", "/reparto/documento-motorizado")
  //         sessionStorage.setItem("repartoRegistroId", repartoRegistroId)

  //         // Usar window.location para forzar la recarga completa
  //         window.location.href = "/reparto/documento-motorizado"
  //       } else {
  //         throw new Error("Error al crear el token")
  //       }
  //     } else {
  //       throw new Error("No se encontró ID de registro")
  //     }
  //   } catch (tokenError) {
  //     console.error("Error al crear el token:", tokenError)
  //     // En caso de error, intentar redirección directa
  //     window.location.href = "/reparto/documento-motorizado"
  //   }

  //   } catch (error) {
  //     if (error instanceof Error) {
  //       toast.error(error.message)
  //     } else {
  //       toast.error("Ocurrió un error al guardar la cuenta bancaria. Por favor, intente nuevamente.")
  //     }
  //     console.error("Error al guardar cuenta bancaria:", error)
  //   } finally {
  //     setIsSubmitting(false)
  //   }
  // }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error(
        "Por favor, complete todos los campos obligatorios correctamente"
      );
      return;
    }

    if (!repartoRegistroId) {
      toast.error("No se encontró el ID del registro");
      return;
    }

    setIsSubmitting(true);

    try {
      // Preparar datos para almacenamiento local
      const datosBancarios = {
        titular: formData.titular,
        dni: formData.dni,
        banco_id: formData.banco_id,
        tipo_cuenta_id: formData.tipo_cuenta_id,
        numero_cuenta: formData.numero_cuenta,
        imagen_cuenta: selectedFiles
          ? await convertFilesToBase64(selectedFiles)
          : capturedImage,
      };

      // Guardar en el servicio
      FormDataService.guardarCuentaBancaria(datosBancarios);

     // Obtener el tipo de vehículo de los datos básicos
    const datosBasicos = FormDataService.obtenerDatosBasicos();
    const vehiculo = datosBasicos?.vehiculo;

    // Si es bicicleta o moto eléctrica, saltar documento-motorizado
    if (vehiculo === "BICICLETA" || vehiculo === "MOTO ELECTRICA") {
      sessionStorage.setItem("repartoCurrentStep", "/reparto/registro-exitoso");
      router.push("/reparto/registro-exitoso");
    } else {
      sessionStorage.setItem("repartoCurrentStep", "/reparto/documento-motorizado");
      router.push("/reparto/documento-motorizado");
    }
      // // Actualizar el paso actual
      // sessionStorage.setItem(
      //   "repartoCurrentStep",
      //   "/reparto/documento-motorizado"
      // );

      // Redireccionar al siguiente paso
      // router.push("/reparto/documento-motorizado");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error(
          "Ocurrió un error al procesar los datos bancarios. Por favor, intente nuevamente."
        );
      }
      console.error("Error al procesar datos bancarios:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Función auxiliar para convertir archivos a base64
  const convertFilesToBase64 = async (
    files: FileList
  ): Promise<string | null> => {
    if (files.length === 0) return null;

    const file = files[0];
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  if (!repartoRegistroId) return null;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-red-500" />
          <p className="mt-4 text-gray-600">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Contenido del formulario con scroll */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-8 max-w-xl mx-auto space-y-6 md:space-y-8">
          <div className="hidden md:block">
            <h1 className="text-xl md:text-2xl font-bold">
              Imagen cuenta bancaria
            </h1>
            <p className="text-sm md:text-base text-gray-500 mt-2">
              Necesitamos verificar tu información.
            </p>
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
              {errors.titular && (
                <p className="text-red-500 text-xs mt-1">{errors.titular}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dni" className="text-sm md:text-base">
                {obtenerLabelDocumento(tipoDocumentoOriginal)} *
              </Label>
              <Input
                id="dni"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={formData.dni}
                onChange={handleInputChange}
                placeholder={obtenerPlaceholderDocumento(tipoDocumentoOriginal)}
                className="text-sm md:text-base"
                required
                maxLength={obtenerMaxLengthDocumento(tipoDocumentoOriginal)}
              />
              {errors.dni && (
                <p className="text-red-500 text-xs mt-1">{errors.dni}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="banco_id" className="text-sm md:text-base">
                Nombre del banco *
              </Label>
              <Select
                value={formData.banco_id}
                onValueChange={(value) => handleSelectChange("banco_id", value)}
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
              {errors.banco_id && (
                <p className="text-red-500 text-xs mt-1">{errors.banco_id}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo_cuenta_id" className="text-sm md:text-base">
                Tipo de Cuenta Bancaria *
              </Label>
              <Select
                value={formData.tipo_cuenta_id}
                onValueChange={(value) =>
                  handleSelectChange("tipo_cuenta_id", value)
                }
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
              {errors.tipo_cuenta_id && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.tipo_cuenta_id}
                </p>
              )}
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
              {errors.numero_cuenta && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.numero_cuenta}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm md:text-base">
                Documento bancario {!cuentaBancariaId && "*"}
              </Label>

              {/* Selector de tipo de archivo */}
              <div className="flex gap-2 mb-4">
                <Button
                  type="button"
                  variant={fileType === "image" ? "default" : "outline"}
                  onClick={() => {
                    setFileType("image");
                    setSelectedFiles(null);
                    setFilePreview([]);
                    setCapturedImage(null);
                    setShowFileSelector(true);
                  }}
                  className={`flex items-center gap-2 text-xs md:text-sm px-3 py-2 h-8 md:h-9 ${
                    fileType === "image" ? "bg-[#f34739] hover:bg-[#d63c30]" : ""
                  }`}
                >
                  <ImageIcon className="w-3 h-3 md:w-4 md:h-4" />
                  Imagen
                </Button>
                <Button
                  type="button"
                  variant={fileType === "pdf" ? "default" : "outline"}
                  onClick={() => {
                    setFileType("pdf");
                    setSelectedFiles(null);
                    setFilePreview([]);
                    setCapturedImage(null);
                    setShowFileSelector(true);
                  }}
                  className={`flex items-center gap-2 text-xs md:text-sm px-3 py-2 h-8 md:h-9 ${
                    fileType === "pdf" ? "bg-[#f34739] hover:bg-[#d63c30]" : ""
                  }`}
                >
                  <FileText className="w-3 h-3 md:w-4 md:h-4" />
                  PDF
                </Button>
              </div>

              <div className="border-2 border-dashed rounded-lg p-3 md:p-4 text-center space-y-3 md:space-y-4">
                {/* Mostrar selector de archivos solo si no hay archivos seleccionados */}
                {showFileSelector && (
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-xs md:text-sm text-gray-500">
                      {fileType === "image"
                        ? "Adjuntar en formato JPEG o PNG"
                        : "Adjuntar en formato PDF"}
                    </p>

                    <Input
                      type="file"
                      onChange={handleFileSelect}
                      accept={
                        fileType === "image"
                          ? ".jpg,.jpeg,.png,image/jpeg,image/png"
                          : "application/pdf"
                      }
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
                  </div>
                )}

                {/* Mostrar opción de cámara solo si está en modo imagen y no hay archivos seleccionados */}
                {isMobile && fileType === "image" && showFileSelector && (
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-xs md:text-sm text-gray-500">
                      O captura una imagen con tu cámara
                    </p>
                    <CapturarImagen onCapture={handleCapture} />
                  </div>
                )}

                {/* Vista previa de archivos PDF */}
                {filePreview.length > 0 &&
                  fileType === "pdf" &&
                  selectedFiles && (
                    <div className="mt-3 md:mt-4">
                      {filePreview.map((preview, index) => {
                        if (preview === "pdf") {
                          const file = Array.from(selectedFiles)[index];
                          return (
                            <PdfPreview
                              key={index}
                              file={file}
                              onDelete={() => {
                                const updatedFiles = Array.from(
                                  selectedFiles
                                ).filter((_, i) => i !== index);
                                const newFileList = new DataTransfer();
                                updatedFiles.forEach((file) =>
                                  newFileList.items.add(file)
                                );
                                setSelectedFiles(
                                  updatedFiles.length > 0
                                    ? newFileList.files
                                    : null
                                );
                                setFilePreview(
                                  filePreview.filter((_, i) => i !== index)
                                );
                                if (updatedFiles.length === 0) {
                                  setShowFileSelector(true);
                                }
                              }}
                            />
                          );
                        }
                        return null;
                      })}
                    </div>
                  )}

                {/* Vista previa de imágenes */}
                {filePreview.length > 0 && fileType === "image" && (
                  <div className="mt-3 md:mt-4">
                    {filePreview.map((preview, index) => (
                      <ImagePreview
                        key={index}
                        src={preview || "/placeholder.svg"}
                        alt={`Vista previa ${index + 1}`}
                        onDelete={() => {
                          if (selectedFiles) {
                            const updatedFiles = Array.from(selectedFiles).filter(
                              (_, i) => i !== index
                            );
                            const newFileList = new DataTransfer();
                            updatedFiles.forEach((file) =>
                              newFileList.items.add(file)
                            );
                            setSelectedFiles(
                              updatedFiles.length > 0 ? newFileList.files : null
                            );
                            setFilePreview(
                              filePreview.filter((_, i) => i !== index)
                            );
                            if (updatedFiles.length === 0) {
                              setShowFileSelector(true);
                            }
                          }
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* Vista previa de imagen capturada */}
                {capturedImage && (
                  <div className="mt-3 md:mt-4">
                    <ImagePreview
                      src={capturedImage || "/placeholder.svg"}
                      alt="Imagen capturada"
                      onDelete={handleRemoveImage}
                    />
                  </div>
                )}
              </div>
              {errors.imagen && (
                <p className="text-red-500 text-xs mt-1">{errors.imagen}</p>
              )}
            </div>

            <div className="bg-blue-50 p-3 md:p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <Info className="h-4 w-4 md:h-5 md:w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 md:h-4 md:w-4 text-blue-600 flex-shrink-0" />
                    <p className="text-xs md:text-sm text-blue-800 font-medium">
                      El justificante bancario debe incluir los cinco datos
                      anteriores
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 md:h-4 md:w-4 text-blue-600 flex-shrink-0" />
                    <p className="text-xs md:text-sm text-blue-800">
                      Puede cargar varias imágenes si los datos están en pantallas
                      separadas
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 md:h-4 md:w-4 text-blue-600 flex-shrink-0" />
                    <p className="text-xs md:text-sm text-blue-800">
                      Asegúrese que la información sea claramente legible
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Botón fijo en la parte inferior */}
      <div className="border-t bg-white p-4 md:p-6">
        <div className="max-w-xl mx-auto">
          <Button
            onClick={handleSubmit}
            className="w-full bg-[#f34739] text-white hover:bg-[#d63c30] h-10 md:h-11 text-sm md:text-base"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              "Enviar"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}