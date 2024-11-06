'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Truck, Clock, ThumbsUp, Package } from 'lucide-react'

export default function SobreNosotros() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const reasons = [
    { icon: <Truck className="h-6 w-6" />, title: 'Entrega Rápida', description: 'Llevamos tus paquetes a su destino en tiempo récord' },
    { icon: <Clock className="h-6 w-6" />, title: 'Puntualidad', description: 'Cumplimos con los tiempos prometidos, siempre' },
    { icon: <Package className="h-6 w-6" />, title: 'Cuidado Especial', description: 'Tratamos cada paquete con el máximo cuidado' },
  ]

  const values = [
    { icon: <Truck className="h-6 w-6" />, title: 'Eficiencia', description: 'Optimizamos cada ruta para una entrega más rápida' },
    { icon: <Clock className="h-6 w-6" />, title: 'Respeto por tu Tiempo', description: 'Valoramos tu tiempo como si fuera el nuestro' },
    { icon: <ThumbsUp className="h-6 w-6" />, title: 'Calidad Garantizada', description: 'Nos aseguramos de que cada entrega cumpla con los más altos estándares' },
  ]

  return (
    <div className="min-h-screen bg-white text-gray-800 p-6 md:p-12">
      <motion.h1 
        className="text-4xl md:text-5xl font-bold text-center mb-12 text-red-600"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Sobre TRUE LOVE Delivery
      </motion.h1>

      <motion.div 
        className="max-w-4xl mx-auto text-center mb-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <p className="text-xl mb-6 text-gray-600">
          En TRUE LOVE, nos dedicamos a ofrecer un servicio de entrega excepcional. Nuestro compromiso es llevar tus paquetes de manera segura y eficiente a su destino.
        </p>
        <Button variant="outline" className="text-lg px-6 py-3 bg-red-100 text-red-600 border-red-300 hover:bg-red-200">
          Haz tu Pedido Ahora
        </Button>
      </motion.div>

      <motion.h2 
        className="text-3xl font-semibold text-center mb-8 text-red-600"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        POR QUÉ ELEGIR TRUE LOVE
      </motion.h2>

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        {reasons.map((reason, index) => (
          <motion.div
            key={reason.title}
            whileHover={{ scale: 1.05 }}
            onHoverStart={() => setHoveredIndex(index)}
            onHoverEnd={() => setHoveredIndex(null)}
          >
            <Card className="bg-red-100 border-red-200">
              <CardContent className="flex flex-col items-center p-6">
                <motion.div 
                  className="text-red-600 mb-4"
                  whileHover={{ scale: 1.2, rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  {reason.icon}
                </motion.div>
                <h3 className="text-xl font-semibold mb-2 text-red-700">{reason.title}</h3>
                <p className="text-center text-red-600">{reason.description}</p>
                {hoveredIndex === index && (
                  <motion.p 
                    className="mt-4 text-sm text-center text-red-600"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                  En TRUE LOVE, cada entrega es nuestra prioridad
                  </motion.p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <motion.h2 
        className="text-3xl font-semibold text-center mb-8 text-red-600"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        Nuestros Valores de Entrega
      </motion.h2>

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        {values.map(value => (
          <Card key={value.title} className="bg-red-100 border-red-200">
            <CardContent className="flex flex-col items-center p-6">
              <motion.div 
                className="text-red-600 mb-4"
                whileHover={{ scale: 1.2, rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                {value.icon}
              </motion.div>
              <h3 className="text-xl font-semibold mb-2 text-red-700">{value.title}</h3>
              <p className="text-center text-red-600">{value.description}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>
    </div>
  )
}
