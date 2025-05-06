// app\admin\local-rating\page.tsx
"use client"

import type React from "react"
import { useState, useEffect } from "react"
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
import { Progress } from "@/components/ui/progress"
import { Star, Search, MapPin, Building, ArrowUpDown, Info, MessageSquare, ShoppingBag } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import Image from "next/image"
import { fetchLocales, fetchRestaurantInfo, type Local, type RestaurantInfo } from "./services/rating.service"

const Rating: React.FC = () => {
  const [locales, setLocales] = useState<Local[]>([])
  const [filteredLocales, setFilteredLocales] = useState<Local[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [filterCity, setFilterCity] = useState<string>("all")
  const [sortBy, setSortBy] = useState<"nombre" | "puntuacion" | "pedidoCount">("puntuacion")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [selectedLocal, setSelectedLocal] = useState<Local | null>(null)
  const [restaurantInfo, setRestaurantInfo] = useState<RestaurantInfo | null>(null)
  const [loadingRestaurantInfo, setLoadingRestaurantInfo] = useState<boolean>(false)
  const [cities, setCities] = useState<string[]>([])

  // Función para asegurar que un valor sea un número
  const ensureNumber = (value: number | string | null | undefined): number => {
    // Si es un número, devolverlo directamente
    if (typeof value === "number") return value

    // Si es una cadena, intentar convertirla a número
    if (typeof value === "string") {
      const parsed = Number.parseFloat(value)
      return isNaN(parsed) ? 0 : parsed
    }

    // Para cualquier otro caso, devolver 0
    return 0
  }

  // Cargar los datos de los locales
  useEffect(() => {
    const loadLocales = async (): Promise<void> => {
      try {
        setLoading(true)
        const data = await fetchLocales()

        // Asegurarse de que todas las puntuaciones sean números
        const processedData = data.map((local) => ({
          ...local,
          puntuacion: ensureNumber(local.puntuacion),
        }))

        setLocales(processedData)
        setFilteredLocales(processedData)

        // Extraer ciudades únicas para el filtro
        const uniqueCities = Array.from(new Set(processedData.map((local) => local.ciudad)))
        setCities(uniqueCities as string[])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido")
        console.error("Error:", err)
      } finally {
        setLoading(false)
      }
    }

    loadLocales()
  }, [])

  // Filtrar y ordenar locales
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

    // Aplicar ordenamiento
    result.sort((a, b) => {
      if (sortOrder === "asc") {
        return a[sortBy] > b[sortBy] ? 1 : -1
      } else {
        return a[sortBy] < b[sortBy] ? 1 : -1
      }
    })

    setFilteredLocales(result)
  }, [locales, searchTerm, filterCity, sortBy, sortOrder])

  // Función para cargar la información detallada del restaurante
  const loadRestaurantInfo = async (localId: number): Promise<void> => {
    try {
      setLoadingRestaurantInfo(true)
      const info = await fetchRestaurantInfo(localId)
      setRestaurantInfo(info)
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err instanceof Error ? err.message : "Error desconocido",
      })
    } finally {
      setLoadingRestaurantInfo(false)
    }
  }

  // Función para cambiar el orden
  const toggleSortOrder = (field: "nombre" | "puntuacion" | "pedidoCount"): void => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortOrder("desc")
    }
  }

  // Renderizar estrellas para la puntuación
  const renderStars = (rating: number): JSX.Element => {
    // Asegurar que rating sea un número
    const numRating = ensureNumber(rating)

    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= numRating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
          />
        ))}
      </div>
    )
  }

  // Función para formatear la puntuación
  const formatRating = (rating: number | string): string => {
    const numRating = ensureNumber(rating)
    return numRating.toFixed(1)
  }

  // Renderizar la distribución de calificaciones
  const renderRatingDistribution = (): JSX.Element | null => {
    if (!restaurantInfo || !restaurantInfo.ratingCounts) return null

    const counts = restaurantInfo.ratingCounts
    const total = counts["1"] + counts["2"] + counts["3"] + counts["4"] + counts["5"]

    return (
      <div className="space-y-3 mt-4">
        <h4 className="text-sm font-medium">Distribución de calificaciones</h4>

        {[5, 4, 3, 2, 1].map((rating) => {
          const count = counts[rating as unknown as keyof typeof counts] || 0
          const percentage = total > 0 ? (count / total) * 100 : 0

          return (
            <div key={rating} className="flex items-center gap-2">
              <div className="flex items-center w-12">
                <span className="text-sm font-medium">{rating}</span>
                <Star className="h-4 w-4 ml-1 text-yellow-500 fill-yellow-500" />
              </div>
              <Progress value={percentage} className="h-2 flex-1" />
              <span className="text-xs text-gray-500 w-10 text-right">{count}</span>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <MainLayout>
      <div className="container mx-auto p-4">
        <Card className="shadow-md">
          <CardHeader className="bg-white border-b">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <Building className="h-6 w-6 text-red-600" />
                  Calificaciones
                </CardTitle>
                <CardDescription>Visualiza las calificaciones y comentarios de los locales</CardDescription>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Buscar local o empresa..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <Select value={filterCity} onValueChange={setFilterCity}>
                  <SelectTrigger className="w-full sm:w-40">
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

          <CardContent className="p-0">
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
                      <TableHead className="min-w-[200px]">
                        <button className="flex items-center gap-1" onClick={() => toggleSortOrder("nombre")}>
                          Local
                          <ArrowUpDown className="h-4 w-4" />
                        </button>
                      </TableHead>
                      <TableHead className="min-w-[150px]">
                        <button className="flex items-center gap-1" onClick={() => toggleSortOrder("puntuacion")}>
                          Puntuación
                          <ArrowUpDown className="h-4 w-4" />
                        </button>
                      </TableHead>
                      <TableHead className="min-w-[150px]">
                        <button className="flex items-center gap-1" onClick={() => toggleSortOrder("pedidoCount")}>
                          Pedidos
                          <ArrowUpDown className="h-4 w-4" />
                        </button>
                      </TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLocales.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                          No se encontraron locales con los filtros aplicados
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredLocales.map((local) => (
                        <TableRow key={local.id}>
                          <TableCell className="font-medium">{local.id}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {local.logo ? (
                                <Image
                                  src={local.logo || "/placeholder.svg"}
                                  alt={local.nombre}
                                  width={32}
                                  height={32}
                                  className="rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                  <Building className="h-4 w-4 text-gray-500" />
                                </div>
                              )}
                              <span className="font-medium">{local.nombre}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {renderStars(local.puntuacion)}
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                  ensureNumber(local.puntuacion) >= 4
                                    ? "bg-green-100 text-green-800"
                                    : ensureNumber(local.puntuacion) >= 3
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-red-100 text-red-800"
                                }`}
                              >
                                {formatRating(local.puntuacion)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <ShoppingBag className="h-4 w-4 text-gray-500" />
                              <span>{local.pedidoCount}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedLocal(local)
                                    loadRestaurantInfo(local.business_id)
                                  }}
                                >
                                  Ver Detalles
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-3xl">
                                <DialogHeader>
                                  <DialogTitle className="text-xl flex items-center gap-2">
                                    <Star className="h-5 w-5 text-yellow-500" />
                                    Detalles de Calificaciones
                                  </DialogTitle>
                                </DialogHeader>

                                {loadingRestaurantInfo ? (
                                  <div className="flex justify-center items-center h-64">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                                  </div>
                                ) : selectedLocal && restaurantInfo ? (
                                  <div className="space-y-6">
                                    <div className="flex flex-col md:flex-row gap-6">
                                      {/* Información del local */}
                                      <div className="md:w-1/3 space-y-4">
                                        <div className="flex items-center gap-3 border-b pb-4">
                                          {selectedLocal.logo ? (
                                            <Image
                                              src={selectedLocal.logo || "/placeholder.svg"}
                                              alt={selectedLocal.nombre}
                                              width={80}
                                              height={80}
                                              className="rounded-lg object-cover"
                                            />
                                          ) : (
                                            <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                                              <Building className="h-10 w-10 text-gray-500" />
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
                                          <div className="flex items-center gap-2 mb-2">
                                            <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                                            <span className="font-medium">
                                              Calificación general: {restaurantInfo.rating}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            {renderStars(Number.parseFloat(restaurantInfo.rating))}
                                          </div>

                                          <div className="flex items-center gap-2 mt-4">
                                            <ShoppingBag className="h-5 w-5 text-gray-500" />
                                            <span className="font-medium">
                                              Total de pedidos: {restaurantInfo.pedidoCount}
                                            </span>
                                          </div>

                                          {renderRatingDistribution()}
                                        </div>
                                      </div>

                                      {/* Comentarios */}
                                      <div className="md:w-2/3 border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6">
                                        <div className="flex items-center gap-2 mb-4">
                                          <MessageSquare className="h-5 w-5 text-gray-500" />
                                          <h3 className="font-medium text-lg">Comentarios de clientes</h3>
                                        </div>

                                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                                          {restaurantInfo.comentarios && restaurantInfo.comentarios.length > 0 ? (
                                            restaurantInfo.comentarios.map((comentario) => (
                                              <div key={comentario.id} className="border rounded-lg p-4 space-y-2">
                                                <div className="flex justify-between items-start">
                                                  <span className="font-medium">{comentario.cliente}</span>
                                                  <div className="flex items-center gap-1">
                                                    <span className="text-sm">{comentario.rating}</span>
                                                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                                  </div>
                                                </div>
                                                <p className="text-sm text-gray-700">{comentario.comentario}</p>
                                              </div>
                                            ))
                                          ) : (
                                            <div className="text-center py-8 text-gray-500">
                                              No hay comentarios disponibles
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-center py-8 text-gray-500">
                                    No se pudo cargar la información del restaurante
                                  </div>
                                )}

                                <DialogFooter className="flex justify-end gap-2 mt-4">
                                  <DialogClose asChild>
                                    <Button variant="outline">Cerrar</Button>
                                  </DialogClose>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}

export default Rating
