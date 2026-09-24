// app\acercaNegocio\page.tsx  este es el segundo paso del registro
"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Navbar from "@/components/ui/navbar";
import Negocio from "@/public/img/imagen2.png";
import { toast } from "@/hooks/use-toast";
import StepNavigation from "@/components/ui/StepNavigation";
import Loading from "./components/Loading";
import { BusinessForm } from "./components/Fomurlulario";
import { formSchema, type BusinessFormValues } from "./schemas/business-form";
import {
  getRegistrationToken,
  updateRegistrationStep,
  getRegistrationData,
  clearAllRegistrationData,
} from "@/services/registrationTokenService";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";

function FormularioDetallesNegocioContent() {
  useBodyScrollLock();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  // QR de Yape/Plin: archivo nuevo elegido, QR ya guardado en el servidor y si existía al cargar
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [qrFilePreview, setQrFilePreview] = useState<string | null>(null);
  const [qrGuardadoUrl, setQrGuardadoUrl] = useState<string | null>(null);
  const [teniaQrGuardado, setTeniaQrGuardado] = useState(false);
  const currentStep = 1;
  const totalSteps = 8;

  const form = useForm<BusinessFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessName: "",
      branches: 1,
      isStreetLocation: "Si",
      contactMethod: "WhatsApp",
      phoneNumber: "+51",
      digitalWallet: "0",
      useSamePhone: true,
      walletOwnerName: "",
    },
  });

  const fetchNegocioData = async (registrationId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_WEB}/negocios/${registrationId}`,
        {
          headers: {
            Authorization: `Bearer ${getRegistrationToken()}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status !== 404) {
          throw new Error("Error al obtener datos del negocio");
        }
        return null;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching business data:", error);
      return null;
    }
  };

  useEffect(() => {
    const checkToken = async () => {
      const data = await getRegistrationData();
      if (
        !data ||
        (data.current_step !== "/acercaNegocio" &&
          data.current_step !== "/ubicar-local")
      ) {
        toast({
          title: "Error",
          description: "Por favor complete el registro primero",
          variant: "destructive",
        });
        // Limpiar datos antes de redirigir
        clearAllRegistrationData();
        router.push("/");
        return;
      }

      // Cargar datos del negocio si existen
      const negocioData = await fetchNegocioData(data.registration_id);
      if (negocioData) {
        form.reset({
          businessName: negocioData.nombre,
          branches: negocioData.total_sucursales,
          isStreetLocation: negocioData.es_local_calle ? "Si" : "No",
          contactMethod: negocioData.metodo_contacto,
          phoneNumber: negocioData.telefono || localStorage.getItem("registrationPhone") || "+51",
          digitalWallet: negocioData.tipo_pago_digital || "0",
          useSamePhone: true,
          walletOwnerName: negocioData.nombre_titular_pago_digital || "",
        });
        setQrGuardadoUrl(negocioData.qr_pago_digital_url || null);
        setTeniaQrGuardado(!!negocioData.qr_pago_digital_url);
      } else {
        // Precargar teléfono del registro si no hay negocio aún
        const savedPhone = localStorage.getItem("registrationPhone")
        if (savedPhone) {
          form.setValue("phoneNumber", savedPhone)
        }
      }

      setIsLoading(false);
    };

    checkToken();
  }, [form, router]);

  useEffect(() => {
    if (!qrFile) {
      setQrFilePreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(qrFile);
    setQrFilePreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [qrFile]);

  const handleQrRemove = () => {
    setQrFile(null);
    setQrGuardadoUrl(null);
  };

  // Sube el QR nuevo o elimina el guardado según lo que haya elegido el socio
  const sincronizarQr = async (negocioId: number, digitalWallet: string) => {
    const baseUrl = `${process.env.NEXT_PUBLIC_API_WEB}/negocios/${negocioId}/qr-pago-digital`;
    const headers = {
      Authorization: `Bearer ${getRegistrationToken()}`,
      Accept: "application/json",
    };

    if (digitalWallet !== "0" && qrFile) {
      const qrData = new FormData();
      qrData.append("qr", qrFile);
      const response = await fetch(baseUrl, { method: "POST", headers, body: qrData });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "No se pudo subir el QR. Intente con otra imagen.");
      }
      const datos = await response.json();
      setQrFile(null);
      setQrGuardadoUrl(datos.qr_pago_digital);
      setTeniaQrGuardado(true);
      return;
    }

    const debeEliminar = teniaQrGuardado && (digitalWallet === "0" || !qrGuardadoUrl);
    if (debeEliminar) {
      const response = await fetch(baseUrl, { method: "DELETE", headers });
      if (!response.ok) {
        throw new Error("No se pudo quitar el QR");
      }
      setQrGuardadoUrl(null);
      setTeniaQrGuardado(false);
    }
  };



  const onSubmit = useCallback(
    async (data: BusinessFormValues) => {
      setIsSubmitting(true);
      try {
        const registrationData = await getRegistrationData();
        if (!registrationData) {
          throw new Error("Datos de registro no encontrados");
        }

        // Verificar si ya existe un negocio
        const existingBusiness = await fetchNegocioData(
          registrationData.registration_id
        );
        const method = existingBusiness ? "PUT" : "POST";
        const url = existingBusiness
          ? `${process.env.NEXT_PUBLIC_API_WEB}/negocios/${existingBusiness.id}`
          : `${process.env.NEXT_PUBLIC_API_WEB}/negocios`;

        const businessData = {
          nombre: data.businessName,
          total_sucursales: data.branches,
          es_local_calle: data.isStreetLocation === "Si",
          metodo_contacto: data.contactMethod,
          telefono: data.phoneNumber.replace(/\s/g, ""),
          business_registration_id: registrationData.registration_id,
          tipo_pago_digital: parseInt(data.digitalWallet),
          numero_pago_digital:
            data.digitalWallet !== "0"
              ? data.useSamePhone
                ? data.phoneNumber.replace(/\s/g, "").substring(3)
                : data.walletNumber
              : null,
          nombre_titular_pago_digital:
            data.digitalWallet !== "0"
              ? data.walletOwnerName
              : null,
        };

        const response = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getRegistrationToken()}`,
          },
          body: JSON.stringify(businessData),
        });

        const responseData = await response.json();

        if (!response.ok) {
          throw new Error(responseData.message || "Error al guardar los datos");
        }

        const negocioId = existingBusiness?.id ?? responseData.negocio?.id;
        if (negocioId) {
          await sincronizarQr(negocioId, data.digitalWallet);
        }

        // Actualizar el paso del registro
        await updateRegistrationStep("/ubicar-local");

        router.push("/ubicar-local");
      } catch (error) {
        console.error("Error submitting form:", error);
        toast({
          title: "Error",
          description:
            error instanceof Error
              ? error.message
              : "Error al guardar los datos del negocio",
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [router, qrFile, qrGuardadoUrl, teniaQrGuardado]
  );

  const handleNext = form.handleSubmit(onSubmit);

  if (isLoading) {
    return <Loading />;
  }

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
              src={Negocio}
              alt="Ilustración de Negocio"
              fill
              className="object-cover"
              priority
              sizes="50vw"
            />
          </div>
        </div>

        {/* Área del formulario con scroll interno */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto p-8 pb-32">
            <div className="space-y-8">
              <div>
                <h1 className="text-2xl font-bold mb-2">
                  Cuéntenos sobre su negocio
                </h1>
                <p className="text-muted-foreground">
                  Esta información se mostrará en la aplicación para que los
                  clientes puedan encontrarlo y contactarlo si tienen preguntas.
                </p>
              </div>

              <BusinessForm
                form={form}
                qrPreview={qrFilePreview ?? qrGuardadoUrl}
                onQrSelect={setQrFile}
                onQrRemove={handleQrRemove}
              />
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
          isNextDisabled={!form.formState.isValid || isSubmitting}
        />
      </div>
    </div>
  );
}

export default function FormularioDetallesNegocio() {
  return (
    <Suspense fallback={<Loading />}>
      <FormularioDetallesNegocioContent />
    </Suspense>
  );
}
