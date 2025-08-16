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
import type { TipoNegocio, Categoria } from "./types/business";
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
  const [tiposNegocio, setTiposNegocio] = useState<TipoNegocio[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const currentStep = 1;
  const totalSteps = 8;

  const form = useForm<BusinessFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessName: "",
      businessType: "",
      category: "",
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
          businessType: negocioData.tipo_negocio_id.toString(),
          category: negocioData.categoria_id.toString(),
          branches: negocioData.total_sucursales,
          isStreetLocation: negocioData.es_local_calle ? "Si" : "No",
          contactMethod: negocioData.metodo_contacto,
          phoneNumber: negocioData.telefono,
          digitalWallet: negocioData.tipo_pago_digital || "0",
          useSamePhone: true,
          walletOwnerName: negocioData.nombre_titular_pago_digital || "",
        });

        // Cargar las categorías correspondientes
        await fetchCategorias(negocioData.tipo_negocio_id.toString());
      }

      setIsLoading(false);
    };

    checkToken();
    fetchTiposNegocio();
  }, [form, router]);

  const fetchTiposNegocio = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_WEB}/tipos-negocio`
      );
      if (!response.ok) throw new Error("Error al obtener tipos de negocio");
      const data = await response.json();
      setTiposNegocio(data);
    } catch (error) {
      console.error("Error fetching business types:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los tipos de negocio",
        variant: "destructive",
      });
    }
  };

  const fetchCategorias = async (tipoNegocioId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_WEB}/categorias/${tipoNegocioId}`
      );
      if (!response.ok) throw new Error("Error al obtener categorías");
      const data = await response.json();
      setCategorias(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las categorías",
        variant: "destructive",
      });
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
          tipo_negocio_id: parseInt(data.businessType),
          categoria_id: parseInt(data.category),
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
            data.digitalWallet !== "0" && !data.useSamePhone
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
    [router]
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
                tiposNegocio={tiposNegocio}
                categorias={categorias}
                fetchCategorias={fetchCategorias}
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
