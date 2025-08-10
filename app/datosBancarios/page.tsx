// app\datosBancarios\page.tsx
"use client";

import type React from "react";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { SkipForward, Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import Navbar from "@/components/ui/navbar";
import StepNavigation from "@/components/ui/StepNavigation";
import Persona from "@/public/img/negocio.jpg";
import { useToast } from "@/hooks/use-toast";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import {
  updateRegistrationStep,
  getRegistrationData,
  createRegistrationToken,
} from "@/services/registrationTokenService";
import {
  fetchExistingData,
  fetchEstablecimientoDireccion,
  saveBankData,
} from "./services/serviciosDatosBancarios";
import FormularioDatosBancarios from "./components/FormularioDatosBancarios";

interface EstablecimientoDireccion {
  calle: string;
  numero: string;
  codigo_postal: string;
  provincia: string;
  ciudad: string;
  referencia: string | null;
  direccion_completa: string;
}

function DatosBancariosContent() {
  useBodyScrollLock();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentStep] = useState(4);
  const totalSteps = 6;
  const [establecimientoDireccion, setEstablecimientoDireccion] =
    useState<EstablecimientoDireccion | null>(null);
  const [establecimientoId, setEstablecimientoId] = useState<string | null>(
    null
  );
  const [formData, setFormData] = useState({
    accountHolder: "",
    accountNumber: "",
    bankName: "",
    accountType: "",
    documentNumber: "",
    cci: "",
    useBusinessAddress: true,
  });
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    const isValid = Object.values(formData).every((value) =>
      typeof value === "boolean" ? true : value.trim() !== ""
    );
    setIsFormValid(isValid);
  }, [formData]);

  useEffect(() => {
    const checkToken = async () => {
      const data = await getRegistrationData();
      if (!data || data.current_step !== "/datosBancarios") {
        toast({
          title: "Error",
          description: "Por favor complete los pasos anteriores",
          variant: "destructive",
        });
        router.push("/");
      }
    };

    checkToken();
  }, [router, toast]);

  useEffect(() => {
    const loadExistingData = async () => {
      try {
        setIsLoading(true);
        const registrationData = await getRegistrationData();
        if (!registrationData) {
          throw new Error("Datos de registro no encontrados");
        }

        // Cargar los datos bancarios existentes
        const existingData = await fetchExistingData(
          registrationData.registration_id
        );
        if (existingData) {
          setFormData({
            accountHolder: existingData.titular_cuenta,
            accountNumber: existingData.numero_cuenta,
            bankName: existingData.nombre_banco,
            accountType: existingData.tipo_cuenta,
            documentNumber: existingData.documento_titular,
            cci: existingData.codigo_cci,
            useBusinessAddress: existingData.usar_direccion_negocio,
          });
          setEstablecimientoId(existingData.establecimiento_id.toString());
        }
      } catch (error) {
        console.error("Error al cargar datos existentes:", error);
        toast({
          title: "Error",
          description:
            error instanceof Error
              ? error.message
              : "No se pudieron cargar los datos bancarios existentes",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadExistingData();
  }, [toast]);

  const loadEstablecimientoDireccion = useCallback(async () => {
    try {
      setIsLoading(true);
      const registrationData = await getRegistrationData();
      if (!registrationData) {
        throw new Error("Datos de registro no encontrados");
      }

      console.log("ID de registro:", registrationData.registration_id); // Para depuración

      const result = await fetchEstablecimientoDireccion(
        registrationData.registration_id
      );
      setEstablecimientoDireccion(result.direccion);
      setEstablecimientoId(result.establecimiento_id);
      console.log("Establecimiento ID:", result.establecimiento_id); // Para depuración
    } catch (error) {
      console.error("Error al obtener la dirección:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "No se pudo obtener la dirección del establecimiento",
        variant: "destructive",
      });
      setEstablecimientoDireccion(null);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (formData.useBusinessAddress) {
      loadEstablecimientoDireccion();
    } else {
      setEstablecimientoDireccion(null);
    }
  }, [formData.useBusinessAddress, loadEstablecimientoDireccion]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id: string, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, useBusinessAddress: checked }));
  };

  const handleNext = async () => {
    if (!isFormValid) return;

    setIsSaving(true);
    try {
      const registrationData = await getRegistrationData();
      if (!registrationData) {
        throw new Error("Datos de registro no encontrados");
      }

      // Verificar si ya existen datos bancarios
      const existingData = await fetchExistingData(
        registrationData.registration_id
      );

      // Guardar datos bancarios
      const result = await saveBankData(
        registrationData.registration_id,
        formData,
        establecimientoId,
        existingData
      );

      console.log("Respuesta del servidor:", result);

      // Actualizar el paso del registro
      await updateRegistrationStep("/planes");

      setTimeout(() => {
        router.push("/planes");
      }, 1000);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Hubo un error al guardar los datos bancarios",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = async () => {
    try {
      await updateRegistrationStep("/datosClaves");
      router.push("/datosClaves");
    } catch (error) {
      console.error("Error al volver hacia atrás:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Error al volver hacia atrás",
        variant: "destructive",
      });
    }
  };

  // Función para omitir este paso
  const handleSkip = async () => {
    try {
      setIsLoading(true);

      // Obtener los datos de registro actuales
      const registrationData = await getRegistrationData();
      if (!registrationData) {
        throw new Error("Datos de registro no encontrados");
      }

      // Crear un nuevo token directamente con el paso actualizado
      await createRegistrationToken(
        registrationData.registration_id,
        "/planes"
      );

      // Esperar un momento para asegurar que el token se actualice correctamente
      setTimeout(() => {
        setIsLoading(false);
        // Redirigir a la página de planes
        router.push("/planes");
      }, 500);
    } catch (error) {
      setIsLoading(false);
      console.error("Error al omitir paso:", error);
      toast({
        title: "Error",
        description: "Error al omitir este paso",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col h-dvh bg-white overflow-hidden">
      {/* Navbar fijo */}
      <div className="flex-shrink-0 bg-white">
        <Navbar />
      </div>

      {/* Contenido principal con flex-grow */}
      <div className="flex flex-grow overflow-hidden">
        {/* Imagen fija en desktop */}
        <div className="hidden md:block w-1/2 relative bg-muted flex-shrink-0">
          <div className="absolute inset-0">
            <Image
              src={Persona}
              alt="Persona trabajando con laptop"
              fill
              className="object-cover"
              priority
              sizes="50vw"
            />
          </div>
        </div>

        {/* Área del formulario con scroll interno */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto p-8 pb-32 relative">
            {/* Botón saltar paso - posicionado mejor */}
            <div className="absolute top-0 right-0 mb-8">
              <div className="flex flex-col items-end space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSkip}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 transition-all shadow-sm"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></span>
                      <span>Procesando...</span>
                    </>
                  ) : (
                    <>
                      <SkipForward className="h-4 w-4" />
                      <span>Saltar este paso</span>
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground max-w-[200px] text-right">
                  Puede completar esta información más tarde
                </p>
              </div>
            </div>

            <div className="space-y-8 mt-16">
              <div>
                <h1 className="text-2xl font-bold mb-2">
                  Datos Bancarios
                </h1>
                <p className="text-muted-foreground">
                  Ingrese su información bancaria para recibir pagos. Esta
                  información puede ser completada más tarde si lo prefiere.
                </p>
              </div>

              <FormularioDatosBancarios
                formData={formData}
                handleInputChange={handleInputChange}
                handleSelectChange={handleSelectChange}
                handleCheckboxChange={handleCheckboxChange}
                isLoading={isLoading}
                isSaving={isSaving}
                establecimientoDireccion={establecimientoDireccion}
              />

              {/* Información importante */}
              <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Información Importante</p>
                  <p>
                    Esta información será utilizada únicamente para procesar los pagos 
                    de sus clientes de manera segura. Puede omitir este paso y 
                    completarlo más tarde desde su panel de control.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* StepNavigation fijo */}
      <div className="flex-shrink-0 border-t">
        <StepNavigation
          currentStep={currentStep}
          totalSteps={totalSteps}
          onNext={handleNext}
          onBack={handleBack}
          isNextDisabled={!isFormValid || isLoading || isSaving}
        />
      </div>
    </div>
  );
}

export default function DatosBancarios() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <DatosBancariosContent />
    </Suspense>
  );
}