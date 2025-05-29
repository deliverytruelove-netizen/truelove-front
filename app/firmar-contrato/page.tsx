// app\firmar-contrato\page.tsx
'use client'


import { useState, useEffect } from "react"
import Image from "next/image"
// import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import ReactConfetti from "react-confetti"
import { Button } from "@/components/ui/button"
import Navbar from "@/components/ui/navbar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CheckCircle2, CircleDot, Circle } from 'lucide-react'
import Contrato from '@/src/assets/contrato.png'
import { getRegistrationData, updateRegistrationStep } from '@/services/registrationTokenService'
import { useToast } from "@/hooks/use-toast"

export default function ContratoPage() {
  const [showConfetti, setShowConfetti] = useState(false)
  const [loading, setLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState<'adjuntar' | 'crear_perfil'>('adjuntar')
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const checkRegistrationStep = async () => {
      try {
        const data = await getRegistrationData();
        if (!data || (data.current_step !== '/firmar-contrato' && data.current_step !== '/cuenta-bancaria')) {
          toast({
            title: "Error",
            description: "Por favor complete los pasos anteriores",
            variant: "destructive",
          });
          router.push('/');
        } else {
          setLoading(false);
          setShowConfetti(true)
          const timer = setTimeout(() => setShowConfetti(false), 5000)
          setCurrentStep(data.current_step === '/firmar-contrato' ? 'adjuntar' : 'crear_perfil')
          return () => clearTimeout(timer)
        }
      } catch (error) {
        console.error('Error checking registration step:', error);
        toast({
          title: "Error",
          description: "Hubo un problema al verificar tu progreso",
          variant: "destructive",
        });
      }
    };

    checkRegistrationStep();
  }, [router, toast]);

  const handleNext = async () => {
    try {
      if (currentStep === 'adjuntar') {
        await updateRegistrationStep('/cuenta-bancaria');
        router.push('/cuenta-bancaria');
      } else {
        await updateRegistrationStep('/crear-perfil');
        router.push('/crear-perfil');
      }
    } catch (error) {
      console.error('Error updating registration step:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el paso de registro",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-red-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f34739] mx-auto"></div>
          <p className="mt-4 text-[#f34739]">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-red-50 to-white">
      {showConfetti && <ReactConfetti recycle={false} />}
      <Navbar/>
        {/* <Button
          asChild
          variant="default"
          className="bg-[#f34739] text-white hover:bg-[#d63c30] transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          <Link href="/">Guardar y salir</Link>
        </Button>
      </Navbar> */}

      <div className="flex flex-col md:flex-row flex-1">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full md:w-1/2 p-4 md:p-8 flex items-center justify-center"
        >
          <div className="text-center space-y-6 max-w-md">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="mx-auto w-32 h-32 md:w-40 md:h-40 relative"
            >
              <Image
                src={Contrato}
                alt="Documento"
                layout="fill"
                objectFit="contain"
              />
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-3xl md:text-4xl font-bold text-[#f34739]"
            >
              ¡Felicidades!
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-xl md:text-2xl font-semibold"
            >
              Firmaste el contrato satisfactoriamente
            </motion.p>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-sm md:text-base text-gray-600"
            >
              Estamos ajustando los últimos detalles para que puedas empezar pronto
            </motion.p>
          </div>
        </motion.div>

        <div className="w-full md:w-1/2 bg-white p-6 md:p-12 rounded-t-3xl md:rounded-l-3xl shadow-2xl">
          <ScrollArea className="h-[calc(100vh-4rem)] md:h-auto flex items-center p-4 md:p-8">
            <div className="space-y-8 max-w-xl mx-auto">
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 }}
                className="flex items-start gap-4"
              >
                <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8 text-green-500 flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <h2 className="text-base md:text-lg font-semibold">
                    Estamos preparando tu contrato para enviártelo
                  </h2>
                  <p className="text-sm md:text-base text-gray-600">
                    ¡Danos un momento! Podrás descargar tu contrato desde el correo
                    electrónico que te enviaremos. Manténlo seguro.
                  </p>
                  <span className="text-sm md:text-base text-green-500 font-medium">Completado</span>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.1 }}
                className="flex items-start gap-4"
              >
                <CircleDot className="w-6 h-6 md:w-8 md:h-8 text-[#f34739] flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <h2 className="text-base md:text-lg font-semibold">
                    {currentStep === 'adjuntar' ? 'Adjunta tus documentos' : 'Crea tu perfil'}
                  </h2>
                  <p className="text-sm md:text-base text-gray-600">
                    {currentStep === 'adjuntar' 
                      ? 'Para completar el siguiente paso necesitaremos algunos documentos.'
                      : 'Para empezar, carga tu logo, menú y horarios.'}
                  </p>
                  <span className="text-sm md:text-base text-[#f34739] font-medium">En proceso</span>
                  <div className="pt-2">
                    <Button 
                      variant="default" 
                      className="bg-[#f34739] hover:bg-[#d63c30] text-sm md:text-base transition-all duration-300 shadow-md hover:shadow-lg"
                      onClick={handleNext}
                    >
                      Empezar
                    </Button>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.3 }}
                className="flex items-start gap-4"
              >
                <Circle className="w-6 h-6 md:w-8 md:h-8 text-gray-300 flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <h2 className="text-base md:text-lg font-semibold text-gray-500">
                    {currentStep === 'adjuntar' ? 'Crea tu perfil' : 'Activa tu negocio'}
                  </h2>
                  <p className="text-sm md:text-base text-gray-500">
                    {currentStep === 'adjuntar'
                      ? 'Para empezar, carga tu logo, menú y horarios.'
                      : 'Actívate desde el sistema de recepción de pedidos para empezar a recibir pedidos.'}
                  </p>
                </div>
              </motion.div>

              {currentStep === 'adjuntar' && (
                <motion.div 
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.5 }}
                  className="flex items-start gap-4"
                >
                  <Circle className="w-6 h-6 md:w-8 md:h-8 text-gray-300 flex-shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <h2 className="text-base md:text-lg font-semibold text-gray-500">Activa tu negocio</h2>
                    <p className="text-sm md:text-base text-gray-500">
                      Actívate desde el sistema de recepción de pedidos para empezar a
                      recibir pedidos.
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}

