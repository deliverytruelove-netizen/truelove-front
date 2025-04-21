"use client"
import Image from "next/image"
import { motion } from "framer-motion"
import img from "@/src/assets/img/ima.png"

export default function PromotionalSection() {
  return (
    <motion.div
      className="flex flex-col md:flex-row w-full p-6 mt-6 bg-gradient-to-r from-gray-100 to-gray-50 rounded-xl shadow-md overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
    >
      <div className="w-full md:w-1/2 p-6 flex flex-col justify-center items-center">
        <motion.h3
          className="text-3xl md:text-4xl font-bold text-center text-[#D9043D] mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          ¡Vive la experiencia TRUE LOVER!
        </motion.h3>
        <motion.p
          className="text-lg md:text-xl text-center text-gray-700 max-w-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          Unete a nuestra comunidad y disfruta de beneficios exclusivos. Conoce a otros motorizados y comparte tus experiencias.
        </motion.p>
        <motion.button
          className="mt-6 px-8 py-3 bg-[#D9043D] text-white font-semibold rounded-full hover:bg-red-700 transition-colors duration-300"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.3 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          ¡Únete ahora!
        </motion.button>
      </div>
      <div className="w-full md:w-1/2 flex justify-center items-center p-4">
        <motion.div
          className="relative overflow-hidden rounded-2xl w-64 h-64 md:w-80 md:h-80 flex justify-center items-center border-4 border-[#D9043D] shadow-lg"
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          whileHover={{ scale: 1.03, rotate: 1 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent z-10"></div>
          <Image
            className="object-cover w-full h-full"
            src={img || "/placeholder.svg"}
            alt="promotional image"
            width={400}
            height={400}
            priority
          />
        </motion.div>
      </div>
    </motion.div>
  )
}
