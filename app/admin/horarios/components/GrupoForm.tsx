// app\admin\horarios\components\GrupoForm.tsx
"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { TimeSelectorMejorado } from "./TimeSelector"
import { createGrupoHorario, updateGrupoHorario, fetchMotorizadosDisponibles, fetchTodosMotorizados } from "../services/horarios.service"
import type { HorarioGrupo, HorarioBloque, Motorizado, DiaSemana } from "../types/horarios.types"
import { ArrowLeft, Trash2, Clock, Users, User, Save, X, Info, Calendar, Coffee, Briefcase, Moon, AlertCircle, Sunrise, Check, RefreshCw } from 'lucide-react'
 import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { showAlert } from "@/components/ui/DataTable/Alert"
interface GrupoFormProps {
  grupo?: HorarioGrupo
  onCancel: () => void
  onSave: () => void
}

// Interfaces para los bloques de verificación de solapamiento
interface BloqueVerificacion {
  inicio: string
  fin: string
  index: number
  tipo: string
}

export function GrupoForm({ grupo, onCancel, onSave }: GrupoFormProps) {
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    tipo: "grupal" as "grupal" | "individual",
    motorizado_individual_id: 0,
    bloques: [] as Omit<HorarioBloque, "id" | "grupo_id">[],
    motorizados: [] as number[],
  })

  const [motorizadosDisponibles, setMotorizadosDisponibles] = useState<Motorizado[]>([])
  const [todosMotorizados, setTodosMotorizados] = useState<Motorizado[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingMotorizados, setLoadingMotorizados] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Cargar motorizados disponibles (para horarios nuevos)
  const loadMotorizadosDisponibles = useCallback(async () => {
    try {
      setLoadingMotorizados(true)
      const motorizados = await fetchMotorizadosDisponibles(grupo?.id)
      setMotorizadosDisponibles(motorizados)
    } catch (error) {
      console.error("Error al cargar motorizados disponibles:", error)
      showAlert({
        title: "Error",
        text: "No se pudieron cargar los motorizados disponibles",
        icon: "error",
      })
    } finally {
      setLoadingMotorizados(false)
    }
  }, [grupo?.id])

  // Cargar todos los motorizados (para edición de horarios)
  const loadTodosMotorizados = useCallback(async () => {
    try {
      setLoadingMotorizados(true)
      const motorizados = await fetchTodosMotorizados()
      setTodosMotorizados(motorizados)
    } catch (error) {
      console.error("Error al cargar todos los motorizados:", error)
      showAlert({
        title: "Error",
        text: "No se pudieron cargar los motorizados",
        icon: "error",
      })
    } finally {
      setLoadingMotorizados(false)
    }
  }, [])

  const diasSemana: { key: DiaSemana; label: string; short: string }[] = [
    { key: "lunes", label: "Lunes", short: "Lun" },
    { key: "martes", label: "Martes", short: "Mar" },
    { key: "miercoles", label: "Miércoles", short: "Mié" },
    { key: "jueves", label: "Jueves", short: "Jue" },
    { key: "viernes", label: "Viernes", short: "Vie" },
    { key: "sabado", label: "Sábado", short: "Sáb" },
    { key: "domingo", label: "Domingo", short: "Dom" },
  ]

  const tiposBloques = [
    {
      key: "trabajo",
      label: "Tiempo de Trabajo",
      description: "Horario activo de entrega de pedidos",
      color: "#3B82F6",
      icon: Briefcase,
    },
    {
      key: "descanso",
      label: "Descanso/Pausa",
      description: "Tiempo de descanso corto",
      color: "#F59E0B",
      icon: Moon,
    },
    {
      key: "almuerzo",
      label: "Hora de Almuerzo",
      description: "Tiempo de comida principal",
      color: "#10B981",
      icon: Coffee,
    },
  ]

  useEffect(() => {
    // Si estamos editando un grupo existente, cargar todos los motorizados
    // Si estamos creando uno nuevo, cargar solo los disponibles
    if (grupo) {
      loadTodosMotorizados()
    } else {
      loadMotorizadosDisponibles()
    }

    if (grupo) {
      console.log('Cargando datos del grupo:', grupo)
      console.log('Motorizados del grupo:', grupo.motorizados)
      
      setFormData({
        nombre: grupo.nombre,
        descripcion: grupo.descripcion || "",
        tipo: grupo.tipo,
        motorizado_individual_id: grupo.motorizado_individual_id || 0,
        bloques:
          grupo.bloques?.map((bloque) => ({
            dia_semana: bloque.dia_semana,
            hora_inicio: bloque.hora_inicio,
            hora_fin: bloque.hora_fin,
            tipo: bloque.tipo,
            descripcion: bloque.descripcion,
            color: bloque.color,
            orden: bloque.orden,
          })) || [],
        motorizados: grupo.motorizados?.map((m) => m.id) || [],
      })
    }
  }, [grupo, loadMotorizadosDisponibles, loadTodosMotorizados])

  // Obtener la lista de motorizados a mostrar según el contexto
  const getMotorizadosParaMostrar = () => {
    if (grupo) {
      // Si estamos editando, mostrar todos los motorizados
      return todosMotorizados
    } else {
      // Si estamos creando, mostrar solo disponibles
      return motorizadosDisponibles
    }
  }

  // Verificar si un motorizado está disponible (no asignado a otro horario)
  const isMotorizadoDisponible = (motorizadoId: number) => {
    if (!grupo) {
      // Para horarios nuevos, todos los motorizados en la lista están disponibles
      return true
    }
    
    // Para edición: el motorizado está disponible si:
    // 1. Ya está asignado a este horario, O
    // 2. Está en la lista de disponibles
    const yaAsignado = formData.motorizados.includes(motorizadoId)
    const estaDisponible = motorizadosDisponibles.some(m => m.id === motorizadoId)
    
    return yaAsignado || estaDisponible
  }

  const handleAddBloque = (tipo: "trabajo" | "descanso" | "almuerzo") => {
    const tipoInfo = tiposBloques.find((t) => t.key === tipo)

    // Horarios por defecto más realistas
    let horaInicio = "08:00"
    let horaFin = "17:00"

    // Si hay bloques existentes, usar la hora final del último bloque como hora inicial
    if (formData.bloques.length > 0) {
      const ultimoBloque = formData.bloques[formData.bloques.length - 1]
      horaInicio = ultimoBloque.hora_fin

      // Calcular hora final basada en el tipo de bloque
      if (tipo === "almuerzo") {
        // Para almuerzo, agregar 1 hora
        horaFin = calcularHoraFin(horaInicio, 60)
      } else if (tipo === "descanso") {
        // Para descanso, agregar 15 minutos
        horaFin = calcularHoraFin(horaInicio, 15)
      } else {
        // Para trabajo, agregar 8 horas o hasta las 17:00 si es antes
        horaFin = calcularHoraFin(horaInicio, 480)
      }
    } else {
      // Si no hay bloques, usar valores predeterminados
      if (tipo === "almuerzo") {
        horaInicio = "12:00"
        horaFin = "13:00"
      } else if (tipo === "descanso") {
        horaInicio = "15:00"
        horaFin = "15:15"
      }
    }

    // Usar los días del último bloque si existe, o todos los días si es el primer bloque
    let diasSeleccionados: DiaSemana[] = ["lunes"]
    if (formData.bloques.length > 0) {
      const ultimoBloque = formData.bloques[formData.bloques.length - 1]
      diasSeleccionados = Array.isArray(ultimoBloque.dia_semana) 
        ? ultimoBloque.dia_semana as DiaSemana[]
        : [ultimoBloque.dia_semana as DiaSemana]
    }

    const nuevoBloque: Omit<HorarioBloque, "id" | "grupo_id"> = {
      dia_semana: diasSeleccionados,
      hora_inicio: horaInicio,
      hora_fin: horaFin,
      tipo: tipo,
      descripcion: "",
      color: tipoInfo?.color || "#3B82F6",
      orden: formData.bloques.length,
    }

    setFormData((prev) => ({
      ...prev,
      bloques: [...prev.bloques, nuevoBloque],
    }))
  }

  // Función auxiliar para calcular la hora final
  const calcularHoraFin = (horaInicio: string, minutosAgregar: number): string => {
    const [horas, minutos] = horaInicio.split(":").map(Number)

    let totalMinutos = horas * 60 + minutos + minutosAgregar

    // Manejar el desbordamiento de 24 horas
    totalMinutos = totalMinutos % (24 * 60)

    const nuevasHoras = Math.floor(totalMinutos / 60)
    const nuevosMinutos = totalMinutos % 60

    return `${nuevasHoras.toString().padStart(2, "0")}:${nuevosMinutos.toString().padStart(2, "0")}`
  }

  const handleRemoveBloque = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      bloques: prev.bloques.filter((_, i) => i !== index),
    }))
  }

  const handleBloqueChange = (index: number, field: keyof HorarioBloque, value: string | string[] | undefined) => {
    setFormData((prev) => {
      const newBloques = [...prev.bloques]
      
      // Si estamos cambiando la hora de fin de un bloque, actualizar la hora de inicio del siguiente
      if (field === "hora_fin" && index < newBloques.length - 1) {
        newBloques[index + 1] = {
          ...newBloques[index + 1],
          hora_inicio: value as string
        }
        
        // Recalcular las horas de fin de los bloques siguientes
        for (let i = index + 1; i < newBloques.length; i++) {
          const bloque = newBloques[i]
          const duracion = calcularDuracion(bloque.hora_inicio, bloque.hora_fin)
          newBloques[i] = {
            ...bloque,
            hora_fin: calcularHoraFin(bloque.hora_inicio, duracion)
          }
          
          // Actualizar la hora de inicio del siguiente bloque si existe
          if (i < newBloques.length - 1) {
            newBloques[i + 1] = {
              ...newBloques[i + 1],
              hora_inicio: newBloques[i].hora_fin
            }
          }
        }
      }
      
      // Si estamos cambiando la hora de inicio de un bloque, recalcular su hora de fin
      if (field === "hora_inicio" && typeof value === "string") {
        const bloque = newBloques[index]
        const duracion = calcularDuracion(bloque.hora_inicio, bloque.hora_fin)
        newBloques[index] = {
          ...bloque,
          [field]: value,
          hora_fin: calcularHoraFin(value, duracion)
        }
        
        // Actualizar los bloques siguientes
        for (let i = index + 1; i < newBloques.length; i++) {
          newBloques[i] = {
            ...newBloques[i],
            hora_inicio: i === index + 1 ? newBloques[index].hora_fin : newBloques[i - 1].hora_fin
          }
          
          // Recalcular la hora de fin
          const duracionSiguiente = calcularDuracion(newBloques[i].hora_inicio, newBloques[i].hora_fin)
          newBloques[i] = {
            ...newBloques[i],
            hora_fin: calcularHoraFin(newBloques[i].hora_inicio, duracionSiguiente)
          }
        }
      } else {
        // Para otros campos, simplemente actualizar el valor
        newBloques[index] = {
          ...newBloques[index],
          [field]: value
        }
      }
      
      return {
        ...prev,
        bloques: newBloques
      }
    })
  }

  const handleDiaChange = (bloqueIndex: number, dia: DiaSemana, checked: boolean) => {
    setFormData((prev) => {
      const newBloques = [...prev.bloques]
      
      // Obtener los días actuales del bloque
      const bloque = newBloques[bloqueIndex]
      const diasActuales = Array.isArray(bloque.dia_semana) ? bloque.dia_semana : [bloque.dia_semana]
      
      // Actualizar los días del bloque actual
      const nuevosDias = checked 
        ? [...diasActuales, dia] 
        : diasActuales.filter(d => d !== dia)
      
      newBloques[bloqueIndex] = {
        ...bloque,
        dia_semana: nuevosDias
      }
      
      // Aplicar los mismos días a todos los demás bloques
      return {
        ...prev,
        bloques: newBloques.map((b, i) => {
          if (i !== bloqueIndex) {
            return {
              ...b,
              dia_semana: nuevosDias
            }
          }
          return b
        })
      }
    })
  }

  // Función para seleccionar o deseleccionar todos los días
  const handleToggleAllDias = (bloqueIndex: number) => {
    setFormData((prev) => {
      const newBloques = [...prev.bloques]
      const bloque = newBloques[bloqueIndex]
      const diasActuales = Array.isArray(bloque.dia_semana) ? bloque.dia_semana : [bloque.dia_semana]
      
      // Si ya están todos seleccionados, deseleccionar todos
      const nuevosDias = diasActuales.length === diasSemana.length 
        ? [] 
        : diasSemana.map(d => d.key)
      
      // Aplicar a todos los bloques
      return {
        ...prev,
        bloques: newBloques.map(b => ({
          ...b,
          dia_semana: nuevosDias
        }))
      }
    })
  }

  const handleMotorizadoToggle = (motorizadoId: number) => {
    // Verificar si el motorizado está disponible antes de permitir el toggle
    if (!isMotorizadoDisponible(motorizadoId) && !formData.motorizados.includes(motorizadoId)) {
      showAlert({
        title: "Motorizado no disponible",
        text: "Este motorizado ya tiene un horario asignado y no puede ser agregado a otro grupo.",
        icon: "warning",
      })
      return
    }

    setFormData((prev) => ({
      ...prev,
      motorizados: prev.motorizados.includes(motorizadoId)
        ? prev.motorizados.filter((id) => id !== motorizadoId)
        : [...prev.motorizados, motorizadoId],
    }))
  }

  // Función auxiliar para convertir hora a minutos desde medianoche
  const horaAMinutos = (hora: string): number => {
    const [hours, minutes] = hora.split(':').map(Number)
    return hours * 60 + minutes
  }

  // Función auxiliar para verificar si un horario cruza medianoche
  const cruzaMedianoche = (horaInicio: string, horaFin: string): boolean => {
    const inicioMinutos = horaAMinutos(horaInicio)
    const finMinutos = horaAMinutos(horaFin)
    return finMinutos < inicioMinutos
  }

  // Función auxiliar para calcular duración de un bloque (considerando cruce de medianoche)
  const calcularDuracion = (horaInicio: string, horaFin: string): number => {
    const inicioMinutos = horaAMinutos(horaInicio)
    const finMinutos = horaAMinutos(horaFin)
    
    if (cruzaMedianoche(horaInicio, horaFin)) {
      // Si cruza medianoche: (24:00 - inicio) + fin
      return (24 * 60 - inicioMinutos) + finMinutos
    } else {
      return finMinutos - inicioMinutos
    }
  }

  // Función auxiliar para verificar solapamiento considerando cruce de medianoche
  const verificarSolapamiento = (bloque1: BloqueVerificacion, bloque2: BloqueVerificacion): boolean => {
    const inicio1 = horaAMinutos(bloque1.inicio)
    const fin1 = horaAMinutos(bloque1.fin)
    const inicio2 = horaAMinutos(bloque2.inicio)
    const fin2 = horaAMinutos(bloque2.fin)

    const cruza1 = cruzaMedianoche(bloque1.inicio, bloque1.fin)
    const cruza2 = cruzaMedianoche(bloque2.inicio, bloque2.fin)

    if (!cruza1 && !cruza2) {
      // Ninguno cruza medianoche - validación normal
      return fin1 > inicio2 && fin2 > inicio1
    } else if (cruza1 && !cruza2) {
      // Solo el primero cruza medianoche
      return (fin1 > inicio2) || (inicio1 <= fin2)
    } else if (!cruza1 && cruza2) {
      // Solo el segundo cruza medianoche
      return (fin2 > inicio1) || (inicio2 <= fin1)
    } else {
      // Ambos cruzan medianoche - siempre se solapan
      return true
    }
  }

  // Validación mejorada del frontend
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es requerido"
    }

    if (formData.tipo === "individual" && !formData.motorizado_individual_id) {
      newErrors.motorizado_individual_id = "Debe seleccionar un motorizado para horarios individuales"
    }

    if (formData.tipo === "grupal" && formData.motorizados.length === 0) {
      newErrors.motorizados = "Debe seleccionar al menos un motorizado para horarios grupales"
    }

    if (formData.bloques.length === 0) {
      newErrors.bloques = "Debe agregar al menos un bloque de horario"
    }

    // Validar cada bloque
    formData.bloques.forEach((bloque, index) => {
      const diasArray = Array.isArray(bloque.dia_semana) ? bloque.dia_semana : [bloque.dia_semana]
      if (diasArray.length === 0) {
        newErrors[`bloque_${index}_dias`] = "Debe seleccionar al menos un día"
      }

      // Validar duración mínima (15 minutos)
      const duracion = calcularDuracion(bloque.hora_inicio, bloque.hora_fin)
      if (duracion < 15) {
        if (cruzaMedianoche(bloque.hora_inicio, bloque.hora_fin)) {
          newErrors[`bloque_${index}_horas`] = `Horario nocturno demasiado corto. Duración actual: ${Math.floor(duracion / 60)}h ${duracion % 60}min (mínimo 15 minutos)`
        } else {
          newErrors[`bloque_${index}_horas`] = `Duración demasiado corta: ${duracion} minutos (mínimo 15 minutos)`
        }
      }

      // Validar duración máxima (24 horas para permitir trabajo de día completo)
      if (duracion > 24 * 60) {
        newErrors[`bloque_${index}_horas`] = `Duración demasiado larga: ${Math.floor(duracion / 60)}h ${duracion % 60}min (máximo 24 horas)`
      }
    })

    // Validar solapamientos en el frontend
    const bloquesPorDia: Record<string, Array<BloqueVerificacion>> = {}

    formData.bloques.forEach((bloque, index) => {
      const diasArray = Array.isArray(bloque.dia_semana) ? bloque.dia_semana : [bloque.dia_semana]
      diasArray.forEach((dia) => {
        if (!bloquesPorDia[dia]) {
          bloquesPorDia[dia] = []
        }
        bloquesPorDia[dia].push({
          inicio: bloque.hora_inicio,
          fin: bloque.hora_fin,
          index,
          tipo: bloque.tipo
        })
      })
    })

    // Verificar solapamientos
    Object.entries(bloquesPorDia).forEach(([dia, bloques]) => {
      for (let i = 0; i < bloques.length - 1; i++) {
        for (let j = i + 1; j < bloques.length; j++) {
          const bloque1 = bloques[i]
          const bloque2 = bloques[j]

          if (verificarSolapamiento(bloque1, bloque2)) {
            const duracion1 = calcularDuracion(bloque1.inicio, bloque1.fin)
            const duracion2 = calcularDuracion(bloque2.inicio, bloque2.fin)
            
            newErrors[`solapamiento_${dia}`] = 
              `Conflicto en ${dia}: Bloque ${bloque1.tipo} (${bloque1.inicio}-${bloque1.fin}, ${Math.floor(duracion1 / 60)}h ${duracion1 % 60}min) se superpone con bloque ${bloque2.tipo} (${bloque2.inicio}-${bloque2.fin}, ${Math.floor(duracion2 / 60)}h ${duracion2 % 60}min)`
          }
        }
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      if (grupo) {
        await updateGrupoHorario(grupo.id, {
          nombre: formData.nombre,
          descripcion: formData.descripcion,
          bloques: formData.bloques as HorarioBloque[],
          motorizados: formData.tipo === "grupal" ? formData.motorizados : undefined,
        })
        showAlert({
          title: "Éxito",
          text: "Grupo actualizado exitosamente",
          icon: "success",
        })
      } else {
        await createGrupoHorario({
          nombre: formData.nombre,
          descripcion: formData.descripcion,
          tipo: formData.tipo,
          motorizado_individual_id: formData.tipo === "individual" ? formData.motorizado_individual_id : undefined,
          bloques: formData.bloques,
          motorizados: formData.tipo === "grupal" ? formData.motorizados : undefined,
        })
        showAlert({
          title: "Éxito",
          text: "Grupo creado exitosamente",
          icon: "success",
        })
      }

      onSave()
    } catch (error: unknown) {
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Error al guardar el grupo de horario"
      showAlert({
        title: "Error",
        text: errorMessage,
        icon: "error",
      })
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  // Recargar motorizados manualmente
  const handleRecargarMotorizados = async () => {
    if (grupo) {
      await loadTodosMotorizados()
    } else {
      await loadMotorizadosDisponibles()
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-700 px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <button onClick={onCancel} className="text-white hover:bg-brand-600 p-1.5 sm:p-2 rounded-lg transition-colors flex-shrink-0">
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
          <h2 className="text-base sm:text-xl font-semibold text-white break-words">
            {grupo ? "Editar Horario de Trabajo" : "Crear Nuevo Horario de Trabajo"}
          </h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Información sobre horarios nocturnos */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-blue-800 mb-2">
            <Sunrise className="h-5 w-5" />
            <span className="font-medium">Información sobre horarios nocturnos:</span>
          </div>
          <p className="text-sm text-blue-700">
            ✓ Puedes crear horarios que crucen la medianoche (ej: 06:00 a 00:00 del día siguiente)
            <br />
            ✓ El sistema calculará automáticamente la duración correcta para horarios nocturnos
            <br />
            ✓ Duración mínima: 15 minutos | Duración máxima: 24 horas (día completo)
          </p>
        </div>

        {/* Mostrar errores de solapamiento */}
        {Object.entries(errors).some(([key]) => key.startsWith("solapamiento_")) && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-800 mb-2">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Conflictos de horarios detectados:</span>
            </div>
            <ul className="text-sm text-red-700 space-y-1">
              {Object.entries(errors)
                .filter(([key]) => key.startsWith("solapamiento_"))
                .map(([key, message]) => (
                  <li key={key}>• {message}</li>
                ))}
            </ul>
          </div>
        )}

        {/* Información básica */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del horario *</label>
            <Input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData((prev) => ({ ...prev, nombre: e.target.value }))}
              className="w-full"
              placeholder="Ej: Turno Mañana, Horario Fin de Semana..."
            />
            {errors.nombre && <p className="text-red-600 text-sm mt-1">{errors.nombre}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de horario *</label>
            <Select
              value={formData.tipo}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  tipo: value as "grupal" | "individual",
                  motorizados: value === "individual" ? [] : prev.motorizados,
                  motorizado_individual_id: value === "grupal" ? 0 : prev.motorizado_individual_id,
                }))
              }
              disabled={!!grupo}
            >
              <SelectTrigger className="w-full px-3 py-2 ">
                <SelectValue placeholder="Seleccionar tipo..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grupal">Grupal (varios motorizados)</SelectItem>
                <SelectItem value="individual">Individual (un motorizado)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
          <Textarea
            value={formData.descripcion}
            onChange={(e) => setFormData((prev) => ({ ...prev, descripcion: e.target.value }))}
            rows={3}
            className="w-full"
            placeholder="Descripción opcional del horario de trabajo..."
          />
        </div>

        {/* Selección de motorizado individual */}
        {formData.tipo === "individual" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="inline h-4 w-4 mr-1" />
              Motorizado asignado *
            </label>
            <Select
              value={formData.motorizado_individual_id.toString()}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, motorizado_individual_id: Number.parseInt(value) }))
              }
            >
              <SelectTrigger className="w-full px-3">
                <SelectValue placeholder="Seleccionar motorizado..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Seleccionar motorizado...</SelectItem>
                {getMotorizadosParaMostrar().map((motorizado) => (
                  <SelectItem key={motorizado.id} value={motorizado.id.toString()}>
                    {motorizado.nombres} {motorizado.apellidos} - {motorizado.celular}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.motorizado_individual_id && (
              <p className="text-red-600 text-sm mt-1">{errors.motorizado_individual_id}</p>
            )}
          </div>
        )}

        {/* Selección de motorizados grupales */}
        {formData.tipo === "grupal" && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                <Users className="inline h-4 w-4 mr-1" />
                Motorizados asignados *
                {grupo && (
                  <span className="text-xs text-gray-500 ml-2">
                    (Editando horario: se muestran todos los motorizados)
                  </span>
                )}
              </label>
              <button
                type="button"
                onClick={handleRecargarMotorizados}
                disabled={loadingMotorizados}
                className="text-sm text-brand-600 hover:text-brand-700 flex items-center gap-1 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${loadingMotorizados ? 'animate-spin' : ''}`} />
                Recargar
              </button>
            </div>
            
            <div className="border border-gray-300 rounded-lg p-4 max-h-64 overflow-y-auto">
              {loadingMotorizados ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-600 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-500">Cargando motorizados...</p>
                </div>
              ) : getMotorizadosParaMostrar().length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">
                  {grupo ? "No se pudieron cargar los motorizados" : "No hay motorizados disponibles"}
                </p>
              ) : (
                <div className="space-y-3">
                  {getMotorizadosParaMostrar().map((motorizado) => {
                    const isSelected = formData.motorizados.includes(motorizado.id)
                    const isAvailable = isMotorizadoDisponible(motorizado.id)
                    const canToggle = isAvailable || isSelected

                    return (
                      <label 
                        key={motorizado.id} 
                        className={`flex items-center p-3 rounded-lg border transition-colors ${
                          isSelected 
                            ? "bg-brand-50 border-brand-200" 
                            : canToggle
                            ? "bg-white border-gray-200 hover:bg-gray-50"
                            : "bg-gray-50 border-gray-200"
                        } ${canToggle ? "cursor-pointer" : "cursor-not-allowed opacity-60"}`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleMotorizadoToggle(motorizado.id)}
                          disabled={!canToggle}
                          className="rounded border-gray-300 text-brand-600 focus:ring-brand-500 disabled:opacity-50"
                        />
                        <div className="ml-3 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-900">
                              {motorizado.nombres} {motorizado.apellidos}
                            </span>
                            {!isAvailable && !isSelected && (
                              <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
                                No disponible
                              </span>
                            )}
                            {isSelected && (
                              <span className="text-xs text-brand-600 bg-brand-100 px-2 py-1 rounded">
                                Asignado
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            {motorizado.celular} • {motorizado.email}
                          </div>
                        </div>
                      </label>
                    )
                  })}
                </div>
              )}
            </div>
            {errors.motorizados && <p className="text-red-600 text-sm mt-1">{errors.motorizados}</p>}
          </div>
        )}

        {/* Bloques de horario */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                <Clock className="inline h-4 w-4 mr-1" />
                Horarios de Trabajo *
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Define los diferentes períodos de trabajo, descansos y almuerzo. Soporta horarios nocturnos.
              </p>
            </div>
          </div>

          {/* Botones para agregar diferentes tipos de bloques */}
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-3">Agregar período de tiempo:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {tiposBloques.map((tipo) => {
                const IconComponent = tipo.icon
                return (
                  <button
                    key={tipo.key}
                    type="button"
                    onClick={() => handleAddBloque(tipo.key as "trabajo" | "descanso" | "almuerzo")}
                    className="flex items-center gap-3 p-3 sm:p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-brand-400 hover:bg-brand-50 transition-colors group"
                  >
                    <div className="p-2 rounded-lg flex-shrink-0" style={{ backgroundColor: `${tipo.color}20`, color: tipo.color }}>
                      <IconComponent className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <div className="text-left min-w-0">
                      <div className="font-medium text-sm sm:text-base text-gray-900 group-hover:text-brand-700 break-words">{tipo.label}</div>
                      <div className="text-xs text-gray-500 break-words">{tipo.description}</div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {errors.bloques && <p className="text-red-600 text-sm mb-4">{errors.bloques}</p>}

          <div className="space-y-4 sm:space-y-6">
            {formData.bloques.map((bloque, index) => {
              const tipoInfo = tiposBloques.find((t) => t.key === bloque.tipo)
              const IconComponent = tipoInfo?.icon || Clock
              const duracion = calcularDuracion(bloque.hora_inicio, bloque.hora_fin)
              const cruzaMedianocheBloque = cruzaMedianoche(bloque.hora_inicio, bloque.hora_fin)
              const diasActuales = Array.isArray(bloque.dia_semana) ? bloque.dia_semana : [bloque.dia_semana]
              const todosDiasSeleccionados = diasActuales.length === diasSemana.length

              return (
                <div key={index} className="border border-gray-200 rounded-lg p-4 sm:p-6 bg-gray-50">
                  <div className="flex items-start sm:items-center justify-between mb-4 gap-2">
                    <div className="flex items-start sm:items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      <div
                        className="p-1.5 sm:p-2 rounded-lg flex-shrink-0"
                        style={{ backgroundColor: `${tipoInfo?.color}20`, color: tipoInfo?.color }}
                      >
                        <IconComponent className="h-4 w-4 sm:h-5 sm:w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-sm sm:text-base text-gray-900 break-words">
                          {tipoInfo?.label} #{index + 1}
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-500 break-words">{tipoInfo?.description}</p>
                        {/* Mostrar duración calculada */}
                        <p className="text-xs text-gray-600 mt-1">
                          Duración: {Math.floor(duracion / 60)}h {duracion % 60}min
                          {cruzaMedianocheBloque && <span className="text-blue-600 ml-1 sm:ml-2">(cruza medianoche)</span>}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveBloque(index)}
                      className="text-red-600 hover:bg-red-100 p-1.5 sm:p-2 rounded-lg transition-colors flex-shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Selectores de tiempo mejorados */}
                    <TimeSelectorMejorado
                      label="Hora de inicio"
                      value={bloque.hora_inicio}
                      onChange={(time) => handleBloqueChange(index, "hora_inicio", time)}
                    />

                    <TimeSelectorMejorado
                      label="Hora de fin"
                      value={bloque.hora_fin}
                      onChange={(time) => handleBloqueChange(index, "hora_fin", time)}
                    />
                  </div>

                  {/* Días de la semana */}
                  <div className="mt-6">
                    <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 mb-3">
                      <label className="block text-sm font-medium text-gray-700">
                        <Calendar className="inline h-4 w-4 mr-1" />
                        Días de la semana
                      </label>
                      <button
                        type="button"
                        onClick={() => handleToggleAllDias(index)}
                        className={`text-xs px-3 py-1.5 rounded-full flex items-center justify-center gap-1 self-start xs:self-auto whitespace-nowrap ${
                          todosDiasSeleccionados 
                            ? "bg-brand-100 text-brand-700 hover:bg-brand-200" 
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {todosDiasSeleccionados ? (
                          <>
                            <X className="h-3 w-3 flex-shrink-0" />
                            <span className="hidden xs:inline">Deseleccionar todos</span>
                            <span className="xs:hidden">Deseleccionar</span>
                          </>
                        ) : (
                          <>
                            <Check className="h-3 w-3 flex-shrink-0" />
                            <span className="hidden xs:inline">Seleccionar todos</span>
                            <span className="xs:hidden">Seleccionar</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-7 gap-2 sm:gap-2">
                      {diasSemana.map((dia) => {
                        const isSelected = diasActuales.includes(dia.key)

                        return (
                          <label key={dia.key} className="flex flex-col items-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => handleDiaChange(index, dia.key, e.target.checked)}
                              className="sr-only"
                            />
                            <div
                              className={`w-full py-2.5 sm:py-3 px-1.5 sm:px-2 text-center text-xs sm:text-sm font-medium rounded-lg cursor-pointer transition-all ${
                                isSelected
                                  ? "bg-brand-600 text-white shadow-md transform scale-105"
                                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                              }`}
                            >
                              <div className="font-bold text-xs sm:text-sm">{dia.short}</div>
                              <div className="text-[10px] sm:text-xs opacity-75 hidden xs:block">{dia.label.slice(0, 3)}</div>
                            </div>
                          </label>
                        )
                      })}
                    </div>
                    {errors[`bloque_${index}_dias`] && (
                      <p className="text-red-600 text-sm mt-2">{errors[`bloque_${index}_dias`]}</p>
                    )}
                    {errors[`bloque_${index}_horas`] && (
                      <p className="text-red-600 text-sm mt-2">{errors[`bloque_${index}_horas`]}</p>
                    )}
                  </div>

                  {/* Descripción del bloque */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Info className="inline h-4 w-4 mr-1" />
                      Descripción adicional (opcional)
                    </label>
                    <input
                      type="text"
                      value={bloque.descripcion || ""}
                      onChange={(e) => handleBloqueChange(index, "descripcion", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                      placeholder="Ej: Turno principal de entregas, Hora de comida..."
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col-reverse xs:flex-row xs:justify-end gap-2 xs:gap-3 pt-4 sm:pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="w-full xs:w-auto px-4 sm:px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
          >
            <X className="h-4 w-4 flex-shrink-0" />
            <span>Cancelar</span>
          </button>
          <button
            type="submit"
            disabled={loading}
            className="w-full xs:w-auto px-6 sm:px-8 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white flex-shrink-0"></div>
            ) : (
              <Save className="h-4 w-4 flex-shrink-0" />
            )}
            <span>{loading ? "Guardando..." : grupo ? "Actualizar Horario" : "Crear Horario"}</span>
          </button>
        </div>
      </form>
    </div>
  )
}