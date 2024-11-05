"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import Fondo from '@/public/fondo.png'

export default function About() {
  const [formData, setFormData] = useState({
    name: "",
    lastName: "",
    businessType: "",
    phone: "+51 ",
    email: ""
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    if (name === 'phone') {
      const numbersOnly = value.replace(/\D/g, "").slice(2)
      if (numbersOnly.length <= 9) {
        setFormData(prev => ({ ...prev, phone: "+51 " + numbersOnly }))
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const imageStyle = {
    backgroundImage: `url(${Fondo.src})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    width: '100%',
    height: '100%',
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="relative min-h-screen flex items-start justify-end py-10 px-4"
      style={imageStyle}
    >
      {/* Texto superpuesto */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
         className="absolute top-1/4 left-11 transform -translate-x-12 text-center"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
          Haz crecer tu negocio con nosotros
        </h1>
        <p className="mt-4 text-xl text-white drop-shadow-lg">
          Únete a nuestra red de establecimientos y alcanza a más clientes
        </p>
      </motion.div>

      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="max-w-lg w-full bg-white/95 backdrop-blur-sm p-8 rounded-lg shadow-xl"
      >
        <motion.h2
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-2xl font-bold text-gray-800 mb-6 text-center"
        >
          ¡Registra tu local ahora!
        </motion.h2>

        <form className="space-y-6">
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="space-y-2"
          >
            <label className="block text-sm font-medium text-gray-700">Nombre *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Ingrese su nombre"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white/50 backdrop-blur-sm 
                       text-gray-900 placeholder-gray-500
                       focus:ring-2 focus:ring-[#f34739] focus:border-transparent
                       transition-colors duration-200"
            />
          </motion.div>

          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="space-y-2"
          >
            <label className="block text-sm font-medium text-gray-700">Apellido *</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              placeholder="Ingrese su apellido"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white/50 backdrop-blur-sm 
                       text-gray-900 placeholder-gray-500
                       focus:ring-2 focus:ring-[#f34739] focus:border-transparent
                       transition-colors duration-200"
            />
          </motion.div>

          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="space-y-2"
          >
            <label className="block text-sm font-medium text-gray-700">Tipo de negocio *</label>
            <select
              name="businessType"
              value={formData.businessType}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white/50 backdrop-blur-sm 
                       text-gray-900
                       focus:ring-2 focus:ring-[#f34739] focus:border-transparent
                       transition-colors duration-200"
            >
              <option value="">Seleccione el tipo de negocio</option>
              <option value="Restaurante">Restaurante</option>
              <option value="Cafetería">Cafetería</option>
              <option value="Bar">Bar</option>
              <option value="Tienda">Tienda</option>
              <option value="Hotel">Hotel</option>
            </select>
          </motion.div>

          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="space-y-2"
          >
            <label className="block text-sm font-medium text-gray-700">Teléfono de contacto *</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              placeholder="Ingrese su teléfono"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white/50 backdrop-blur-sm 
                       text-gray-900 placeholder-gray-500
                       focus:ring-2 focus:ring-[#f34739] focus:border-transparent
                       transition-colors duration-200"
              maxLength={13}
            />
          </motion.div>

          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="space-y-2"
          >
            <label className="block text-sm font-medium text-gray-700">Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Ingrese su email"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white/50 backdrop-blur-sm 
                       text-gray-900 placeholder-gray-500
                       focus:ring-2 focus:ring-[#f34739] focus:border-transparent
                       transition-colors duration-200"
            />
          </motion.div>

          <motion.button
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.9 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full py-3 px-4 bg-[#f34739] text-white font-semibold rounded-lg
                     shadow-lg hover:bg-[#e03e31] 
                     transition-all duration-200
                     focus:outline-none focus:ring-2 focus:ring-[#f34739] focus:ring-offset-2"
          >
            Comenzar Ahora
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  )
}