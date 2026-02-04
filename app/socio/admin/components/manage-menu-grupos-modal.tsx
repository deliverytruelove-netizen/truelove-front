"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Layers, 
  Loader2, 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  Trash2, 
  X,
  Check
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  getGrupos,
  getMenuGrupos,
  assignGruposToMenu,
  createGrupo,
  addItemToGrupo,
  removeItemFromGrupo,
  getAvailableItems,
  type GrupoAdicional,
  type GrupoAdicionalItem,
} from "../services/grupo-adicional.service"
import {
  Collapsible,
  CollapsibleContent,
} from "@/components/ui/collapsible"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface ManageMenuGruposModalProps {
  menuId: number
  menuName: string
  trigger?: React.ReactNode
  onSaved?: () => void
}

export function ManageMenuGruposModal({
  menuId,
  menuName,
  trigger,
  onSaved,
}: ManageMenuGruposModalProps) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [allGrupos, setAllGrupos] = useState<GrupoAdicional[]>([])
  const [selectedGrupos, setSelectedGrupos] = useState<number[]>([])
  const [expandedGrupos, setExpandedGrupos] = useState<Set<number>>(new Set())
  
  // Estado para crear nuevo grupo
  const [showNewGrupo, setShowNewGrupo] = useState(false)
  const [newGrupoName, setNewGrupoName] = useState("")
  const [newGrupoMin, setNewGrupoMin] = useState(0)
  const [newGrupoMax, setNewGrupoMax] = useState(3)
  const [creatingGrupo, setCreatingGrupo] = useState(false)
  
  // Estado para agregar item a grupo
  const [addingItemToGrupo, setAddingItemToGrupo] = useState<number | null>(null)
  const [availableItems, setAvailableItems] = useState<GrupoAdicionalItem[]>([])
  const [loadingAvailable, setLoadingAvailable] = useState(false)
  const [selectedItemId, setSelectedItemId] = useState<string>("")
  const [selectedItemPrice, setSelectedItemPrice] = useState("")
  const [addingItem, setAddingItem] = useState(false)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [grupos, menuGrupos] = await Promise.all([
        getGrupos(),
        getMenuGrupos(menuId),
      ])
      setAllGrupos(grupos.filter((g) => g.estado === "active"))
      setSelectedGrupos(menuGrupos.map((g) => g.id))
    } catch {
      toast({
        title: "Error",
        description: "Error al cargar grupos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [menuId, toast])

  useEffect(() => {
    if (open) {
      loadData()
      setExpandedGrupos(new Set())
      setShowNewGrupo(false)
      setAddingItemToGrupo(null)
    }
  }, [open, loadData])

  const handleToggleGrupo = (grupoId: number) => {
    setSelectedGrupos((prev) =>
      prev.includes(grupoId)
        ? prev.filter((id) => id !== grupoId)
        : [...prev, grupoId]
    )
  }

  const handleToggleExpand = (grupoId: number) => {
    setExpandedGrupos((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(grupoId)) {
        newSet.delete(grupoId)
      } else {
        newSet.add(grupoId)
      }
      return newSet
    })
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      await assignGruposToMenu(menuId, selectedGrupos)
      toast({
        title: "Éxito",
        description: "Grupos asignados correctamente",
      })
      setOpen(false)
      onSaved?.()
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

  const handleCreateGrupo = async () => {
    if (!newGrupoName.trim()) {
      toast({
        title: "Error",
        description: "El nombre del grupo es requerido",
        variant: "destructive",
      })
      return
    }

    try {
      setCreatingGrupo(true)
      const newGrupo = await createGrupo({
        nombre: newGrupoName,
        minimo: newGrupoMin,
        maximo: newGrupoMax,
      })
      
      // Agregar el nuevo grupo a la lista y seleccionarlo
      setAllGrupos((prev) => [...prev, { ...newGrupo, items: [] }])
      setSelectedGrupos((prev) => [...prev, newGrupo.id])
      
      // Resetear formulario
      setNewGrupoName("")
      setNewGrupoMin(0)
      setNewGrupoMax(3)
      setShowNewGrupo(false)
      
      toast({
        title: "Éxito",
        description: "Grupo creado correctamente",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al crear grupo",
        variant: "destructive",
      })
    } finally {
      setCreatingGrupo(false)
    }
  }

  const handleStartAddItem = async (grupoId: number) => {
    setAddingItemToGrupo(grupoId)
    setSelectedItemId("")
    setSelectedItemPrice("")
    setLoadingAvailable(true)
    
    try {
      const items = await getAvailableItems(grupoId)
      setAvailableItems(items)
    } catch {
      toast({
        title: "Error",
        description: "Error al cargar adicionales disponibles",
        variant: "destructive",
      })
      setAddingItemToGrupo(null)
    } finally {
      setLoadingAvailable(false)
    }
  }

  const handleAddItemToGrupo = async (grupoId: number) => {
    if (!selectedItemId || !selectedItemPrice) {
      toast({
        title: "Error",
        description: "Selecciona un adicional y su precio",
        variant: "destructive",
      })
      return
    }

    try {
      setAddingItem(true)
      await addItemToGrupo(grupoId, {
        adicional_id: parseInt(selectedItemId),
        precio: parseFloat(selectedItemPrice),
      })

      // Actualizar la lista de grupos
      await loadData()
      
      // Mantener el grupo expandido
      setExpandedGrupos((prev) => new Set(prev).add(grupoId))
      
      setAddingItemToGrupo(null)
      setSelectedItemId("")
      setSelectedItemPrice("")
      
      toast({
        title: "Éxito",
        description: "Adicional agregado al grupo",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al agregar adicional",
        variant: "destructive",
      })
    } finally {
      setAddingItem(false)
    }
  }

  const handleRemoveItemFromGrupo = async (grupoId: number, adicionalId: number) => {
    try {
      await removeItemFromGrupo(grupoId, adicionalId)
      
      // Actualizar localmente
      setAllGrupos((prev) =>
        prev.map((g) =>
          g.id === grupoId
            ? { ...g, items: g.items?.filter((i) => i.id !== adicionalId) }
            : g
        )
      )
      
      toast({
        title: "Éxito",
        description: "Adicional removido del grupo",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al remover adicional",
        variant: "destructive",
      })
    }
  }

  const formatPrice = (price: number | string): string => {
    if (typeof price === "string") {
      const numPrice = Number.parseFloat(price)
      if (!isNaN(numPrice)) {
        return numPrice.toFixed(2)
      }
      return price
    }
    return price.toFixed(2)
  }

  // Cuando selecciona un item, auto-completar el precio
  const handleItemSelect = (itemId: string) => {
    setSelectedItemId(itemId)
    const item = availableItems.find((i) => i.id.toString() === itemId)
    if (item) {
      setSelectedItemPrice(formatPrice(item.precio))
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-1">
            <Layers className="h-4 w-4" />
            Grupos
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-red-600" />
            Grupos de Adicionales
          </DialogTitle>
          <DialogDescription>
            Gestiona los grupos de adicionales para <strong>{menuName}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : (
            <>
              {/* Botón crear nuevo grupo */}
              {!showNewGrupo ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowNewGrupo(true)}
                  className="w-full gap-2 border-dashed"
                >
                  <Plus className="h-4 w-4" />
                  Crear nuevo grupo
                </Button>
              ) : (
                <div className="p-4 border border-dashed border-brand-300 rounded-lg bg-brand-50 dark:bg-gray-800 dark:border-gray-600 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">Nuevo Grupo</h4>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setShowNewGrupo(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <Input
                    placeholder="Nombre del grupo (ej: Salsas, Extras)"
                    value={newGrupoName}
                    onChange={(e) => setNewGrupoName(e.target.value)}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-gray-500">Mínimo (0 = opcional)</Label>
                      <Input
                        type="number"
                        min={0}
                        value={newGrupoMin}
                        onChange={(e) => setNewGrupoMin(parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Máximo</Label>
                      <Input
                        type="number"
                        min={1}
                        value={newGrupoMax}
                        onChange={(e) => setNewGrupoMax(parseInt(e.target.value) || 1)}
                      />
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={handleCreateGrupo}
                    disabled={creatingGrupo || !newGrupoName.trim()}
                    className="w-full bg-red-600 hover:bg-red-700"
                  >
                    {creatingGrupo && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Crear Grupo
                  </Button>
                </div>
              )}

              {/* Lista de grupos */}
              {allGrupos.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Layers className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                  <p>No hay grupos de adicionales</p>
                  <p className="text-sm">Crea tu primer grupo arriba</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {allGrupos.map((grupo) => {
                    const isSelected = selectedGrupos.includes(grupo.id)
                    const isExpanded = expandedGrupos.has(grupo.id)
                    const itemCount = grupo.items?.length || 0

                    return (
                      <div
                        key={grupo.id}
                        className={`border rounded-lg overflow-hidden transition-colors ${
                          isSelected
                            ? "border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800"
                            : "border-gray-200 dark:border-gray-700"
                        }`}
                      >
                        {/* Header del grupo */}
                        <div className="flex items-center p-3 gap-3">
                          <Checkbox
                            id={`grupo-${grupo.id}`}
                            checked={isSelected}
                            onCheckedChange={() => handleToggleGrupo(grupo.id)}
                          />
                          <div
                            className="flex-1 cursor-pointer"
                            onClick={() => handleToggleExpand(grupo.id)}
                          >
                            <div className="flex items-center gap-2">
                              <Label
                                htmlFor={`grupo-${grupo.id}`}
                                className="font-medium cursor-pointer"
                              >
                                {grupo.nombre}
                              </Label>
                              <Badge variant="secondary" className="text-xs">
                                {itemCount} items
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {grupo.minimo === 0 ? "Opcional" : `Mínimo: ${grupo.minimo}`} | Máximo: {grupo.maximo}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleToggleExpand(grupo.id)}
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </div>

                        {/* Contenido expandible - Items del grupo */}
                        <Collapsible open={isExpanded}>
                          <CollapsibleContent>
                            <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 space-y-2">
                              {/* Lista de items */}
                              {itemCount === 0 ? (
                                <p className="text-sm text-gray-400 text-center py-2">
                                  Sin adicionales en este grupo
                                </p>
                              ) : (
                                <div className="space-y-1">
                                  {grupo.items?.map((item) => (
                                    <div
                                      key={item.id}
                                      className="flex items-center justify-between py-1.5 px-2 rounded bg-gray-50 dark:bg-gray-800"
                                    >
                                      <span className="text-sm">{item.titulo}</span>
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-500">
                                          S/ {formatPrice(item.pivot?.precio || item.precio)}
                                        </span>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-6 w-6 text-gray-400 hover:text-red-500"
                                          onClick={() => handleRemoveItemFromGrupo(grupo.id, item.id)}
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Agregar item */}
                              {addingItemToGrupo === grupo.id ? (
                                <div className="p-3 border border-dashed border-gray-300 rounded-lg space-y-2 mt-2">
                                  {loadingAvailable ? (
                                    <div className="flex items-center justify-center py-2">
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    </div>
                                  ) : availableItems.length === 0 ? (
                                    <div className="text-center py-2">
                                      <p className="text-sm text-gray-500">No hay adicionales disponibles</p>
                                      <p className="text-xs text-gray-400">Crea adicionales en la sección Adicionales</p>
                                    </div>
                                  ) : (
                                    <>
                                      <Select value={selectedItemId} onValueChange={handleItemSelect}>
                                        <SelectTrigger className="w-full">
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
                                      <div className="flex gap-2">
                                        <Input
                                          type="number"
                                          step="0.01"
                                          placeholder="Precio"
                                          value={selectedItemPrice}
                                          onChange={(e) => setSelectedItemPrice(e.target.value)}
                                          className="flex-1"
                                        />
                                        <Button
                                          size="sm"
                                          onClick={() => handleAddItemToGrupo(grupo.id)}
                                          disabled={addingItem || !selectedItemId}
                                          className="bg-green-600 hover:bg-green-700"
                                        >
                                          {addingItem ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                          ) : (
                                            <Check className="h-4 w-4" />
                                          )}
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => setAddingItemToGrupo(null)}
                                        >
                                          <X className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </>
                                  )}
                                </div>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-full text-gray-500 hover:text-gray-700 gap-1"
                                  onClick={() => handleStartAddItem(grupo.id)}
                                >
                                  <Plus className="h-3 w-3" />
                                  Agregar adicional
                                </Button>
                              )}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || loading}
            className="bg-red-600 hover:bg-red-700"
          >
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Guardar Cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
