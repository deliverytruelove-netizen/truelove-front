import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import img from "@/src/assets/img/image2.jpeg";
export default function PromotionalSection() {
  return (
    <motion.div
      className="flex w-full p-4 mt-4 bg-gray-100 rounded-lg"
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.5 }}
    >
      <div className="w-1/2 p-4 flex flex-col justify-center items-center">
        <h3 className="text-3xl font-bold text-center text-blue-600 mb-2">
          ¡Vive la experiencia TRUE LOVER!
        </h3>
        <p className="text-lg text-center text-gray-700">
          Gana dinero repartiendo con la empresa líder de delivery en
          Latinoamérica.
        </p>
      </div>
      <div className="w-1/2 flex justify-center items-center">
        <div className="overflow-hidden rounded-full w-3/4 h-3/4 flex justify-center items-center">
          <Image
            className="object-cover w-full h-full"
            src={img}
            alt="promotional image"
            width={300}
            height={300}
          />
        </div>
      </div>
    </motion.div>
  );
}

