// app/admin/horarios/components/grupo-form.tsx
"use client";

import { useState, useEffect , useCallback} from "react";
import {
  createGrupoHorario,
  updateGrupoHorario,
  fetchMotorizadosDisponibles,
} from "../services/horarios.service";
import type { Grupo, Rango, Motorizado } from "../types/horarios.types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Clock,
  Plus,
  Trash2,
  X,
  Save,
  Users,
  ArrowLeft,
  Calendar,
  Search,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface GrupoFormProps {
  grupo?: Grupo;
  onCancel: () => void;
  onSave: () => void;
}

export function GrupoForm({ grupo, onCancel, onSave }: GrupoFormProps) {
  const [nombre, setNombre] = useState(grupo?.nombre || "");
  const [descripcion, setDescripcion] = useState(grupo?.descripcion || "");
  const [rangos, setRangos] = useState<
    (Rango | Omit<Rango, "id" | "grupo_id">)[]
  >(grupo?.rangos || []);
  const [motorizadosSeleccionados, setMotorizadosSeleccionados] = useState<
    number[]
  >(grupo?.motorizados.map((m) => m.id) || []);
  const [motorizadosDisponibles, setMotorizadosDisponibles] = useState<
    Motorizado[]
  >([]);
const [, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [motorizadosDialogOpen, setMotorizadosDialogOpen] = useState(false);
  const [rangoDialogOpen, setRangoDialogOpen] = useState(false);
  const [nuevoRango, setNuevoRango] = useState<Rango>({
    // dia_semana: "lunes" as 'lunes',
    dia_semana: ["lunes"],
    hora_inicio: "08:00",
    hora_fin: "17:00",
  });
  const [searchMotorizado, setSearchMotorizado] = useState("");
  const [todosSeleccionados, setTodosSeleccionados] = useState(false);

  const { toast } = useToast();


  useEffect(() => {
    // Actualizar estado de "todos seleccionados" cuando cambia la selección
    const todosDisponiblesSeleccionados =
      motorizadosDisponibles.length > 0 &&
      motorizadosDisponibles.every((m) =>
        motorizadosSeleccionados.includes(m.id)
      );
    setTodosSeleccionados(todosDisponiblesSeleccionados);
  }, [motorizadosSeleccionados, motorizadosDisponibles]);

const loadMotorizados = useCallback(async () => {
  try {
    setLoading(true);
    const data = await fetchMotorizadosDisponibles();
    setMotorizadosDisponibles(data);
  } catch (error) {
    toast({
      title: "Error",
      description: "No se pudieron cargar los motorizados disponibles",
      variant: "destructive",
    });
    console.error(error);
  } finally {
    setLoading(false);
  }
}, [toast]); 

  useEffect(() => {
    loadMotorizados();
  }, [loadMotorizados]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre.trim()) {
      toast({
        title: "Error",
        description: "El nombre del grupo es obligatorio",
        variant: "destructive",
      });
      return;
    }

    if (rangos.length === 0) {
      toast({
        title: "Error",
        description: "Debe agregar al menos un rango de horario",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);

      const grupoData = {
        nombre,
        descripcion,
        rangos,
        motorizados: motorizadosSeleccionados,
      };

      if (grupo) {
        await updateGrupoHorario(grupo.id, grupoData);
        toast({
          title: "Éxito",
          description: "Grupo de horario actualizado correctamente",
        });
      } else {
        await createGrupoHorario(grupoData);
        toast({
          title: "Éxito",
          description: "Grupo de horario creado correctamente",
        });
      }

      onSave();
    } catch (error) {
      toast({
        title: "Error",
        description: grupo
          ? "No se pudo actualizar el grupo de horario"
          : "No se pudo crear el grupo de horario",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

const handleAddRango = () => {
  // Validar que la hora de fin sea posterior a la hora de inicio
  if (nuevoRango.hora_inicio >= nuevoRango.hora_fin) {
    toast({
      title: "Error",
      description: "La hora de fin debe ser posterior a la hora de inicio",
      variant: "destructive",
    })
    return
  }

  // Validar que se haya seleccionado al menos un día
  if (nuevoRango.dia_semana.length === 0) {
    toast({
      title: "Error",
      description: "Debes seleccionar al menos un día de la semana",
      variant: "destructive",
    })
    return
  }

  // Verificar si alguno de los días seleccionados ya existe
  const diasExistentes = nuevoRango.dia_semana.filter(dia => 
    rangos.some(rango => 
      // Asegurarnos de que rango.dia_semana es un array
      Array.isArray(rango.dia_semana) && rango.dia_semana.includes(dia)
    )
  );

  let diasDuplicados: string[] = [];
  const nuevosRangos: Rango[] = [];

  if (diasExistentes.length > 0) {
    // Hay días duplicados
    diasDuplicados = diasExistentes.map(dia => formatDiaSemana(dia));
    
    // Filtrar los días que no están duplicados
    const diasNoExistentes = nuevoRango.dia_semana.filter(dia => 
      !diasExistentes.includes(dia)
    );
    
    if (diasNoExistentes.length === 0) {
      // Todos los días seleccionados ya existen
      toast({
        title: "Error",
        description: "Todos los días seleccionados ya tienen rangos asignados.",
        variant: "destructive",
      });
      return;
    }
    
    // Mostrar advertencia sobre días duplicados
    toast({
      title: "Advertencia",
      description: `Ya existen rangos para: ${diasDuplicados.join(", ")}. Solo se añadirán los días restantes.`,
      variant: 'default',
    });
    
    // Crear un solo rango con los días no duplicados
    nuevosRangos.push({
      dia_semana: diasNoExistentes,
      hora_inicio: nuevoRango.hora_inicio,
      hora_fin: nuevoRango.hora_fin,
    });
  } else {
    // No hay días duplicados, crear un solo rango con todos los días seleccionados
    nuevosRangos.push({
      dia_semana: [...nuevoRango.dia_semana],
      hora_inicio: nuevoRango.hora_inicio,
      hora_fin: nuevoRango.hora_fin,
    });
  }

  // Añadir los nuevos rangos
  setRangos((prevRangos) => [...prevRangos, ...nuevosRangos]);
  
  setRangoDialogOpen(false);

  // Resetear el formulario de nuevo rango
  setNuevoRango({
    dia_semana: ["lunes"],
    hora_inicio: "08:00",
    hora_fin: "17:00",
  });
}

  const handleDeleteRango = (index: number) => {
    const nuevosRangos = [...rangos];
    nuevosRangos.splice(index, 1);
    setRangos(nuevosRangos);
  };

  const handleMotorizadoChange = (motorizadoId: number, checked: boolean) => {
    if (checked) {
      setMotorizadosSeleccionados([...motorizadosSeleccionados, motorizadoId]);
    } else {
      setMotorizadosSeleccionados(
        motorizadosSeleccionados.filter((id) => id !== motorizadoId)
      );
    }
  };

  const handleSelectAllMotorizados = (checked: boolean) => {
    if (checked) {
      // Seleccionar todos los motorizados
      const todosIds = motorizadosDisponibles.map((m) => m.id);
      setMotorizadosSeleccionados(todosIds);
      setTodosSeleccionados(true);
    } else {
      // Deseleccionar todos
      setMotorizadosSeleccionados([]);
      setTodosSeleccionados(false);
    }
  };

const formatDiaSemana = (dia: string | string[]): string => {
  const diasMap: Record<string, string> = {
    lunes: "Lunes",
    martes: "Martes",
    miercoles: "Miércoles",
    jueves: "Jueves",
    viernes: "Viernes",
    sabado: "Sábado",
    domingo: "Domingo",
  };
  
  // Si es un string, simplemente formateamos ese día
  if (typeof dia === 'string') {
    return diasMap[dia] || dia;
  }
  
  // Si es un array, procesamos según la cantidad de días
  if (dia.length === 0) {
    return "Sin días";
  }
  
  if (dia.length === 1) {
    return diasMap[dia[0]] || dia[0];
  }
  
  if (dia.length === 7) {
    return "Todos los días";
  }
  
  // Verificar si son días consecutivos para mostrar como rango
  const ordenDias = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];
  const indices = dia.map(d => ordenDias.indexOf(d)).sort((a, b) => a - b);
  
  // Verificar si los índices son consecutivos
  let esConsecutivo = true;
  for (let i = 1; i < indices.length; i++) {
    if (indices[i] !== indices[i-1] + 1) {
      esConsecutivo = false;
      break;
    }
  }
  
  if (esConsecutivo && indices.length > 1) {
    // Si son consecutivos, mostrar como rango (ej: "Lunes-Jueves")
    return `${diasMap[ordenDias[indices[0]]]} - ${diasMap[ordenDias[indices[indices.length - 1]]]}`;
  }
  
  // Si no son consecutivos, mostrar como lista separada por comas
  return dia.map(d => diasMap[d]).join(", ");
}
  const motorizadosFiltrados = motorizadosDisponibles.filter((m) =>
    `${m.nombres} ${m.apellidos} ${m.email}`
      .toLowerCase()
      .includes(searchMotorizado.toLowerCase())
  );

  return (
    <Card className="w-full shadow-lg border-t-2 border-t-red-300 animate-in fade-in duration-300">
      <CardHeader className="flex flex-row items-center justify-between bg-muted/40 pb-4">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onCancel}
            className="h-8 w-8 rounded-full hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Volver</span>
          </Button>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            {grupo ? "Editar Grupo de Horario" : "Nuevo Grupo de Horario"}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <Label htmlFor="nombre" className="text-base font-medium">
                Nombre del Grupo
              </Label>
              <Input
                id="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Turno Mañana"
                required
                className="mt-1.5 h-10"
              />
            </div>

            <div>
              <Label htmlFor="descripcion" className="text-base font-medium">
                Descripción (opcional)
              </Label>
              <Textarea
                id="descripcion"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Descripción del grupo de horario"
                rows={1}
                className="mt-1.5 min-h-10"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between pb-1 border-b">
              <Label className="text-base font-medium flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Rangos de Horario
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setRangoDialogOpen(true)}
                className="flex items-center gap-1 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Agregar Horario
              </Button>
            </div>

            {rangos.length === 0 ? (
              <div className="text-center py-8 border rounded-md text-muted-foreground bg-muted/20 flex flex-col items-center gap-2">
                <Clock className="h-12 w-12 text-muted-foreground/50" />
                <p>No hay rangos de horario definidos</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setRangoDialogOpen(true)}
                  className="mt-2"
                >
                  <Plus className="h-4 w-4 mr-1" /> Agregar primer horario
                </Button>
              </div>
            ) : (
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow className="hover:bg-muted/30">
                      <TableHead className="font-medium">Día</TableHead>
                      <TableHead className="font-medium">Hora Inicio</TableHead>
                      <TableHead className="font-medium">Hora Fin</TableHead>
                      <TableHead className="text-right font-medium">
                        Acciones
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rangos.map((rango, index) => (
                      <TableRow
                        key={index}
                        className="hover:bg-muted/20 transition-colors"
                      >
                        <TableCell className="font-medium">
                          <Badge
                            variant="outline"
                            className="bg-white/50 px-2 py-1"
                          >
                            {formatDiaSemana(rango.dia_semana)}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {rango.hora_inicio}
                        </TableCell>
                        <TableCell className="font-medium">
                          {rango.hora_fin}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteRango(index)}
                            className="bg-red-600 hover:bg-red-700 transition-colors"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Eliminar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between pb-1 border-b">
              <Label className="text-base font-medium flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Motorizados Asignados ({motorizadosSeleccionados.length})
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setMotorizadosDialogOpen(true)}
                className="flex items-center gap-1 transition-colors"
              >
                <Users className="h-4 w-4" />
                Seleccionar Motorizados
              </Button>
            </div>

            {motorizadosSeleccionados.length === 0 ? (
              <div className="text-center py-8 border rounded-md text-muted-foreground bg-muted/20 flex flex-col items-center gap-2">
                <Users className="h-12 w-12 text-muted-foreground/50" />
                <p>No hay motorizados asignados</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setMotorizadosDialogOpen(true)}
                  className="mt-2"
                >
                  <Plus className="h-4 w-4 mr-1" /> Asignar motorizados
                </Button>
              </div>
            ) : (
              <div className="border rounded-md p-4">
                <div className="flex flex-wrap gap-2">
                  {motorizadosSeleccionados.map((id) => {
                    const motorizado = motorizadosDisponibles.find(
                      (m) => m.id === id
                    );
                    return motorizado ? (
                      <div
                        key={id}
                        className="flex items-center gap-1 bg-muted/40 hover:bg-muted/60 px-3 py-1.5 rounded-md text-sm transition-colors"
                      >
                        <span className="font-medium">
                          {motorizado.nombres} {motorizado.apellidos}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0 ml-1 rounded-full hover:bg-muted"
                          onClick={() => handleMotorizadoChange(id, false)}
                        >
                          <X className="h-3 w-3" />
                          <span className="sr-only">Quitar</span>
                        </Button>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between border-t p-6 bg-muted/20">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="border-2 hover:bg-background transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Cancelar
        </Button>
        <Button
          type="submit"
          onClick={handleSubmit}
          disabled={saving}
          className={cn(
            "flex items-center gap-2 transition-colors",
            saving ? "opacity-80" : "bg-red-500 hover:bg-red-600"
          )}
        >
          {saving ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <Save className="h-4 w-4" />
          )}
          {grupo ? "Actualizar" : "Guardar"}
        </Button>
      </CardFooter>

      {/* Dialog para agregar nuevo rango de horario */}
      <Dialog open={rangoDialogOpen} onOpenChange={setRangoDialogOpen}>
        <DialogContent className="sm:max-w-md border-t-4 border-t-primary">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Clock className="h-5 w-5 text-primary" />
              Agregar Rango de Horario
            </DialogTitle>
            <DialogDescription>
              Define el día y las horas de trabajo para este rango.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-4">
            <div>
              <Label htmlFor="dia_semana" className="text-base font-medium">
                Día de la Semana
              </Label>
              <div className="col-span-3 space-y-2 border rounded-md p-3">
                <div className="text-sm text-muted-foreground mb-2">
                  Selecciona los días:
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: "lunes", label: "Lunes" },
                    { value: "martes", label: "Martes" },
                    { value: "miercoles", label: "Miércoles" },
                    { value: "jueves", label: "Jueves" },
                    { value: "viernes", label: "Viernes" },
                    { value: "sabado", label: "Sábado" },
                    { value: "domingo", label: "Domingo" },
                  ].map((dia) => (
                    <div
                      key={dia.value}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`dia-${dia.value}`}
                        checked={nuevoRango.dia_semana.includes(
                          dia.value as
                            | "lunes"
                            | "martes"
                            | "miercoles"
                            | "jueves"
                            | "viernes"
                            | "sabado"
                            | "domingo"
                        )}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setNuevoRango({
                              ...nuevoRango,
                              dia_semana: [
                                ...nuevoRango.dia_semana,
                                dia.value,
                              ] as (
                                | "lunes"
                                | "martes"
                                | "miercoles"
                                | "jueves"
                                | "viernes"
                                | "sabado"
                                | "domingo"
                              )[],
                            });
                          } else {
                            setNuevoRango({
                              ...nuevoRango,
                              dia_semana: Array.isArray(nuevoRango.dia_semana)
                                ? nuevoRango.dia_semana.filter(
                                    (d) => d !== dia.value
                                  )
                                : [],
                            });
                          }
                        }}
                      />
                      <label
                        htmlFor={`dia-${dia.value}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {dia.label}
                      </label>
                    </div>
                  ))}
                </div>
                <div className="flex items-center space-x-2 mt-2 pt-2 border-t">
                  <Checkbox
                    id="seleccionar-todos"
                    checked={nuevoRango.dia_semana.length === 7}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setNuevoRango({
                          ...nuevoRango,
                          dia_semana: [
                            "lunes",
                            "martes",
                            "miercoles",
                            "jueves",
                            "viernes",
                            "sabado",
                            "domingo",
                          ],
                        });
                      } else {
                        setNuevoRango({
                          ...nuevoRango,
                          dia_semana: [],
                        });
                      }
                    }}
                  />
                  <label
                    htmlFor="seleccionar-todos"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Seleccionar todos
                  </label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="hora_inicio" className="text-base font-medium">
                  Hora de Inicio
                </Label>
                <Input
                  id="hora_inicio"
                  type="time"
                  value={nuevoRango.hora_inicio}
                  onChange={(e) =>
                    setNuevoRango({
                      ...nuevoRango,
                      hora_inicio: e.target.value,
                    })
                  }
                  className="mt-1.5 h-10"
                />
              </div>

              <div>
                <Label htmlFor="hora_fin" className="text-base font-medium">
                  Hora de Fin
                </Label>
                <Input
                  id="hora_fin"
                  type="time"
                  value={nuevoRango.hora_fin}
                  onChange={(e) =>
                    setNuevoRango({ ...nuevoRango, hora_fin: e.target.value })
                  }
                  className="mt-1.5 h-10"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setRangoDialogOpen(false)}
              className="border-2"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleAddRango}
              className="bg-primary hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-4 w-4 mr-1" />
              Agregar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para seleccionar motorizados */}
      <Dialog
        open={motorizadosDialogOpen}
        onOpenChange={setMotorizadosDialogOpen}
      >
        <DialogContent className="max-w-3xl border-t-4 border-t-primary">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Users className="h-5 w-5 text-primary" />
              Seleccionar Motorizados
            </DialogTitle>
            <DialogDescription>
              Selecciona los motorizados que pertenecerán a este grupo de
              horario.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre o email..."
                  value={searchMotorizado}
                  onChange={(e) => setSearchMotorizado(e.target.value)}
                  className="pl-10 pr-4 h-10"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="select-all"
                  checked={todosSeleccionados}
                  onCheckedChange={handleSelectAllMotorizados}
                />
                <Label
                  htmlFor="select-all"
                  className="text-sm cursor-pointer hover:text-primary transition-colors"
                >
                  Seleccionar todos
                </Label>
              </div>
            </div>

            <div className="max-h-[400px] overflow-y-auto rounded-md border">
              {motorizadosDisponibles.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No hay motorizados disponibles
                </div>
              ) : motorizadosFiltrados.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
              No se encontraron resultados para &quot;{searchMotorizado}&quot;
                </div>
              ) : (
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow className="hover:bg-muted/30">
                      <TableHead className="w-12"></TableHead>
                      <TableHead className="font-medium">Nombre</TableHead>
                      <TableHead className="font-medium">Teléfono</TableHead>
                      <TableHead className="font-medium">Email</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {motorizadosFiltrados.map((motorizado) => (
                      <TableRow
                        key={motorizado.id}
                        className={cn(
                          "hover:bg-muted/20 transition-colors",
                          motorizadosSeleccionados.includes(motorizado.id) &&
                            "bg-muted/10"
                        )}
                      >
                        <TableCell>
                          <Checkbox
                            checked={motorizadosSeleccionados.includes(
                              motorizado.id
                            )}
                            onCheckedChange={(checked) =>
                              handleMotorizadoChange(
                                motorizado.id,
                                checked as boolean
                              )
                            }
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          {motorizado.nombres} {motorizado.apellidos}
                        </TableCell>
                        <TableCell>{motorizado.celular}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {motorizado.email}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="text-sm text-muted-foreground">
                {motorizadosSeleccionados.length} motorizados seleccionados
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              onClick={() => setMotorizadosDialogOpen(false)}
              className="bg-primary hover:bg-primary/90 transition-colors"
            >
              Listo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
