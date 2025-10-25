// app\admin\horarios\components\GruposList.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { fetchGruposHorarios, deleteGrupoHorario } from '../services/horarios.service';
import type { HorarioGrupo } from '../types/horarios.types';
import { 
  Clock, 
  Users, 
  Trash2, 
  Edit, 
  Plus, 
  Calendar,
  Eye,
  User,
  
  AlertTriangle
} from 'lucide-react';
import { confirmAlert, showAlert } from '@/components/ui/DataTable/Alert';

interface GruposListProps {
  onEdit: (grupo: HorarioGrupo) => void;
  onView: (grupo: HorarioGrupo) => void;
  onNew: () => void;
  refreshTrigger?: number;
}

export function GruposList({ onEdit, onView, onNew, refreshTrigger = 0 }: GruposListProps) {
  const [grupos, setGrupos] = useState<HorarioGrupo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadGrupos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchGruposHorarios();
      setGrupos(data);
    } catch (error) {
      setError('No se pudieron cargar los grupos de horarios');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGrupos();
  }, [refreshTrigger, loadGrupos]);

  const confirmDelete = async (id: number, nombre: string) => {
    const result = await confirmAlert({
      title: 'Confirmar eliminación',
      text: `¿Estás seguro de eliminar el grupo "${nombre}"? Esta acción no se puede deshacer.`,
      icon: 'warning',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      try {
        await deleteGrupoHorario(id);
        setGrupos(prev => prev.filter(g => g.id !== id));
        showAlert({
          title: 'Éxito',
          text: 'Grupo de horario eliminado correctamente',
          icon: 'success',
        });
      } catch (error) {
        showAlert({
          title: 'Error',
          text: 'No se pudo eliminar el grupo de horario',
          icon: 'error',
        });
        console.error(error);
      }
    }
  };

  const formatTimeDisplay = (time24: string): string => {
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const formatDiasSemana = (dias: string | string[]) => {
    const diasArray = Array.isArray(dias) ? dias : [dias];
    const diasMap: Record<string, string> = {
      lunes: 'Lun',
      martes: 'Mar', 
      miercoles: 'Mié',
      jueves: 'Jue',
      viernes: 'Vie',
      sabado: 'Sáb',
      domingo: 'Dom'
    };

    if (diasArray.length === 7) return 'Todos los días';
    if (diasArray.length <= 2) return diasArray.map(d => diasMap[d] || d).join(', ');
    
    return `${diasArray.length} días`;
  };

  const getBloqueTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'trabajo': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'descanso': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'almuerzo': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
          <span className="ml-3 text-lg text-gray-600">Cargando grupos de horarios...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <button
            onClick={loadGrupos}
            className="bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-700 px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-white flex-shrink-0" />
            <h2 className="text-base sm:text-xl font-semibold text-white">Grupos de Horarios</h2>
          </div>
          <button
            onClick={onNew}
            className="bg-white text-brand-600 px-4 py-2 rounded-lg hover:bg-brand-50 transition-colors flex items-center justify-center gap-2 font-medium text-sm sm:text-base whitespace-nowrap"
          >
            <Plus className="h-4 w-4 flex-shrink-0" />
            <span>Nuevo Grupo</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-6">
        {grupos.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay grupos de horarios</h3>
            <p className="text-gray-600 mb-6">Crea tu primer grupo de horarios para comenzar</p>
            <button
              onClick={onNew}
              className="bg-brand-600 text-white px-6 py-3 rounded-lg hover:bg-brand-700 transition-colors flex items-center gap-2 mx-auto"
            >
              <Plus className="h-5 w-5" />
              Crear primer grupo
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {grupos.map((grupo) => (
              <div key={grupo.id} className="border border-gray-200 rounded-lg p-4 sm:p-5 hover:shadow-md transition-shadow bg-gray-50">
                {/* Header del grupo */}
                <div className="mb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-base sm:text-lg text-gray-900 break-words">{grupo.nombre}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium self-start sm:self-auto whitespace-nowrap ${
                      grupo.tipo === 'grupal' 
                        ? 'bg-brand-100 text-brand-800' 
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {grupo.tipo === 'grupal' ? 'Grupal' : 'Individual'}
                    </span>
                  </div>
                  {grupo.descripcion && (
                    <p className="text-sm text-gray-600 break-words">{grupo.descripcion}</p>
                  )}
                </div>

                {/* Información de motorizados */}
                <div className="mb-4">
                  <div className="flex items-start sm:items-center gap-2 text-sm text-gray-700">
                    {grupo.tipo === 'grupal' ? (
                      <>
                        <Users className="h-4 w-4 text-brand-600 flex-shrink-0 mt-0.5 sm:mt-0" />
                        <span className="break-words">{grupo.motorizados?.length || 0} motorizados asignados</span>
                      </>
                    ) : (
                      <>
                        <User className="h-4 w-4 text-purple-600 flex-shrink-0 mt-0.5 sm:mt-0" />
                        <span className="break-words">
                          {grupo.motorizado_individual 
                            ? `${grupo.motorizado_individual.nombres} ${grupo.motorizado_individual.apellidos}`
                            : 'Sin motorizado asignado'
                          }
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Bloques de horario */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-gray-600 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-700">Bloques de horario</span>
                  </div>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {grupo.bloques?.slice(0, 3).map((bloque, index) => (
                      <div key={index} className="text-xs bg-white rounded p-2 border">
                        <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-1 xs:gap-2 mb-1">
                          <span className={`px-2 py-1 rounded text-xs font-medium border self-start ${getBloqueTipoColor(bloque.tipo)}`}>
                            {bloque.tipo}
                          </span>
                          <span className="text-gray-600 text-xs">
                            {formatDiasSemana(bloque.dia_semana)}
                          </span>
                        </div>
                        <div className="font-medium text-gray-900 text-xs sm:text-sm">
                          {formatTimeDisplay(bloque.hora_inicio)} - {formatTimeDisplay(bloque.hora_fin)}
                        </div>
                      </div>
                    )) || <span className="text-xs text-gray-500">Sin bloques definidos</span>}
                    {(grupo.bloques?.length || 0) > 3 && (
                      <div className="text-xs text-gray-500 text-center py-1">
                        +{(grupo.bloques?.length || 0) - 3} bloques más
                      </div>
                    )}
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex flex-col xs:flex-row gap-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => onView(grupo)}
                    className="flex-1 bg-green-100 text-green-700 px-3 py-2 rounded-lg hover:bg-green-200 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    <Eye className="h-4 w-4 flex-shrink-0" />
                    <span>Ver</span>
                  </button>
                  <button
                    onClick={() => onEdit(grupo)}
                    className="flex-1 bg-brand-100 text-brand-700 px-3 py-2 rounded-lg hover:bg-brand-200 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    <Edit className="h-4 w-4 flex-shrink-0" />
                    <span>Editar</span>
                  </button>
                  <button
                    onClick={() => confirmDelete(grupo.id, grupo.nombre)}
                    className="xs:flex-none bg-red-100 text-red-700 px-3 py-2 rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    <Trash2 className="h-4 w-4 flex-shrink-0" />
                    <span className="xs:hidden">Eliminar</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}