// components\UserList.tsx
"use client"

import type React from "react"
import { useState } from "react"
import Section from "@/components/layout/Section"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchUsers, changeStateUser, createUser, deleteUser } from "../app/admin/usuarios/services/User.service"
import type { User } from "../app/admin/usuarios/types/User.types"
import { DEFAULT_PAGE_SIZE } from "@/config/constanst"
import { showAlert, confirmAlert } from "@/components/ui/DataTable/Alert"
import UserModal from "@/components/ui/UserModal"
import Image from "next/image"
import defaultUserIcon from "/public/img/icon-user.png"
import { Search, Plus, RefreshCw, Trash2, Users, Truck, UserCog } from "lucide-react"
import { Input } from "./ui/input"

const UserList: React.FC = () => {
  const queryClient = useQueryClient()
  const [globalFilter, setGlobalFilter] = useState<string>("")
  const [roleFilter, setRoleFilter] = useState<number | null>(null)
  const [pagination, setPagination] = useState({
    pageSize: DEFAULT_PAGE_SIZE,
    pageIndex: 0,
  })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    usuario: "",
    password: "",
    role_id: 1, // Por defecto, crear usuarios administradores (role_id: 1)
  })

  const {
    data: users = [],
    isLoading,
    refetch,
  } = useQuery<User[], Error>({
    queryKey: ["users"],
    queryFn: fetchUsers,
  })

  const mutation = useMutation({
    mutationFn: changeStateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      showAlert({ title: "Éxito", text: "Se cambió el estado del usuario.", icon: "success" })
    },
    onError: (error: unknown) => {
      if (error instanceof Error) {
        showAlert({ title: "Error", text: error.message, icon: "error" })
      }
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      showAlert({ title: "Éxito", text: "Usuario eliminado correctamente.", icon: "success" })
    },
    onError: (error: unknown) => {
      if (error instanceof Error) {
        showAlert({ title: "Error", text: error.message, icon: "error" })
      }
    },
  })

  const handleDeactivate = (id: number) => {
    mutation.mutate(id)
  }

  const handleDeleteUser = (id: number) => {
    confirmAlert({
      title: "¿Eliminar usuario?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMutation.mutate(id)
      }
    })
  }

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      showAlert({ title: "Éxito", text: "Usuario creado exitosamente.", icon: "success" })
      setIsModalOpen(false)
      setNewUser({ name: "", email: "", usuario: "", password: "", role_id: 1 })
    },
    onError: (error: unknown) => {
      if (error instanceof Error) {
        showAlert({ title: "Error", text: error.message, icon: "error" })
      }
    },
  })

  const handleCreateUser = () => {
    createMutation.mutate(newUser)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewUser({ ...newUser, [name]: value })
  }

  const getUserProfileImage = (user: User) => {
    if (user.role_id === 2 && user.businessRegistration?.perfilNegocio?.foto_perfil) {
      return `${process.env.NEXT_PUBLIC_API_WEB}/storage/${user.businessRegistration.perfilNegocio.foto_perfil}`
    }
    return defaultUserIcon
  }

  // Filtrar usuarios por rol y búsqueda global
  const filteredUsers = users.filter((user) => {
    // Filtrar por rol si hay un filtro activo
    if (roleFilter !== null && user.role_id !== roleFilter) {
      return false
    }

    // Filtrar por búsqueda global
    if (globalFilter) {
      const searchTerm = globalFilter.toLowerCase()
      return (
        user.usuario.toLowerCase().includes(searchTerm) ||
        user.name.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm)
      )
    }

    return true
  })

  // Paginación
  const paginatedUsers = filteredUsers.slice(
    pagination.pageIndex * pagination.pageSize,
    (pagination.pageIndex + 1) * pagination.pageSize,
  )

  // Obtener el nombre del rol
  const getRoleName = (roleId: number): string => {
    switch (roleId) {
      case 1:
        return "Administrador"
      case 2:
        return "Empresa"
      case 3:
        return "Motorizado"
      default:
        return "Usuario"
    }
  }

  return (
    <Section title="Listado de Usuarios">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 border-b border-gray-200">
          <div className="w-full sm:w-auto flex flex-wrap gap-2">
            <button
              onClick={() => setRoleFilter(null)}
              className={`px-3 py-2 rounded-md flex items-center gap-2 text-sm ${
                roleFilter === null ? "bg-red-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Users size={16} />
              <span>Todos</span>
            </button>
            <button
              onClick={() => setRoleFilter(2)}
              className={`px-3 py-2 rounded-md flex items-center gap-2 text-sm ${
                roleFilter === 2 ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Users size={16} />
              <span>Empresas</span>
            </button>
            <button
              onClick={() => setRoleFilter(3)}
              className={`px-3 py-2 rounded-md flex items-center gap-2 text-sm ${
                roleFilter === 3 ? "bg-green-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Truck size={16} />
              <span>Motorizados</span>
            </button>
            <button
              onClick={() => setRoleFilter(1)}
              className={`px-3 py-2 rounded-md flex items-center gap-2 text-sm ${
                roleFilter === 1 ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <UserCog size={16} />
              <span>Administradores</span>
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Buscar..."
                className="w-full sm:w-64 pl-9 h-10 "
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
              />
            </div>
            <button
              onClick={() => refetch()}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
              title="Actualizar"
            >
              <RefreshCw size={18} />
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#1abc9c] hover:bg-[#16a085] text-white flex items-center justify-center py-2 px-4 gap-2 rounded-md transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Crear Usuario</span>
            </button>
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
                  Usuario
                </th>
                <th scope="col" className="px-4 py-3">
                  Nombre
                </th>
                <th scope="col" className="px-4 py-3">
                  Correo
                </th>
                <th scope="col" className="px-4 py-3 text-center">
                  Rol
                </th>
                <th scope="col" className="px-4 py-3 text-center">
                  Fecha de Creación
                </th>
                <th scope="col" className="px-4 py-3 text-center">
                  Estado
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
              ) : paginatedUsers.length === 0 ? (
                <tr className="bg-white">
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-800">No se encontraron usuarios</h3>
                    <p className="text-gray-500 mt-2">
                      {globalFilter || roleFilter !== null
                        ? "Intenta con otra búsqueda o elimina los filtros aplicados."
                        : "No hay usuarios registrados en el sistema."}
                    </p>
                    {(globalFilter || roleFilter !== null) && (
                      <button
                        className="mt-4 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        onClick={() => {
                          setGlobalFilter("")
                          setRoleFilter(null)
                        }}
                      >
                        Limpiar filtros
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user, index) => {
                  const rowNumber = pagination.pageSize * pagination.pageIndex + index + 1

                  return (
                    <tr key={user.id} className="bg-white border-b hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-center font-medium text-gray-600">{rowNumber}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-3">
                          <div className="relative flex-shrink-0">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
                              <Image
                                src={getUserProfileImage(user) || "/placeholder.svg"}
                                alt={`Foto de perfil de ${user.usuario}`}
                                width={40}
                                height={40}
                                className="object-cover w-full h-full"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  target.src = defaultUserIcon.src
                                }}
                              />
                            </div>
                            <div
                              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                                user.estado ? "bg-green-500" : "bg-gray-400"
                              }`}
                              title={user.estado ? "Activo" : "Inactivo"}
                            ></div>
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-800">{user.usuario}</span>
                            <span className="text-xs text-gray-500">
                              {user.role_id === 2 ? "Empresa" : user.role_id === 3 ? "Motorizado" : "Admin"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-800 truncate max-w-[180px]">{user.name}</td>
                      <td className="px-4 py-3 text-gray-600 truncate max-w-[220px]">{user.email}</td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.role_id === 1
                              ? "bg-purple-100 text-purple-800"
                              : user.role_id === 2
                                ? "bg-blue-100 text-blue-800"
                                : "bg-green-100 text-green-800"
                          }`}
                        >
                          {getRoleName(user.role_id)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-gray-600">{formatDate(user.created_at)}</td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.estado ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {user.estado ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleDeactivate(user.id)}
                            className={`px-3 py-1 text-xs font-medium rounded-md ${
                              user.estado
                                ? "bg-red-100 text-red-700 hover:bg-red-200"
                                : "bg-green-100 text-green-700 hover:bg-green-200"
                            } transition-colors`}
                          >
                            {user.estado ? "Desactivar" : "Activar"}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                            title="Eliminar usuario"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {filteredUsers.length > 0 && (
          <div className="flex items-center justify-between p-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Página {pagination.pageIndex + 1} de {Math.ceil(filteredUsers.length / pagination.pageSize)}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPagination({ ...pagination, pageIndex: Math.max(0, pagination.pageIndex - 1) })}
                disabled={pagination.pageIndex === 0}
                className="px-3 py-1 border border-gray-300 rounded-md text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <button
                onClick={() =>
                  setPagination({
                    ...pagination,
                    pageIndex: Math.min(
                      Math.ceil(filteredUsers.length / pagination.pageSize) - 1,
                      pagination.pageIndex + 1,
                    ),
                  })
                }
                disabled={pagination.pageIndex >= Math.ceil(filteredUsers.length / pagination.pageSize) - 1}
                className="px-3 py-1 bg-[#e74c3c] text-white rounded-md hover:bg-[#c0392b] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        newUser={newUser}
        onChange={handleInputChange}
        onCreateUser={handleCreateUser}
        isLoading={createMutation.isPending}
      />
    </Section>
  )
}

export default UserList

