// app\admin\horarios\components\CalendarioVista.tsx
"use client"
import type { HorarioGrupo, DiaSemana } from "../types/horarios.types"
import { ArrowLeft, Clock, Users, User, Calendar } from 'lucide-react'

interface CalendarioVistaProps {
  grupo: HorarioGrupo
  onBack: () => void
}

export function CalendarioVista({ grupo, onBack }: CalendarioVistaProps) {
  const diasSemana = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"]
  const diasLabels = {
    lunes: "Lunes",
    martes: "Martes",
    miercoles: "Miércoles",
    jueves: "Jueves",
    viernes: "Viernes",
    sabado: "Sábado",
    domingo: "Domingo",
  }

  // Generar las horas del día con soporte para horarios nocturnos (1:00 a 12:00 AM)
  const generateHours = () => {
    const hours = []
    // Empezamos desde 1 AM hasta 11 PM
    for (let i = 1; i < 24; i++) {
      hours.push(i)
    }
    // Agregamos 12 AM (hora 0) al final
    hours.push(0)
    return hours
  }

  const hours = generateHours()

  const formatTimeDisplay = (time24: string): string => {
    const [hours, minutes] = time24.split(":").map(Number)
    const period = hours >= 12 ? "PM" : "AM"
    const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
    return `${displayHour}:${minutes.toString().padStart(2, "0")} ${period}`
  }

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case "trabajo":
        return "bg-blue-500"
      case "descanso":
        return "bg-yellow-500"
      case "almuerzo":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case "trabajo":
        return "Trabajo"
      case "descanso":
        return "Descanso"
      case "almuerzo":
        return "Almuerzo"
      default:
        return tipo
    }
  }

  // Función auxiliar para convertir hora a minutos
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

  // Calcular la posición y altura de cada bloque (mejorado para horarios nocturnos)
  const getBlockPosition = (horaInicio: string, horaFin: string) => {
    const inicioMinutos = horaAMinutos(horaInicio)
    const finMinutos = horaAMinutos(horaFin)
    
    // 40px por hora (reducido de 60px para que los bloques no sean tan altos)
    const pixelsPerMinute = 40 / 60

    if (cruzaMedianoche(horaInicio, horaFin)) {
      // Para horarios que cruzan medianoche, necesitamos crear dos bloques
      // Primer bloque: desde hora_inicio hasta 24:00
      const primerBloqueAltura = (24 * 60 - inicioMinutos) * pixelsPerMinute
      const primerBloqueTop = inicioMinutos * pixelsPerMinute
      
      // Segundo bloque: desde 00:00 hasta hora_fin  
      const segundoBloqueAltura = finMinutos * pixelsPerMinute
      const segundoBloqueTop = 0
      
      return {
        cruzaMedianoche: true,
        primerBloque: { top: primerBloqueTop, height: Math.max(primerBloqueAltura, 20) },
        segundoBloque: { top: segundoBloqueTop, height: Math.max(segundoBloqueAltura, 20) }
      }
    } else {
      // Horario normal
      const top = inicioMinutos * pixelsPerMinute
      const height = Math.max((finMinutos - inicioMinutos) * pixelsPerMinute, 20)
      
      return {
        cruzaMedianoche: false,
        normal: { top, height }
      }
    }
  }

  // Obtener bloques para un día específico
  const getBloquesPorDia = (dia: string) => {
    return (
      grupo.bloques
        ?.filter((bloque) => {
          const diasBloque = Array.isArray(bloque.dia_semana) ? bloque.dia_semana : [bloque.dia_semana]
          return diasBloque.includes(dia as DiaSemana)
        })
        .sort((a, b) => {
          // Ordenar por hora de inicio
          return a.hora_inicio.localeCompare(b.hora_inicio)
        }) || []
    )
  }

  // Calcular duración de un bloque
  const calcularDuracion = (horaInicio: string, horaFin: string): number => {
    const inicioMinutos = horaAMinutos(horaInicio)
    const finMinutos = horaAMinutos(horaFin)
    
    if (cruzaMedianoche(horaInicio, horaFin)) {
      return (24 * 60 - inicioMinutos) + finMinutos
    } else {
      return finMinutos - inicioMinutos
    }
  }

  // Reordenar las horas para que 12 AM aparezca al final
  // const reorderHour = (hour: number): number => {
  //   if (hour === 0) return 24; // 12 AM (hora 0) se muestra al final
  //   return hour;
  // }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-700 px-6 py-4">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={onBack} className="text-white hover:bg-brand-600 p-2 rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h2 className="text-xl font-semibold text-white">Vista de Calendario - {grupo.nombre}</h2>
        </div>

        {/* Info del grupo */}
        <div className="bg-brand-600/30 rounded-lg p-3">
          <div className="flex flex-wrap items-center gap-4 text-white text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="font-medium">Tipo:</span>
              <span className="bg-white/20 px-2 py-1 rounded">{grupo.tipo === "grupal" ? "Grupal" : "Individual"}</span>
            </div>

            {grupo.tipo === "grupal" ? (
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="font-medium">Motorizados:</span>
                <span className="bg-white/20 px-2 py-1 rounded">{grupo.motorizados?.length || 0}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="font-medium">Motorizado:</span>
                <span className="bg-white/20 px-2 py-1 rounded">
                  {grupo.motorizado_individual
                    ? `${grupo.motorizado_individual.nombres} ${grupo.motorizado_individual.apellidos}`
                    : "Sin asignar"}
                </span>
              </div>
            )}

            {grupo.descripcion && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{grupo.descripcion}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Leyenda de colores */}
      <div className="px-6 py-3 bg-gray-50 border-b">
        <div className="flex items-center gap-6 text-sm">
          <span className="font-medium text-gray-700">Tipos de actividad:</span>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span>Tiempo de Trabajo</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span>Descanso</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>Almuerzo</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-500 rounded border-2 border-purple-300"></div>
            <span>Horario nocturno (cruza medianoche)</span>
          </div>
        </div>
      </div>

      {/* Calendario */}
      <div className="p-6">
        <div className="overflow-x-auto">
          <div className="min-w-max border border-gray-200 rounded-lg overflow-hidden bg-white">
            {/* Header con días */}
            <div className="grid grid-cols-8 bg-gray-50">
              <div className="p-4 text-center font-medium text-gray-700 border-r border-gray-200 min-w-[80px]">
                Hora
              </div>
              {diasSemana.map((dia) => (
                <div
                  key={dia}
                  className="p-4 text-center font-medium text-gray-700 border-r border-gray-200 last:border-r-0 min-w-[120px]"
                >
                  <div className="text-sm">{diasLabels[dia as keyof typeof diasLabels]}</div>
                </div>
              ))}
            </div>

            {/* Cuerpo del calendario */}
            <div className="grid grid-cols-8 relative">
              {/* Columna de horas */}
              <div className="border-r border-gray-200">
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="h-[40px] border-b border-gray-100 p-2 text-xs text-gray-600 text-center bg-gray-50 flex items-center justify-center"
                  >
                    {formatTimeDisplay(`${hour.toString().padStart(2, "0")}:00`)}
                  </div>
                ))}
              </div>

              {/* Columnas de días */}
              {diasSemana.map((dia) => (
                <div key={dia} className="relative border-r border-gray-200 last:border-r-0">
                  {/* Líneas de hora */}
                  {hours.map((hour) => (
                    <div key={hour} className="h-[40px] border-b border-gray-100"></div>
                  ))}

                  {/* Bloques de horario */}
                  <div className="absolute inset-0 p-1">
                    {getBloquesPorDia(dia).map((bloque, bloqueIndex) => {
                      const position = getBlockPosition(bloque.hora_inicio, bloque.hora_fin)
                      const duracion = calcularDuracion(bloque.hora_inicio, bloque.hora_fin)
                      
                      if (position.cruzaMedianoche) {
                        // Renderizar dos bloques para horarios que cruzan medianoche
                        return (
                          <div key={bloqueIndex}>
                            {/* Primer bloque (antes de medianoche) */}
                            <div
                              className={`absolute left-1 right-1 ${getTipoColor(bloque.tipo)} text-white text-xs rounded shadow-sm overflow-hidden border-2 border-purple-300`}
                              style={{
                                top: `${position.primerBloque?.top ?? 0}px`,
                                height: `${position.primerBloque?.height ?? 0}px`,
                                zIndex: 10,
                              }}
                            >
                              <div className="p-2 h-full flex flex-col justify-center">
                                <div className="font-medium text-center mb-1">{getTipoLabel(bloque.tipo)}</div>
                                <div className="text-center text-xs opacity-90">
                                  {formatTimeDisplay(bloque.hora_inicio)}
                                </div>
                                <div className="text-center text-xs opacity-90">↓ 12:00 AM</div>
                                <div className="text-center text-xs opacity-80 mt-1">
                                  🌙 Nocturno ({Math.floor(duracion / 60)}h {duracion % 60}min)
                                </div>
                              </div>
                            </div>
                            
                            {/* Segundo bloque (después de medianoche) */}
                            <div
                              className={`absolute left-1 right-1 ${getTipoColor(bloque.tipo)} text-white text-xs rounded shadow-sm overflow-hidden border-2 border-purple-300`}
                              style={{
                                top: `${position.segundoBloque?.top ?? 0}px`,
                                height: `${position.segundoBloque?.height ?? 0}px`,
                                zIndex: 10,
                              }}
                            >
                              <div className="p-2 h-full flex flex-col justify-center">
                                <div className="text-center text-xs opacity-90">12:00 AM ↓</div>
                                <div className="text-center text-xs opacity-90">
                                  {formatTimeDisplay(bloque.hora_fin)}
                                </div>
                                {bloque.descripcion && (
                                  <div className="text-center text-xs opacity-80 mt-1 truncate">{bloque.descripcion}</div>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      } else {
                        // Renderizar bloque normal
                        return (
                          <div
                            key={bloqueIndex}
                            className={`absolute left-1 right-1 ${getTipoColor(bloque.tipo)} text-white text-xs rounded shadow-sm overflow-hidden border border-white/20`}
                            style={{
                              top: `${position.normal?.top ?? 0}px`,
                              height: `${position.normal?.height ?? 0}px`,
                              zIndex: 10,
                            }}
                          >
                            <div className="p-2 h-full flex flex-col justify-center">
                              <div className="font-medium text-center mb-1">{getTipoLabel(bloque.tipo)}</div>
                              <div className="text-center text-xs opacity-90">
                                {formatTimeDisplay(bloque.hora_inicio)}
                              </div>
                              <div className="text-center text-xs opacity-90">{formatTimeDisplay(bloque.hora_fin)}</div>
                              <div className="text-center text-xs opacity-80 mt-1">
                                {Math.floor(duracion / 60)}h {duracion % 60}min
                              </div>
                              {bloque.descripcion && (
                                <div className="text-center text-xs opacity-80 mt-1 truncate">{bloque.descripcion}</div>
                              )}
                            </div>
                          </div>
                        )
                      }
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Información adicional */}
        {grupo.tipo === "grupal" && grupo.motorizados && grupo.motorizados.length > 0 && (
          <div className="mt-6 bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-3">Motorizados asignados a este horario:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {grupo.motorizados.map((motorizado) => (
                <div key={motorizado.id} className="bg-white rounded p-3 border border-blue-200">
                  <div className="font-medium text-gray-900">
                    {motorizado.nombres} {motorizado.apellidos}
                  </div>
                  <div className="text-sm text-gray-600">{motorizado.celular}</div>
                  <div className="text-xs text-gray-500">{motorizado.email}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Resumen de bloques mejorado */}
        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Resumen de horarios:</h4>
          <div className="space-y-2">
            {grupo.bloques?.map((bloque, index) => {
              const diasArray = Array.isArray(bloque.dia_semana) ? bloque.dia_semana : [bloque.dia_semana]
              const duracion = calcularDuracion(bloque.hora_inicio, bloque.hora_fin)
              const esNocturno = cruzaMedianoche(bloque.hora_inicio, bloque.hora_fin)
              
              return (
                <div key={index} className="flex items-center justify-between bg-white rounded p-3 border">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 ${getTipoColor(bloque.tipo)} rounded ${esNocturno ? 'border-2 border-purple-300' : ''}`}></div>
                    <div>
                      <span className="font-medium">{getTipoLabel(bloque.tipo)}</span>
                      {bloque.descripcion && <span className="text-gray-600 ml-2">- {bloque.descripcion}</span>}
                      {esNocturno && <span className="text-purple-600 text-xs ml-2">🌙 Nocturno</span>}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">
                      {formatTimeDisplay(bloque.hora_inicio)} - {formatTimeDisplay(bloque.hora_fin)}
                    </span>
                    <span className="ml-2 text-xs">
                      ({Math.floor(duracion / 60)}h {duracion % 60}min)
                    </span>
                    <div className="text-xs text-gray-500">
                      {diasArray.map((d) => diasLabels[d as keyof typeof diasLabels]).join(", ")}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}