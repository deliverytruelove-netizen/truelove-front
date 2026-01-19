// components/ClienteList.tsx
"use client";

import type React from "react";
import { useState } from "react";
import { Eye, Search, RefreshCw, X, Trash2, User } from "lucide-react";
import Section from "@/components/layout/Section";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchClientes,
  fetchClienteDetails,
  deleteCliente,
} from "@/app/admin/clientes/services/cliente.service";
import type { Cliente, DetallesCliente } from "@/app/admin/clientes/types/cliente.types";
import { DEFAULT_PAGE_SIZE } from "@/config/constanst";
import { showAlert } from "@/components/ui/DataTable/Alert";
import { Input } from "./ui/input";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { DetallesClienteModal } from "./modals/DetallesClienteModal";
import { DeleteClienteDialog } from "./DeleteClienteDialog";
import Image from "next/image";

const ClienteList: React.FC = () => {
  const queryClient = useQueryClient();
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [selectedClienteId, setSelectedClienteId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pagination, setPagination] = useState({
    pageSize: DEFAULT_PAGE_SIZE,
    pageIndex: 0,
  });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [clienteToDelete, setClienteToDelete] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const {
    data: clientes = [],
    isLoading,
    refetch,
  } = useQuery<Cliente[], Error>({
    queryKey: ["clientes"],
    queryFn: fetchClientes,
  });

  const { data: detallesCliente } = useQuery<DetallesCliente | null>({
    queryKey: ["cliente-details", selectedClienteId],
    queryFn: async () => {
      if (!selectedClienteId) return null;
      const data = await fetchClienteDetails(selectedClienteId);
      return data;
    },
    enabled: !!selectedClienteId,
  });

  // Mutación para eliminar un cliente
  const mutationDelete = useMutation({
    mutationFn: deleteCliente,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientes"] });
      showAlert({
        title: "Éxito",
        text: "Se eliminó el cliente correctamente.",
        icon: "success",
      });
      setIsDeleteDialogOpen(false);
      setClienteToDelete(null);
    },
    onError: (error: Error) => {
      showAlert({
        title: "Error",
        text: error.message || "No se pudo eliminar el cliente.",
        icon: "error",
      });
      setIsDeleteDialogOpen(false);
    },
  });

  const handleDelete = (id: number, name: string) => {
    setClienteToDelete({ id, name });
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (clienteToDelete) {
      mutationDelete.mutate(clienteToDelete.id);
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

  // Aplicar filtros de búsqueda
  const filteredClientes = clientes.filter((cliente) => {
    if (!globalFilter) return true;

    const searchTerm = globalFilter.toLowerCase();
    return (
      (cliente.nombre?.toLowerCase() + " " + cliente.apellido?.toLowerCase()).includes(searchTerm) ||
      cliente.apellido?.toLowerCase().includes(searchTerm) ||
      cliente.email?.toLowerCase().includes(searchTerm) ||
      cliente.documento?.toLowerCase().includes(searchTerm) ||
      cliente.celular?.toLowerCase().includes(searchTerm)
    );
  });

  const paginatedClientes = filteredClientes.slice(
    pagination.pageIndex * pagination.pageSize,
    (pagination.pageIndex + 1) * pagination.pageSize
  );

  return (
    <Section title="Listado de Clientes">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 border-b border-gray-200">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
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
                  Cliente
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
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array(5)
                  .fill(0)
                  .map((_, index) => (
                    <tr key={index} className="bg-white border-b hover:bg-gray-50">
                      <td colSpan={7} className="px-4 py-3">
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
              ) : filteredClientes.length === 0 ? (
                <tr className="bg-white">
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-800">
                      No se encontraron clientes
                    </h3>
                    <p className="text-gray-500 mt-2">
                      {globalFilter
                        ? "Intenta con otra búsqueda."
                        : "No hay clientes registrados."}
                    </p>
                    {globalFilter && (
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => setGlobalFilter("")}
                      >
                        Limpiar búsqueda
                      </Button>
                    )}
                  </td>
                </tr>
              ) : (
                paginatedClientes.map((cliente, index) => {
                  const pageSize = pagination.pageSize;
                  const pageIndex = pagination.pageIndex;
                  const rowNumber = pageSize * pageIndex + index + 1;

                  return (
                    <tr
                      key={cliente.id}
                      className="bg-white border-b hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-center font-medium text-gray-600">
                        {rowNumber}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {cliente.foto_perfil ? (
                            <Image
                              src={cliente.foto_perfil}
                              alt={`${cliente.nombre} ${cliente.apellido}`}
                              width={40}
                              height={40}
                              className="rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-gray-500" />
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-gray-800">
                              {cliente.nombre} {cliente.apellido}
                            </div>
                            <div className="text-xs text-gray-500">{cliente.genero}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{cliente.documento}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {cliente.celular || "No especificado"}
                      </td>
                      <td className="px-4 py-3 text-gray-600 truncate max-w-[180px]">
                        {cliente.email}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-600">
                        {formatDate(cliente.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedClienteId(cliente.id);
                              setIsModalOpen(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                            title="Ver detalles"
                          >
                            <Eye className="w-5 h-5" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              handleDelete(
                                cliente.id,
                                `${cliente.nombre} ${cliente.apellido}`
                              )
                            }
                            className="text-red-600 hover:text-red-800 hover:bg-red-50"
                            title="Eliminar cliente"
                          >
                            <Trash2 className="w-5 h-5" />
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

        {filteredClientes.length > 0 && (
          <Pagination
            currentPage={pagination.pageIndex + 1}
            totalPages={Math.ceil(filteredClientes.length / pagination.pageSize)}
            totalItems={filteredClientes.length}
            perPage={pagination.pageSize}
            onPageChange={(page) => setPagination({ ...pagination, pageIndex: page - 1 })}
            onPerPageChange={(perPage) => setPagination({ pageSize: perPage, pageIndex: 0 })}
            itemsInCurrentPage={paginatedClientes.length}
          />
        )}
      </div>

      <DetallesClienteModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedClienteId(null);
        }}
        data={detallesCliente || null}
      />

      {/* Diálogo de confirmación para eliminar */}
      {clienteToDelete && (
        <DeleteClienteDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={confirmDelete}
          clienteName={clienteToDelete.name}
        />
      )}
    </Section>
  );
};

export default ClienteList;
