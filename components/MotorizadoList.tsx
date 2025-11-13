// components\MotorizadoList.tsx
"use client";

import type React from "react";
import { AsignarPedidosModal } from "./modals/AsignarPedidosModal";
import { EntregaCalendarioModal } from "./EntregaCalendarioModal";
import { useState } from "react";
import { Eye, Check, Search, RefreshCw, X, Trash2, Calendar, Clock } from "lucide-react";
import Section from "@/components/layout/Section";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchMotorizados,
  fetchMotorizadoDetails,
  aprobarMotorizado,
  deleteMotorizado,
} from "@/app/admin/motorizado/services/motorizado.service";
import type {
  Motorizado,
  DetallesMotorizado,
} from "@/app/admin/motorizado/types/motorizado.types";
import { DEFAULT_PAGE_SIZE } from "@/config/constanst";
import { showAlert } from "@/components/ui/DataTable/Alert";
import { DetallesMotorizadoModal } from "./modals/DetallesMotorizadoModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "./ui/input";
import { Button } from "@/components/ui/button";
import { DeleteMotorizadoDialog } from "./DeleteMotorizadoDialog";

const MotorizadoList: React.FC = () => {
  const queryClient = useQueryClient();
  const [motorizadoAprobado, setMotorizadoAprobado] = useState<number | null>(null);
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [selectedMotorizadoId, setSelectedMotorizadoId] = useState<
    number | null
  >(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCalendarioModalOpen, setIsCalendarioModalOpen] = useState(false);
  const [selectedMotorizadoCalendario, setSelectedMotorizadoCalendario] = useState<{
    id: number;
    nombre: string;
  } | null>(null);
  const [pagination, setPagination] = useState({
    pageSize: DEFAULT_PAGE_SIZE,
    pageIndex: 0,
  });
  const [activeTab, setActiveTab] = useState<"aprobados" | "pendientes">("aprobados");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [motorizadoToDelete, setMotorizadoToDelete] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [motorizadoToApprove, setMotorizadoToApprove] = useState<{
    id: number;
    nombre: string;
  } | null>(null);
  const [showAsignarPedidosModal, setShowAsignarPedidosModal] = useState(false);
  const {
    data: motorizados = [],
    isLoading,
    refetch,
  } = useQuery<Motorizado[], Error>({
    queryKey: ["motorizados"],
    queryFn: fetchMotorizados,
  });

  const { data: detallesMotorizado } = useQuery<DetallesMotorizado | null>({
    queryKey: ["motorizado-details", selectedMotorizadoId],
    queryFn: async () => {
      if (!selectedMotorizadoId) return null;
      const data = await fetchMotorizadoDetails(selectedMotorizadoId);
      return data;
    },
    enabled: !!selectedMotorizadoId,
  });

  const mutationAprobar = useMutation({
    mutationFn: aprobarMotorizado,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["motorizados"] });
      showAlert({
        title: "Éxito",
        text: "Motorizado aprobado correctamente. Se han enviado las credenciales por correo electrónico.",
        icon: "success",
      });
    },
    onError: (error: Error) => {
      console.error("Error al aprobar motorizado:", error);

      // Verificar si es un error de correo duplicado
      if (
        error.message &&
        error.message.includes("correo electrónico ya está registrado")
      ) {
        showAlert({
          title: "Error de registro",
          text: "El correo electrónico ya está registrado en el sistema. No se puede crear un usuario duplicado.",
          icon: "error",
        });
      } else {
        showAlert({
          title: "Error",
          text:
            error.message ||
            "No se pudo aprobar el motorizado o enviar las credenciales.",
          icon: "error",
        });
      }
    },
  });

  // Mutación para eliminar un motorizado
  const mutationDelete = useMutation({
    mutationFn: deleteMotorizado,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["motorizados"] });
      showAlert({
        title: "Éxito",
        text: "Se eliminó el motorizado correctamente.",
        icon: "success",
      });
      setIsDeleteDialogOpen(false);
      setMotorizadoToDelete(null);
    },
    onError: (error: Error) => {
      showAlert({
        title: "Error",
        text: error.message || "No se pudo eliminar el motorizado.",
        icon: "error",
      });
      setIsDeleteDialogOpen(false);
    },
  });

  const handleAprobar = (id: number) => {
    const motorizado = motorizados.find((m) => m.id === id);
    if (motorizado) {
      // Verificar si ya está aprobado
      if (motorizado.aprobado) {
        showAlert({
          title: "Información",
          text: "Este motorizado ya está aprobado.",
          icon: "info",
        });
        return;
      }

      setMotorizadoToApprove({
        id,
        nombre: `${motorizado.nombres} ${motorizado.apellidos}`,
      });
      setShowAsignarPedidosModal(true);
    }
  };

  const handleDelete = (id: number, name: string) => {
    setMotorizadoToDelete({ id, name });
    setIsDeleteDialogOpen(true);
  };

  const handleVerCalendario = (id: number, nombre: string) => {
    setSelectedMotorizadoCalendario({ id, nombre });
    setIsCalendarioModalOpen(true);
  };

  const confirmDelete = () => {
    if (motorizadoToDelete) {
      mutationDelete.mutate(motorizadoToDelete.id);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };
const handleAprobarMotorizado = (id: number) => {
    const motorizado = motorizados.find(m => m.id === id);
    // Solo aprobar si no está aprobado Y no hemos intentado aprobarlo ya
    if (motorizado && !motorizado.aprobado && motorizadoAprobado !== id) {
      setMotorizadoAprobado(id); // Marcar como "en proceso de aprobación"
      mutationAprobar.mutate(id);
    }
  };

  // Contar motorizados pendientes para el badge
  const pendientesCount = motorizados.filter((m) => !m.aprobado).length;

  // Aplicar filtros de estado y búsqueda
  const filteredMotorizados = motorizados
    .filter((motorizado) => {
      // Filtrar por tab activo
      if (activeTab === "aprobados") return motorizado.aprobado;
      if (activeTab === "pendientes") return !motorizado.aprobado;
      return true;
    })
    .filter((motorizado) => {
      // Filtrar por término de búsqueda
      if (!globalFilter) return true;

      const searchTerm = globalFilter.toLowerCase();
      return (
        (
          motorizado.nombres?.toLowerCase() +
          " " +
          motorizado.apellidos?.toLowerCase()
        ).includes(searchTerm) ||
        motorizado.apellidos?.toLowerCase().includes(searchTerm) ||
        motorizado.celular?.toLowerCase().includes(searchTerm) ||
        motorizado.email?.toLowerCase().includes(searchTerm) ||
        motorizado.nro_documento?.toLowerCase().includes(searchTerm)
      );
    });

  const paginatedMotorizados = filteredMotorizados.slice(
    pagination.pageIndex * pagination.pageSize,
    (pagination.pageIndex + 1) * pagination.pageSize
  );

  return (
    <Section title="Listado de Motorizados">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 border-b border-gray-200">
          <div className="w-full sm:w-auto flex flex-wrap gap-2">
            <button
              onClick={() => {
                setActiveTab("aprobados");
                setPagination({ ...pagination, pageIndex: 0 });
              }}
              className={`px-3 py-2 rounded-md flex items-center gap-2 text-sm ${
                activeTab === "aprobados"
                  ? "bg-green-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Check size={16} />
              <span>Aprobados</span>
            </button>
            <button
              onClick={() => {
                setActiveTab("pendientes");
                setPagination({ ...pagination, pageIndex: 0 });
              }}
              className={`px-3 py-2 rounded-md flex items-center gap-2 text-sm relative ${
                activeTab === "pendientes"
                  ? "bg-yellow-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Clock size={16} />
              <span>Pendientes</span>
              {pendientesCount > 0 && (
                <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full ml-1">
                  {pendientesCount}
                </span>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Buscar..."
                className="w-full sm:w-64 pl-9 py-2 h-10"
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
              />
              {globalFilter && (
                <button
                  onClick={() => setGlobalFilter("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => refetch()}
              title="Actualizar"
            >
              <RefreshCw size={18} />
            </Button>
          </div>
        </div>

        <div className="relative overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
              <tr>
                <th scope="col" className="px-4 py-3 text-center w-12">
                  #
                </th>
                <th scope="col" className="px-4 py-3">
                  Datos
                </th>
                <th scope="col" className="px-4 py-3">
                  Documento
                </th>
                <th scope="col" className="px-4 py-3">
                  Teléfono
                </th>
                <th scope="col" className="px-4 py-3">
                  Correo
                </th>
                <th scope="col" className="px-4 py-3 text-center">
                  Fecha de Registro
                </th>
                <th scope="col" className="px-4 py-3 text-center">
                  Aprobado
                </th>
                <th scope="col" className="px-4 py-3 text-center">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array(5)
                  .fill(0)
                  .map((_, index) => (
                    <tr
                      key={index}
                      className="bg-white border-b hover:bg-gray-50"
                    >
                      <td colSpan={8} className="px-4 py-3">
                        <div className="animate-pulse flex items-center space-x-4">
                          <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
              ) : filteredMotorizados.length === 0 ? (
                <tr className="bg-white">
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-800">
                      No se encontraron motorizados
                    </h3>
                    <p className="text-gray-500 mt-2">
                      {globalFilter
                        ? "Intenta con otra búsqueda."
                        : activeTab === "aprobados"
                        ? "No hay motorizados aprobados."
                        : "No hay motorizados pendientes de aprobación."}
                    </p>
                    {globalFilter && (
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => {
                          setGlobalFilter("");
                        }}
                      >
                        Limpiar búsqueda
                      </Button>
                    )}
                  </td>
                </tr>
              ) : (
                paginatedMotorizados.map((motorizado, index) => {
                  const pageSize = pagination.pageSize;
                  const pageIndex = pagination.pageIndex;
                  const rowNumber = pageSize * pageIndex + index + 1;

                  return (
                    <tr
                      key={motorizado.id}
                      className="bg-white border-b hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-center font-medium text-gray-600">
                        {rowNumber}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {motorizado.nombres} {motorizado.apellidos}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{`${motorizado.tipo_documento}: ${motorizado.nro_documento}`}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {motorizado.celular}
                      </td>
                      <td className="px-4 py-3 text-gray-600 truncate max-w-[180px]">
                        {motorizado.email}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-600">
                        {formatDate(motorizado.created_at)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {motorizado.aprobado ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <Check className="w-3 h-3 mr-1" />
                            Aprobado
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Pendiente
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center justify-center gap-1">
                          {!motorizado.aprobado && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAprobar(motorizado.id)}
                              className="text-blue-700 bg-blue-50 border-blue-100 hover:bg-blue-100"
                              disabled={mutationAprobar.isPending}
                            >
                              {mutationAprobar.isPending
                                ? "Aprobando..."
                                : "Aprobar"}
                            </Button>
                          )}
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedMotorizadoId(motorizado.id);
                              setIsModalOpen(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              handleVerCalendario(
                                motorizado.id,
                                `${motorizado.nombres} ${motorizado.apellidos}`
                              )
                            }
                            className="text-purple-600 hover:text-purple-800 hover:bg-purple-50"
                            title="Ver calendario de entregas"
                          >
                            <Calendar className="w-4 h-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              handleDelete(
                                motorizado.id,
                                `${motorizado.nombres} ${motorizado.apellidos}`
                              )
                            }
                            className="text-red-600 hover:text-red-800 hover:bg-red-50"
                            title="Eliminar motorizado"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {filteredMotorizados.length > 0 && (
          <div className="flex items-center justify-between p-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Página {pagination.pageIndex + 1} de{" "}
              {Math.ceil(filteredMotorizados.length / pagination.pageSize)}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() =>
                  setPagination({
                    ...pagination,
                    pageIndex: Math.max(0, pagination.pageIndex - 1),
                  })
                }
                disabled={pagination.pageIndex === 0}
              >
                Anterior
              </Button>
              <Button
                onClick={() =>
                  setPagination({
                    ...pagination,
                    pageIndex: Math.min(
                      Math.ceil(
                        filteredMotorizados.length / pagination.pageSize
                      ) - 1,
                      pagination.pageIndex + 1
                    ),
                  })
                }
                disabled={
                  pagination.pageIndex >=
                  Math.ceil(filteredMotorizados.length / pagination.pageSize) -
                    1
                }
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </div>

      <DetallesMotorizadoModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedMotorizadoId(null);
        }}
        data={detallesMotorizado}
        onAprobar={handleAprobar}
        isApproving={mutationAprobar.isPending}
      />

      {/* Modal de calendario de entregas */}
      {selectedMotorizadoCalendario && (
        <EntregaCalendarioModal
          isOpen={isCalendarioModalOpen}
          onClose={() => {
            setIsCalendarioModalOpen(false);
            setSelectedMotorizadoCalendario(null);
          }}
          motorizadoId={selectedMotorizadoCalendario.id}
          motorizadoNombre={selectedMotorizadoCalendario.nombre}
        />
      )}

      {/* Diálogo de confirmación para eliminar */}
      {motorizadoToDelete && (
        <DeleteMotorizadoDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={confirmDelete}
          motorizadoName={motorizadoToDelete.name}
        />
      )}

      {motorizadoToApprove && (
        <AsignarPedidosModal
          isOpen={showAsignarPedidosModal}
          onClose={(pedidosAsignados = false) => {
            setShowAsignarPedidosModal(false);
            // Solo aprobar si no se asignaron pedidos (botón "Asignar más tarde")
            if (!pedidosAsignados) {
              handleAprobarMotorizado(motorizadoToApprove.id);
            }
            setMotorizadoToApprove(null);
          }}
          motorizadoId={motorizadoToApprove.id}
          motorizadoNombre={motorizadoToApprove.nombre}
          onSuccess={() => {
            // Aprobar cuando se guardan los pedidos exitosamente
            handleAprobarMotorizado(motorizadoToApprove.id);
            setMotorizadoToApprove(null);
          }}
        />
      )}
    </Section>
  );
};

export default MotorizadoList;