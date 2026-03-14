"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { useQuery } from "@tanstack/react-query"
import Section from "@/components/layout/Section"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Pagination } from "@/components/ui/pagination"
import { DEFAULT_PAGE_SIZE } from "@/config/constanst"
import { fetchSocios } from "@/app/admin/socios/services/Socios.service"
import { fetchCuotas, fetchEstadoPagosSocio, type EstadoPagosSocio } from "../services/cuota-socio.service"
import type { Socio } from "@/app/admin/socios/types/Socios.types"
import type { CuotaSocio } from "../types/cuota-socio.types"
import { Search, Users, DollarSign, Percent, AlertTriangle, CheckCircle, Clock } from "lucide-react"

export default function SociosAsignadosPage() {
  const [search, setSearch] = useState("")
  const [filtroTipo, setFiltroTipo] = useState<string>("")
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(DEFAULT_PAGE_SIZE)
  const [estadosPagos, setEstadosPagos] = useState<Map<number, EstadoPagosSocio>>(new Map())

  const { data: socios = [], isLoading: isLoadingSocios } = useQuery({
    queryKey: ["socios"],
    queryFn: fetchSocios,
  })

  const { data: cuotas = [], isLoading: isLoadingCuotas } = useQuery({
    queryKey: ["cuotas-socios"],
    queryFn: fetchCuotas,
  })

  const cuotasMap = useMemo(() => {
    const map = new Map<number, CuotaSocio>()
    cuotas.forEach((c) => map.set(c.id, c))
    return map
  }, [cuotas])

  const sociosConCuota = useMemo(() => {
    return socios.filter((s: Socio) => s.cuota_socio_id != null)
  }, [socios])

  // Cargar estados de pago de los socios paginados
  const loadEstadosPagos = useCallback(async (sociosList: Socio[]) => {
    const newEstados = new Map(estadosPagos)
    const promises = sociosList
      .filter((s) => !newEstados.has(s.id))
      .map(async (s) => {
        try {
          const estado = await fetchEstadoPagosSocio(s.id)
          return { id: s.id, estado }
        } catch {
          return null
        }
      })

    const results = await Promise.all(promises)
    let changed = false
    results.forEach((r) => {
      if (r) {
        newEstados.set(r.id, r.estado)
        changed = true
      }
    })
    if (changed) {
      setEstadosPagos(new Map(newEstados))
    }
  }, [estadosPagos])

  const filteredSocios = useMemo(() => {
    let result = sociosConCuota

    if (search.trim()) {
      const term = search.toLowerCase()
      result = result.filter((s: Socio) => {
        const nombre = `${s.name} ${s.lastName}`.toLowerCase()
        const email = (s.email ?? "").toLowerCase()
        const phone = (s.phone ?? "").toLowerCase()
        return nombre.includes(term) || email.includes(term) || phone.includes(term)
      })
    }

    if (filtroTipo) {
      result = result.filter((s: Socio) => {
        const cuota = cuotasMap.get(s.cuota_socio_id!)
        return cuota?.tipo_cuota === filtroTipo
      })
    }

    return result
  }, [sociosConCuota, search, filtroTipo, cuotasMap])

  const totalPages = Math.max(1, Math.ceil(filteredSocios.length / perPage))
  const paginatedSocios = filteredSocios.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  )

  // Cargar estados de pago cuando cambia la página
  useEffect(() => {
    if (paginatedSocios.length > 0) {
      loadEstadosPagos(paginatedSocios)
    }
  }, [paginatedSocios.map(s => s.id).join(",")]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePerPageChange = (newPerPage: number) => {
    setPerPage(newPerPage)
    setCurrentPage(1)
  }

  const getTipoCuotaBadge = (cuota: CuotaSocio | undefined) => {
    if (!cuota) return <span className="text-gray-400 text-xs">Sin datos</span>
    if (cuota.tipo_cuota === "porcentaje") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          <Percent className="w-3 h-3 mr-1" />
          Porcentaje
        </span>
      )
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        <DollarSign className="w-3 h-3 mr-1" />
        Monto Fijo
      </span>
    )
  }

  const getPeriodicidadLabel = (periodicidad: string) => {
    const labels: Record<string, string> = {
      diario: "Diario",
      semanal: "Semanal",
      quincenal: "Quincenal",
      mensual: "Mensual",
    }
    return labels[periodicidad] || periodicidad
  }

  const getMontoDisplay = (cuota: CuotaSocio | undefined) => {
    if (!cuota) return "-"
    if (cuota.tipo_cuota === "porcentaje") {
      return `${Number(cuota.porcentaje_comision || 0)}%`
    }
    return `S/ ${Number(cuota.monto_cuota).toFixed(2)}`
  }

  const getEstadoPagoBadge = (socioId: number) => {
    const estado = estadosPagos.get(socioId)
    if (!estado) {
      return <span className="text-gray-300 text-xs">Cargando...</span>
    }

    if (estado.periodos_vencidos > 0) {
      return (
        <div className="flex flex-col items-center gap-1">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Vencido
          </span>
          <span className="text-[10px] text-red-600 font-medium">
            {estado.dias_vencimiento} {estado.dias_vencimiento === 1 ? "día" : "días"} vencido
          </span>
          {estado.periodos_vencidos > 1 && (
            <span className="text-[10px] text-red-500">
              ({estado.periodos_vencidos} períodos)
            </span>
          )}
        </div>
      )
    }

    if (estado.periodos_pendientes > 0) {
      const dias = estado.dias_vencimiento ?? 0
      const esUrgente = dias <= 1
      return (
        <div className="flex flex-col items-center gap-1">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            esUrgente ? "bg-orange-100 text-orange-800" : "bg-yellow-100 text-yellow-800"
          }`}>
            {esUrgente ? <AlertTriangle className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
            {dias === 0 ? "Vence hoy" : "Por vencer"}
          </span>
          {dias > 0 && (
            <span className={`text-[10px] font-medium ${esUrgente ? "text-orange-600" : "text-yellow-600"}`}>
              {dias} {dias === 1 ? "día" : "días"} restantes
            </span>
          )}
        </div>
      )
    }

    return (
      <div className="flex flex-col items-center gap-1">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Al día
        </span>
      </div>
    )
  }

  const isLoading = isLoadingSocios || isLoadingCuotas

  return (
    <div className="space-y-6">
      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Socios con Cuota</p>
              <p className="text-2xl font-bold text-gray-900">{sociosConCuota.length}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Monto Fijo</p>
              <p className="text-2xl font-bold text-blue-600">
                {sociosConCuota.filter((s: Socio) => cuotasMap.get(s.cuota_socio_id!)?.tipo_cuota === "monto_fijo").length}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Porcentaje</p>
              <p className="text-2xl font-bold text-purple-600">
                {sociosConCuota.filter((s: Socio) => cuotasMap.get(s.cuota_socio_id!)?.tipo_cuota === "porcentaje").length}
              </p>
            </div>
            <Percent className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Lista */}
      <Section title="">
        <div className="p-2 sm:p-6">
          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre, email o teléfono..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => { setFiltroTipo(""); setCurrentPage(1) }}
                variant={filtroTipo === "" ? "default" : "outline"}
                className={filtroTipo === "" ? "bg-blue-600 hover:bg-blue-700" : ""}
              >
                Todos
              </Button>
              <Button
                onClick={() => { setFiltroTipo("monto_fijo"); setCurrentPage(1) }}
                variant={filtroTipo === "monto_fijo" ? "default" : "outline"}
                className={filtroTipo === "monto_fijo" ? "bg-blue-600 hover:bg-blue-700" : ""}
              >
                Monto Fijo
              </Button>
              <Button
                onClick={() => { setFiltroTipo("porcentaje"); setCurrentPage(1) }}
                variant={filtroTipo === "porcentaje" ? "default" : "outline"}
                className={filtroTipo === "porcentaje" ? "bg-purple-600 hover:bg-purple-700" : ""}
              >
                Porcentaje
              </Button>
            </div>
          </div>

          {/* Tabla */}
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-[60px] w-full" />
              ))}
            </div>
          ) : (
            <>
              <div className="relative overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th scope="col" className="px-4 py-3">#</th>
                      <th scope="col" className="px-4 py-3">Socio</th>
                      {/* <th scope="col" className="px-4 py-3">Tipo Negocio</th> */}
                      <th scope="col" className="px-4 py-3 text-center">Tipo Cuota</th>
                      <th scope="col" className="px-4 py-3 text-center">Monto / %</th>
                      <th scope="col" className="px-4 py-3 text-center">Periodicidad</th>
                      <th scope="col" className="px-4 py-3 text-center">Estado Cuota</th>
                      <th scope="col" className="px-4 py-3 text-center">Monto a Pagar</th>
                      <th scope="col" className="px-4 py-3 text-center">Estado Pago</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedSocios.length === 0 ? (
                      <tr className="bg-white">
                        <td colSpan={8} className="px-4 py-12 text-center">
                          <div className="text-gray-500">No se encontraron socios con cuota asignada</div>
                        </td>
                      </tr>
                    ) : (
                      paginatedSocios.map((socio: Socio, index: number) => {
                        const cuota = cuotasMap.get(socio.cuota_socio_id!)
                        return (
                          <tr key={socio.id} className="bg-white border-b hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 text-gray-500">
                              {(currentPage - 1) * perPage + index + 1}
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-medium text-gray-800">
                                {socio.name} {socio.lastName}
                              </div>
                              <div className="text-xs text-gray-500">{socio.email}</div>
                              {socio.phone && (
                                <div className="text-xs text-gray-400">{socio.phone}</div>
                              )}
                            </td>
                            {/* <td className="px-4 py-3 text-gray-600 capitalize">
                              {socio.businessType || "-"}
                            </td> */}
                            <td className="px-4 py-3 text-center">
                              {getTipoCuotaBadge(cuota)}
                            </td>
                            <td className="px-4 py-3 text-center font-semibold text-gray-800">
                              {getMontoDisplay(cuota)}
                            </td>
                            <td className="px-4 py-3 text-center text-gray-600">
                              {cuota ? getPeriodicidadLabel(cuota.periodicidad) : "-"}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {cuota?.estado === "activo" ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Activo
                                </span>
                              ) : cuota ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  Inactivo
                                </span>
                              ) : (
                                <span className="text-gray-400 text-xs">-</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center font-semibold">
                              {(() => {
                                const estado = estadosPagos.get(socio.id)
                                if (!estado) return <span className="text-gray-300 text-xs">Cargando...</span>
                                if (estado.periodos_vencidos > 0) {
                                  return <span className="text-red-600">S/ {Number(estado.total_adeudado).toFixed(2)}</span>
                                }
                                if (estado.monto_esperado > 0) {
                                  return <span className="text-gray-800">S/ {Number(estado.monto_esperado).toFixed(2)}</span>
                                }
                                return <span className="text-green-600">-</span>
                              })()}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {getEstadoPagoBadge(socio.id)}
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {filteredSocios.length > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredSocios.length}
                  perPage={perPage}
                  onPageChange={handlePageChange}
                  onPerPageChange={handlePerPageChange}
                  itemsInCurrentPage={paginatedSocios.length}
                />
              )}
            </>
          )}
        </div>
      </Section>
    </div>
  )
}
