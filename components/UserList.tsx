"use client"

import type React from "react"
import { useState } from "react"
import Section from "@/components/layout/Section"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchUsers, changeStateUser, createUser } from "../app/admin/usuarios/services/User.service"
import DataTable from "@/components/ui/DataTable/DataTable"
import { DebounceInput } from "@/components/ui/DataTable/DebounceInput"
import type { User } from "../app/admin/usuarios/types/User.types"
import type { ColumnSort, ColumnDef, Row } from "@tanstack/react-table"
import { DEFAULT_PAGE_SIZE } from "@/config/constanst"
import { FaPlus } from "react-icons/fa"
import ConfirmationAlert from "@/components/ui/DataTable/ConfirmationAlert"
import { showAlert } from "@/components/ui/DataTable/Alert"
import UserModal from "@/components/ui/UserModal"
import Image from "next/image"
import defaultUserIcon from "/public/img/icon-user.png"

const UserList: React.FC = () => {
  const queryClient = useQueryClient()
  const [sorting, setSorting] = useState<ColumnSort[]>([])
  const [globalFilter, setGlobalFilter] = useState<string>("")
  const [pagination, setPagination] = useState({
    pageSize: DEFAULT_PAGE_SIZE,
    pageIndex: 0,
  })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newUser, setNewUser] = useState({ name: "", email: "", usuario: "", password: "" })

  const { data: users = [], isLoading } = useQuery<User[], Error>({
    queryKey: ["users"],
    queryFn: fetchUsers,
  })

  const mutation = useMutation({
    mutationFn: changeStateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      showAlert({ title: "Éxito", text: "Se cambio el estado del usuario.", icon: "success" })
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

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      showAlert({ title: "Éxito", text: "Usuario creado exitosamente.", icon: "success" })
      setIsModalOpen(false)
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

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "index",
      header: "#",
      cell: ({ row }) => {
        const pageSize = pagination.pageSize
        const pageIndex = pagination.pageIndex
        return <div className="text-start ">{pageSize * pageIndex + row.index + 1}</div>
      },
      size: 60,
    },
    {
      accessorKey: "usuario",
      header: "Usuario",
      cell: ({ row }: { row: Row<User> }) => {
        const user = row.original
        return (
          <div className="flex items-center space-x-4 py-2">
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100">
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
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${user.estado === 1 ? "bg-green-500" : "bg-gray-400"}`}
              ></div>
            </div>
            <span className="font-medium truncate max-w-[150px]">{user.usuario}</span>
          </div>
        )
      },
      size: 200,
    },
    {
      accessorKey: "name",
      header: "Nombre",
      cell: (info) => <div className="truncate max-w-[150px]">{info.getValue() as string}</div>,
      size: 150,
    },
    {
      accessorKey: "email",
      header: "Correo",
      cell: (info) => <div className="truncate max-w-[200px]">{info.getValue() as string}</div>,
      size: 200,
    },
    {
      accessorKey: "created_at",
      header: "Fecha de Creación",
      cell: ({ row }: { row: Row<User> }) => (
        <div className="text-center">{formatDate(row.getValue("created_at"))}</div>
      ),
      size: 150,
    },
    {
      accessorKey: "estado",
      header: "Estado",
      cell: ({ row }: { row: Row<User> }) => (
        <div className="text-center">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              row.getValue("estado") === 1 ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
            }`}
          >
            {row.getValue("estado") === 1 ? "Activo" : "Inactivo"}
          </span>
        </div>
      ),
      size: 100,
    },
    {
      accessorKey: "action",
      header: "Acciones",
      cell: ({ row }: { row: Row<User> }) => (
        <div className="text-center">
          <ConfirmationAlert
            title="¿Estás seguro?"
            text="¡No podrás revertir esto!"
            onConfirm={() => handleDeactivate(row.original.id)}
          />
        </div>
      ),
      size: 100,
    },
  ]

  return (
    <Section title="Listado de Usuarios">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-4 py-4 bg-white rounded-t-lg border-b">
        <DebounceInput
          type="text"
          placeholder="Buscar..."
          className="w-full sm:w-64 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
          value={globalFilter}
          onChange={(value) => setGlobalFilter(value)}
        />
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto bg-cyan-400 text-white flex items-center justify-center py-2 px-4 gap-2 rounded-lg hover:bg-cyan-500 transition-all"
        >
          <FaPlus className="w-4 h-4" />
          <span>Crear Usuario</span>
        </button>
      </div>

      <div className="bg-white rounded-b-lg shadow">
        <DataTable
          columns={columns}
          data={users}
          globalFilter={globalFilter}
          loading={isLoading}
          setSorting={setSorting}
          setPagination={setPagination}
          sorting={sorting}
          pagination={pagination}
        />
      </div>

      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        newUser={newUser}
        onChange={handleInputChange}
        onCreateUser={handleCreateUser}
      />
    </Section>
  )
}

export default UserList

