"use client"; // Necesario para componentes en el lado del cliente en Next.js

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Fondo from '@/public/fondo.png';

export default function About() {
  const [phone, setPhone] = useState("+51 ");

  const handlePhoneChange = (e) => {
    const input = e.target.value;
    const numbersOnly = input.replace(/\D/g, "").slice(2); // Quita cualquier no numérico y deja solo 9 dígitos después del prefijo
    if (numbersOnly.length <= 9) {
      setPhone("+51 " + numbersOnly); // Prefijo +51 seguido de un espacio
    }
  };

  const imageStyle = {
    backgroundImage: `url(${Fondo.src})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    width: '100%',
    height: '100%',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="min-h-screen flex items-start justify-end py-10 px-4"
      style={imageStyle}
    >
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="max-w-lg w-full bg-white p-8 rounded-lg shadow-md"
      >
        <motion.h1
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-2xl font-bold text-gray-800 mb-6 text-center"
        >
          ¡Registra tu local ahora!
        </motion.h1>

        <form className="space-y-4">
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <label className="block text-gray-700 font-medium mb-1">Nombre *</label>
            <input
              type="text"
              required
              placeholder="Ingrese su nombre"
              className="w-full text-black p-3 border border-gray-300 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </motion.div>

          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <label className="block text-gray-700 font-medium mb-1">Apellido *</label>
            <input
              type="text"
              required
              placeholder="Ingrese su apellido"
              className="w-full text-black p-3 border border-gray-300 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </motion.div>

          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <label className="block text-gray-700 font-medium mb-1">Tipo de negocio *</label>
            <select
              className="w-full text-black p-3 border border-gray-300 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">Seleccione el tipo de negocio</option>
              <option value="Restaurante">Restaurante</option>
              <option value="Tienda">Tienda</option>
            </select>
          </motion.div>

          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <label className="block text-gray-700 font-medium mb-1">Teléfono de contacto *</label>
            <input
              type="text"
              required
              value={phone}
              onChange={handlePhoneChange}
              placeholder="Ingrese su teléfono"
              className="w-full text-black p-3 border border-gray-300 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
              maxLength={13} // Total de caracteres contando el prefijo +51 y el espacio
            />
          </motion.div>

          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <label className="block text-gray-700 font-medium mb-1">Email</label>
            <input
              type="text"
              required
              placeholder="Ingrese su email"
              className="w-full p-3 border text-black border-gray-300 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </motion.div>

          <motion.button
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.9 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="w-full p-3 mt-4 bg-[#f34739] shadow-lg hover:bg-orange-500 text-gray-200 font-semibold rounded-lg"
          >
            Comenzar Ahora
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
}
