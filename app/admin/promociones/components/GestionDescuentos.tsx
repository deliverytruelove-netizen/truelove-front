"use client"

import type React from "react"

import { useState, useEffect,useCallback } from "react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Pencil, Trash2, Plus, Gift, Award, Truck, Percent, Search, X, DollarSign } from "lucide-react"
import {
  getDescuentos,
  getTopClientes,
  createDescuento,
  updateDescuento,
  deleteDescuento,
  buscarClientes,
} from "../services/descuentos.service"
import type { DescuentoCliente, TopCliente, Cliente } from "../types/descuento.types"

export default function GestionDescuentos() {
  const { toast } = useToast()
  const [descuentos, setDescuentos] = useState<DescuentoCliente[]>([])
  const [topClientes, setTopClientes] = useState<TopCliente[]>([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [currentDescuento, setCurrentDescuento] = useState<Partial<DescuentoCliente>>({
    tipo_descuento: "porcentaje",
    valor: 10,
    fecha_inicio: new Date().toISOString().split("T")[0],
    estado: true,
  })
  const [isEditing, setIsEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null)
  const [selectedCliente, setSelectedCliente] = useState<TopCliente | null>(null)

  // Estados para la búsqueda de clientes
  const [openClienteSearch, setOpenClienteSearch] = useState(false)
  const [clienteSearchResults, setClienteSearchResults] = useState<Cliente[]>([])
  const [clienteSearchQuery, setClienteSearchQuery] = useState("")
  const [clienteSearchLoading, setClienteSearchLoading] = useState(false)



 const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [descuentosData, topClientesData] = await Promise.all([getDescuentos(), getTopClientes()])
      setDescuentos(descuentosData)
      setTopClientes(topClientesData)
    } catch (error) {
      console.error("Error al cargar datos:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast]) // Incluir toast como dependencia
  // Cargar descuentos y top clientes al montar el componente
  useEffect(() => {
    loadData()
  }, [loadData])
  // Función para buscar clientes
  const handleSearchClientes = async (query: string) => {
    setClienteSearchQuery(query)
    if (query.length < 3) {
      setClienteSearchResults([])
      return
    }

    try {
      setClienteSearchLoading(true)
      const results = await buscarClientes(query)
      setClienteSearchResults(results)
    } catch (error) {
      console.error("Error al buscar clientes:", error)
    } finally {
      setClienteSearchLoading(false)
    }
  }

  // Función para seleccionar un cliente de la búsqueda
  const handleSelectCliente = (cliente: Cliente) => {
    setCurrentDescuento({
      ...currentDescuento,
      id_cliente: cliente.id,
      cliente_nombre: cliente.nombre,
      cliente_documento: cliente.documento,
    })
    setOpenClienteSearch(false)
  }

  const handleOpenDialog = (descuento?: DescuentoCliente, cliente?: TopCliente) => {
    if (descuento) {
      setCurrentDescuento({
        ...descuento,
        fecha_inicio: descuento.fecha_inicio.split("T")[0],
        fecha_fin: descuento.fecha_fin ? descuento.fecha_fin.split("T")[0] : "",
        cliente_nombre: descuento.cliente ? `${descuento.cliente.nombre}` : `Cliente ID: ${descuento.id_cliente}`,
      })
      setIsEditing(true)
      setSelectedCliente(null)
    } else if (cliente) {
      setCurrentDescuento({
        id_cliente: cliente.id,
        cliente_nombre: cliente.nombre,
        tipo_descuento: "porcentaje",
        valor: 10,
        fecha_inicio: new Date().toISOString().split("T")[0],
        estado: true,
      })
      setIsEditing(false)
      setSelectedCliente(cliente)
    } else {
      setCurrentDescuento({
        tipo_descuento: "porcentaje",
        valor: 10,
        fecha_inicio: new Date().toISOString().split("T")[0],
        estado: true,
      })
      setIsEditing(false)
      setSelectedCliente(null)
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setCurrentDescuento({
      tipo_descuento: "porcentaje",
      valor: 10,
      fecha_inicio: new Date().toISOString().split("T")[0],
      estado: true,
    })
    setSelectedCliente(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentDescuento.id_cliente && !isEditing) {
      toast({
        title: "Error",
        description: "Debe seleccionar un cliente",
        variant: "destructive",
      })
      return
    }

    try {
      if (isEditing && currentDescuento.id) {
        await updateDescuento(currentDescuento.id, currentDescuento)
        toast({
          title: "Éxito",
          description: "Descuento actualizado correctamente",
        })
      } else {
        await createDescuento(currentDescuento)
        toast({
          title: "Éxito",
          description: "Descuento creado correctamente",
        })
      }

      handleCloseDialog()
      loadData()
    } catch (error) {
      console.error("Error al guardar descuento:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar el descuento",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteDescuento(id)
      toast({
        title: "Éxito",
        description: "Descuento eliminado correctamente",
      })
      loadData()
    } catch (error) {
      console.error("Error al eliminar descuento:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el descuento",
        variant: "destructive",
      })
    } finally {
      setConfirmDelete(null)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Sin fecha"
    return new Date(dateString).toLocaleDateString()
  }

  const getTipoDescuentoIcon = (tipo: string) => {
    switch (tipo) {
      case "porcentaje":
        return <Percent className="h-4 w-4 text-blue-500" />
      case "monto_fijo":
        return <DollarSign className="h-4 w-4 text-green-500" />
      case "delivery_gratis":
        return <Truck className="h-4 w-4 text-purple-500" />
      default:
        return <Gift className="h-4 w-4 text-gray-500" />
    }
  }

  const getTipoDescuentoText = (tipo: string, valor: number) => {
    switch (tipo) {
      case "porcentaje":
        return `${valor}% de descuento`
      case "monto_fijo":
        return `S/${valor} de descuento`
      case "delivery_gratis":
        return "Delivery gratis"
      default:
        return "Descuento"
    }
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="descuentos" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="descuentos">Descuentos Activos</TabsTrigger>
          <TabsTrigger value="top-clientes">Top Clientes</TabsTrigger>
        </TabsList>

        <TabsContent value="descuentos">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Gestión de Descuentos</h2>
            <Button onClick={() => handleOpenDialog()} className="bg-red-500 hover:bg-red-600">
              <Plus className="mr-2 h-4 w-4" /> Nuevo Descuento
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-4 text-center">Cargando descuentos...</div>
              ) : descuentos.length === 0 ? (
                <div className="p-4 text-center">No hay descuentos disponibles</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Código</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Vigencia</TableHead>
                      <TableHead>Usos</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {descuentos.map((descuento) => (
                      <TableRow key={descuento.id}>
                        <TableCell>
                          {descuento.cliente
                            ? `${descuento.cliente.nombre} ${descuento.cliente.apellido}`
                            : `Cliente ID: ${descuento.id_cliente}`}
                        </TableCell>
                        <TableCell>
                          <span className="font-mono bg-gray-100 p-1 rounded">{descuento.codigo}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {getTipoDescuentoIcon(descuento.tipo_descuento)}
                            <span className="ml-2">
                              {getTipoDescuentoText(descuento.tipo_descuento, descuento.valor)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {formatDate(descuento.fecha_inicio)} - {formatDate(descuento.fecha_fin)}
                        </TableCell>
                        <TableCell>
                          {descuento.cantidad_usos} / {descuento.usos_disponibles || "∞"}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              descuento.estado ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }`}
                          >
                            {descuento.estado ? "Activo" : "Inactivo"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(descuento)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setConfirmDelete(descuento.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="top-clientes">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Top Clientes por Pedidos Completados</h2>
          </div>

          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-4 text-center">Cargando clientes...</div>
              ) : topClientes.length === 0 ? (
                <div className="p-4 text-center">No hay datos de clientes disponibles</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Teléfono</TableHead>
                      <TableHead>Pedidos Completados</TableHead>
                      <TableHead>Descuento Activo</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topClientes.map((cliente) => (
                      <TableRow key={cliente.id}>
                        <TableCell>{cliente.nombre}</TableCell>
                        <TableCell>{cliente.email}</TableCell>
                        <TableCell>{cliente.celular}</TableCell>
                        <TableCell>
                          <span className="flex items-center">
                            <Award className="h-4 w-4 mr-1 text-yellow-500" />
                            {cliente.total_pedidos}
                          </span>
                        </TableCell>
                        <TableCell>
                          {cliente.tiene_descuento_activo && cliente.descuento ? (
                            <div className="flex items-center">
                              {getTipoDescuentoIcon(cliente.descuento.tipo_descuento)}
                              <span className="ml-1 px-2 py-1 rounded text-xs bg-green-100 text-green-800">
                                {getTipoDescuentoText(cliente.descuento.tipo_descuento, cliente.descuento.valor)} -{" "}
                                {cliente.descuento.codigo}
                              </span>
                            </div>
                          ) : (
                            <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-800">Sin descuento</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDialog(undefined, cliente)}
                            disabled={cliente.tiene_descuento_activo}
                          >
                            <Gift className="h-4 w-4 mr-1" />
                            {cliente.tiene_descuento_activo ? "Ya tiene descuento" : "Crear descuento"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Diálogo para crear/editar descuento */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Editar Descuento" : "Nuevo Descuento"}</DialogTitle>
            <DialogDescription>
              {selectedCliente
                ? `Crear descuento para ${selectedCliente.nombre} (${selectedCliente.total_pedidos} pedidos)`
                : `Complete los campos para ${isEditing ? "actualizar el" : "crear un nuevo"} descuento.`}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              {!selectedCliente && !isEditing && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="cliente" className="text-right">
                    Cliente
                  </Label>
                  <div className="col-span-3 relative">
                    <div className="relative">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Buscar cliente por documento o nombre..."
                          value={clienteSearchQuery}
                          onChange={(e) => handleSearchClientes(e.target.value)}
                          className="w-full"
                        />
                        <Button variant="outline" type="button" onClick={() => setOpenClienteSearch(true)}>
                          <Search className="h-4 w-4" />
                        </Button>
                      </div>

                      {currentDescuento.cliente_nombre && (
                        <div className="mt-2 p-2 border rounded flex justify-between items-center">
                          <span>{currentDescuento.cliente_nombre}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setCurrentDescuento({
                                ...currentDescuento,
                                id_cliente: undefined,
                                cliente_nombre: undefined,
                                cliente_documento: undefined,
                              })
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}

                      <Dialog open={openClienteSearch} onOpenChange={setOpenClienteSearch}>
                        <DialogContent className="sm:max-w-[500px]">
                          <DialogHeader>
                            <DialogTitle>Buscar Cliente</DialogTitle>
                            <DialogDescription>Busca clientes por documento o nombre</DialogDescription>
                          </DialogHeader>
                          <div className="py-4">
                            <Input
                              placeholder="Buscar por documento o nombre..."
                              value={clienteSearchQuery}
                              onChange={(e) => handleSearchClientes(e.target.value)}
                              className="mb-4"
                            />

                            {clienteSearchLoading ? (
                              <div className="text-center py-4">Buscando...</div>
                            ) : clienteSearchQuery.length < 3 ? (
                              <div className="text-center py-4">Ingrese al menos 3 caracteres para buscar</div>
                            ) : clienteSearchResults.length === 0 ? (
                              <div className="text-center py-4">No se encontraron clientes</div>
                            ) : (
                              <div className="max-h-[300px] overflow-y-auto border rounded">
                                {clienteSearchResults.map((cliente) => (
                                  <div
                                    key={cliente.id}
                                    className="p-3 border-b hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                                    onClick={() => {
                                      handleSelectCliente(cliente)
                                      setOpenClienteSearch(false)
                                    }}
                                  >
                                    <div>
                                      <div className="font-medium">{cliente.nombre}</div>
                                      <div className="text-sm text-gray-500">
                                        Doc: {cliente.documento} | Pedidos: {cliente.total_pedidos}
                                      </div>
                                    </div>
                                    <Button variant="ghost" size="sm">
                                      Seleccionar
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setOpenClienteSearch(false)}>
                              Cancelar
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="tipo_descuento" className="text-right">
                  Tipo de Descuento
                </Label>
                <div className="col-span-3">
                  <select
                    id="tipo_descuento"
                    value={currentDescuento.tipo_descuento || "porcentaje"}
                    onChange={(e) =>
                      setCurrentDescuento({
                        ...currentDescuento,
                        tipo_descuento: e.target.value as "porcentaje" | "monto_fijo" | "delivery_gratis",
                        // Resetear valor si cambia a delivery_gratis
                        ...(e.target.value === "delivery_gratis" ? { valor: 0 } : {}),
                      })
                    }
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="porcentaje">Porcentaje (%)</option>
                    <option value="monto_fijo">Monto Fijo (S/)</option>
                    <option value="delivery_gratis">Delivery Gratis</option>
                  </select>
                </div>
              </div>

              {currentDescuento.tipo_descuento !== "delivery_gratis" && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="valor" className="text-right">
                    {currentDescuento.tipo_descuento === "porcentaje" ? "Porcentaje (%)" : "Monto (S/)"}
                  </Label>
                  <Input
                    id="valor"
                    type="number"
                    min="1"
                    max={currentDescuento.tipo_descuento === "porcentaje" ? "100" : undefined}
                    value={currentDescuento.valor || ""}
                    onChange={(e) =>
                      setCurrentDescuento({
                        ...currentDescuento,
                        valor: Number.parseFloat(e.target.value),
                      })
                    }
                    className="col-span-3"
                    required
                  />
                </div>
              )}

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="fecha_inicio" className="text-right">
                  Fecha Inicio
                </Label>
                <Input
                  id="fecha_inicio"
                  type="date"
                  value={currentDescuento.fecha_inicio || ""}
                  onChange={(e) =>
                    setCurrentDescuento({
                      ...currentDescuento,
                      fecha_inicio: e.target.value,
                    })
                  }
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="fecha_fin" className="text-right">
                  Fecha Fin
                </Label>
                <Input
                  id="fecha_fin"
                  type="date"
                  value={currentDescuento.fecha_fin || ""}
                  onChange={(e) =>
                    setCurrentDescuento({
                      ...currentDescuento,
                      fecha_fin: e.target.value || null,
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="usos_disponibles" className="text-right">
                  Usos Disponibles
                </Label>
                <Input
                  id="usos_disponibles"
                  type="number"
                  min="1"
                  value={currentDescuento.usos_disponibles || ""}
                  onChange={(e) =>
                    setCurrentDescuento({
                      ...currentDescuento,
                      usos_disponibles: e.target.value ? Number.parseInt(e.target.value) : null,
                    })
                  }
                  placeholder="Ilimitado si está vacío"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="descripcion" className="text-right">
                  Descripción
                </Label>
                <Input
                  id="descripcion"
                  value={currentDescuento.descripcion || ""}
                  onChange={(e) =>
                    setCurrentDescuento({
                      ...currentDescuento,
                      descripcion: e.target.value,
                    })
                  }
                  placeholder="Descripción opcional"
                  className="col-span-3"
                />
              </div>
              {isEditing && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="estado" className="text-right">
                    Estado
                  </Label>
                  <div className="flex items-center space-x-2 col-span-3">
                    <Switch
                      id="estado"
                      checked={currentDescuento.estado}
                      onCheckedChange={(checked) =>
                        setCurrentDescuento({
                          ...currentDescuento,
                          estado: checked,
                        })
                      }
                    />
                    <Label htmlFor="estado">{currentDescuento.estado ? "Activo" : "Inactivo"}</Label>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-red-500 hover:bg-red-600">Guardar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación para eliminar */}
      <Dialog open={confirmDelete !== null} onOpenChange={() => setConfirmDelete(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Está seguro de que desea eliminar este descuento? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={() => confirmDelete && handleDelete(confirmDelete)}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
