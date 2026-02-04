"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Layers, Loader2, ChevronDown, ChevronRight, Plus, Trash2, Check, X } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  getGrupos,
  getMenuGrupos,
  assignGruposToMenu,
  addItemToGrupo,
  removeItemFromGrupo,
  getAvailableItems,
  type GrupoAdicional,
  type GrupoAdicionalItem,
} from "@/app/socio/admin/services/grupo-adicional.service"
import { menuService } from "@/app/socio/admin/services/menu.service"
import { CreateAdicionalInline } from "@/app/socio/admin/components/create-adicional-inline"

export default function ProductoGruposPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  
  const categoriaId = params.id as string
  const menuId = parseInt(params.menuId as string)

  const [menuName, setMenuName] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [allGrupos, setAllGrupos] = useState<GrupoAdicional[]>([])
  const [selectedGrupos, setSelectedGrupos] = useState<number[]>([])
  const [expandedGrupoId, setExpandedGrupoId] = useState<number | null>(null)

  // Estado para agregar adicionales
  const [addingToGrupoId, setAddingToGrupoId] = useState<number | null>(null)
  const [creatingInGrupoId, setCreatingInGrupoId] = useState<number | null>(null)
  const [availableItems, setAvailableItems] = useState<GrupoAdicionalItem[]>([])
  const [loadingAvailable, setLoadingAvailable] = useState(false)
  const [selectedItemId, setSelectedItemId] = useState("")
  const [selectedItemPrice, setSelectedItemPrice] = useState("")
  const [addingItem, setAddingItem] = useState(false)

  // Cargar datos
  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      
      // Cargar info del menú
      const menus = await menuService.getMenusByCategory(categoriaId)
      const menu = menus.find(m => m.id === menuId)
      if (menu) {
        setMenuName(menu.titulo)
      }

      // Cargar todos los grupos
      const grupos = await getGrupos()
      setAllGrupos(grupos.filter(g => g.estado === "active"))

      // Cargar grupos asignados a este menú
      const menuGrupos = await getMenuGrupos(menuId)
      setSelectedGrupos(menuGrupos.map(g => g.id))
    } catch {
      toast({
        title: "Error",
        description: "Error al cargar datos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [categoriaId, menuId, toast])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Toggle selección de grupo
  const handleToggleGrupo = (grupoId: number) => {
    setSelectedGrupos(prev =>
      prev.includes(grupoId)
        ? prev.filter(id => id !== grupoId)
        : [...prev, grupoId]
    )
  }

  // Expandir grupo
  const handleToggleExpand = (grupoId: number) => {
    setExpandedGrupoId(prev => prev === grupoId ? null : grupoId)
    setAddingToGrupoId(null)
    setCreatingInGrupoId(null)
  }

  // Guardar grupos
  const handleSave = async () => {
    try {
      setSaving(true)
      await assignGruposToMenu(menuId, selectedGrupos)
      toast({ title: "Éxito", description: "Grupos guardados correctamente" })
      router.back()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al guardar",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  // Iniciar agregar adicional existente
  const handleStartAddToGrupo = async (grupoId: number) => {
    setAddingToGrupoId(grupoId)
    setCreatingInGrupoId(null)
    setSelectedItemId("")
    setSelectedItemPrice("")
    setLoadingAvailable(true)

    try {
      const items = await getAvailableItems(grupoId)
      setAvailableItems(items)
    } catch {
      toast({ title: "Error", description: "Error al cargar adicionales", variant: "destructive" })
      setAddingToGrupoId(null)
    } finally {
      setLoadingAvailable(false)
    }
  }

  // Agregar adicional existente
  const handleAddItemToGrupo = async (grupoId: number) => {
    if (!selectedItemId || !selectedItemPrice) {
      toast({ title: "Error", description: "Selecciona un adicional y precio", variant: "destructive" })
      return
    }

    try {
      setAddingItem(true)
      await addItemToGrupo(grupoId, {
        adicional_id: parseInt(selectedItemId),
        precio: parseFloat(selectedItemPrice),
      })
      toast({ title: "Éxito", description: "Adicional agregado al grupo" })
      setAddingToGrupoId(null)
      loadData()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al agregar",
        variant: "destructive",
      })
    } finally {
      setAddingItem(false)
    }
  }

  // Remover adicional
  const handleRemoveItem = async (grupoId: number, adicionalId: number) => {
    try {
      await removeItemFromGrupo(grupoId, adicionalId)
      toast({ title: "Éxito", description: "Adicional removido" })
      loadData()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al remover",
        variant: "destructive",
      })
    }
  }

  // Seleccionar item
  const handleSelectItem = (value: string) => {
    setSelectedItemId(value)
    const item = availableItems.find(i => i.id.toString() === value)
    if (item) {
      setSelectedItemPrice(typeof item.precio === "string" ? item.precio : item.precio.toString())
    }
  }

  // Callback crear adicional
  const handleAdicionalCreated = async (grupoId: number, adicional: { id: number; precio: number }) => {
    try {
      await addItemToGrupo(grupoId, {
        adicional_id: adicional.id,
        precio: adicional.precio,
      })
      toast({ title: "Éxito", description: "Adicional creado y agregado" })
      setCreatingInGrupoId(null)
      loadData()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al agregar",
        variant: "destructive",
      })
    }
  }

  const formatPrice = (price: number | string): string => {
    const num = typeof price === "string" ? parseFloat(price) : price
    return isNaN(num) ? "0.00" : num.toFixed(2)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto py-6 px-4 max-w-3xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Volver
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Grupos de Adicionales
              </h1>
              <p className="text-sm text-gray-500">
                Producto: <span className="font-medium text-gray-700 dark:text-gray-300">{menuName}</span>
              </p>
            </div>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-green-600 hover:bg-green-700 gap-2"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Guardar
          </Button>
        </div>

        {/* Info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Selecciona los grupos que aplican a este producto. Expande cada grupo para ver y gestionar sus adicionales.
          </p>
        </div>

        {/* Lista de grupos */}
        {allGrupos.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              <Layers className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="font-medium">No hay grupos disponibles</p>
              <p className="text-sm">Crea grupos en la sección Grupos de Adicionales</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {allGrupos.map((grupo) => {
              const isSelected = selectedGrupos.includes(grupo.id)
              const isExpanded = expandedGrupoId === grupo.id
              const itemCount = grupo.items?.length || 0

              return (
                <Card 
                  key={grupo.id}
                  className={`overflow-hidden transition-all ${
                    isSelected ? 'ring-2 ring-red-200 dark:ring-red-800' : ''
                  }`}
                >
                  {/* Header */}
                  <div
                    className={`flex items-center gap-4 p-4 cursor-pointer transition-colors ${
                      isExpanded ? 'bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleToggleGrupo(grupo.id)}
                    />
                    <div 
                      className="flex-1"
                      onClick={() => handleToggleExpand(grupo.id)}
                    >
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">{grupo.nombre}</h3>
                        <Badge variant="secondary">{itemCount} items</Badge>
                      </div>
                      <p className="text-sm text-gray-500">
                        {grupo.minimo === 0 ? 'Opcional' : `Mínimo: ${grupo.minimo}`} | Máximo: {grupo.maximo}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggleExpand(grupo.id)}
                    >
                      {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                    </Button>
                  </div>

                  {/* Contenido expandido */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
                      {/* Lista de adicionales */}
                      {itemCount === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-4">
                          Este grupo no tiene adicionales
                        </p>
                      ) : (
                        <div className="grid gap-2 sm:grid-cols-2 mb-4">
                          {grupo.items?.map((adicional) => (
                            <div
                              key={adicional.id}
                              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                            >
                              <div>
                                <p className="font-medium text-gray-900 dark:text-gray-100">{adicional.titulo}</p>
                                <p className="text-sm text-green-600 font-semibold">
                                  S/ {formatPrice(adicional.pivot?.precio || adicional.precio)}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-gray-400 hover:text-red-500"
                                onClick={() => handleRemoveItem(grupo.id, adicional.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Agregar adicional */}
                      {addingToGrupoId === grupo.id ? (
                        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 space-y-3">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm">Agregar adicional existente</p>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => setAddingToGrupoId(null)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          {loadingAvailable ? (
                            <div className="flex justify-center py-4">
                              <Loader2 className="h-5 w-5 animate-spin" />
                            </div>
                          ) : availableItems.length === 0 ? (
                            <div className="space-y-2">
                              <p className="text-sm text-gray-500">No hay adicionales disponibles</p>
                              <Button size="sm" variant="outline" onClick={() => setAddingToGrupoId(null)}>
                                Cancelar
                              </Button>
                            </div>
                          ) : (
                            <>
                              <Select value={selectedItemId} onValueChange={handleSelectItem}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar adicional" />
                                </SelectTrigger>
                                <SelectContent>
                                  {availableItems.map((item) => (
                                    <SelectItem key={item.id} value={item.id.toString()}>
                                      {item.titulo} - S/ {formatPrice(item.precio)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <div>
                                <Label className="text-xs">Precio en este grupo</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={selectedItemPrice}
                                  onChange={(e) => setSelectedItemPrice(e.target.value)}
                                />
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleAddItemToGrupo(grupo.id)}
                                  disabled={addingItem || !selectedItemId}
                                  className="bg-blue-600 hover:bg-blue-700"
                                >
                                  {addingItem && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                                  Agregar
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => setAddingToGrupoId(null)}>
                                  Cancelar
                                </Button>
                              </div>
                            </>
                          )}
                        </div>
                      ) : creatingInGrupoId === grupo.id ? (
                        <CreateAdicionalInline
                          onCreated={(adicional) => handleAdicionalCreated(grupo.id, adicional)}
                          onCancel={() => setCreatingInGrupoId(null)}
                        />
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStartAddToGrupo(grupo.id)}
                            className="gap-1"
                          >
                            <Plus className="h-4 w-4" />
                            Agregar existente
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setCreatingInGrupoId(grupo.id)
                              setAddingToGrupoId(null)
                            }}
                            className="gap-1 border-green-300 text-green-600 hover:bg-green-50"
                          >
                            <Plus className="h-4 w-4" />
                            Crear nuevo
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
