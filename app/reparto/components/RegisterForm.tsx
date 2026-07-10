// app\reparto\components\RegisterForm.tsx este es el registro principal
"use client";

import * as React from "react";
import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { WebcamModal } from "./WebcamModal";
import { useMediaQuery } from "../hooks/use-media-query";
import { VisualCaptcha } from "./VisualCapcha";
import { ValidationAlert } from "@/components/ValidationAlert";
import { StorageWarning } from "./StorageWarning";
import type {
  FormData,
  DocumentInfo,
  DocumentoAdicional,
} from "../types/form-types";
import { StepOne } from "./form-steps/StepOne";
import { StepTwo } from "./form-steps/StepTwo";
import { StepThree } from "./form-steps/StepThree";
import { StepFour } from "./form-steps/StepFour";
import { fetchDocumentInfo } from "@/utils/api";
import { EstadoVerificacion } from "./EstadoVerificacion";
import { IndicadorPasos } from "./IndicadorPasos";
import { EmailChangeDialog } from "./EmailChangeDialog";
// import { createRepartoToken } from "@/services/repartoTokenService";
import { FormDataServiceV2 } from "@/services/formDataServiceV2";
const formVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.3 } },
};

export default function RegisterForm() {
  const [step, setStep] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = React.useState(false);
  const [showCaptcha, setShowCaptcha] = React.useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = React.useState<FormData>({
    departamento: "",
    vehiculo: "",
    tipoDocumento: "",
    nroDocumento: "",
    nombres: "",
    apellidos: "",
    celular: "",
    email: "",
    mayorEdad: "",
    aceptaPolitica: false,
    documentoImagenFrente: null,
    documentoImagenReverso: null,
    documentosAdicionales: [],
  });
  const [isCameraOpenFrente, setIsCameraOpenFrente] = React.useState(false);
  const [isCameraOpenReverso, setIsCameraOpenReverso] = React.useState(false);
  const [previewImageFrente, setPreviewImageFrente] = React.useState<
    string | null
  >(null);
  const [previewImageReverso, setPreviewImageReverso] = React.useState<
    string | null
  >(null);
  const [validationError, setValidationError] = React.useState<string | null>(
    null
  );
  const fileInputRefAdicional = React.useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = React.useState(false);

  const fileInputRefFrente = React.useRef<HTMLInputElement>(null);
  const fileInputRefReverso = React.useRef<HTMLInputElement>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Estado para el diálogo de correo electrónico
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [originalEmail, ] = useState(""); //setOriginalEmail

  // Verificar si hay un registro existente al cargar el componente
  useEffect(() => {
    const checkExistingRegistration = async () => {
      const document = searchParams.get("document");
      const email = searchParams.get("email");

      if (document || email) {
        setIsCheckingStatus(true);
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_WEB}/reparto/check-status`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                nroDocumento: document,
                email: email,
              }),
            }
          );

          if (!response.ok) {
            throw new Error("Error al verificar el estado del registro");
          }

          const data = await response.json();

          if (data.status === "incomplete" && data.registration_id) {
            router.push(
              `/reparto/status?registration_id=${data.registration_id}`
            );
            return;
          }
        } catch (error) {
          console.error("Error al verificar registro existente:", error);
        } finally {
          setIsCheckingStatus(false);
        }
      }
    };

    checkExistingRegistration();
  }, [router, searchParams]);

  const updateFormData = (
    field: keyof FormData,
    value: FormData[keyof FormData]
  ): void => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNextStep = (): void => {
    if (step < 4) {
      setStep(step + 1);
      // Scroll al inicio del formulario cuando cambia de paso
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (isStepComplete()) {
      // setShowCaptcha(true);
      handleSubmit();
    }
  };

  const handleCaptchaClose = useCallback(() => {
    setShowCaptcha(false);
  }, []);

  const handleBack = (): void => {
    if (step > 1) {
      setStep(step - 1);
      // Scroll al inicio del formulario cuando vuelve atrás
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  const handleDocumentoAdicionalUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ✅ VALIDAR TIPO DE ARCHIVO
    if (file.type !== "application/pdf") {
      toast({
        title: "Formato no válido",
        description: "Solo se permiten archivos PDF",
        variant: "destructive",
      });
      return;
    }

    // Limit PDF to 1MB so base64 payload stays under Nginx's client_max_body_size
    const maxSize = 1 * 1024 * 1024; // 1MB
    if (file.size > maxSize) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      toast({
        title: "Archivo muy pesado",
        description: `El PDF pesa ${sizeMB}MB. El tamaño máximo es 1MB. Por favor, comprime el PDF antes de subirlo.`,
        variant: "destructive",
      });
      return;
    }

    const categoria =
      fileInputRefAdicional.current?.getAttribute("data-categoria") || "otros";

    setIsUploading(true);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === "string") {
            resolve(reader.result);
          } else {
            reject(new Error("Failed to read file as base64"));
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // ✅ VERIFICAR TAMAÑO FINAL EN BASE64
      const finalSize = Math.round((base64.length * 3) / 4);
      const finalSizeKB = (finalSize / 1024).toFixed(0);

      const nuevoDocumento: DocumentoAdicional = {
        nombre: file.name,
        archivo: base64,
        tipo: file.type,
        categoria: categoria,
      };
      
      // Eliminar documento anterior de la misma categoría si existe
      const documentosActualizados = formData.documentosAdicionales.filter(
        (doc) => doc.categoria !== categoria
      );
      updateFormData("documentosAdicionales", [
        ...documentosActualizados,
        nuevoDocumento,
      ]);

      toast({
        title: "Documento agregado",
        description: `PDF cargado correctamente (${finalSizeKB}KB)`,
      });
    } catch (error) {
      console.error("Error al procesar documento adicional:", error);
      toast({
        title: "Error",
        description: "No se pudo procesar el documento. Intenta con otro archivo.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRefAdicional.current) {
        fileInputRefAdicional.current.value = "";
      }
    }
  };
  // const handleSubmit = useCallback(async (): Promise<void> => {
  //   setIsLoading(true)
  //   setValidationError(null) // Clear any previous errors
  //   try {
  //     const documentosAdicionales = formData.documentosAdicionales.map(doc => ({
  //     nombre: doc.nombre,
  //     archivo: doc.archivo.split(",")[1], // Eliminar el prefijo "data:application/pdf;base64,"
  //     tipo: doc.tipo,
  //     categoria : doc.categoria
  //   }))
  //     const requestData = {
  //       departamento: formData.departamento,
  //       vehiculo: formData.vehiculo,
  //       tipo_documento: formData.tipoDocumento,
  //       nro_documento: formData.nroDocumento,
  //       nombres: formData.nombres,
  //       apellidos: formData.apellidos,
  //       celular: formData.celular,
  //       email: formData.email,
  //       mayor_edad: formData.mayorEdad === "si",
  //       acepta_politica: formData.aceptaPolitica,
  //       documento_imagen_frente: formData.documentoImagenFrente?.split(",")[1] || null,
  //       documento_imagen_reverso: formData.documentoImagenReverso?.split(",")[1] || null,
  //     documentos_adicionales: documentosAdicionales.length > 0 ? documentosAdicionales : undefined
  //   }

  //     console.log("Enviando datos de registro:", requestData)

  //     const response = await fetch(`${process.env.NEXT_PUBLIC_API_WEB}/reparto/registro`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(requestData),
  //     })

  //     const data = await response.json()
  //     console.log("Respuesta del servidor:", data)

  //     if (!response.ok) {
  //       // Verificar si es un error de correo diferente
  //       if (response.status === 422 && data.error === "different_email" && data.original_email) {
  //         setOriginalEmail(data.original_email)
  //         setShowEmailDialog(true)
  //         setIsLoading(false)
  //         return
  //       }

  //       // Otros errores de validación
  //       if (response.status === 422 && data.errors?.duplicate) {
  //         setValidationError(data.errors.duplicate[0])
  //         setIsLoading(false)
  //         return
  //       }

  //       throw new Error(data?.message || `Error ${response.status}: ${response.statusText}`)
  //     }

  //     // Si es un registro incompleto, redirigir a la página de estado
  //     if (data.status === "incomplete" && data.registration_id) {
  //       router.push(`/reparto/status?registration_id=${data.registration_id}`)
  //       return
  //     }

  //     // Si es un registro nuevo exitoso
  //     if (data.data && data.data.id) {
  //       // Verificar si es un registro nuevo
  //       if (data.status === "new_registration") {
  //         console.log("Registro nuevo, redirigiendo directamente a zonas")

  //         // Crear token para la sesión
  //         try {
  //           await createRepartoToken(data.data.id, "/reparto/zonas")
  //           router.push("/reparto/zonas")
  //           return
  //         } catch (tokenError) {
  //           console.error("Error al crear token:", tokenError)
  //           // Si hay error al crear el token, continuar con el flujo normal
  //         }
  //       }

  //       // Si no es un registro nuevo o hubo error al crear el token, ir a la página de estado
  //       router.push(`/reparto/status?registration_id=${data.data.id}`)
  //       return
  //     }

  //     // Si llegamos aquí, algo salió mal con la estructura de la respuesta
  //     console.error("Estructura de respuesta inesperada:", data)
  //     throw new Error("La respuesta del servidor no tiene el formato esperado")
  //   } catch (error) {
  //     console.error("Detalles del error:", error)
  //     toast({
  //       title: "Error",
  //       description:
  //         error instanceof Error
  //           ? error.message
  //           : "Hubo un problema al enviar el formulario. Por favor, intenta de nuevo.",
  //       variant: "destructive",
  //     })
  //   } finally {
  //     setIsLoading(false)
  //   }
  // }, [formData, router, toast])

  // Funciones para manejar los botones del diálogo
// Función mejorada de validación del formulario
// Función mejorada de validación del formulario
const validarFormulario = useCallback((formData: FormData) => {
  const errores: string[] = []

  if (!formData.departamento) errores.push("Departamento es requerido")
  if (!formData.vehiculo) errores.push("Vehículo es requerido")
  if (!formData.tipoDocumento) errores.push("Tipo de documento es requerido")
  if (!formData.nroDocumento) errores.push("Número de documento es requerido")
  if (!formData.nombres) errores.push("Nombres son requeridos")
  if (!formData.celular) errores.push("Celular es requerido")
  if (!formData.email) errores.push("Email es requerido")
  if (!formData.mayorEdad) errores.push("Confirmación de mayoría de edad es requerida")
  if (!formData.aceptaPolitica) errores.push("Debe aceptar la política de privacidad")

  // Validaciones específicas para móviles
  if (isMobile) {
    // Validar formato de email en móviles
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (formData.email && !emailRegex.test(formData.email)) {
      errores.push("El formato del email no es válido")
    }

    // Validar longitud del celular
    if (formData.celular && formData.celular.length < 9) {
      errores.push("El número de celular debe tener al menos 9 dígitos")
    }

    // Validar documento según tipo
    if (formData.tipoDocumento === "DNI" && formData.nroDocumento.length !== 8) {
      errores.push("El DNI debe tener 8 dígitos")
    }
    if (formData.tipoDocumento === "RUC" && formData.nroDocumento.length !== 11) {
      errores.push("El RUC debe tener 11 dígitos")
    }
  }

  if (errores.length > 0) {
    setValidationError(errores[0]) // Mostrar el primer error
    return false
  }

  return true
}, [isMobile, setValidationError])
// Usar useCallback para handleSaveAndRedirect
const handleSaveAndRedirect = useCallback(async (): Promise<void> => {
  try {
    // ✅ PREPARAR DATOS BÁSICOS
    const datosBasicos = {
      departamento: formData.departamento,
      vehiculo: formData.vehiculo,
      tipo_documento: formData.tipoDocumento,
      nro_documento: formData.nroDocumento,
      nombres: formData.nombres,
      apellidos: formData.apellidos,
      celular: formData.celular,
      email: formData.email,
      mayor_edad: formData.mayorEdad,
      aceptaPolitica: formData.aceptaPolitica,
      documentoImagenFrente: formData.documentoImagenFrente,
      documentoImagenReverso: formData.documentoImagenReverso,
      documentosAdicionales: formData.documentosAdicionales,
    };

    // ✅ GUARDAR CON INDEXEDDB (async)
    await FormDataServiceV2.guardarDatosBasicos(datosBasicos);
    
    console.log("✅ Datos guardados exitosamente en IndexedDB");

    // Generar un ID temporal para identificar el registro
    const registroId = "temp_" + Date.now().toString();
    sessionStorage.setItem("repartoRegistroId", registroId);
    sessionStorage.setItem("repartoCurrentStep", "/reparto/zonas");

    // Redireccionar al siguiente paso
    router.push("/reparto/zonas");
  } catch (error) {
    console.error("Error al guardar y redireccionar:", error);
    
    let errorMessage = "Hubo un problema al procesar el formulario.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    toast({
      title: "Error",
      description: errorMessage,
      variant: "destructive",
    });
  }
}, [formData, router, toast]);

const handleSubmit = useCallback(async (): Promise<void> => {
  setIsLoading(true)
  setValidationError(null)

  try {
    // Validación mejorada
    if (!validarFormulario(formData)) {
      setIsLoading(false)
      return
    }

    // Si estamos en el paso 4, hacer validación previa del documento y correo
    if (step === 4) {
      console.log("Validando documento y correo...")

      // Timeout más largo para móviles
      const timeoutDuration = isMobile ? 10000 : 5000

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeoutDuration)

      try {
        const validationResponse = await fetch(`${process.env.NEXT_PUBLIC_API_WEB}/reparto/validate-document-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nro_documento: formData.nroDocumento,
            email: formData.email,
          }),
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        const validationData = await validationResponse.json()
        console.log("Respuesta de validación:", validationData)

        if (!validationResponse.ok) {
          if (validationData.errors) {
            const errorMessages = Object.values(validationData.errors).flat()
            setValidationError(errorMessages[0] as string)
          } else {
            setValidationError("Error en la validación. Por favor, intenta nuevamente.")
          }
          setIsLoading(false)
          return
        }

        // Si la validación es exitosa, mostrar captcha
        setShowCaptcha(true)
        setIsLoading(false)
        return
      } catch (fetchError) {
        clearTimeout(timeoutId)
        // On network error, proceed anyway — the backend will catch duplicates on final submit
        console.warn("validate-document-email falló, continuando sin validación previa:", fetchError)
        setShowCaptcha(true)
        setIsLoading(false)
        return
      }
    }

    // Para los pasos 1-3, continuar con el flujo normal
    handleSaveAndRedirect()
  } catch (error) {
    console.error("Detalles del error:", error)

    let errorMessage = "Hubo un problema al procesar el formulario. Por favor, intenta de nuevo."

    if (error instanceof Error) {
      if (error.message.includes("fetch")) {
        errorMessage = "Error de conexión. Por favor, verifica tu internet e intenta nuevamente."
      } else {
        errorMessage = error.message
      }
    }

    toast({
      title: "Error",
      description: errorMessage,
      variant: "destructive",
    })
  } finally {
    setIsLoading(false)
  }
}, [formData, toast, step, handleSaveAndRedirect, isMobile, validarFormulario])





  const handleUseOriginalEmail = async () => {
    setShowEmailDialog(false);
    setIsLoading(true);

    try {
      // Actualizar el formulario con el correo original
      updateFormData("email", originalEmail);

      // Esperar un momento para que se actualice el estado
      setTimeout(async () => {
        // Volver a intentar el envío con el correo original
        const requestData = {
          departamento: formData.departamento,
          vehiculo: formData.vehiculo,
          tipo_documento: formData.tipoDocumento,
          nro_documento: formData.nroDocumento,
          nombres: formData.nombres,
          apellidos: formData.apellidos,
          celular: formData.celular,
          email: originalEmail, // Usar el correo original directamente
          mayor_edad: formData.mayorEdad === "si",
          acepta_politica: formData.aceptaPolitica,
          documento_imagen_frente:
            formData.documentoImagenFrente?.split(",")[1] || null,
          documento_imagen_reverso:
            formData.documentoImagenReverso?.split(",")[1] || null,
        };

        console.log("Enviando datos con correo original:", requestData);

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_WEB}/reparto/registro`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestData),
          }
        );

        const data = await response.json();
        console.log("Respuesta del servidor (correo original):", data);

        if (!response.ok) {
          throw new Error(
            data?.message || `Error ${response.status}: ${response.statusText}`
          );
        }

        // Redirigir a la página de estado
        if (data.registration_id || (data.data && data.data.id)) {
          const registrationId = data.registration_id || data.data.id;
          router.push(`/reparto/status?registration_id=${registrationId}`);
        } else {
          throw new Error("No se recibió ID de registro en la respuesta");
        }
      }, 100);
    } catch (error) {
      console.error("Error al usar el correo original:", error);
      toast({
        title: "Error",
        description:
          "Hubo un problema al procesar tu solicitud. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleUseNewEmail = async () => {
    setShowEmailDialog(false);
    setIsLoading(true);

    try {
      // Buscar el registro existente por correo
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_WEB}/reparto/check-status`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: originalEmail,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Error al verificar el registro existente");
      }

      const data = await response.json();
      console.log("Datos del registro existente:", data);

      if (data.status === "incomplete" && data.registration_id) {
        // Actualizar el correo en el registro existente
        const updateResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_WEB}/reparto/${data.registration_id}/update-email`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: formData.email,
            }),
          }
        );

        const updateData = await updateResponse.json();
        console.log("Respuesta de actualización de correo:", updateData);

        if (!updateResponse.ok) {
          if (updateData.error === "email_registered") {
            setValidationError(
              "Este correo electrónico ya está registrado como repartidor."
            );
            setIsLoading(false);
            return;
          }
          throw new Error("Error al actualizar el correo electrónico");
        }

        // Redirigir a la página de estado
        router.push(`/reparto/status?registration_id=${data.registration_id}`);
      } else {
        // Si no hay un registro incompleto, continuar con el registro normal
        handleSubmit();
      }
    } catch (error) {
      console.error("Error al usar el nuevo correo:", error);
      toast({
        title: "Error",
        description:
          "Hubo un problema al procesar tu solicitud. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

const handleCaptchaVerify = useCallback(
  (success: boolean) => {
    if (success) {
      setShowCaptcha(false);
      // Llamar directamente a la función de guardado
      handleSaveAndRedirect();
    } else {
      toast({
        title: "Error de verificación",
        description: "Por favor, intenta la verificación nuevamente.",
        variant: "destructive",
      });
      setShowCaptcha(false);
    }
  },
  [handleSaveAndRedirect, toast] // Solo incluir las dependencias necesarias
);

  const handleDocumentChange = async (value: string): Promise<void> => {
    const numbersOnly = value.replace(/\D/g, "");
    updateFormData("nroDocumento", numbersOnly);

    if (
      (formData.tipoDocumento === "DNI" && numbersOnly.length === 8) ||
      (formData.tipoDocumento === "RUC" && numbersOnly.length === 11)
    ) {
      setIsLoading(true);
      try {
        const data = (await fetchDocumentInfo(
          formData.tipoDocumento.toLowerCase() as "dni" | "ruc",
          numbersOnly
        )) as DocumentInfo;

        if ("nombres" in data) {
          updateFormData("nombres", data.nombres || "");
          updateFormData(
            "apellidos",
            `${data.apellidoPaterno || ""} ${data.apellidoMaterno || ""}`.trim()
          );
        } else if ("razonSocial" in data) {
          updateFormData("nombres", data.razonSocial || "");
          updateFormData("apellidos", "");
        }
      } catch (error) {
        toast({
          title: "Error",
          description:
            error instanceof Error
              ? error.message
              : "Error al consultar el documento",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    side: "frente" | "reverso"
  ): Promise<void> => {
    const file = event.target.files?.[0];
    if (!file) return;

    // ✅ VALIDAR TIPO DE ARCHIVO
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Formato no válido",
        description: "Solo se permiten imágenes JPG, JPEG o PNG",
        variant: "destructive",
      });
      return;
    }

    // ✅ VALIDAR TAMAÑO MÁXIMO (10MB con IndexedDB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      toast({
        title: "Archivo muy pesado",
        description: `La imagen pesa ${sizeMB}MB. El tamaño máximo es 10MB. Por favor, usa una imagen más pequeña.`,
        variant: "destructive",
      });
      return;
    }

    try {
      // ✅ COMPRIMIR IMAGEN ANTES DE GUARDAR
      const compressedBase64 = await compressImage(file);
      
      // ✅ VERIFICAR TAMAÑO FINAL (2MB después de comprimir con IndexedDB)
      const finalSize = Math.round((compressedBase64.length * 3) / 4);
      if (finalSize > 2 * 1024 * 1024) { // 2MB después de comprimir
        toast({
          title: "Imagen aún muy pesada",
          description: "Incluso después de comprimir, la imagen es muy grande. Intenta con una foto de menor resolución.",
          variant: "destructive",
        });
        return;
      }

      if (side === "frente") {
        setPreviewImageFrente(compressedBase64);
        updateFormData("documentoImagenFrente", compressedBase64);
      } else {
        setPreviewImageReverso(compressedBase64);
        updateFormData("documentoImagenReverso", compressedBase64);
      }

      toast({
        title: "Imagen cargada",
        description: `Tamaño: ${(finalSize / 1024).toFixed(0)}KB`,
      });
    } catch (error) {
      console.error("Error al procesar la imagen:", error);
      toast({
        title: "Error",
        description: "No se pudo procesar la imagen. Intenta con otra foto.",
        variant: "destructive",
      });
    }
  };

  // ✅ FUNCIÓN DE COMPRESIÓN DE IMÁGENES
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          
          // ✅ REDUCIR TAMAÑO MÁXIMO
          const maxWidth = 800;
          const maxHeight = 600;
          let { width, height } = img;
          
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width *= ratio;
            height *= ratio;
          }
          
          canvas.width = width;
          canvas.height = height;
          ctx?.drawImage(img, 0, 0, width, height);
          
          // ✅ COMPRIMIR A 60% DE CALIDAD
          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.6);
          resolve(compressedBase64);
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleCameraCapture = async (
    imageData: { imageSrc: string; text: string },
    side: "frente" | "reverso"
  ): Promise<void> => {
    try {
      // ✅ COMPRIMIR IMAGEN CAPTURADA
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        
        const maxWidth = 800;
        const maxHeight = 600;
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);
        
        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.6);
        
        // ✅ VERIFICAR TAMAÑO (2MB después de comprimir con IndexedDB)
        const finalSize = Math.round((compressedBase64.length * 3) / 4);
        if (finalSize > 2 * 1024 * 1024) {
          toast({
            title: "Imagen muy pesada",
            description: "La foto capturada es muy grande. Intenta desde más lejos o con menos luz.",
            variant: "destructive",
          });
          return;
        }
        
        if (side === "frente") {
          setPreviewImageFrente(compressedBase64);
          updateFormData("documentoImagenFrente", compressedBase64);
        } else {
          setPreviewImageReverso(compressedBase64);
          updateFormData("documentoImagenReverso", compressedBase64);
        }
        
        console.log(`OCR Text (${side}):`, imageData.text);
      };
      img.src = imageData.imageSrc;
    } catch (error) {
      console.error("Error al comprimir imagen capturada:", error);
      toast({
        title: "Error",
        description: "No se pudo procesar la imagen capturada",
        variant: "destructive",
      });
    }
  };

  const isStepComplete = (): boolean => {
    switch (step) {
      case 1:
        return !!formData.departamento;
      case 2:
        return !!formData.vehiculo;
      case 3:
        return (
          formData.tipoDocumento !== "" &&
          formData.nroDocumento !== "" &&
          formData.nombres !== "" &&
          (formData.tipoDocumento === "RUC" || formData.apellidos !== "") &&
          (formData.tipoDocumento === "RUC" ||
            (formData.documentoImagenFrente !== null &&
              formData.documentoImagenReverso !== null))
        );
      case 4:
        return (
          formData.celular !== "" &&
          formData.email !== "" &&
          formData.mayorEdad !== "" &&
          formData.aceptaPolitica
        );
      default:
        return false;
    }
  };

  if (isCheckingStatus) {
    return <EstadoVerificacion />;
  }

  return (
    <div className="w-full">
      <div className="w-full bg-white rounded-2xl shadow-lg p-6 md:max-h-[80vh] md:overflow-y-auto">
        {step > 1 && (
          <button
            onClick={handleBack}
            className="mb-4 text-gray-500 hover:text-gray-700 flex items-center gap-2"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Volver</span>
          </button>
        )}

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Crea tu perfil</h2>
          <p className="text-gray-500 mt-1">
            Es rápido y sencillo. ¡Comencemos!
          </p>
        </div>

        {/* ✅ ADVERTENCIA DE ALMACENAMIENTO */}
        <StorageWarning />

        <IndicadorPasos pasoActual={step} />

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            variants={formVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-4"
          >
            {step === 1 && (
              <StepOne
                departamento={formData.departamento}
                onDepartamentoChange={(value) =>
                  updateFormData("departamento", value)
                }
              />
            )}

            {step === 2 && (
              <StepTwo
                vehiculo={formData.vehiculo}
                onVehiculoChange={(value) => updateFormData("vehiculo", value)}
              />
            )}

            {step === 3 && (
              <StepThree
                formData={formData}
                updateFormData={updateFormData}
                isLoading={isLoading}
                handleDocumentChange={handleDocumentChange}
                handleFileUpload={handleFileUpload}
                handleDocumentoAdicionalUpload={handleDocumentoAdicionalUpload}
                previewImageFrente={previewImageFrente}
                previewImageReverso={previewImageReverso}
                fileInputRefFrente={fileInputRefFrente}
                fileInputRefReverso={fileInputRefReverso}
                fileInputRefAdicional={fileInputRefAdicional}
                isMobile={isMobile}
                setIsCameraOpenFrente={setIsCameraOpenFrente}
                setIsCameraOpenReverso={setIsCameraOpenReverso}
                isUploading={isUploading}
              />
            )}

            {step === 4 && (
              <StepFour formData={formData} updateFormData={updateFormData} />
            )}
          </motion.div>
        </AnimatePresence>

        {validationError && (
          <ValidationAlert
            message={validationError}
            onClose={() => setValidationError(null)}
          />
        )}

        <Button
          onClick={handleNextStep}
          disabled={!isStepComplete() || isLoading}
          className="w-full mt-6 bg-red-500 hover:bg-red-600 text-white"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              {step === 4 ? "Continuar" : "Siguiente"}
              <ChevronRight className="ml-2" />
            </>
          )}
        </Button>
      </div>

      <WebcamModal
        isOpen={isCameraOpenFrente}
        onClose={() => setIsCameraOpenFrente(false)}
        onCapture={(imageData) => handleCameraCapture(imageData, "frente")}
        title="Capturar frente del DNI"
      />
      <WebcamModal
        isOpen={isCameraOpenReverso}
        onClose={() => setIsCameraOpenReverso(false)}
        onCapture={(imageData) => handleCameraCapture(imageData, "reverso")}
        title="Capturar reverso del DNI"
      />
      <VisualCaptcha
        isOpen={showCaptcha}
        onVerify={handleCaptchaVerify}
        onClose={handleCaptchaClose}
      />
      <EmailChangeDialog
        isOpen={showEmailDialog}
        onClose={() => setShowEmailDialog(false)}
        onUseOriginal={handleUseOriginalEmail}
        onUseNew={handleUseNewEmail}
        originalEmail={originalEmail}
      />
    </div>
  );
}
