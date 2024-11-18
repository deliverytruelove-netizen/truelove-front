'use client'

import React, { useRef } from 'react'
import { motion, useScroll, useTransform} from 'framer-motion'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Truck, Clock, Shield, Package, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import AppPlay from '@/public/img/appPlay.png'
import AppStore from '@/public/img/appStore.png'

export default function DeliveryAboutUs() {
  const { scrollYProgress } = useScroll()
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.2])
  const ref = useRef(null)

  const features = [
    { icon: <Truck className="h-8 w-8" />, title: 'Entrega Rápida', description: 'Llegamos a tu puerta en tiempo récord' },
    { icon: <Clock className="h-8 w-8" />, title: '24/7 Disponible', description: 'Servicio ininterrumpido, todos los días' },
    { icon: <Shield className="h-8 w-8" />, title: 'Seguridad Garantizada', description: 'Tu Pedido, nuestra responsabilidad' },
    { icon: <Package className="h-8 w-8" />, title: 'Seguimiento en Tiempo Real', description: 'Monitorea tu envío en cada paso' },
  ]

  return (
    <div className="min-h-screen bg-white text-black p-6 md:p-12 overflow-hidden">
      <motion.h1 
        className="text-4xl md:text-6xl font-bold text-center mb-20 text-red-600"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Revolucionando las Entregas
      </motion.h1>

      <motion.div 
        className="max-w-4xl mx-auto mb-24" // Increased bottom margin
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        style={{ scale }}
      >
        <div className="relative pb-[56.25%] h-0 rounded-lg overflow-hidden shadow-2xl">
          <iframe 
            className="absolute top-0 left-0 w-full h-full"
            src="https://www.youtube.com/embed/9uW6zblB-wI" 
            title="TRUE LOVE Delivery Service Video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
          ></iframe>
        </div>
      </motion.div>

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-24" // Increased gap and bottom margin
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        {features.map(feature => (
          <motion.div
            key={feature.title}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-4" // Added padding around cards
          >
            <Card className="bg-white border-red-200 shadow-lg h-full transition-all duration-300 hover:shadow-2xl">
              <CardContent className="flex flex-col items-center p-8 h-full"> {/* Increased padding */}
                <motion.div 
                  className="text-red-600 mb-6" // Increased bottom margin
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  {feature.icon}
                </motion.div>
                <h3 className="text-xl font-semibold mb-4 text-red-600">{feature.title}</h3> {/* Increased margin */}
                <p className="text-center text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* App Store Buttons */}
      <motion.div 
        className="mt-24 text-center mb-6" 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <h2 className="text-2xl font-semibold text-red-600">Descárgalo en</h2>
      </motion.div>

      <motion.div 
        className="flex flex-row items-center justify-center gap-6 mb-24" 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }} 
      >
        <Link href="#" className="transition-transform hover:scale-105">
          <Image
            src={AppStore}
            alt="Descárgalo en el App Store"
            width={135}
            height={40}
            className="h-[40px] w-auto"
          />
        </Link>
        <Link href="#" className="transition-transform hover:scale-105">
          <Image
            src={AppPlay}
            alt="Disponible en Google Play"
            width={135}
            height={40}
            className="h-[40px] w-auto"
          />
        </Link>
      </motion.div>

      <motion.div 
        className="mt-24 text-center mb-24" // Added bottom margin
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <h2 className="text-3xl font-semibold mb-6 text-red-600">¿Listo para una entrega perfecta?</h2>
        <Button 
          variant="default" 
          size="lg" 
          className="bg-red-600 text-white hover:bg-red-700 transition-colors duration-300 group"
        >
          Comenzar Ahora
          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </motion.div>

      <motion.div 
        ref={ref}
        className="mt-24 text-center pb-12" // Added bottom padding
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <h3 className="text-2xl font-semibold mb-6 text-red-600">Nuestro Compromiso</h3>
        <p className="max-w-2xl mx-auto text-lg text-gray-700">
          Desde nuestra fundación, nos hemos dedicado a perfeccionar el arte de la entrega.
          Con años de experiencia y constante innovación, hemos desarrollado un sistema
          que garantiza la satisfacción de nuestros clientes en cada envío.
        </p>
      </motion.div>
    </div>
  )
}