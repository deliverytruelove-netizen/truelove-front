'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Users, Rocket, Heart } from 'lucide-react'

export default function AboutUs() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const teamMembers = [
    { name: 'Ana García', role: 'CEO', image: '/placeholder.svg?height=100&width=100' },
    { name: 'Carlos Rodríguez', role: 'CTO', image: '/placeholder.svg?height=100&width=100' },
    { name: 'Elena Martínez', role: 'Lead Designer', image: '/placeholder.svg?height=100&width=100' },
  ]

  const values = [
    { icon: <Users className="h-6 w-6" />, title: 'Colaboración', description: 'Trabajamos juntos para lograr grandes cosas' },
    { icon: <Rocket className="h-6 w-6" />, title: 'Innovación', description: 'Siempre buscamos nuevas formas de mejorar' },
    { icon: <Heart className="h-6 w-6" />, title: 'Pasión', description: 'Amamos lo que hacemos y se refleja en nuestro trabajo' },
  ]

  return (
    <div className="min-h-screen bg-white text-gray-800 p-6 md:p-12">
      <motion.h1 
        className="text-4xl md:text-5xl font-bold text-center mb-12 text-red-600"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Acerca de Nosotros
      </motion.h1>

      <motion.div 
        className="max-w-4xl mx-auto text-center mb-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <p className="text-xl mb-6 text-gray-600">
          Somos una empresa innovadora dedicada a transformar ideas en realidad. 
          Nuestro equipo de expertos trabaja incansablemente para ofrecer soluciones 
          creativas y eficientes a nuestros clientes.
        </p>
        <Badge variant="outline" className="text-lg px-4 py-2 bg-red-100 text-red-600 border-red-300">
          Innovando desde 2010
        </Badge>
      </motion.div>

      <motion.h2 
        className="text-3xl font-semibold text-center mb-8 text-red-600"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        Nuestro Equipo
      </motion.h2>

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        {teamMembers.map((member, index) => (
          <motion.div
            key={member.name}
            whileHover={{ scale: 1.05 }}
            onHoverStart={() => setHoveredIndex(index)}
            onHoverEnd={() => setHoveredIndex(null)}
          >
            <Card className="bg-red-100 border-red-200">
              <CardContent className="flex flex-col items-center p-6">
                <Avatar className="w-24 h-24 mb-4">
                  <AvatarImage src={member.image} alt={member.name} />
                  <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <h3 className="text-xl font-semibold mb-2 text-red-700">{member.name}</h3>
                <p className="text-red-600">{member.role}</p>
                {hoveredIndex === index && (
                  <motion.p 
                    className="mt-4 text-sm text-center text-red-600"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    "Comprometido con la excelencia y la innovación en cada proyecto."
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
        Nuestros Valores
      </motion.h2>

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        {values.map((value, index) => (
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