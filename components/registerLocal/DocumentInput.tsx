'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { fetchDocumentInfo } from '@/utils/api';

interface DocumentInputProps {
  documentType: string;
  documentNumber: string;
  onDocumentTypeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onDocumentNumberChange: (number: string) => void;
  onDataFetched: (data: any) => void;
  setError: (error: string) => void;
  setIsLoading: (loading: boolean) => void;
}

export default function DocumentInput({
  documentType,
  documentNumber,
  onDocumentTypeChange,
  onDocumentNumberChange,
  onDataFetched,
  setError,
  setIsLoading
}: DocumentInputProps) {
  const handleDocumentNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e || !e.target) return;
    
    const value = e.target.value.replace(/\D/g, '');
    onDocumentNumberChange(value);

    // Validate document number length and fetch data
    if ((documentType === 'DNI' && value.length === 8) || 
        (documentType === 'RUC' && value.length === 11)) {
      fetchDocumentData(value);
    }
  };

  const fetchDocumentData = async (value: string) => {
    setIsLoading(true);
    setError('');
    
    try {
      const data = await fetchDocumentInfo(
        documentType.toLowerCase() as 'dni' | 'ruc',
        value
      );
      onDataFetched(data);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Error al validar el documento');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!e || !e.target) return;
    onDocumentTypeChange(e);
  };

  return (
    <>
      <motion.div
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="space-y-2"
      >
        <label className="block text-sm font-medium text-gray-700">Tipo de Documento *</label>
        <select
          name="documentType"
          value={documentType}
          onChange={handleTypeChange}
          required
          className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white/50 backdrop-blur-sm 
                   text-gray-900 focus:ring-2 focus:ring-[#f34739] focus:border-transparent
                   transition-colors duration-200"
        >
          <option value="">Seleccione el tipo de documento</option>
          <option value="DNI">DNI</option>
          <option value="RUC">RUC</option>
          <option value="CARNET_EXTRANJERIA">Carnet de Extranjería</option>
        </select>
      </motion.div>

      <motion.div
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="space-y-2"
      >
        <label className="block text-sm font-medium text-gray-700">Número de Documento *</label>
        <input
          type="text"
          name="documentNumber"
          value={documentNumber}
          onChange={handleDocumentNumberChange}
          required
          maxLength={documentType === 'RUC' ? 11 : 8}
          placeholder="Ingrese su número de documento"
          className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white/50 backdrop-blur-sm 
                   text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-[#f34739] focus:border-transparent
                   transition-colors duration-200"
        />
      </motion.div>
    </>
  );
}