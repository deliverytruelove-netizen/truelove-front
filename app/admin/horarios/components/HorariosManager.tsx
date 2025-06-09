// app\admin\horarios\components\HorariosManager.tsx
import React, { useState } from 'react';
import { GruposList } from './GruposList';
import { GrupoForm } from './GrupoForm';
import { CalendarioVista } from './CalendarioVista';
import type { HorarioGrupo } from '../types/horarios.types';

export function HorariosManager() {
  const [currentView, setCurrentView] = useState<'list' | 'form' | 'calendar'>('list');
  const [currentGrupo, setCurrentGrupo] = useState<HorarioGrupo | undefined>(undefined);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleEdit = (grupo: HorarioGrupo) => {
    setCurrentGrupo(grupo);
    setCurrentView('form');
  };

  const handleView = (grupo: HorarioGrupo) => {
    setCurrentGrupo(grupo);
    setCurrentView('calendar');
  };

  const handleNew = () => {
    setCurrentGrupo(undefined);
    setCurrentView('form');
  };

  const handleBack = () => {
    setCurrentView('list');
    setCurrentGrupo(undefined);
  };

  const handleSave = () => {
    setCurrentView('list');
    setCurrentGrupo(undefined);
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
           Horarios de Motorizados
        </h1>
        <p className="text-gray-600">
          Administra los horarios de trabajo de motorizados 
        </p>
      </div>

      {currentView === 'list' && (
        <GruposList 
          onEdit={handleEdit}
          onView={handleView}
          onNew={handleNew} 
          refreshTrigger={refreshTrigger} 
        />
      )}
      
      {currentView === 'form' && (
        <GrupoForm 
          grupo={currentGrupo} 
          onCancel={handleBack} 
          onSave={handleSave} 
        />
      )}
      
      {currentView === 'calendar' && currentGrupo && (
        <CalendarioVista 
          grupo={currentGrupo} 
          onBack={handleBack} 
        />
      )}
    </div>
  );
}