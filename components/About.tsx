"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Truck, Clock, Package, Heart, ArrowRight, Gift, Shield, Star } from 'lucide-react'

export default function Component() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const reasons = [
    {
      icon: <Truck className="h-8 w-8" />,
      title: "Entrega Rápida",
      description: "Llevamos tus pedidos a su destino en tiempo récord",
      highlight: "Servicio Express 24/7",
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: "Puntualidad",
      description: "Cumplimos con los tiempos prometidos, siempre",
      highlight: "Garantía de tiempo",
    },
    {
      icon: <Package className="h-8 w-8" />,
      title: "Cuidado Especial",
      description: "Tratamos cada pedido con el máximo cuidado",
      highlight: "Embalaje premium",
    },
  ]

  const values = [
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Seguridad",
      description: "Tu envío está protegido de principio a fin",
      gradient: "from-pink-500 to-red-500",
    },
    {
      icon: <Star className="h-8 w-8" />,
      title: "Excelencia",
      description: "Superamos las expectativas en cada entrega",
      gradient: "from-red-500 to-red-600",
    },
    {
      icon: <Gift className="h-8 w-8" />,
      title: "Compromiso",
      description: "Tu satisfacción es nuestra prioridad",
      gradient: "from-red-600 to-red-700",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
      {/* Hero Section with New Animation */}
      <div className="bg-gradient-to-br from-red-600 to-red-700 pt-16 pb-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* New Enhanced Background Animation */}
        <div className="absolute inset-0">
          <motion.div 
            className="absolute inset-0 opacity-30"
            animate={{ 
              background: [
                "radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.3) 0%, transparent 50%)",
                "radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.3) 0%, transparent 50%)",
                "radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.3) 0%, transparent 50%)",
                "radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.3) 0%, transparent 50%)",
                "radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.3) 0%, transparent 50%)",
              ]
            }}
            transition={{ 
              duration: 10, 
              repeat: Infinity, 
              repeatType: "reverse" 
            }}
          />
          <motion.div 
            className="absolute inset-0"
            initial={{ backgroundPosition: "0% 0%" }}
            animate={{ 
              backgroundPosition: ["0% 0%", "100% 100%"]
            }}
            transition={{ 
              duration: 20,
              repeat: Infinity,
              repeatType: "reverse"
            }}
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: "60px 60px",
            }}
          />
          <motion.div 
            className="absolute inset-0"
            animate={{ 
              background: [
                "linear-gradient(45deg, rgba(255,0,0,0) 0%, rgba(255,0,0,0.3) 50%, rgba(255,0,0,0) 100%)",
                "linear-gradient(45deg, rgba(255,0,0,0.3) 0%, rgba(255,0,0,0) 50%, rgba(255,0,0,0.3) 100%)",
              ]
            }}
            transition={{ 
              duration: 5, 
              repeat: Infinity, 
              repeatType: "reverse" 
            }}
          />
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.h1 
              className="text-5xl md:text-7xl font-bold mb-8 text-white tracking-tight"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 5, repeat: Infinity, repeatType: "reverse" }}
            >
              TRUE LOVE
              <motion.span 
                className="block text-3xl md:text-4xl mt-2 font-normal"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
              >
                Delivery con Pasión
              </motion.span>
            </motion.h1>
            <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
              En TRUE LOVE, nos dedicamos a ofrecer un servicio de entrega excepcional. 
              Nuestro compromiso es llevar tus pedidos de manera segura y eficiente a su destino.
            </p>
            <Button 
              size="lg"
              className="bg-white text-red-600 hover:bg-red-50 shadow-lg hover:shadow-red-700/20 transition-all duration-300 group"
            >
              Haz tu Pedido Ahora
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </motion.div>
        </div>

        {/* Animated Wave Transition */}
        <div className="absolute bottom-0 left-0 right-0">
          <motion.div
            initial={{ y: 50 }}
            animate={{ y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <svg viewBox="0 0 1440 120" className="w-full h-[60px] fill-white preserve-3d">
              <motion.path 
                d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
                animate={{
                  d: [
                    "M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z",
                    "M0,32L80,37.3C160,43,320,53,480,58.7C640,64,800,69,960,64C1120,59,1280,43,1360,37.3L1440,32L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z",
                    "M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z",
                  ]
                }}
                transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
              />
            </svg>
          </motion.div>
        </div>
      </div>

      {/* Reasons Section */}
      <div className="bg-white py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-center mb-16 text-red-600"
          >
            POR QUÉ ELEGIR TRUE LOVE
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {reasons.map((reason, index) => (
              <motion.div
                key={reason.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                whileHover={{ scale: 1.03 }}
                onHoverStart={() => setHoveredIndex(index)}
                onHoverEnd={() => setHoveredIndex(null)}
              >
                <Card className="h-full bg-white shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden border-t-4 border-red-500">
                  <CardContent className="flex flex-col items-center p-8">
                    <motion.div
                      className="p-4 rounded-full bg-red-100 text-red-600 mb-6"
                      whileHover={{ scale: 1.2, rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      {reason.icon}
                    </motion.div>
                    <h3 className="text-2xl font-semibold mb-4 text-red-600">{reason.title}</h3>
                    <p className="text-center text-gray-600 mb-4">{reason.description}</p>
                    <AnimatePresence>
                      {hoveredIndex === index && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.2 }}
                          className="mt-4 flex items-center text-red-500"
                        >
                          <Heart className="mr-2 h-5 w-5" />
                          <span className="text-sm font-medium">{reason.highlight}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Values Section with Enhanced Visibility */}
      <div className="bg-gradient-to-br from-red-600 to-red-700 pt-32 pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Enhanced Background Animation for Values Section */}
        <motion.div
          className="absolute inset-0 opacity-20"
          animate={{ 
            backgroundPosition: ["0% 0%", "100% 100%"],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse"
          }}
          style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.4) 0%, transparent 60%)`,
          }}
        />

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-center mb-16 text-white"
          >
            Nuestros Valores de Entrega
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                whileHover={{ scale: 1.03 }}
              >
                <Card className="h-full bg-white shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden border border-red-100">
                  <CardContent className="flex flex-col items-center p-8">
                    <motion.div
                      className="p-4 rounded-full bg-red-100 text-red-600 mb-6"
                      whileHover={{ scale: 1.2, rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      {value.icon}
                    </motion.div>
                    <h3 className="text-2xl font-semibold mb-4 text-red-600">{value.title}</h3>
                    <p className="text-center text-gray-600">{value.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
