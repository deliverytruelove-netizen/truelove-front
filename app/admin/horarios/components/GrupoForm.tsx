// app\admin\horarios\components\GrupoForm.tsx
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { TimeSelectorMejorado } from "./TimeSelector"
import { createGrupoHorario, updateGrupoHorario, fetchMotorizadosDisponibles } from "../services/horarios.service"
import type { HorarioGrupo, HorarioBloque, Motorizado, DiaSemana } from "../types/horarios.types"
import { ArrowLeft, Trash2, Clock, Users, User, Save, X, Info, Calendar, Coffee, Briefcase, Moon, AlertCircle, Sunrise, Check } from 'lucide-react'

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
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

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
    loadMotorizadosDisponibles()

    if (grupo) {
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
  }, [grupo])

  const loadMotorizadosDisponibles = async () => {
    try {
      const motorizados = await fetchMotorizadosDisponibles()
      setMotorizadosDisponibles(motorizados)
    } catch (error) {
      console.error("Error al cargar motorizados:", error)
    }
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

      // Validar duración máxima (18 horas para evitar horarios excesivos)
      if (duracion > 18 * 60) {
        newErrors[`bloque_${index}_horas`] = `Duración demasiado larga: ${Math.floor(duracion / 60)}h ${duracion % 60}min (máximo 18 horas)`
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
        alert("Grupo actualizado exitosamente")
      } else {
        await createGrupoHorario({
          nombre: formData.nombre,
          descripcion: formData.descripcion,
          tipo: formData.tipo,
          motorizado_individual_id: formData.tipo === "individual" ? formData.motorizado_individual_id : undefined,
          bloques: formData.bloques,
          motorizados: formData.tipo === "grupal" ? formData.motorizados : undefined,
        })
        alert("Grupo creado exitosamente")
      }

      onSave()
    } catch (error: unknown) {
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Error al guardar el grupo de horario"
      alert(errorMessage)
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-700 px-6 py-4">
        <div className="flex items-center gap-3">
          <button onClick={onCancel} className="text-white hover:bg-brand-600 p-2 rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h2 className="text-xl font-semibold text-white">
            {grupo ? "Editar Horario de Trabajo" : "Crear Nuevo Horario de Trabajo"}
          </h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Información sobre horarios nocturnos */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-blue-800 mb-2">
            <Sunrise className="h-5 w-5" />
            <span className="font-medium">Información sobre horarios nocturnos:</span>
          </div>
          <p className="text-sm text-blue-700">
            ✓ Puedes crear horarios que crucen la medianoche (ej: 6:00 AM a 12:00 AM del día siguiente)
            <br />
            ✓ El sistema calculará automáticamente la duración correcta para horarios nocturnos
            <br />
            ✓ Duración mínima: 15 minutos | Duración máxima: 18 horas
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
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData((prev) => ({ ...prev, nombre: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              placeholder="Ej: Turno Mañana, Horario Fin de Semana..."
            />
            {errors.nombre && <p className="text-red-600 text-sm mt-1">{errors.nombre}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de horario *</label>
            <select
              value={formData.tipo}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  tipo: e.target.value as "grupal" | "individual",
                  motorizados: e.target.value === "individual" ? [] : prev.motorizados,
                  motorizado_individual_id: e.target.value === "grupal" ? 0 : prev.motorizado_individual_id,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              disabled={!!grupo}
            >
              <option value="grupal">Grupal (varios motorizados)</option>
              <option value="individual">Individual (un motorizado)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
          <textarea
            value={formData.descripcion}
            onChange={(e) => setFormData((prev) => ({ ...prev, descripcion: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
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
            <select
              value={formData.motorizado_individual_id}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, motorizado_individual_id: Number.parseInt(e.target.value) }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            >
              <option value={0}>Seleccionar motorizado...</option>
              {motorizadosDisponibles.map((motorizado) => (
                <option key={motorizado.id} value={motorizado.id}>
                  {motorizado.nombres} {motorizado.apellidos} - {motorizado.celular}
                </option>
              ))}
            </select>
            {errors.motorizado_individual_id && (
              <p className="text-red-600 text-sm mt-1">{errors.motorizado_individual_id}</p>
            )}
          </div>
        )}

        {/* Selección de motorizados grupales */}
        {formData.tipo === "grupal" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="inline h-4 w-4 mr-1" />
              Motorizados asignados *
            </label>
            <div className="border border-gray-300 rounded-lg p-4 max-h-40 overflow-y-auto">
              {motorizadosDisponibles.length === 0 ? (
                <p className="text-gray-500 text-sm">No hay motorizados disponibles</p>
              ) : (
                <div className="space-y-2">
                  {motorizadosDisponibles.map((motorizado) => (
                    <label key={motorizado.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.motorizados.includes(motorizado.id)}
                        onChange={() => handleMotorizadoToggle(motorizado.id)}
                        className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                      />
                      <span className="ml-2 text-sm">
                        {motorizado.nombres} {motorizado.apellidos} - {motorizado.celular}
                      </span>
                    </label>
                  ))}
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {tiposBloques.map((tipo) => {
                const IconComponent = tipo.icon
                return (
                  <button
                    key={tipo.key}
                    type="button"
                    onClick={() => handleAddBloque(tipo.key as "trabajo" | "descanso" | "almuerzo")}
                    className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-brand-400 hover:bg-brand-50 transition-colors group"
                  >
                    <div className="p-2 rounded-lg" style={{ backgroundColor: `${tipo.color}20`, color: tipo.color }}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-gray-900 group-hover:text-brand-700">{tipo.label}</div>
                      <div className="text-xs text-gray-500">{tipo.description}</div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {errors.bloques && <p className="text-red-600 text-sm mb-4">{errors.bloques}</p>}

          <div className="space-y-6">
            {formData.bloques.map((bloque, index) => {
              const tipoInfo = tiposBloques.find((t) => t.key === bloque.tipo)
              const IconComponent = tipoInfo?.icon || Clock
              const duracion = calcularDuracion(bloque.hora_inicio, bloque.hora_fin)
              const cruzaMedianocheBloque = cruzaMedianoche(bloque.hora_inicio, bloque.hora_fin)
              const diasActuales = Array.isArray(bloque.dia_semana) ? bloque.dia_semana : [bloque.dia_semana]
              const todosDiasSeleccionados = diasActuales.length === diasSemana.length

              return (
                <div key={index} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: `${tipoInfo?.color}20`, color: tipoInfo?.color }}
                      >
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {tipoInfo?.label} #{index + 1}
                        </h4>
                        <p className="text-sm text-gray-500">{tipoInfo?.description}</p>
                        {/* Mostrar duración calculada */}
                        <p className="text-xs text-gray-600 mt-1">
                          Duración: {Math.floor(duracion / 60)}h {duracion % 60}min
                          {cruzaMedianocheBloque && <span className="text-blue-600 ml-2">(cruza medianoche)</span>}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveBloque(index)}
                      className="text-red-600 hover:bg-red-100 p-2 rounded-lg transition-colors"
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
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-medium text-gray-700">
                        <Calendar className="inline h-4 w-4 mr-1" />
                        Días de la semana
                      </label>
                      <button
                        type="button"
                        onClick={() => handleToggleAllDias(index)}
                        className={`text-xs px-3 py-1 rounded-full flex items-center gap-1 ${
                          todosDiasSeleccionados 
                            ? "bg-brand-100 text-brand-700 hover:bg-brand-200" 
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {todosDiasSeleccionados ? (
                          <>
                            <X className="h-3 w-3" />
                            Deseleccionar todos
                          </>
                        ) : (
                          <>
                            <Check className="h-3 w-3" />
                            Seleccionar todos
                          </>
                        )}
                      </button>
                    </div>
                    <div className="grid grid-cols-7 gap-2">
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
                              className={`w-full py-3 px-2 text-center text-sm font-medium rounded-lg cursor-pointer transition-all ${
                                isSelected
                                  ? "bg-brand-600 text-white shadow-md transform scale-105"
                                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                              }`}
                            >
                              <div className="font-bold">{dia.short}</div>
                              <div className="text-xs opacity-75">{dia.label.slice(0, 3)}</div>
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
        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Save className="h-4 w-4" />
            )}
            {loading ? "Guardando..." : grupo ? "Actualizar Horario" : "Crear Horario"}
          </button>
        </div>
      </form>
    </div>
  )
}