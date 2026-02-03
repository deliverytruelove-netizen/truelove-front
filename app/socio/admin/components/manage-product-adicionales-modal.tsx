// app\socio\admin\components\manage-product-adicionales-modal.tsx
"use client"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Plus, Loader2, ListPlus, X, Trash2, Edit, DollarSign, 
  FileText, Upload, CheckCircle2, XCircle, Save
} from "lucide-react"
import { adicionalService, type Adicional } from "../services/adicional.service"
import type { MenuItem } from "../services/menu.service"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface ManageProductAdicionalesModalProps {
  menuItem: MenuItem
  trigger?: React.ReactNode
  onAdicionalesChange?: () => void
}

type ViewMode = "list" | "create" | "edit"

export function ManageProductAdicionalesModal({ 
  menuItem, 
  trigger,
  onAdicionalesChange 
}: ManageProductAdicionalesModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [adicionales, setAdicionales] = useState<Adicional[]>([])
  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const [editingAdicional, setEditingAdicional] = useState<Adicional | null>(null)
  const { toast } = useToast()

  // Form state
  const [titulo, setTitulo] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [precio, setPrecio] = useState("")
  const [status, setStatus] = useState("active")
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [imageError, setImageError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const MAX_FILE_SIZE = 5 * 1024 * 1024

  // Cargar adicionales cuando se abre el modal
  useEffect(() => {
    if (open) {
      loadAdicionales()
    }
  }, [open, menuItem.id])

  // Si no hay adicionales y terminó de cargar, mostrar formulario de crear
  useEffect(() => {
    if (!loading && adicionales.length === 0 && viewMode === "list") {
      setViewMode("create")
    }
  }, [loading, adicionales.length, viewMode])

  const loadAdicionales = async () => {
    setLoading(true)
    try {
      const data = await adicionalService.getMenuAdicionales(menuItem.id)
      setAdicionales(data)
    } catch (error) {
      console.error("Error al cargar adicionales:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los adicionales",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setTitulo("")
    setDescripcion("")
    setPrecio("")
    setStatus("active")
    setPreviewImage(null)
    setImageError(null)
    setEditingAdicional(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleCreateClick = () => {
    resetForm()
    setViewMode("create")
  }

  const handleEditClick = (adicional: Adicional) => {
    setEditingAdicional(adicional)
    setTitulo(adicional.titulo)
    setDescripcion(adicional.descripcion || "")
    setPrecio(typeof adicional.precio === "string" ? adicional.precio : adicional.precio.toString())
    setStatus(adicional.status)
    setPreviewImage(adicional.foto || null)
    setViewMode("edit")
  }

  const handleBackToList = () => {
    resetForm()
    setViewMode("list")
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setImageError(null)

    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        setImageError(`Imagen muy grande. Máximo: 5MB`)
        if (fileInputRef.current) fileInputRef.current.value = ""
        return
      }

      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp']
      if (!validTypes.includes(file.type)) {
        setImageError('Formato no válido. Solo JPG, PNG, GIF o WEBP')
        if (fileInputRef.current) fileInputRef.current.value = ""
        return
      }

      const reader = new FileReader()
      reader.onload = () => setPreviewImage(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const clearImage = () => {
    setPreviewImage(null)
    setImageError(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const formData = new FormData()
      formData.append("titulo", titulo)
      formData.append("descripcion", descripcion)
      formData.append("precio", precio)
      formData.append("status", status)

      if (fileInputRef.current?.files?.[0]) {
        formData.append("foto", fileInputRef.current.files[0])
      }

      if (viewMode === "create") {
        await adicionalService.createMenuAdicional(menuItem.id, formData)
        toast({
          title: "Éxito",
          description: "Adicional creado correctamente",
        })
      } else if (viewMode === "edit" && editingAdicional) {
        await adicionalService.updateMenuAdicional(menuItem.id, editingAdicional.id, formData)
        toast({
          title: "Éxito",
          description: "Adicional actualizado correctamente",
        })
      }

      await loadAdicionales()
      onAdicionalesChange?.()
      handleBackToList()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo guardar el adicional",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (adicionalId: number) => {
    try {
      await adicionalService.deleteMenuAdicional(menuItem.id, adicionalId)
      toast({
        title: "Éxito",
        description: "Adicional eliminado correctamente",
      })
      await loadAdicionales()
      onAdicionalesChange?.()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo eliminar el adicional",
        variant: "destructive",
      })
    }
  }

  const formatPrice = (price: number | string): string => {
    if (typeof price === "string") {
      const numPrice = Number.parseFloat(price)
      if (!isNaN(numPrice)) return numPrice.toFixed(2)
      return price
    }
    return price.toFixed(2)
  }

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      setOpen(newOpen)
      if (!newOpen) {
        resetForm()
        setViewMode("list")
      }
    }}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-1">
            <ListPlus className="h-4 w-4" />
            Gestionar adicionales
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] max-h-[85vh] p-0 flex flex-col">
        <DialogHeader className="p-4 pb-2 border-b">
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <ListPlus className="h-5 w-5 text-red-600" />
            {viewMode === "list" && `Adicionales de "${menuItem.titulo}"`}
            {viewMode === "create" && `Nuevo adicional para "${menuItem.titulo}"`}
            {viewMode === "edit" && "Editar adicional"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {/* Vista de lista */}
          {viewMode === "list" && (
            <div className="flex flex-col h-full">
              <div className="p-4 border-b bg-gray-50">
                <Button onClick={handleCreateClick} className="w-full bg-red-600 hover:bg-red-700 gap-2">
                  <Plus className="h-4 w-4" />
                  Crear nuevo adicional
                </Button>
              </div>

              <ScrollArea className="flex-1 p-4">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                    <span className="ml-2 text-gray-500">Cargando...</span>
                  </div>
                ) : adicionales.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed">
                    <ListPlus className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No hay adicionales</p>
                    <p className="text-sm text-gray-400 mt-1">Crea el primer adicional para este producto</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {adicionales.map((adicional) => (
                      <div
                        key={adicional.id}
                        className="flex items-center gap-3 p-3 bg-white border rounded-lg hover:border-gray-300 transition-colors"
                      >
                        {adicional.foto && (
                          <div className="relative w-12 h-12 rounded overflow-hidden flex-shrink-0">
                            <Image
                              src={adicional.foto}
                              alt={adicional.titulo}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-800 truncate">{adicional.titulo}</p>
                            <Badge 
                              variant="outline" 
                              className={cn(
                                "text-xs",
                                adicional.status === "active" ? "text-green-600 border-green-300" : "text-gray-500"
                              )}
                            >
                              {adicional.status === "active" ? "Activo" : "Inactivo"}
                            </Badge>
                          </div>
                          <p className="text-sm text-green-600 font-medium">S/ {formatPrice(adicional.precio)}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-500 hover:text-blue-600"
                            onClick={() => handleEditClick(adicional)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-gray-500 hover:text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar adicional?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Se eliminará &quot;{adicional.titulo}&quot; permanentemente.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(adicional.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          )}

          {/* Vista de crear/editar */}
          {(viewMode === "create" || viewMode === "edit") && (
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {/* Nombre */}
                  <div className="space-y-2">
                    <Label htmlFor="titulo" className="text-sm font-medium flex items-center gap-1">
                      <FileText className="h-4 w-4 text-gray-500" />
                      Nombre <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="titulo"
                      value={titulo}
                      onChange={(e) => setTitulo(e.target.value)}
                      placeholder="Ej: Extra queso, Salsa especial"
                      required
                    />
                  </div>

                  {/* Descripción */}
                  <div className="space-y-2">
                    <Label htmlFor="descripcion" className="text-sm font-medium">
                      Descripción
                    </Label>
                    <Textarea
                      id="descripcion"
                      value={descripcion}
                      onChange={(e) => setDescripcion(e.target.value)}
                      placeholder="Descripción opcional"
                      className="min-h-[60px] resize-none"
                    />
                  </div>

                  {/* Precio */}
                  <div className="space-y-2">
                    <Label htmlFor="precio" className="text-sm font-medium flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      Precio <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">S/</span>
                      <Input
                        id="precio"
                        type="number"
                        step="0.01"
                        min="0"
                        value={precio}
                        onChange={(e) => setPrecio(e.target.value)}
                        placeholder="0.00"
                        className="pl-8"
                        required
                      />
                    </div>
                  </div>

                  {/* Foto */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-1">
                      <Upload className="h-4 w-4 text-gray-500" />
                      Foto (opcional)
                    </Label>
                    <Input
                      type="file"
                      accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className={cn(
                        "text-sm",
                        previewImage ? "hidden" : "block",
                        imageError ? "border-red-500" : ""
                      )}
                    />
                    {imageError && (
                      <p className="text-xs text-red-600 flex items-center gap-1">
                        <XCircle className="h-3 w-3" />
                        {imageError}
                      </p>
                    )}
                    {previewImage && (
                      <div className="relative w-full h-24 rounded-md overflow-hidden border">
                        <Image
                          src={previewImage}
                          alt="Vista previa"
                          fill
                          className="object-contain bg-gray-50"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6 rounded-full"
                          onClick={clearImage}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Estado */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Estado</Label>
                    <RadioGroup value={status} onValueChange={setStatus} className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="active" id="active" />
                        <Label htmlFor="active" className="flex items-center gap-1 cursor-pointer text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          Activo
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="inactive" id="inactive" />
                        <Label htmlFor="inactive" className="flex items-center gap-1 cursor-pointer text-sm">
                          <XCircle className="h-4 w-4 text-gray-500" />
                          Inactivo
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </ScrollArea>

              {/* Footer con botones */}
              <div className="p-4 border-t bg-gray-50 flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBackToList}
                  disabled={saving}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={saving || !titulo || !precio}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {viewMode === "create" ? "Crear adicional" : "Guardar cambios"}
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
