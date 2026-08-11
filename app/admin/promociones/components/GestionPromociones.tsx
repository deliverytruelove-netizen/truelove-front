// app\admin\promociones\components\GestionPromociones.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil, Trash2, Plus } from "lucide-react";
import {
  Promocion,
  TipoDestinoPromocion,
  getPromociones,
  createPromocion,
  updatePromocion,
  deletePromocion,
} from "../services/promosiones.service";
import { fetchTiposNegocio } from "../../tiposNegocio/services/TiposNegocio.service";
import { TipoNegocio } from "../../tiposNegocio/types/TiposNegocio.types";
import { fetchLocales, Local } from "../../local-rating/services/rating.service";

const PANTALLAS_FIJAS = [
  { value: "cupones", label: "Cupones" },
  { value: "perfil", label: "Perfil" },
  { value: "home", label: "Inicio" },
];

export default function GestionPromociones() {
  const { toast } = useToast();
  const [promociones, setPromociones] = useState<Promocion[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentPromocion, setCurrentPromocion] = useState<Partial<Promocion>>({
    titulo: "",
    subtitulo: "",
    estado: true,
    tipo_destino: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [tiposNegocio, setTiposNegocio] = useState<TipoNegocio[]>([]);
  const [locales, setLocales] = useState<Local[]>([]);

  useEffect(() => {
    fetchTiposNegocio().then(setTiposNegocio).catch(() => setTiposNegocio([]));
    fetchLocales().then(setLocales).catch(() => setLocales([]));
  }, []);

  const loadPromociones = useCallback (async () => {
    try {
      setLoading(true);
      const response = await getPromociones();
      setPromociones(response.data);
    } catch (error) {
      console.error("Error al cargar promociones:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las promociones",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  },[toast]);
  // Cargar promociones al montar el componente
  useEffect(() => {
    loadPromociones();
  }, [loadPromociones]);

  const handleOpenDialog = (promocion?: Promocion) => {
    if (promocion) {
      setCurrentPromocion({ ...promocion, tipo_destino: promocion.tipo_destino || "" });
      setIsEditing(true);
      setImagePreview((promocion.imagen as string) || null);
    } else {
      setCurrentPromocion({ titulo: "", subtitulo: "", estado: true, tipo_destino: "" });
      setIsEditing(false);
      setImagePreview(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentPromocion({ titulo: "", subtitulo: "", estado: true, tipo_destino: "" });
    setImagePreview(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/svg+xml"];
      if (!allowedTypes.includes(file.type)) {
        toast({
            title: "Error de formato",
            description: "Formato de imagen no válido. Por favor, usa JPG, PNG, GIF o SVG.",
            variant: "destructive",
        })
        e.target.value = ''
        return;
      }

      setCurrentPromocion({ ...currentPromocion, imagen: file });

      // Crear preview de la imagen
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("titulo", currentPromocion.titulo || "");
      formData.append("subtitulo", currentPromocion.subtitulo || "");
      formData.append("estado", currentPromocion.estado ? "1" : "0");

      if (currentPromocion.imagen instanceof File) {
        formData.append("imagen", currentPromocion.imagen);
      }

      // Siempre se envía (incluso vacío) para poder limpiar un destino ya asignado al editar.
      formData.append("tipo_destino", currentPromocion.tipo_destino || "");
      if (currentPromocion.tipo_destino === "pantalla") {
        formData.append("pantalla", currentPromocion.pantalla || "");
      } else if (currentPromocion.tipo_destino === "restaurante" || currentPromocion.tipo_destino === "categoria") {
        formData.append("destino_id", String(currentPromocion.destino_id ?? ""));
      }

      if (isEditing && currentPromocion.id) {
        await updatePromocion(currentPromocion.id, formData);
        toast({
          title: "Éxito",
          description: "Promoción actualizada correctamente",
        });
      } else {
        await createPromocion(formData);
        toast({
          title: "Éxito",
          description: "Promoción creada correctamente",
        });
      }

      handleCloseDialog();
      loadPromociones();
    } catch (error) {
      console.error("Error al guardar promoción:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar la promoción",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deletePromocion(id);
      toast({
        title: "Éxito",
        description: "Promoción eliminada correctamente",
      });
      loadPromociones();
    } catch (error) {
      console.error("Error al eliminar promoción:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la promoción",
        variant: "destructive",
      });
    } finally {
      setConfirmDelete(null);
    }
  };
  // Función para formatear correctamente la URL de la imagen
  const formatImageUrl = useCallback(
    (imageUrl: string | undefined | File): string => {
      if (!imageUrl || imageUrl instanceof File) {
        return "/placeholder.svg";
      }

      // Si la URL ya comienza con http:// o https://, devolverla tal cual
      if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
        return imageUrl;
      }

      // Si la URL ya comienza con /storage/, devolverla tal cual
      if (imageUrl.startsWith("/storage/")) {
        return imageUrl;
      }

      // Si la URL comienza con promociones-img/ o cualquier otra ruta relativa,
      // añadir el prefijo /storage/
      return `/storage/${imageUrl}`;
    },
    []
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        {/* <h2 className="text-xl font-bold">Gestión de Promociones</h2> */}
        <Button onClick={() => handleOpenDialog()} className="bg-red-500 hover:bg-red-600">
          <Plus className="mr-2 h-4 w-4" /> Nueva Promoción
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 text-center">Cargando promociones...</div>
          ) : promociones.length === 0 ? (
            <div className="p-4 text-center">
              No hay promociones disponibles
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Imagen</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Subtítulo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promociones.map((promocion) => (
                  <TableRow key={promocion.id}>
                    <TableCell>
                      {promocion.imagen ? (
                        <div className="w-16 h-16 relative">
                          <Image
                            src={
                              formatImageUrl(promocion.imagen) ||
                              "/placeholder.svg"
                            }
                            alt={promocion.titulo}
                            width={100}
                            height={100}
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 flex items-center justify-center rounded">
                          <Plus className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{promocion.titulo}</TableCell>
                    <TableCell>{promocion.subtitulo}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          promocion.estado
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {promocion.estado ? "Activo" : "Inactivo"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(promocion)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setConfirmDelete(promocion.id!)}
                      >
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

      {/* Diálogo para crear/editar promoción */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Editar Promoción" : "Nueva Promoción"}
            </DialogTitle>
            <DialogDescription>
              Complete los campos para{" "}
              {isEditing ? "actualizar la" : "crear una nueva"} promoción.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="titulo" className="text-right">
                  Título
                </Label>
                <Input
                  id="titulo"
                  value={currentPromocion.titulo}
                  onChange={(e) =>
                    setCurrentPromocion({
                      ...currentPromocion,
                      titulo: e.target.value,
                    })
                  }
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="subtitulo" className="text-right">
                  Subtítulo
                </Label>
                <Input
                  id="subtitulo"
                  value={currentPromocion.subtitulo}
                  onChange={(e) =>
                    setCurrentPromocion({
                      ...currentPromocion,
                      subtitulo: e.target.value,
                    })
                  }
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="imagen" className="text-right">
                  Imagen
                </Label>
                <div className="col-span-3">
                  <Input
                    id="imagen"
                    type="file"
                    accept="image/jpeg, image/png, image/gif, image/svg+xml"
                    onChange={handleImageChange}
                    className="mb-2"
                  />
                  {imagePreview && (
                    <div className="mt-2">
                      <Image
                        src={imagePreview || "/placeholder.svg"}
                        alt="Vista previa"
                        className="max-h-40 rounded"
                        width={64}
                        height={64}
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="estado" className="text-right">
                  Estado
                </Label>
                <div className="flex items-center space-x-2 col-span-3">
                  <Switch
                    id="estado"
                    checked={currentPromocion.estado}
                    onCheckedChange={(checked) =>
                      setCurrentPromocion({
                        ...currentPromocion,
                        estado: checked,
                      })
                    }
                  />
                  <Label htmlFor="estado">
                    {currentPromocion.estado ? "Activo" : "Inactivo"}
                  </Label>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="tipo_destino" className="text-right">
                  Al presionar
                </Label>
                <Select
                  value={currentPromocion.tipo_destino || "ninguno"}
                  onValueChange={(value: string) =>
                    setCurrentPromocion({
                      ...currentPromocion,
                      tipo_destino: (value === "ninguno" ? "" : value) as TipoDestinoPromocion,
                      pantalla: null,
                      destino_id: null,
                    })
                  }
                >
                  <SelectTrigger id="tipo_destino" className="col-span-3">
                    <SelectValue placeholder="Selecciona un destino" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ninguno">Sin acción</SelectItem>
                    <SelectItem value="pantalla">Pantalla del app</SelectItem>
                    <SelectItem value="restaurante">Un restaurante específico</SelectItem>
                    <SelectItem value="categoria">Una categoría específica</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {currentPromocion.tipo_destino === "pantalla" && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="pantalla" className="text-right">
                    Pantalla
                  </Label>
                  <Select
                    value={currentPromocion.pantalla || ""}
                    onValueChange={(value: string) =>
                      setCurrentPromocion({ ...currentPromocion, pantalla: value })
                    }
                  >
                    <SelectTrigger id="pantalla" className="col-span-3">
                      <SelectValue placeholder="Selecciona una pantalla" />
                    </SelectTrigger>
                    <SelectContent>
                      {PANTALLAS_FIJAS.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {currentPromocion.tipo_destino === "restaurante" && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="destino_id" className="text-right">
                    Restaurante
                  </Label>
                  <Select
                    value={currentPromocion.destino_id ? String(currentPromocion.destino_id) : ""}
                    onValueChange={(value: string) =>
                      setCurrentPromocion({ ...currentPromocion, destino_id: Number(value) })
                    }
                  >
                    <SelectTrigger id="destino_id" className="col-span-3">
                      <SelectValue placeholder="Selecciona un restaurante" />
                    </SelectTrigger>
                    <SelectContent>
                      {locales.map((local) => (
                        <SelectItem key={local.business_id} value={String(local.business_id)}>
                          {local.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {currentPromocion.tipo_destino === "categoria" && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="destino_id" className="text-right">
                    Categoría
                  </Label>
                  <Select
                    value={currentPromocion.destino_id ? String(currentPromocion.destino_id) : ""}
                    onValueChange={(value: string) =>
                      setCurrentPromocion({ ...currentPromocion, destino_id: Number(value) })
                    }
                  >
                    <SelectTrigger id="destino_id" className="col-span-3">
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposNegocio.map((tipo) => (
                        <SelectItem key={tipo.id} value={String(tipo.id)}>
                          {tipo.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
              >
                Cancelar
              </Button>
              <Button type="submit" className="bg-red-500 hover:bg-red-600">Guardar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación para eliminar */}
      <Dialog
        open={confirmDelete !== null}
        onOpenChange={() => setConfirmDelete(null)}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Está seguro de que desea eliminar esta promoción? Esta acción no
              se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => confirmDelete && handleDelete(confirmDelete)}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
