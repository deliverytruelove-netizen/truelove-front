// app\socio\admin\pos\page.tsx
"use client"

import React, { useState, useEffect } from 'react';
import { CreditCard, FileText, Save, AlertCircle, CheckCircle2, Settings } from 'lucide-react';

interface POSSettings {
  posToDriver: number;
  entrega_documento_venta: number;
}

const POSAdminPage: React.FC = () => {
  const [settings, setSettings] = useState<POSSettings>({
    posToDriver: 0,
    entrega_documento_venta: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      
      // Intentar obtener el token de diferentes fuentes como en tu perfil
      let token = localStorage.getItem('auth_token');
      if (!token) {
        const cookieToken = document.cookie
          .split("; ")
          .find((row) => row.startsWith("authToken="))
          ?.split("=")[1];
        token = cookieToken ?? null;
      }
      
      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_WEB}/negocio/pos-settings`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Error ${response.status}: Error al cargar configuración`);
      }

      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error('Error loading POS settings:', error);
      setMessage({ type: 'error', text: 'Error al cargar la configuración' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      let token = localStorage.getItem('auth_token');
      if (!token) {
        token = document.cookie
          .split("; ")
          .find((row) => row.startsWith("authToken="))
          ?.split("=")[1] ?? null;
      }
      
      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_WEB}/negocio/pos-settings`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Error ${response.status}: Error al guardar configuración`);
      }
      
      setMessage({ type: 'success', text: 'Configuración actualizada correctamente' });
      
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error saving POS settings:', error);
      setMessage({ type: 'error', text: 'Error al guardar la configuración' });
    } finally {
      setSaving(false);
    }
  };

  const getPOSLabel = (value: number) => {
    switch (value) {
      case 0: return 'No facilitar POS';
      case 1: return 'POS Visa';
      case 2: return 'POS Estilos';
      case 3: return 'Ambos POS';
      default: return 'No especificado';
    }
  };

  const getDocumentLabel = (value: number) => {
    switch (value) {
      case 0: return 'No emito documentos de venta';
      case 1: return 'Sí emito documentos de venta';
      default: return 'No especificado';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-100 rounded-lg">
              <Settings className="h-6 w-6 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Configuración POS</h1>
          </div>
         
        </div>

        {/* Mensajes de alerta */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {/* Tarjeta de Configuración POS */}
          <div className="shadow-lg border-0 bg-white/80 backdrop-blur-sm rounded-lg">
            <div className="p-6 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Configuración POS</h2>
                  <p className="text-sm text-gray-600">
                    Gestiona el acceso del repartidor a tu máquina POS
                  </p>
                </div>
              </div>
            </div>
            <div className="px-6 pb-6 space-y-6">
              {/* Estado actual del POS */}
              <div className="p-4 bg-gray-50 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Estado actual:</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {getPOSLabel(settings.posToDriver)}
                    </p>
                  </div>
                  <div className={`p-2 rounded-full ${
                    settings.posToDriver === 0 
                      ? 'bg-gray-100' 
                      : settings.posToDriver === 1 
                        ? 'bg-green-100' 
                        : 'bg-blue-100'
                  }`}>
                    <CreditCard className={`h-5 w-5 ${
                      settings.posToDriver === 0 
                        ? 'text-gray-500' 
                        : settings.posToDriver === 1 
                          ? 'text-green-600' 
                          : 'text-blue-600'
                    }`} />
                  </div>
                </div>
              </div>

              {/* Selección de POS */}
              <div className="space-y-2">
                <label htmlFor="posToDriver" className="text-sm font-medium block">
                  ¿Deseas facilitar tu máquina POS al driver?
                </label>
                <select
                  id="posToDriver"
                  value={settings.posToDriver.toString()}
                  onChange={(e) => {
                    setSettings(prev => ({
                      ...prev,
                      posToDriver: parseInt(e.target.value, 10),
                    }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="0">No facilitar POS</option>
                  <option value="1">POS Visa</option>
                  <option value="2">POS Estilos</option>
                  <option value="3">Ambos</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Esta opción permite que el repartidor use tu dispositivo para cobros con tarjeta a los clientes.
                </p>
              </div>
            </div>
          </div>

          {/* Tarjeta de Documentos de Venta */}
          <div className="shadow-lg border-0 bg-white/80 backdrop-blur-sm rounded-lg">
            <div className="p-6 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FileText className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Documentos de Venta</h2>
                  <p className="text-sm text-gray-600">
                    Configura la emisión de facturas y boletas
                  </p>
                </div>
              </div>
            </div>
            <div className="px-6 pb-6 space-y-6">
              {/* Estado actual de documentos */}
              <div className="p-4 bg-gray-50 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Estado actual:</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {getDocumentLabel(settings.entrega_documento_venta)}
                    </p>
                  </div>
                  <div className={`p-2 rounded-full ${
                    settings.entrega_documento_venta === 0 
                      ? 'bg-gray-100' 
                      : 'bg-green-100'
                  }`}>
                    <FileText className={`h-5 w-5 ${
                      settings.entrega_documento_venta === 0 
                        ? 'text-gray-500' 
                        : 'text-green-600'
                    }`} />
                  </div>
                </div>
              </div>

              {/* Selección de documentos */}
              <div className="space-y-2">
                <label htmlFor="entrega_documento_venta" className="text-sm font-medium block">
                  ¿Emites documentos de venta (facturas/boletas)?
                </label>
                <select
                  id="entrega_documento_venta"
                  value={settings.entrega_documento_venta.toString()}
                  onChange={(e) => {
                    setSettings(prev => ({
                      ...prev,
                      entrega_documento_venta: parseInt(e.target.value, 10),
                    }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="0">No emito documentos de venta</option>
                  <option value="1">Sí emito documentos de venta</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Esta opción indica si tu negocio puede emitir facturas o boletas para las entregas. 
                  Ideal para carritos ambulantes que no cuentan con sistema de facturación.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Botón de guardar */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-3 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
          >
            <Save className="h-5 w-5" />
            {saving ? 'Guardando...' : 'Guardar Configuración'}
          </button>
        </div>

        {/* Sección de información */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <AlertCircle className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Información importante</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Los cambios en la configuración POS afectarán a todas las entregas futuras</li>
                <li>• Si facilitas tu POS, asegúrate de que esté disponible durante las entregas</li>
                <li>• La emisión de documentos de venta es importante para la formalización de tu negocio</li>
                <li>• Puedes cambiar estas configuraciones en cualquier momento</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default POSAdminPage;
