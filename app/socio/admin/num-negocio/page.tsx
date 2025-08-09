// app\socio\admin\num-negocio\page.tsx
"use client"

import React, { useState, useEffect } from 'react';
import { Smartphone, Save, AlertCircle, CheckCircle2,  CreditCard, Phone } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
interface PagoDigitalSettings {
  tipo_pago_digital: number;
  numero_pago_digital: string;
}

const NumeroDigitalPage: React.FC = () => {
  const [settings, setSettings] = useState<PagoDigitalSettings>({
    tipo_pago_digital: 0,
    numero_pago_digital: '',
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
      
      // Intentar obtener el token de diferentes fuentes
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
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_WEB}/negocio/pago-digital`, {
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
      setSettings({
        tipo_pago_digital: data.tipo_pago_digital,
        numero_pago_digital: data.numero_pago_digital || '',
      });
    } catch (error) {
      console.error('Error loading payment settings:', error);
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
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_WEB}/negocio/pago-digital`, {
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
      console.error('Error saving payment settings:', error);
      setMessage({ type: 'error', text: 'Error al guardar la configuración' });
    } finally {
      setSaving(false);
    }
  };

  const getTipoPagoLabel = (value: number) => {
    switch (value) {
      case 0: return 'No usar pago digital';
      case 1: return 'Yape';
      case 2: return 'Plin';
      default: return 'No especificado';
    }
  };

  const getTipoPagoColor = (value: number) => {
    switch (value) {
      case 0: return 'text-gray-500';
      case 1: return 'text-purple-600';
      case 2: return 'text-blue-600';
      default: return 'text-gray-500';
    }
  };

  const getTipoPagoBgColor = (value: number) => {
    switch (value) {
      case 0: return 'bg-gray-100';
      case 1: return 'bg-purple-100';
      case 2: return 'bg-blue-100';
      default: return 'bg-gray-100';
    }
  };

  const handleTipoPagoChange = (newTipo: number) => {
    setSettings(prev => ({
      ...prev,
      tipo_pago_digital: newTipo,
      // Limpiar el número si se selecciona "No usar pago digital"
      numero_pago_digital: newTipo === 0 ? '' : prev.numero_pago_digital
    }));
  };

  const handleNumeroChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Solo números
    if (value.length <= 9) {
      setSettings(prev => ({
        ...prev,
        numero_pago_digital: value
      }));
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
              <Smartphone className="h-6 w-6 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Número Digital</h1>
          </div>
          <p className="text-gray-600">
            Configura tu número de teléfono para recibir pagos digitales (Yape o Plin)
          </p>
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

        <div className="grid gap-6">
          {/* Tarjeta de Configuración de Pago Digital */}
          <div className="shadow-lg border-0 bg-white/80 backdrop-blur-sm rounded-lg">
            <div className="p-6 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CreditCard className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Configuración de Pago Digital</h2>
                  <p className="text-sm text-gray-600">
                    Configura tu método de pago digital preferido
                  </p>
                </div>
              </div>
            </div>
            <div className="px-6 pb-6 space-y-6">
              {/* Estado actual del pago digital */}
              <div className="p-4 bg-gray-50 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Método actual:</p>
                    <p className={`text-lg font-semibold ${getTipoPagoColor(settings.tipo_pago_digital)}`}>
                      {getTipoPagoLabel(settings.tipo_pago_digital)}
                    </p>
                    {settings.numero_pago_digital && settings.tipo_pago_digital !== 0 && (
                      <p className="text-sm text-gray-600 mt-1">
                        Número: {settings.numero_pago_digital}
                      </p>
                    )}
                  </div>
                  <div className={`p-2 rounded-full ${getTipoPagoBgColor(settings.tipo_pago_digital)}`}>
                    <Smartphone className={`h-5 w-5 ${getTipoPagoColor(settings.tipo_pago_digital)}`} />
                  </div>
                </div>
              </div>

              {/* Selección de tipo de pago */}
              <div className="space-y-2">
                <label htmlFor="tipo_pago_digital" className="text-sm font-medium block">
                  Tipo de pago digital
                </label>
                <Select
                  value={settings.tipo_pago_digital.toString()}
                  onValueChange={(value) => handleTipoPagoChange(parseInt(value, 10))}
                >
                  <SelectTrigger className="w-full px-3 py-2 ">
                    <SelectValue placeholder="Selecciona un método de pago" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">No usar pago digital</SelectItem>
                    <SelectItem value="1">Yape</SelectItem>
                    <SelectItem value="2">Plin</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  Selecciona el método de pago digital que prefieres usar para recibir pagos.
                </p>
              </div>

              {/* Campo de número de teléfono (solo si no es "No usar") */}
              {settings.tipo_pago_digital !== 0 && (
                <div className="space-y-2">
                  <label htmlFor="numero_pago_digital" className="text-sm font-medium block">
                    Número de teléfono para {getTipoPagoLabel(settings.tipo_pago_digital)}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-4 w-4 text-gray-400" />
                    </div>
                    <Input
                      type="text"
                      id="numero_pago_digital"
                      value={settings.numero_pago_digital}
                      onChange={handleNumeroChange}
                      placeholder="987654321"
                      className="w-full pl-10 pr-3 py-2 "
                      maxLength={9}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Ingresa el número de teléfono asociado a tu cuenta de {getTipoPagoLabel(settings.tipo_pago_digital)} (9 dígitos).
                    Este puede ser diferente al teléfono principal de tu negocio.
                  </p>
                  {settings.numero_pago_digital && settings.numero_pago_digital.length !== 9 && (
                    <p className="text-xs text-red-500 mt-1">
                      El número debe tener exactamente 9 dígitos.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Botón de guardar */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleSave}
            disabled={saving || (settings.tipo_pago_digital !== 0 && settings.numero_pago_digital.length !== 9)}
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
                <li>• El número de teléfono para pagos digitales puede ser diferente al teléfono principal de tu negocio</li>
                <li>• Asegúrate de que el número esté asociado a tu cuenta de Yape o Plin</li>
                <li>• Los clientes podrán ver este número cuando seleccionen el método de pago</li>
                <li>• Puedes cambiar esta configuración en cualquier momento</li>
                <li>• Si no usas pagos digitales, selecciona No usar pago digital</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NumeroDigitalPage;