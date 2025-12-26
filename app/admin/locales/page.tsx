// app\admin\locales\page.tsx
"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import MainLayout from "../components/MainLayout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CustomSlider } from "@/components/ui/custom-slider"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  MapPin,
  Building,
  ArrowUpDown,
  Info,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import Image from "next/image"
import { fetchLocales, updateLocalPriority, type Local, fetchPriorityStats } from "./services/locales.service"

const Locales: React.FC = () => {
  const [locales, setLocales] = useState<Local[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("")
  const [filterCity, setFilterCity] = useState<string>("all")
  const [sortBy, setSortBy] = useState<"nombre" | "prioridad" | "empresa">("prioridad")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [selectedLocal, setSelectedLocal] = useState<Local | null>(null)
  const [newPriority, setNewPriority] = useState<number>(0)
  const [cities, setCities] = useState<string[]>([])
  const [updatingPriority, setUpdatingPriority] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<string>("todos")
  const [filteredLocales, setFilteredLocales] = useState<Local[]>([])

  // Paginación
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [perPage, setPerPage] = useState<number>(10)
  const [totalItems, setTotalItems] = useState<number>(0)
  const [totalPages, setTotalPages] = useState<number>(1)

  // Añadir un nuevo estado para el total de locales
  const [totalLocales, setTotalLocales] = useState<number>(0)

  // Función para asegurar que un valor sea un número
  const ensureNumber = (value: number | string | null | undefined): number => {
    if (typeof value === "number") return value
    if (typeof value === "string") {
      const parsed = Number.parseFloat(value)
      return isNaN(parsed) ? 0 : parsed
    }
    return 0
  }

  // Debounce para la búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Cargar los datos de los locales
  const loadLocales = useCallback(async (): Promise<void> => {
    try {
      setLoading(true)

      // Mapear el activeTab al formato esperado por la API
      const priorityLevel = activeTab === "todos" ? "todos" : (activeTab as "alta" | "media" | "baja")

      const response = await fetchLocales(currentPage, perPage, {
        search: debouncedSearchTerm,
        city: filterCity,
        priorityLevel,
      })

      // Asegurarse de que todas las prioridades sean números
      const processedData = response.data.map((local) => ({
        ...local,
        prioridad: ensureNumber(local.prioridad || 0),
      }))

      setLocales(processedData)
      setTotalItems(response.meta.total)
      setTotalPages(response.meta.last_page)

      // Obtener el total de locales para el rango del slider
      const stats = await fetchPriorityStats()
      setTotalLocales(stats.totalLocales)

      // Si es la primera carga, extraer ciudades únicas para el filtro
      if (cities.length === 0) {
        // Obtener todas las ciudades (esto podría requerir una llamada API separada en un entorno real)
        const uniqueCities = Array.from(new Set(processedData.map((local) => local.ciudad)))
        setCities(uniqueCities as string[])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
      console.error("Error:", err)
    } finally {
      setLoading(false)
    }
  }, [currentPage, perPage, debouncedSearchTerm, filterCity, activeTab, cities.length])

  // Cargar datos cuando cambien los filtros o la paginación
  useEffect(() => {
    loadLocales()
  }, [loadLocales])

  // Función para actualizar la prioridad
  const handleUpdatePriority = async (): Promise<void> => {
    if (!selectedLocal) return

    try {
      setUpdatingPriority(true)

      await updateLocalPriority(selectedLocal.id, newPriority)

      // Actualizar el estado local
      setLocales((prevLocales) =>
        prevLocales.map((local) => {
          if (local.id === selectedLocal.id) {
            return { ...local, prioridad: newPriority }
          }
          return local
        }),
      )

      toast({
        title: "Prioridad actualizada",
        description: `La prioridad de ${selectedLocal.nombre} ha sido actualizada a ${newPriority}`,
      })
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err instanceof Error ? err.message : "Error desconocido",
      })
    } finally {
      setUpdatingPriority(false)
    }
  }

  // Función para cambiar el orden
  const toggleSortOrder = (field: "nombre" | "prioridad" | "empresa"): void => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortOrder("desc")
    }

    // Volver a la primera página al cambiar el orden
    setCurrentPage(1)
  }

  // Renderizar indicador de prioridad
  const renderPriorityBadge = (priority: number): React.JSX.Element => {
    let color = ""
    let label = ""

    // Si no hay locales, usar valores predeterminados
    if (totalLocales === 0) {
      color = "bg-gray-100 text-gray-800"
      label = "Sin definir"
    } else {
      // Calcular los umbrales para las categorías basados en el total de locales
      const lowThreshold = Math.ceil(totalLocales * 0.33) // Primer tercio
      const mediumThreshold = Math.ceil(totalLocales * 0.67) // Segundo tercio

      // Ordenar las prioridades de menor a mayor
      const sortedPriorities = [...locales].map((l) => l.prioridad).sort((a, b) => a - b)
      const position = sortedPriorities.indexOf(priority) + 1

      if (position <= lowThreshold) {
        color = "bg-green-100 text-green-800 hover:bg-green-100 hover:text-green-800"
        label = "Baja"
      } else if (position <= mediumThreshold) {
        color = "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 hover:text-yellow-800"
        label = "Media"
      } else {
        color = "bg-red-100 text-red-800 hover:bg-red-100 hover:text-red-800"
        label = "Alta"
      }
    }

    return (
      <Badge className={`${color} transition-none`}>
        {label} ({priority})
      </Badge>
    )
  }

  // Manejar cambio de página
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }


  const renderLocalesTable = (): React.JSX.Element => {
    return (
      <>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        ) : error ? (
          <div className="m-4 p-4 border border-red-200 bg-red-50 text-red-700 rounded-md">
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              <p className="font-medium">Error</p>
            </div>
            <p className="mt-1">{error}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">#</TableHead>
                  <TableHead className="min-w-[120px] sm:min-w-[200px]">
                    <button className="flex items-center gap-1" onClick={() => toggleSortOrder("nombre")}>
                      Local
                      <ArrowUpDown className="h-4 w-4" />
                    </button>
                  </TableHead>
                  <TableHead className="hidden md:table-cell min-w-[150px]">
                    <button className="flex items-center gap-1" onClick={() => toggleSortOrder("empresa")}>
                      Empresa/Socio
                      <ArrowUpDown className="h-4 w-4" />
                    </button>
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">Dirección</TableHead>
                  <TableHead className="min-w-[100px] sm:min-w-[150px]">
                    <button className="flex items-center gap-1" onClick={() => toggleSortOrder("prioridad")}>
                      Prioridad
                      <ArrowUpDown className="h-4 w-4" />
                    </button>
                  </TableHead>
                  <TableHead className="text-right min-w-[80px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLocales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No se encontraron locales con los filtros aplicados
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLocales.map((local, index) => (
                    <TableRow key={local.id}>
                      <TableCell className="font-medium">{(currentPage - 1) * perPage + index + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {local.logo ? (
                            <Image
                              src={local.logo || "/placeholder.svg"}
                              alt={local.nombre}
                              width={32}
                              height={32}
                              className="rounded-full object-cover shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center shrink-0">
                              <Building className="h-4 w-4 text-gray-500" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <span className="font-medium text-sm sm:text-base block truncate">{local.nombre}</span>
                            <span className="text-xs text-gray-500 md:hidden block truncate">{local.empresa}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{local.empresa}</TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex items-start gap-1">
                          <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm line-clamp-2">{local.direccion}</span>
                        </div>
                      </TableCell>
                      <TableCell>{renderPriorityBadge(local.prioridad)}</TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedLocal(local)
                                setNewPriority(ensureNumber(local.prioridad))
                              }}
                              className="hover:bg-gray-100 hover:text-gray-900 transition-colors text-xs sm:text-sm px-2 sm:px-4"
                            >
                              <span className="hidden sm:inline">Establecer Prioridad</span>
                              <span className="sm:hidden">Editar</span>
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle className="text-xl flex items-center gap-2">
                                <ArrowUp className="h-5 w-5 text-red-500" />
                                Establecer Prioridad
                              </DialogTitle>
                            </DialogHeader>

                            {selectedLocal && (
                              <div className="space-y-4">
                                <div className="flex items-center gap-3 border-b pb-4">
                                  {selectedLocal.logo ? (
                                    <Image
                                      src={selectedLocal.logo || "/placeholder.svg"}
                                      alt={selectedLocal.nombre}
                                      width={64}
                                      height={64}
                                      className="rounded-lg object-cover"
                                    />
                                  ) : (
                                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                      <Building className="h-8 w-8 text-gray-500" />
                                    </div>
                                  )}
                                  <div>
                                    <h3 className="font-bold text-lg">{selectedLocal.nombre}</h3>
                                    <p className="text-sm text-gray-500">{selectedLocal.empresa}</p>
                                  </div>
                                </div>

                                <div>
                                  <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-gray-500" />
                                    <span className="text-sm">{selectedLocal.direccion}</span>
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Building className="h-4 w-4 text-gray-500" />
                                    <span className="text-sm">{selectedLocal.ciudad}</span>
                                  </div>
                                </div>

                                <div className="border-t pt-4">
                                  <label className="block text-sm font-medium mb-2">
                                    Prioridad actual: {selectedLocal.prioridad}
                                  </label>
                                  <div className="flex items-center gap-2">
                                    {renderPriorityBadge(selectedLocal.prioridad)}
                                  </div>

                                  <label className="block text-sm font-medium mt-4 mb-2">
                                    Nueva prioridad: {newPriority}
                                  </label>
                                  <div className="flex flex-col gap-2">
                                    <CustomSlider
                                      value={[newPriority]}
                                      min={1}
                                      max={totalLocales > 0 ? totalLocales : 100}
                                      step={1}
                                      onValueChange={(value) => setNewPriority(value[0])}
                                      className="py-4"
                                    />
                                    <div className="flex justify-between text-xs text-gray-500">
                                      <span>Baja (1)</span>
                                      <span>Media ({Math.ceil(totalLocales / 2)})</span>
                                      <span>Alta ({totalLocales})</span>
                                    </div>
                                  </div>

                                  <div className="mt-2 text-sm text-gray-500">
                                    <p>
                                      <strong>Prioridad Baja (1-{Math.ceil(totalLocales * 0.33)}):</strong> Locales con
                                      menor visibilidad.
                                    </p>
                                    <p>
                                      <strong>
                                        Prioridad Media ({Math.ceil(totalLocales * 0.33) + 1}-
                                        {Math.ceil(totalLocales * 0.67)}):
                                      </strong>{" "}
                                      Locales con visibilidad estándar.
                                    </p>
                                    <p>
                                      <strong>
                                        Prioridad Alta ({Math.ceil(totalLocales * 0.67) + 1}-{totalLocales}):
                                      </strong>{" "}
                                      Locales destacados en la aplicación.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}

                            <DialogFooter className="flex justify-end gap-2 mt-4">
                              <DialogClose asChild>
                                <Button variant="outline">Cancelar</Button>
                              </DialogClose>
                              <Button
                                onClick={handleUpdatePriority}
                                disabled={updatingPriority || newPriority === ensureNumber(selectedLocal?.prioridad)}
                                className="bg-red-600 hover:bg-red-700 text-white transition-colors"
                              >
                                {updatingPriority ? (
                                  <>
                                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                    Actualizando...
                                  </>
                                ) : (
                                  "Guardar prioridad"
                                )}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* Paginación */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 p-3 sm:p-4 border-t">
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                <span className="text-gray-500 hidden sm:inline">Mostrar</span>
                <Select
                  value={perPage.toString()}
                  onValueChange={(value) => {
                    setPerPage(Number(value))
                    setCurrentPage(1)
                  }}
                >
                  <SelectTrigger className="w-[60px] sm:w-[70px] h-8 text-xs sm:text-sm">
                    <SelectValue placeholder={perPage.toString()} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-gray-500 hidden sm:inline">por página</span>
              </div>

              <div className="flex items-center gap-1 order-3 sm:order-2">
                <span className="text-xs sm:text-sm text-gray-500">
                  <span className="sm:hidden">
                    {filteredLocales.length > 0 ? (currentPage - 1) * perPage + 1 : 0}-
                    {Math.min(currentPage * perPage, totalItems)} de {totalItems}
                  </span>
                  <span className="hidden sm:inline">
                    Mostrando {filteredLocales.length > 0 ? (currentPage - 1) * perPage + 1 : 0} a{" "}
                    {Math.min(currentPage * perPage, totalItems)} de {totalItems} resultados
                  </span>
                </span>
              </div>

              <div className="flex items-center order-2 sm:order-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className="h-7 w-7 sm:h-8 sm:w-8"
                >
                  <ChevronsLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="h-7 w-7 sm:h-8 sm:w-8 ml-1"
                >
                  <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>

                <div className="flex items-center mx-1 sm:mx-2">
                  {Array.from({ length: Math.min(window.innerWidth < 640 ? 3 : 5, totalPages) }, (_, i) => {
                    let pageToShow: number
                    const maxPages = window.innerWidth < 640 ? 3 : 5
                    if (totalPages <= maxPages) {
                      pageToShow = i + 1
                    } else if (currentPage <= Math.floor(maxPages / 2) + 1) {
                      pageToShow = i + 1
                    } else if (currentPage >= totalPages - Math.floor(maxPages / 2)) {
                      pageToShow = totalPages - maxPages + 1 + i
                    } else {
                      pageToShow = currentPage - Math.floor(maxPages / 2) + i
                    }

                    return (
                      <Button
                        key={pageToShow}
                        variant={currentPage === pageToShow ? "default" : "outline"}
                        size="icon"
                        onClick={() => handlePageChange(pageToShow)}
                        className={`h-7 w-7 sm:h-8 sm:w-8 mx-0.5 text-xs sm:text-sm ${currentPage === pageToShow ? "bg-red-600 hover:bg-red-700" : ""}`}
                      >
                        {pageToShow}
                      </Button>
                    )
                  })}
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="h-7 w-7 sm:h-8 sm:w-8 mr-1"
                >
                  <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  className="h-7 w-7 sm:h-8 sm:w-8"
                >
                  <ChevronsRight className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </>
    )
  }

  useEffect(() => {
    let result = [...locales]

    // Aplicar filtro de búsqueda
    if (searchTerm) {
      result = result.filter(
        (local) =>
          local.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          local.empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
          local.direccion.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Aplicar filtro de ciudad
    if (filterCity !== "all") {
      result = result.filter((local) => local.ciudad === filterCity)
    }

    // Calcular los umbrales para las categorías basados en el total de locales
    const lowThreshold = Math.ceil(totalLocales * 0.33) // Primer tercio
    const mediumThreshold = Math.ceil(totalLocales * 0.67) // Segundo tercio

    // Aplicar filtro por tab
    if (activeTab === "baja") {
      result = result.filter((local) => local.prioridad <= lowThreshold)
    } else if (activeTab === "media") {
      result = result.filter((local) => local.prioridad > lowThreshold && local.prioridad <= mediumThreshold)
    } else if (activeTab === "alta") {
      result = result.filter((local) => local.prioridad > mediumThreshold)
    }

    // Aplicar ordenamiento
    result.sort((a, b) => {
      if (sortBy === "prioridad") {
        // Para prioridad, ordenar numéricamente
        return sortOrder === "asc" ? a.prioridad - b.prioridad : b.prioridad - a.prioridad
      } else {
        // Para otros campos, ordenar alfabéticamente
        if (sortOrder === "asc") {
          return a[sortBy] > b[sortBy] ? 1 : -1
        } else {
          return a[sortBy] < b[sortBy] ? 1 : -1
        }
      }
    })

    setFilteredLocales(result)
  }, [locales, searchTerm, filterCity, sortBy, sortOrder, activeTab, totalLocales])

  return (
    <MainLayout>
      <div className="w-full px-0 sm:container sm:mx-auto sm:px-4 py-3 sm:py-4">
        <Card className="shadow-md rounded-none sm:rounded-lg">
          <CardHeader className="bg-white border-b p-3 sm:p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4">
              <div>
                <CardTitle className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <Building className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
                  Prioridad de Locales
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm mt-1">
                  Administra la prioridad de visualización de los locales en la aplicación
                </CardDescription>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full md:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Buscar local..."
                    className="pl-8 text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <Select value={filterCity} onValueChange={setFilterCity}>
                  <SelectTrigger className="w-full sm:w-40 text-sm">
                    <SelectValue placeholder="Ciudad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las ciudades</SelectItem>
                    {cities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>

          <Tabs defaultValue="todos" value={activeTab} onValueChange={setActiveTab}>
            <div className="px-3 sm:px-4 pt-3 sm:pt-4">
              <TabsList className="flex flex-wrap gap-1 sm:gap-2 w-full md:w-auto">
                <TabsTrigger
                  value="todos"
                  className="px-2 sm:px-4 text-xs sm:text-sm data-[state=active]:bg-red-100 data-[state=active]:text-red-800 hover:bg-gray-100"
                >
                  Todos
                </TabsTrigger>
                <TabsTrigger
                  value="alta"
                  className="px-2 sm:px-4 text-xs sm:text-sm data-[state=active]:bg-red-100 data-[state=active]:text-red-800 hover:bg-gray-100"
                >
                  <span className="hidden sm:inline">Prioridad Alta</span>
                  <span className="sm:hidden">Alta</span>
                </TabsTrigger>
                <TabsTrigger
                  value="media"
                  className="px-2 sm:px-4 text-xs sm:text-sm data-[state=active]:bg-red-100 data-[state=active]:text-red-800 hover:bg-gray-100"
                >
                  <span className="hidden sm:inline">Prioridad Media</span>
                  <span className="sm:hidden">Media</span>
                </TabsTrigger>
                <TabsTrigger
                  value="baja"
                  className="px-2 sm:px-4 text-xs sm:text-sm data-[state=active]:bg-red-100 data-[state=active]:text-red-800 hover:bg-gray-100"
                >
                  <span className="hidden sm:inline">Prioridad Baja</span>
                  <span className="sm:hidden">Baja</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="todos" className="m-0">
              <CardContent className="p-0">{renderLocalesTable()}</CardContent>
            </TabsContent>

            <TabsContent value="alta" className="m-0">
              <CardContent className="p-0">{renderLocalesTable()}</CardContent>
            </TabsContent>

            <TabsContent value="media" className="m-0">
              <CardContent className="p-0">{renderLocalesTable()}</CardContent>
            </TabsContent>

            <TabsContent value="baja" className="m-0">
              <CardContent className="p-0">{renderLocalesTable()}</CardContent>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </MainLayout>
  )
}

export default Locales
