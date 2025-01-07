"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ArrowLeft, Loader2, Camera, Upload } from 'lucide-react';
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { fetchDocumentInfo } from "@/utils/api";
import { useToast } from "@/hooks/use-toast";
import { WebcamModal } from "./WebcamModal";
import { useMediaQuery } from "../hooks/use-media-query";
import { VisualCaptcha } from "./VisualCapcha";

interface FormData {
  departamento: string;
  vehiculo: string;
  tipoDocumento: string;
  nroDocumento: string;
  nombres: string;
  apellidos: string;
  celular: string;
  email: string;
  mayorEdad: string;
  aceptaPolitica: boolean;
  documentoImagenFrente: string | null;
  documentoImagenReverso: string | null;
}

interface DocumentInfo {
  nombres?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  razonSocial?: string;
}

interface ApiResponse {
  message: string;
  data: {
    id: number;
  };
}

const formVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.3 } },
};

export default function RegisterForm() {
  const [step, setStep] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(false);
  const [showCaptcha, setShowCaptcha] = React.useState(false);
  const { toast } = useToast();
  const router = useRouter();
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
  });
  const [isCameraOpenFrente, setIsCameraOpenFrente] = React.useState(false);
  const [isCameraOpenReverso, setIsCameraOpenReverso] = React.useState(false);
  const [previewImageFrente, setPreviewImageFrente] = React.useState<string | null>(null);
  const [previewImageReverso, setPreviewImageReverso] = React.useState<string | null>(null);

  const fileInputRefFrente = React.useRef<HTMLInputElement>(null);
  const fileInputRefReverso = React.useRef<HTMLInputElement>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const updateFormData = (
    field: keyof FormData,
    value: FormData[keyof FormData]
  ): void => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = (): void => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      setShowCaptcha(true);
    }
  };

  const handleBack = (): void => {
    if (step > 1) setStep(step - 1);
  };

  const handleCaptchaVerify = async (success: boolean) => {
    setShowCaptcha(false);
    if (success) {
      await handleSubmit();
    } else {
      toast({
        title: "Error de verificación",
        description: "Por favor, intenta la verificación nuevamente.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const requestData = {
        departamento: formData.departamento,
        vehiculo: formData.vehiculo,
        tipo_documento: formData.tipoDocumento,
        nro_documento: formData.nroDocumento,
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        celular: formData.celular,
        email: formData.email,
        mayor_edad: formData.mayorEdad === "si",
        acepta_politica: formData.aceptaPolitica,
        documento_imagen_frente: formData.documentoImagenFrente?.split(",")[1] || null,
        documento_imagen_reverso: formData.documentoImagenReverso?.split(",")[1] || null,
      };

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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData?.message ||
            `Error ${response.status}: ${response.statusText}`
        );
      }

      const data = (await response.json()) as ApiResponse;
      toast({
        title: "Registro exitoso",
        description: "Tus datos han sido guardados correctamente.",
      });

      sessionStorage.setItem("repartoRegistroId", data.data.id.toString());
      router.push("/reparto/zonas");
    } catch (error) {
      console.error("Detalles del error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Hubo un problema al enviar el formulario. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
    if (file) {
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

        if (side === "frente") {
          setPreviewImageFrente(base64);
          updateFormData("documentoImagenFrente", base64);
        } else {
          setPreviewImageReverso(base64);
          updateFormData("documentoImagenReverso", base64);
        }
      } catch (error) {
        console.error("Error al procesar la imagen:", error);
        toast({
          title: "Error",
          description: "No se pudo procesar la imagen",
          variant: "destructive",
        });
      }
    }
  };

  const handleCameraCapture = (
    imageData: { imageSrc: string; text: string },
    side: "frente" | "reverso"
  ): void => {
    if (side === "frente") {
      setPreviewImageFrente(imageData.imageSrc);
      updateFormData("documentoImagenFrente", imageData.imageSrc);
    } else {
      setPreviewImageReverso(imageData.imageSrc);
      updateFormData("documentoImagenReverso", imageData.imageSrc);
    }
    console.log(`OCR Text (${side}):`, imageData.text);
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
          formData.celular !== "" &&
          formData.email !== "" &&
          formData.mayorEdad !== "" &&
          formData.aceptaPolitica &&
          (formData.tipoDocumento === "RUC" ||
            (formData.documentoImagenFrente !== null &&
              formData.documentoImagenReverso !== null))
        );
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="w-full flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6">
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

          <div className="flex justify-between mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col items-center flex-1">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm mb-1",
                    step === i
                      ? "bg-red-600 text-white"
                      : step > i
                      ? "bg-red-400 text-white"
                      : "bg-gray-100 text-gray-400"
                  )}
                >
                  {i}
                </div>
                <div className="text-xs text-gray-400">
                  {i === 1 ? "Ciudad" : i === 2 ? "Vehículo" : "Datos"}
                </div>
              </div>
            ))}
          </div>

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
                <div className="space-y-4">
                  <Label className="text-lg font-medium text-gray-900">
                    Selecciona tu ciudad
                  </Label>
                  <Select
                    value={formData.departamento}
                    onValueChange={(value) =>
                      updateFormData("departamento", value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Elige ciudad/zona de reparto" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AREQUIPA">AREQUIPA</SelectItem>
                      <SelectItem value="HUACHO">HUACHO</SelectItem>
                      <SelectItem value="LIMA">LIMA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <Label className="text-lg font-medium text-gray-900">
                    Selecciona tu vehículo
                  </Label>
                  <Select
                    value={formData.vehiculo}
                    onValueChange={(value) => updateFormData("vehiculo", value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Elige tu vehículo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MOTO">MOTO</SelectItem>
                      <SelectItem value="BICICLETA">BICICLETA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="tipoDocumento">Tipo de documento</Label>
                    <Select
                      value={formData.tipoDocumento}
                      onValueChange={(value) => {
                        updateFormData("tipoDocumento", value);
                        updateFormData("nroDocumento", "");
                        updateFormData("nombres", "");
                        updateFormData("apellidos", "");
                        updateFormData("documentoImagenFrente", null);
                        updateFormData("documentoImagenReverso", null);
                        setPreviewImageFrente(null);
                        setPreviewImageReverso(null);
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Elige tipo de documento" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DNI">DNI</SelectItem>
                        <SelectItem value="RUC">RUC</SelectItem>
                        <SelectItem value="CE">Carnet de Extranjería</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="nroDocumento">Número de documento</Label>
                    <div className="relative">
                      <Input
                        id="nroDocumento"
                        value={formData.nroDocumento}
                        onChange={(e) => handleDocumentChange(e.target.value)}
                        required
                        maxLength={formData.tipoDocumento === "RUC" ? 11 : 8}
                        className={isLoading ? "pr-10" : ""}
                        disabled={isLoading}
                      />
                      {isLoading && (
                        <Loader2 className="absolute right-3 top-2.5 h-5 w-5 animate-spin text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  {(formData.tipoDocumento === "DNI" || formData.tipoDocumento === "CE") && (
                    <div>
                      <Label>Imágenes del documento</Label>
                      <div className="space-y-4 mt-2">
                        <div>
                          <Label>Frente del documento</Label>
                          <div className="flex space-x-2 mt-2">
                            <Button
                              onClick={() => fileInputRefFrente.current?.click()}
                              variant="outline"
                            >
                              <Upload className="mr-2 h-4 w-4" /> Subir imagen
                            </Button>
                            {isMobile && (
                              <Button
                                onClick={() => setIsCameraOpenFrente(true)}
                                variant="outline"
                              >
                                <Camera className="mr-2 h-4 w-4" /> Usar cámara
                              </Button>
                            )}
                            <input
                              type="file"
                              ref={fileInputRefFrente}
                              onChange={(e) => handleFileUpload(e, "frente")}
                              accept="image/*"
                              className="hidden"
                            />
                          </div>
                          {previewImageFrente && (
                            <div className="mt-2">
                              <p className="text-sm text-green-600 mb-2">
                                Imagen del frente cargada
                              </p>
                              <Image
                                src={previewImageFrente}
                                alt="Vista previa del frente del documento"
                                width={200}
                                height={150}
                                className="rounded-md"
                                unoptimized
                              />
                            </div>
                          )}
                        </div>

                        <div>
                          <Label>Reverso del documento</Label>
                          <div className="flex space-x-2 mt-2">
                            <Button
                              onClick={() => fileInputRefReverso.current?.click()}
                              variant="outline"
                            >
                              <Upload className="mr-2 h-4 w-4" /> Subir imagen
                            </Button>
                            {isMobile && (
                              <Button
                                onClick={() => setIsCameraOpenReverso(true)}
                                variant="outline"
                              >
                                <Camera className="mr-2 h-4 w-4" /> Usar cámara
                              </Button>
                            )}
                            <input
                              type="file"
                              ref={fileInputRefReverso}
                              onChange={(e) => handleFileUpload(e, "reverso")}
                              accept="image/*"
                              className="hidden"
                            />
                          </div>
                          {previewImageReverso && (
                            <div className="mt-2">
                              <p className="text-sm text-green-600 mb-2">
                                Imagen del reverso cargada
                              </p>
                              <Image
                                src={previewImageReverso}
                                alt="Vista previa del reverso del documento"
                                width={200}
                                height={150}
                                className="rounded-md"
                                unoptimized
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="nombres">
                      {formData.tipoDocumento === "RUC" ? "Razón Social" : "Nombres"}
                    </Label>
                    <Input
                      id="nombres"
                      value={formData.nombres}
                      onChange={(e) => updateFormData("nombres", e.target.value)}
                      required
                      readOnly={formData.tipoDocumento !== "CE"}
                    />
                  </div>

                  {formData.tipoDocumento !== "RUC" && (
                    <div>
                      <Label htmlFor="apellidos">Apellidos</Label>
                      <Input
                        id="apellidos"
                        value={formData.apellidos}
                        onChange={(e) => updateFormData("apellidos", e.target.value)}
                        required
                        readOnly={formData.tipoDocumento !== "CE"}
                      />
                    </div>
                  )}

                  <div>
                    <Label>¿Tienes más de 18 años?</Label>
                    <RadioGroup
                      value={formData.mayorEdad}
                      onValueChange={(value) => updateFormData("mayorEdad", value)}
                      className="flex space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="si" id="si" />
                        <Label htmlFor="si">Sí</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="no" />
                        <Label htmlFor="no">No</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Código</Label>
                      <Select defaultValue="+51">
                        <SelectTrigger>
                          <SelectValue placeholder="+51" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="+51">+51</SelectItem>
                          <SelectItem value="+54">+54</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="celular">Número de celular</Label>
                      <Input
                        id="celular"
                        type="tel"
                        value={formData.celular}
                        onChange={(e) => updateFormData("celular", e.target.value)}
                        required
                        maxLength={9}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Correo electrónico</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateFormData("email", e.target.value)}
                      required
                    />
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="politica"
                      checked={formData.aceptaPolitica}
                      onCheckedChange={(checked: boolean) =>
                        updateFormData("aceptaPolitica", checked)
                      }
                    />
                    <Label htmlFor="politica" className="text-sm text-gray-500">
                      Estoy de acuerdo con la política de privacidad y acepto
                      ser contactado por canales de terceros.
                    </Label>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <Button
            onClick={handleNext}
            disabled={!isStepComplete() || isLoading}
            className="w-full mt-6 bg-red-500 hover:bg-red-600 text-white"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                {step === 3 ? "Enviar" : "Siguiente"}
                <ChevronRight className="ml-2" />
              </>
            )}
          </Button>
        </div>
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
        onClose={() => setShowCaptcha(false)}
      />
    </div>
  );
}

