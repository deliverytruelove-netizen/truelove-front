"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Lok from "@/public/img/lok.jpg";
import Pre from "@/public/img/pre.jpg";
import Deli from "@/public/img/deli.jpg";

export default function Component() {
  const cardAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.2,
      },
    }),
  };

  const cards = [
    {
      title: "Entrega Sin Retrasos",
      image: Lok,
      description: "Asegura que cada pedido llegue a tiempo, siempre.",
    },
    {
      title: "Productos Confiables",
      image: Pre,
      description: "Garantizamos calidad en cada entrega para tus clientes.",
    },
    {
      title: "Cobertura Ampliada",
      image: Deli,
      description: "Llega a todas las regiones sin preocuparte por distancias.",
    },
  ];

  return (
    <div className="flex flex-col bg-white min-h-screen justify-center items-center text-center p-4 md:p-8">
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 text-gray-800">
        Únete y <span className="text-[#D9043D]">Crece</span> con Nosotros
      </h1>
      <p className="text-xl md:text-2xl max-w-3xl mx-auto mb-12">
        Descubre cómo nuestra plataforma de entrega puede impulsar tu negocio al
        siguiente nivel.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
        {cards.map((card, index) => (
          <motion.div
            key={index}
            className="group relative flex flex-col items-center bg-white rounded-xl p-6 
                       transition-all duration-300 ease-in-out
                       hover:translate-y-[-8px] hover:shadow-xl
                      shadow-[0_5px_10px_rgba(123,_8,_61,_0.7)] "
            variants={cardAnimation}
            initial="hidden"
            whileInView="visible"
            custom={index}
          >
            <h2 className="font-bold text-xl mb-6 text-gray-800 group-hover:text-[#D9043D] transition-colors duration-300">
              {card.title}
            </h2>
            <div className="w-full aspect-square relative mb-6 overflow-hidden rounded-xl">
              <Image
                src={card.image}
                alt={card.title}
                fill
                className="object-cover transform group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <p className="font-serif text-sm text-gray-600 group-hover:text-gray-800 transition-colors duration-300">
              {card.description}
            </p>
          </motion.div>
        ))}
      </div>

      <button className='mt-12 px-8  py-4 w-full sm:w-fit rounded-full mr-4 bg-gradient-to-br bg-[#D9043D] shadow-lg shadow-red-500/50 ... hover:bg-slate-100 text-white font-bold hover:text-red-600'>
          Empezar Ahora
        </button>
    </div>
  );
}
