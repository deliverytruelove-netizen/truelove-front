'use client'

import { useState } from 'react';
import { DetallesSocio } from '@/app/admin/socios/types/Socios.types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { User, Briefcase, MapPin, CreditCard, Mail, Phone, Calendar, Building } from 'lucide-react'

interface DetallesSocioModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: DetallesSocio | undefined | null;
  onAprobar: (id: number) => void;
}

interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}

const InfoItem = ({ icon, label, value }: InfoItemProps) => (
  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
    <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600">
      {icon}
    </div>
    <div className="flex-1">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  </div>
);

const TabButton = ({ 
  isActive, 
  icon, 
  label, 
  onClick 
}: { 
  isActive: boolean; 
  icon: React.ReactNode; 
  label: string; 
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
      isActive 
        ? 'bg-white shadow-md text-red-600' 
        : 'hover:bg-white/50 text-gray-600'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

export function DetallesSocioModal({ isOpen, onClose, data, onAprobar }: DetallesSocioModalProps) {
  const [activeTab, setActiveTab] = useState<'personal' | 'negocio' | 'establecimiento' | 'bancarios'>('personal');
  const [error, setError] = useState<string | null>(null);

  if (!data) return null;

  const handleAprobar = () => {
    if (!data.id) {
      setError('Error: ID de socio no encontrado');
      return;
    }
    onAprobar(data.id);
  };

  const handleCloseError = () => {
    setError(null);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'personal':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoItem 
              icon={<User className="w-5 h-5" />} 
              label="Nombre Completo" 
              value={`${data.personal.name} ${data.personal.lastName}`} 
            />
            <InfoItem 
              icon={<Mail className="w-5 h-5" />} 
              label="Correo Electrónico" 
              value={data.personal.email} 
            />
            <InfoItem 
              icon={<Phone className="w-5 h-5" />} 
              label="Teléfono" 
              value={data.personal.phone} 
            />
            <InfoItem 
              icon={<Building className="w-5 h-5" />} 
              label="Tipo de Negocio" 
              value={data.personal.businessType} 
            />
            <InfoItem 
              icon={<Calendar className="w-5 h-5" />} 
              label="Fecha de Registro" 
              value={new Date(data.personal.created_at).toLocaleString()} 
            />
          </div>
        );
      case 'negocio':
        return data.businessData ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoItem 
              icon={<Building className="w-5 h-5" />} 
              label="RUC" 
              value={data.businessData.ruc} 
            />
            <InfoItem 
              icon={<Briefcase className="w-5 h-5" />} 
              label="Razón Social" 
              value={data.businessData.razon_social} 
            />
            {data.business && (
              <>
                <InfoItem 
                  icon={<Building className="w-5 h-5" />} 
                  label="Total Sucursales" 
                  value={data.business.total_sucursales} 
                />
                <InfoItem 
                  icon={<Phone className="w-5 h-5" />} 
                  label="Método de Contacto" 
                  value={data.business.metodo_contacto} 
                />
              </>
            )}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No hay datos del negocio disponibles</p>
        );
      case 'establecimiento':
        return data.establishment ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoItem 
              icon={<Building className="w-5 h-5" />} 
              label="Nombre" 
              value={data.establishment.nombre_establecimiento} 
            />
            <InfoItem 
              icon={<MapPin className="w-5 h-5" />} 
              label="Dirección" 
              value={data.establishment.direccion_completa} 
            />
            <InfoItem 
              icon={<MapPin className="w-5 h-5" />} 
              label="Ciudad" 
              value={data.establishment.ciudad} 
            />
            <InfoItem 
              icon={<MapPin className="w-5 h-5" />} 
              label="Código Postal" 
              value={data.establishment.codigo_postal} 
            />
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No hay datos del establecimiento disponibles</p>
        );
      case 'bancarios':
        return data.bankData ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoItem 
              icon={<Building className="w-5 h-5" />} 
              label="Banco" 
              value={data.bankData.nombre_banco} 
            />
            <InfoItem 
              icon={<CreditCard className="w-5 h-5" />} 
              label="Tipo de Cuenta" 
              value={data.bankData.tipo_cuenta} 
            />
            <InfoItem 
              icon={<User className="w-5 h-5" />} 
              label="Titular" 
              value={data.bankData.titular_cuenta} 
            />
            <InfoItem 
              icon={<CreditCard className="w-5 h-5" />} 
              label="Número de Cuenta" 
              value={data.bankData.numero_cuenta} 
            />
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No hay datos bancarios disponibles</p>
        );
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-t-lg">
          <DialogTitle className="text-2xl font-bold">Detalles del Socio</DialogTitle>
          {/* <p className="text-blue-100">ID: {data.id}</p> */}
        </DialogHeader>
        
        <div className="p-6">
          <div className="flex flex-wrap gap-2 p-2 bg-gray-100 rounded-lg mb-6">
            <TabButton
              isActive={activeTab === 'personal'}
              icon={<User className="w-5 h-5" />}
              label="Personal"
              onClick={() => setActiveTab('personal')}
            />
            <TabButton
              isActive={activeTab === 'negocio'}
              icon={<Briefcase className="w-5 h-5" />}
              label="Negocio"
              onClick={() => setActiveTab('negocio')}
            />
            <TabButton
              isActive={activeTab === 'establecimiento'}
              icon={<MapPin className="w-5 h-5" />}
              label="Establecimiento"
              onClick={() => setActiveTab('establecimiento')}
            />
            <TabButton
              isActive={activeTab === 'bancarios'}
              icon={<CreditCard className="w-5 h-5" />}
              label="Bancarios"
              onClick={() => setActiveTab('bancarios')}
            />
          </div>

          <div className="mt-6">
            {renderContent()}
          </div>
        </div>

        <DialogFooter className="p-6 bg-gray-50 border-t">
          <Button onClick={onClose} variant="outline">
            Cerrar
          </Button>
          <Button 
            onClick={handleAprobar}
            disabled={data.aprobado}
            className={`${data.aprobado ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'} text-white transition-colors duration-200`}
          >
            {data.aprobado ? 'Aprobado' : 'Aprobar Socio'}
          </Button>
        </DialogFooter>
      </DialogContent>
      </Dialog>

      <AlertDialog open={!!error} onOpenChange={handleCloseError}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Error</AlertDialogTitle>
            <AlertDialogDescription>
              {error}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button onClick={handleCloseError} variant="outline">
              OK
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

