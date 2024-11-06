'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Truck, Clock, Shield, Package } from 'lucide-react'

export default function DeliveryAboutUs() {
  const features = [
    { icon: <Truck className="h-8 w-8" />, title: 'Entrega Rápida', description: 'Llegamos a tu puerta en tiempo récord' },
    { icon: <Clock className="h-8 w-8" />, title: '24/7 Disponible', description: 'Servicio ininterrumpido, todos los días' },
    { icon: <Shield className="h-8 w-8" />, title: 'Seguridad Garantizada', description: 'Tu paquete, nuestra responsabilidad' },
    { icon: <Package className="h-8 w-8" />, title: 'Seguimiento en Tiempo Real', description: 'Monitorea tu envío en cada paso' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-500 to-orange-500 text-white p-6 md:p-12">
      <motion.h1 
        className="text-4xl md:text-6xl font-bold text-center mb-12"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Revolucionando las Entregas
      </motion.h1>

      <motion.div 
        className="max-w-4xl mx-auto mb-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
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
        className="text-center mb-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <Badge variant="secondary" className="text-lg px-4 py-2 bg-white text-red-500">
          Comienza Tu Experiencia de Entrega
        </Badge>
        <p className="text-xl mt-6 max-w-2xl mx-auto">
          En TRUE LOVE, no solo entregamos paquetes, cumplimos promesas. 
          Nuestra misión es hacer que cada entrega sea una experiencia excepcional,
          utilizando tecnología de punta y un equipo dedicado.
        </p>
      </motion.div>

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Card className="bg-white/10 backdrop-blur-lg border-white/20 h-full">
              <CardContent className="flex flex-col items-center p-6 h-full">
                <motion.div 
                  className="text-yellow-300 mb-4"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  {feature.icon}
                </motion.div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-center text-white/80">{feature.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <motion.div 
        className="mt-16 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <h2 className="text-3xl font-semibold mb-4">¿Listo para una entrega perfecta?</h2>
        <Button 
          variant="secondary" 
          size="lg" 
          className="bg-white text-red-500 hover:bg-yellow-300 hover:text-red-600 transition-colors duration-300"
        >
          Comenzar Ahora
        </Button>
      </motion.div>

      <motion.div 
        className="mt-16 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <h3 className="text-2xl font-semibold mb-4">Nuestro Compromiso</h3>
        <p className="max-w-2xl mx-auto text-lg">
          Desde nuestra fundación, nos hemos dedicado a perfeccionar el arte de la entrega.
          Con años de experiencia y constante innovación, hemos desarrollado un sistema
          que garantiza la satisfacción de nuestros clientes en cada envío.
        </p>
      </motion.div>
    </div>
  )
}