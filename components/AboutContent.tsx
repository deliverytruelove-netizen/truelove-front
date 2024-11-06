'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import Lok from "@/public/img/lok.jpg"
import Pre from "@/public/img/pre.jpg"
import Deli from "@/public/img/deli.jpg"

export default function AboutContent() {
  // Define the animation for the cards
  const cardAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.2 // Delay based on index for a sequential effect
      }
    })
  }

  const cards = [
    {
      title: "Entrega Sin Retrasos",
      image: Lok,
      description: "Asegura que cada pedido llegue a tiempo, siempre."
    },
    {
      title: "Productos Confiables",
      image: Pre,
      description: "Garantizamos calidad en cada entrega para tus clientes."
    },
    {
      title: "Cobertura Ampliada",
      image: Deli,
      description: "Llega a todas las regiones sin preocuparte por distancias."
    }
  ]

  return (
    <div className="flex flex-col bg-[#f34739] min-h-screen justify-center items-center text-center p-4 md:p-8">
      {/* Main title */}
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 text-white">
        Únete y <span className="text-gray-300">Crece</span> con Nosotros
      </h1>
      <p className="text-xl md:text-2xl text-red-100 max-w-3xl mx-auto">
        Descubre cómo nuestra plataforma de entrega puede impulsar tu negocio al siguiente nivel.
      </p>
      
      {/* Images and titles section */}
      <div className="flex flex-col md:flex-row md:space-x-8 space-y-8 md:space-y-0">
        {cards.map((card, index) => (
          <motion.div
            key={index}
            className="flex flex-col items-center w-full md:w-56 text-gray-800 bg-slate-200 rounded-md p-6"
            variants={cardAnimation}
            initial="hidden"
            whileInView="visible"
            custom={index}
          >
            <h2 className="font-bold text-lg mb-2">{card.title}</h2>
            <Image src={card.image} width={200} height={200} alt={card.title} className="rounded-3xl" />
            <p className="font-serif mt-2 text-sm text-center">{card.description}</p>
          </motion.div>
        ))}
      </div>
      
      {/* Action button */}
      <div className="mt-8 w-full md:w-auto">
        <button className='px-6 py-3 w-full md:w-fit rounded-full bg-gradient-to-br from-red-300 to-red-400 shadow-lg shadow-cyan-500/50 hover:bg-slate-200 text-black font-bold transition-all duration-300 hover:shadow-cyan-600/50'>
          Empezar Ahora
        </button>
      </div>
    </div>
  )
}
