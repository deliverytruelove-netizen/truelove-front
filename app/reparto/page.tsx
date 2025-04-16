// app\reparto\page.tsx
'use client'
import React, { Suspense } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import RegistrationForm from './components/RegisterForm'
import PromotionalSection from './components/SeccionHome'
import Footer from '@/components/Footer'
import Repart from "@/src/assets/img/ima.png"

function Loading() {
  return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
    </div>
  )
}

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
            <div className="hidden lg:flex lg:w-1/2 flex-col items-start justify-center space-y-16">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="relative z-10"
              >
                <h1 className="text-5xl lg:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-red-400 leading-tight">
                  ¡Regístrate Ya!
                </h1>
                <p className="text-gray-600 text-2xl mt-6 font-light">
                  Es rápido y sencillo.
                </p>
              </motion.div>
              
              <motion.div 
                className="relative w-full"
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <div className="absolute -inset-8 bg-gradient-to-r from-red-100 to-orange-100 blur-3xl opacity-60"></div>
                <Image 
                  src={Repart} 
                  alt="Ilustración de registro"
                  width={800}
                  height={800}
                  className="relative w-full max-w-[700px] h-auto transform hover:scale-105 transition-transform duration-300"
                  priority
                />
              </motion.div>
            </div>
            
            <motion.div 
              className="w-full lg:w-1/2"
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            >
              <Suspense fallback={<Loading />}>
                <RegistrationForm />
              </Suspense>
            </motion.div>
          </div>
        </div>

        <div className="hidden lg:block mt-24">
          <Suspense fallback={<Loading/>}>
            <PromotionalSection />
          </Suspense>
        </div>
        
        <Footer />
      </div> 
    </div>
  )
}