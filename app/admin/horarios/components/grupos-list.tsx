// app/admin/horarios/components/grupos-list.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  fetchGruposHorarios,
  deleteGrupoHorario,
} from "../services/horarios.service";
import { Grupo } from "../types/horarios.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Trash2, Edit, Plus, Calendar } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface GruposListProps {
  onEdit: (grupo: Grupo) => void;
  onNew: () => void;
  refreshTrigger?: number;
}

export function GruposList({
  onEdit,
  onNew,
  refreshTrigger = 0,
}: GruposListProps) {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [grupoToDelete, setGrupoToDelete] = useState<number | null>(null);
  const { toast } = useToast();

  // Función para formatear hora de 24h a 12h para mostrar
  const formatTimeDisplay = (time24: string): string => {
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const loadGrupos = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchGruposHorarios();
      setGrupos(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los grupos de horarios",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [toast]); // Incluye toast como dependencia
  
  useEffect(() => {
    loadGrupos();
  }, [refreshTrigger, loadGrupos]);

  const handleDelete = async () => {
    if (grupoToDelete === null) return;

    try {
      await deleteGrupoHorario(grupoToDelete);
      toast({
        title: "Éxito",
        description: "Grupo de horario eliminado correctamente",
      });
      loadGrupos();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el grupo de horario",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setDeleteDialogOpen(false);
      setGrupoToDelete(null);
    }
  };

  const confirmDelete = (id: number) => {
    setGrupoToDelete(id);
    setDeleteDialogOpen(true);
  };

  const formatDiaSemana = (dia: string | string[]) => {
    const diasMap: Record<string, string> = {
      lunes: "Lunes",
      martes: "Martes",
      miercoles: "Miércoles",
      jueves: "Jueves",
      viernes: "Viernes",
      sabado: "Sábado",
      domingo: "Domingo",
      todos: "Todos los días",
    };

    // Si es un string, simplemente formateamos ese día
    if (typeof dia === "string") {
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
      return "Lunes - Domingo";
    }

    // Verificar si son días consecutivos para mostrar como rango
    const ordenDias = [
      "lunes",
      "martes",
      "miercoles",
      "jueves",
      "viernes",
      "sabado",
      "domingo",
    ];
    const indices = dia.map((d) => ordenDias.indexOf(d)).sort((a, b) => a - b);

    // Verificar si los índices son consecutivos
    let esConsecutivo = true;
    for (let i = 1; i < indices.length; i++) {
      if (indices[i] !== indices[i - 1] + 1) {
        esConsecutivo = false;
        break;
      }
    }

    if (esConsecutivo && indices.length > 1) {
      // Si son consecutivos, mostrar como rango (ej: "Lunes-Jueves")
      return `${diasMap[ordenDias[indices[0]]]} - ${
        diasMap[ordenDias[indices[indices.length - 1]]]
      }`;
    }

    // Si no son consecutivos, mostrar como lista separada por comas
    return dia.map((d) => diasMap[d]).join(", ");
  };

  return (
    <Card className="shadow-lg border-t-2 border-t-red-500 animate-in fade-in duration-300">
      <CardHeader className="flex flex-row items-center justify-between bg-muted/40 pb-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-6 w-6 text-primary" />
          <CardTitle>Grupos de Horarios</CardTitle>
        </div>
        <Button
          onClick={onNew}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 transition-all"
        >
          <Plus className="h-4 w-4" />
          Nuevo Grupo
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          </div>
        ) : grupos.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground flex flex-col items-center gap-2">
            <Calendar className="h-12 w-12 text-muted-foreground/50" />
            <p>No hay grupos de horarios. Crea uno nuevo para comenzar.</p>
            <Button onClick={onNew} variant="outline" className="mt-4">
              <Plus className="h-4 w-4 mr-2" /> Crear primer grupo
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="font-medium">Nombre</TableHead>
                  <TableHead className="font-medium">Horarios</TableHead>
                  <TableHead className="font-medium">Motorizados</TableHead>
                  <TableHead className="text-right font-medium">
                    Acciones
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {grupos.map((grupo) => (
                  <TableRow
                    key={grupo.id}
                    className="hover:bg-muted/20 transition-colors"
                  >
                    <TableCell className="font-medium">
                      <div className="py-1">
                        <div className="font-semibold text-primary/90">
                          {grupo.nombre}
                        </div>
                        {grupo.descripcion && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {grupo.descripcion}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1.5 py-1">
                        {grupo.rangos.map((rango, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 text-sm bg-muted/30 rounded-md px-2 py-1.5"
                          >
                            <Clock className="h-3.5 w-3.5 text-primary/70" />
                            <Badge
                              variant="outline"
                              className="text-xs font-medium bg-white/50"
                            >
                              {formatDiaSemana(rango.dia_semana)}
                            </Badge>
                            <span className="font-medium">
                              {formatTimeDisplay(rango.hora_inicio)} - {formatTimeDisplay(rango.hora_fin)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 py-1">
                        <div className="bg-muted/30 rounded-md px-3 py-1.5 flex items-center gap-2">
                          <Users className="h-4 w-4 text-primary/70" />
                          <span className="font-medium">
                            {grupo.motorizados.length}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2 py-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEdit(grupo)}
                          className="hover:bg-muted transition-colors"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => confirmDelete(grupo.id)}
                          className="bg-red-600 hover:bg-red-700 transition-colors"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Eliminar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="border-t-4 border-t-destructive">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">
              ¿Estás seguro?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              Esta acción eliminará el grupo de horario y todas sus
              asignaciones. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="border-2">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 transition-colors"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}