"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Navbar from "@/components/ui/navbar";
import Negocio from "@/public/img/negocio.jpg";
import { toast } from "@/hooks/use-toast";
import StepNavigation from '@/components/ui/StepNavigation'
import Loading from "./components/Loading";
import { BusinessForm } from "./components/Fomurlulario";

import { formSchema, type BusinessFormValues } from "./schemas/business-form";
import type { TipoNegocio, Categoria } from "./types/business";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";

function FormularioDetallesNegocioContent() {
  useBodyScrollLock();
  const router = useRouter();
  const searchParams = useSearchParams();
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
    },
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    // Obtener el ID del registro del negocio
    const registration_id = searchParams.get('registration_id');
    
    if (!registration_id) {
      // Si no hay ID en la URL, verificar en sessionStorage
      const storedId = sessionStorage.getItem('business_registration_id');
      if (!storedId) {
        toast({
          title: "Error",
          description: "Por favor complete el registro primero",
          variant: "destructive",
        });
        router.push('/');
        return;
      }
    } else {
      // Si hay ID en la URL, guardarlo en sessionStorage
      sessionStorage.setItem('business_registration_id', registration_id);
    }

    return () => clearTimeout(timer);
  }, [router, searchParams]);

  useEffect(() => {
    fetchTiposNegocio();
  }, []);

  const fetchTiposNegocio = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_WEB}/tipos-negocio`);
      if (!response.ok) throw new Error("Error al obtener tipos de negocio");
      const data = await response.json();
      setTiposNegocio(data);
    } catch (error) {
      console.error('Error fetching business types:', error);
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
      console.error('Error fetching categories:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las categorías",
        variant: "destructive",
      });
    }
  };

  const onSubmit = useCallback(async (data: BusinessFormValues) => {
    const businessRegistrationId = sessionStorage.getItem('business_registration_id');
    
    if (!businessRegistrationId) {
      toast({
        title: "Error",
        description: "Por favor complete el registro primero",
        variant: "destructive",
      });
      router.push('/');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_WEB}/negocios`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nombre: data.businessName,
            tipo_negocio_id: parseInt(data.businessType),
            categoria_id: parseInt(data.category),
            total_sucursales: data.branches,
            es_local_calle: data.isStreetLocation === "Si",
            metodo_contacto: data.contactMethod,
            telefono: data.phoneNumber.replace(/\s/g, ''),
            business_registration_id: businessRegistrationId,
          }),
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "Error al guardar los datos");
      }

      // Guardar el ID del negocio para los siguientes pasos
      sessionStorage.setItem('negocio_id', responseData.negocio.id);

      toast({
        title: "Éxito",
        description: "Negocio registrado correctamente",
      });
      
      router.push("/ubicar-local");
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al guardar los datos del negocio",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [router]);

  const handleNext = form.handleSubmit(onSubmit);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white">
      <Navbar />
      <div className="flex flex-1 h-[calc(100vh-0px)]">
        <div className="hidden md:block w-1/2 relative bg-muted">
          <div className="absolute inset-0" style={{ bottom: '120px' }} >
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

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-md mx-auto p-8">
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

      <StepNavigation
        currentStep={currentStep}
        totalSteps={totalSteps}
        onNext={handleNext}
        isNextDisabled={!form.formState.isValid || isSubmitting}
      />
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

