'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import RegistrationForm from './components/RegisterForm'
import PromotionalSection from './components/SeccionHome'
import Footer from '@/components/Footer'
import Repart from "@/src/assets/img/image.png"

export default function Page() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-2">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-16">
            <div className="hidden lg:block w-full lg:w-1/2 py-24">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-12"
              >
                <h1 className="text-5xl lg:text-6xl font-bold tracking-tight">
                  ¡Registrate Ya!
                </h1>
                <p className="text-gray-600 text-xl mt-4">
                  Es rápido y sencillo.
                </p>
              </motion.div>
              
              <motion.div 
                className="relative"
                initial={{ opacity: 0, x: -50 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <Image 
                  src={Repart} 
                  alt="Ilustración de registro"
                  width={600}
                  height={600}
                  className="w-full max-w-[500px] h-auto"
                  priority
                />
              </motion.div>
            </div>
            
            <motion.div 
              className="w-full"
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            >
              <RegistrationForm />
            </motion.div>
          </div>
        </div>

        <div className="hidden lg:block mt-20">
          <PromotionalSection />
        </div>
        
        <Footer />
      </div> 
    </div>
  )
}

