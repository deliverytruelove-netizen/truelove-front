"use client"

import type React from "react"

import { useState } from "react"
import { Eye, Check } from "lucide-react"
import Section from "@/components/layout/Section"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  fetchSocios,
  changeStateSocio,
  fetchSocioDetails,
  aprobarSocio,
} from "@/app/admin/socios/services/Socios.service"
import DataTable from "@/components/ui/DataTable/DataTable"
import { DebounceInput } from "@/components/ui/DataTable/DebounceInput"
import { Button } from "@/components/ui/button"
import type { DetallesSocio } from "@/app/admin/socios/types/Socios.types"
import type { ColumnSort, ColumnDef } from "@tanstack/react-table"
import { DEFAULT_PAGE_SIZE } from "@/config/constanst"
import ConfirmationAlert from "@/components/ui/DataTable/ConfirmationAlert"
import { showAlert } from "@/components/ui/DataTable/Alert"
import { DetallesSocioModal } from "./modals/DetallesSocioModal"

const SocioList: React.FC = () => {
  const queryClient = useQueryClient()
  const [sorting, setSorting] = useState<ColumnSort[]>([])
  const [globalFilter, setGlobalFilter] = useState<string>("")
  const [selectedSocioId, setSelectedSocioId] = useState<number | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [pagination, setPagination] = useState({
    pageSize: DEFAULT_PAGE_SIZE,
    pageIndex: 0,
  })

  // Consulta para obtener los socios y sus detalles
  const { data: sociosConDetalles = [], isLoading } = useQuery<DetallesSocio[], Error>({
    queryKey: ["socios-detalles"],
    queryFn: async () => {
      const socios = await fetchSocios()
      const detallesPromises = socios.map((socio) => fetchSocioDetails(socio.id))
      const detalles = await Promise.all(detallesPromises)
      return detalles.filter(
        (detalle) =>
          detalle.business !== null &&
          detalle.businessData !== null &&
          detalle.establishment !== null &&
          detalle.bankData !== null &&
          detalle.cuentaBancaria !== null,
      )
    },
  })

  const { data: detallesSocio } = useQuery<DetallesSocio | null>({
    queryKey: ["socio-details", selectedSocioId],
    queryFn: async () => {
      if (!selectedSocioId) return null
      return await fetchSocioDetails(selectedSocioId)
    },
    enabled: !!selectedSocioId,
  })

  const mutationChangeState = useMutation({
    mutationFn: changeStateSocio,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["socios-detalles"] })
      showAlert({ title: "Éxito", text: "Se cambió el estado del socio.", icon: "success" })
    },
    onError: (error: Error) => {
      showAlert({ title: "Error", text: error.message, icon: "error" })
    },
  })

  const mutationAprobar = useMutation({
    mutationFn: aprobarSocio,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["socios-detalles"] })
      showAlert({ title: "Éxito", text: "Se aprobó el socio.", icon: "success" })
    },
    onError: (error: Error) => {
      showAlert({ title: "Error", text: error.message, icon: "error" })
    },
  })

  const handleDeactivate = (id: number) => {
    mutationChangeState.mutate(id)
  }

  const handleAprobar = (id: number) => {
    mutationAprobar.mutate(id)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, "0")
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const year = date.getFullYear()
    const hours = String(date.getHours()).padStart(2, "0")
    const minutes = String(date.getMinutes()).padStart(2, "0")
    return `${day}/${month}/${year} ${hours}:${minutes}`
  }

  const columns: ColumnDef<DetallesSocio>[] = [
    {
      accessorKey: "personal.name",
      header: () => <span className="m-auto">Usuario</span>,
    },
    {
      accessorKey: "personal.lastName",
      header: () => <span className="m-auto">Apellidos</span>,
    },
    {
      accessorKey: "personal.businessType",
      header: () => <span className="m-auto">Tipo de Negocio</span>,
    },
    {
      accessorKey: "personal.phone",
      header: () => <span className="m-auto">Teléfono</span>,
    },
    {
      accessorKey: "personal.email",
      header: () => <span className="m-auto">Correo</span>,
    },
    {
      accessorKey: "personal.created_at",
      header: () => <span className="m-auto">Fecha de Creación</span>,
      cell: ({ getValue }) => formatDate(getValue() as string),
    },
    {
      id: "aprobado",
      header: () => <span className="m-auto">Aprobado</span>,
      cell: ({ row }) => (
        <span>
          {row.original.aprobado ? (
            <Check className="text-green-500 mx-auto" />
          ) : (
            <span className="text-red-500">Pendiente</span>
          )}
        </span>
      ),
    },
    {
      id: "actions",
      header: () => <span className="m-auto">Acciones</span>,
      cell: ({ row }) => (
        <div className="flex gap-2 justify-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setSelectedSocioId(row.original.id)
              setIsModalOpen(true)
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <ConfirmationAlert
            title="¿Estás seguro?"
            text="¡No podrás revertir esto!"
            onConfirm={() => handleDeactivate(row.original.id)}
          />
        </div>
      ),
    },
  ]

  return (
    <Section title="Listado de Socios">
      <div className="flex md:justify-end items-center px-2 lg:px-5 py-4">
        <DebounceInput
          type="text"
          placeholder="Buscar..."
          className="border rounded w-100 outline-primary-400 py-2 px-3 mr-2"
          value={globalFilter}
          onChange={(value) => setGlobalFilter(value)}
        />
      </div>

      <div className="items-center m-auto text-center">
        <DataTable
          columns={columns}
          data={sociosConDetalles}
          globalFilter={globalFilter}
          loading={isLoading}
          setSorting={setSorting}
          setPagination={setPagination}
          sorting={sorting}
          pagination={pagination}
        />
      </div>

      <DetallesSocioModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedSocioId(null)
        }}
        data={detallesSocio}
        onAprobar={handleAprobar}
      />
    </Section>
  )
}

export default SocioList

