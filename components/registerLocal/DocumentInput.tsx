'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { fetchDocumentInfo } from '@/utils/api';

// Definir tipos para DNI y RUC
interface DNIDocument {
  type: 'dni';
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
}

interface RUCDocument {
  type: 'ruc';
  ruc: string;
  razonSocial: string;
  estado: string;
  condicion: string;
}

type DocumentData = DNIDocument | RUCDocument;

// Definir la interfaz para los props
interface DocumentInputProps {
  documentType: string;
  documentNumber: string;
  onDocumentTypeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onDocumentNumberChange: (number: string) => void;
  onDataFetched: (data: DocumentData) => void;
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
  setIsLoading,
}: DocumentInputProps) {
  // Manejar el cambio en el número de documento
  const handleDocumentNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e || !e.target) return;

    const value = e.target.value.replace(/\D/g, '');
    onDocumentNumberChange(value);

    // Validar longitud del número de documento y buscar datos
    if (
      (documentType === 'DNI' && value.length === 8) ||
      (documentType === 'RUC' && value.length === 11)
    ) {
      fetchDocumentData(value);
    }
  };

  // Función para obtener los datos del documento
  const fetchDocumentData = async (value: string) => {
    setIsLoading(true);
    setError('');

    try {
      const data = await fetchDocumentInfo(
        documentType.toLowerCase() as 'dni' | 'ruc',
        value
      );

      // Ajustar la estructura según el tipo de documento
      if (documentType === 'DNI') {
        const formattedData: DNIDocument = {
          type: 'dni',
          nombres: data.nombres,
          apellidoPaterno: data.apellidoPaterno,
          apellidoMaterno: data.apellidoMaterno,
        };
        onDataFetched(formattedData);
      } else if (documentType === 'RUC') {
        const formattedData: RUCDocument = {
          type: 'ruc',
          ruc: data.ruc,
          razonSocial: data.razonSocial,
          estado: data.estado,
          condicion: data.condicion,
        };
        onDataFetched(formattedData);
      }
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

  // Manejar el cambio en el tipo de documento
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!e || !e.target) return;
    onDocumentTypeChange(e);
  };

  return (
    <>
      {/* Selección del tipo de documento */}
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

      {/* Input para el número de documento */}
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
