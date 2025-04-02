// components\registerLocal\PersonalInfo.tsx
import React from 'react';
import { motion } from 'framer-motion';

interface PersonalInfoProps {
  documentType: string;
  name: string;
  lastName: string;
  businessName: string;
  isFieldsLocked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function PersonalInfo({
  documentType,
  name,
  lastName,
  businessName,
  isFieldsLocked,
  onChange
}: PersonalInfoProps) {
  if (documentType === 'RUC') {
    return (
      <motion.div
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="space-y-2"
      >
        <label className="block text-sm font-medium text-gray-700">Razón Social *</label>
        <input
          type="text"
          name="businessName"
          value={businessName}
          onChange={onChange}
          required
          disabled={isFieldsLocked}
          placeholder="Ingrese la razón social"
          className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white/50 backdrop-blur-sm 
                   text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-[#f34739] focus:border-transparent
                   transition-colors duration-200 disabled:bg-gray-100 disabled:text-gray-500"
        />
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="space-y-2"
      >
        <label className="block text-sm font-medium text-gray-700">Nombre *</label>
        <input
          type="text"
          name="name"
          value={name}
          onChange={onChange}
          required
          disabled={isFieldsLocked && documentType === 'DNI'}
          placeholder="Ingrese su nombre"
          className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white/50 backdrop-blur-sm 
                   text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-[#f34739] focus:border-transparent
                   transition-colors duration-200 disabled:bg-gray-100 disabled:text-gray-500"
        />
      </motion.div>

      <motion.div
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="space-y-2"
      >
        <label className="block text-sm font-medium text-gray-700">Apellido *</label>
        <input
          type="text"
          name="lastName"
          value={lastName}
          onChange={onChange}
          required
          disabled={isFieldsLocked && documentType === 'DNI'}
          placeholder="Ingrese su apellido"
          className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white/50 backdrop-blur-sm 
                   text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-[#f34739] focus:border-transparent
                   transition-colors duration-200 disabled:bg-gray-100 disabled:text-gray-500"
        />
      </motion.div>
    </>
  );
}