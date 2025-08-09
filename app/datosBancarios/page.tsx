// app\datosBancarios\page.tsx
"use client";

import type React from "react";
import { useState, useEffect, useCallback } from "react";
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

export default function DatosBancarios() {
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
    <section className="min-h-screen w-full bg-gray-50">
      <Navbar />
      <div className="grid lg:grid-cols-2 min-h-[calc(100vh-140px)]">
        {/* Imagen - oculta en móvil */}
        <div className="relative hidden h-full lg:block overflow-hidden">
          <Image
            alt="Business person working on a laptop"
            className="absolute inset-0 h-full w-full object-cover"
            height={1080}
            src={Persona || "/placeholder.svg"}
            width={1920}
            priority
          />
        </div>

        {/* Contenido del formulario */}
        <div className="flex flex-col p-4 sm:p-6 lg:p-8 relative min-h-[calc(100vh-140px)]">
          {/* Botón de saltar paso - responsive */}
          <div className="flex flex-col items-end mb-4 lg:absolute lg:top-0 lg:right-0 lg:mb-0 lg:z-10">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSkip}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-blue-100 rounded-full px-3 py-2 sm:px-4 transition-all shadow-sm text-sm"
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
            <p className="text-xs text-gray-500 mt-2 max-w-[200px] sm:max-w-[180px] text-right lg:text-right text-center">
              Puede completar esta información más tarde desde su panel de control
            </p>
          </div>

          {/* Contenedor principal del formulario */}
          <div className="flex-1 flex flex-col items-center pt-4 lg:pt-0">
            <div className="w-full max-w-md flex flex-col h-full">
              {/* Área scrolleable del formulario */}
              <div className="flex-1 overflow-y-auto pr-2 max-h-[calc(100vh-280px)]">
                <FormularioDatosBancarios
                  formData={formData}
                  handleInputChange={handleInputChange}
                  handleSelectChange={handleSelectChange}
                  handleCheckboxChange={handleCheckboxChange}
                  isLoading={isLoading}
                  isSaving={isSaving}
                  establecimientoDireccion={establecimientoDireccion}
                />
              </div>
              
              {/* Texto informativo fijo en la parte inferior */}
              <div className="mt-4 flex items-start gap-3 w-full text-sm text-gray-600 bg-blue-50 p-4 rounded-lg border border-blue-100 shadow-sm flex-shrink-0">
                <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <p>
                  Puede ingresar sus datos bancarios para recibir pagos. Esta información puede ser completada más tarde si
                  lo prefiere.
                </p>
              </div>
            </div>
          </div>
          {/* Contenedor principal del formulario con scroll */}
          <div className="flex-1 flex flex-col justify-start items-center overflow-hidden">
            <div className="w-full max-w-md h-full flex flex-col">
              {/* Área scrolleable del formulario */}
              <div className="flex-1 overflow-y-auto pr-2">
              </div>
            </div>
          </div>
          <StepNavigation
            currentStep={currentStep}
            totalSteps={totalSteps}
            onNext={handleNext}
            onBack={handleBack}
            isNextDisabled={!isFormValid || isLoading || isSaving}
          />
        </div>
      </div>
    </section>
  );
}