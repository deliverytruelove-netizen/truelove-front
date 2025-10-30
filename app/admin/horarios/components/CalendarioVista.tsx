// app\admin\horarios\components\CalendarioVista.tsx
"use client";
import { useState } from "react";
import type { HorarioGrupo, DiaSemana } from "../types/horarios.types";
import { ArrowLeft, Clock, Users, User, Calendar, X } from "lucide-react";

interface CalendarioVistaProps {
  grupo: HorarioGrupo;
  onBack: () => void;
}

export function CalendarioVista({ grupo, onBack }: CalendarioVistaProps) {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const diasSemana = [
    "lunes",
    "martes",
    "miercoles",
    "jueves",
    "viernes",
    "sabado",
    "domingo",
  ];
  const diasLabels = {
    lunes: "Lunes",
    martes: "Martes",
    miercoles: "Miércoles",
    jueves: "Jueves",
    viernes: "Viernes",
    sabado: "Sábado",
    domingo: "Domingo",
  };

  // Generar las horas del día con soporte para horarios nocturnos (01:00 a 00:00)
  const generateHours = () => {
    const hours = [];
    // Empezamos desde 01:00 hasta 23:00
    for (let i = 1; i < 24; i++) {
      hours.push(i);
    }
    // Agregamos 00:00 (medianoche) al final
    hours.push(0);
    return hours;
  };

  const hours = generateHours();

  const formatTimeDisplay = (time24: string): string => {
    // Retornar directamente en formato 24 horas
    return time24;
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case "trabajo":
        return "bg-blue-500";
      case "descanso":
        return "bg-yellow-500";
      case "almuerzo":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case "trabajo":
        return "Trabajo";
      case "descanso":
        return "Descanso";
      case "almuerzo":
        return "Almuerzo";
      default:
        return tipo;
    }
  };

  // Función auxiliar para convertir hora a minutos
  const horaAMinutos = (hora: string): number => {
    const [hours, minutes] = hora.split(":").map(Number);
    return hours * 60 + minutes;
  };

  // Función auxiliar para verificar si un horario cruza medianoche
  const cruzaMedianoche = (horaInicio: string, horaFin: string): boolean => {
    const inicioMinutos = horaAMinutos(horaInicio);
    const finMinutos = horaAMinutos(horaFin);
    return finMinutos < inicioMinutos;
  };

  // Calcular la posición y altura de cada bloque (mejorado para horarios nocturnos)
  const getBlockPosition = (horaInicio: string, horaFin: string) => {
    const inicioMinutos = horaAMinutos(horaInicio);
    const finMinutos = horaAMinutos(horaFin);

    // 40px por hora (reducido de 60px para que los bloques no sean tan altos)
    const pixelsPerMinute = 40 / 60;

    if (cruzaMedianoche(horaInicio, horaFin)) {
      // Para horarios que cruzan medianoche, necesitamos crear dos bloques
      // Primer bloque: desde hora_inicio hasta 24:00
      const primerBloqueAltura = (24 * 60 - inicioMinutos) * pixelsPerMinute;
      const primerBloqueTop = inicioMinutos * pixelsPerMinute;

      // Segundo bloque: desde 00:00 hasta hora_fin
      const segundoBloqueAltura = finMinutos * pixelsPerMinute;
      const segundoBloqueTop = 0;

      return {
        cruzaMedianoche: true,
        primerBloque: {
          top: primerBloqueTop,
          height: Math.max(primerBloqueAltura, 20),
        },
        segundoBloque: {
          top: segundoBloqueTop,
          height: Math.max(segundoBloqueAltura, 20),
        },
      };
    } else {
      // Horario normal
      const top = inicioMinutos * pixelsPerMinute;
      const height = Math.max(
        (finMinutos - inicioMinutos) * pixelsPerMinute,
        20
      );

      return {
        cruzaMedianoche: false,
        normal: { top, height },
      };
    }
  };

  // Obtener bloques para un día específico
  const getBloquesPorDia = (dia: string) => {
    return (
      grupo.bloques
        ?.filter((bloque) => {
          const diasBloque = Array.isArray(bloque.dia_semana)
            ? bloque.dia_semana
            : [bloque.dia_semana];
          return diasBloque.includes(dia as DiaSemana);
        })
        .sort((a, b) => {
          // Ordenar por hora de inicio
          return a.hora_inicio.localeCompare(b.hora_inicio);
        }) || []
    );
  };

  // Calcular duración de un bloque
  const calcularDuracion = (horaInicio: string, horaFin: string): number => {
    const inicioMinutos = horaAMinutos(horaInicio);
    const finMinutos = horaAMinutos(horaFin);

    if (cruzaMedianoche(horaInicio, horaFin)) {
      return 24 * 60 - inicioMinutos + finMinutos;
    } else {
      return finMinutos - inicioMinutos;
    }
  };

  // Reordenar las horas para que 00:00 aparezca al final
  // const reorderHour = (hour: number): number => {
  //   if (hour === 0) return 24; // 00:00 (medianoche) se muestra al final
  //   return hour;
  // }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-700 px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center gap-2 sm:gap-3 mb-3">
          <button
            onClick={onBack}
            className="text-white hover:bg-brand-600 p-1.5 sm:p-2 rounded-lg transition-colors flex-shrink-0"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
          <h2 className="text-base sm:text-xl font-semibold text-white break-words">
            Vista de Calendario - {grupo.nombre}
          </h2>
        </div>

        {/* Info del grupo */}
        <div className="bg-brand-600/30 rounded-lg p-3">
          <div className="flex flex-col xs:flex-row xs:flex-wrap items-start xs:items-center gap-3 xs:gap-4 text-white text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 flex-shrink-0" />
              <span className="font-medium">Tipo:</span>
              <span className="bg-white/20 px-2 py-1 rounded whitespace-nowrap">
                {grupo.tipo === "grupal" ? "Grupal" : "Individual"}
              </span>
            </div>

            {grupo.tipo === "grupal" ? (
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 flex-shrink-0" />
                <span className="font-medium">Motorizados:</span>
                <span className="bg-white/20 px-2 py-1 rounded">
                  {grupo.motorizados?.length || 0}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 flex-shrink-0" />
                <span className="font-medium">Motorizado:</span>
                <span className="bg-white/20 px-2 py-1 rounded break-words">
                  {grupo.motorizado_individual
                    ? `${grupo.motorizado_individual.nombres} ${grupo.motorizado_individual.apellidos}`
                    : "Sin asignar"}
                </span>
              </div>
            )}

            {grupo.descripcion && (
              <div className="flex items-center gap-2 w-full xs:w-auto">
                <Clock className="h-4 w-4 flex-shrink-0" />
                <span className="break-words">{grupo.descripcion}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Leyenda de colores */}
      <div className="px-4 sm:px-6 py-3 bg-gray-50 border-b">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-xs sm:text-sm">
          <span className="font-medium text-gray-700 whitespace-nowrap">
            Tipos de actividad:
          </span>
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-500 rounded flex-shrink-0"></div>
              <span className="text-xs sm:text-sm">Trabajo</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-yellow-500 rounded flex-shrink-0"></div>
              <span className="text-xs sm:text-sm">Descanso</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded flex-shrink-0"></div>
              <span className="text-xs sm:text-sm">Almuerzo</span>
            </div>
            <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-purple-500 rounded border-2 border-purple-300 flex-shrink-0"></div>
              <span className="text-xs sm:text-sm">Nocturno</span>
            </div>
          </div>
        </div>
      </div>

      {/* Calendario - Vista Móvil (Mensual) */}
      <div className="p-3 md:hidden">
        {!selectedDay ? (
          // Vista de calendario mensual
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Header con días de la semana */}
            <div className="grid grid-cols-7 bg-gray-100 border-b">
              {["L", "M", "M", "J", "V", "S", "D"].map((dia, index) => (
                <div key={index} className="p-2 text-center text-xs font-medium text-gray-600">
                  {dia}
                </div>
              ))}
            </div>

            {/* Grid de días del mes */}
            <div className="grid grid-cols-7">
              {diasSemana.map((dia, index) => {
                const bloques = getBloquesPorDia(dia);
                const diaNumero = index + 1;

                return (
                  <div
                    key={dia}
                    onClick={() => bloques.length > 0 && setSelectedDay(dia)}
                    className={`min-h-[80px] border-r border-b border-gray-200 p-1 ${
                      bloques.length > 0 ? "cursor-pointer hover:bg-gray-50" : ""
                    }`}
                  >
                    <div className="text-xs font-medium text-gray-700 mb-1">{diaNumero}</div>
                    <div className="space-y-1">
                      {bloques.slice(0, 2).map((bloque, bloqueIndex) => (
                        <div
                          key={bloqueIndex}
                          className={`${getTipoColor(bloque.tipo)} text-white text-[9px] px-1 py-0.5 rounded truncate`}
                        >
                          {getTipoLabel(bloque.tipo)}
                        </div>
                      ))}
                      {bloques.length > 2 && (
                        <div className="text-[8px] text-gray-500">+{bloques.length - 2} más</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          // Vista de detalle del día seleccionado
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Header del día */}
            <div className="bg-gray-100 p-3 border-b flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-600">
                  {diasLabels[selectedDay as keyof typeof diasLabels]}
                </div>
                <div className="text-lg font-semibold text-gray-900">
                  {diasSemana.indexOf(selectedDay) + 1}
                </div>
              </div>
              <button
                onClick={() => setSelectedDay(null)}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            {/* Lista de bloques del día */}
            <div className="p-3 space-y-2">
              {getBloquesPorDia(selectedDay).map((bloque, index) => {
                const duracion = calcularDuracion(bloque.hora_inicio, bloque.hora_fin);
                const esNocturno = cruzaMedianoche(bloque.hora_inicio, bloque.hora_fin);

                return (
                  <div
                    key={index}
                    className={`${getTipoColor(bloque.tipo)} text-white rounded-lg p-3 ${
                      esNocturno ? "border-2 border-purple-300" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium">{getTipoLabel(bloque.tipo)}</div>
                      {esNocturno && <span className="text-xs">🌙 Nocturno</span>}
                    </div>
                    <div className="text-sm opacity-90">
                      {formatTimeDisplay(bloque.hora_inicio)} - {formatTimeDisplay(bloque.hora_fin)}
                    </div>
                    <div className="text-xs opacity-80 mt-1">
                      Duración: {Math.floor(duracion / 60)}h {duracion % 60}min
                    </div>
                    {bloque.descripcion && (
                      <div className="text-xs opacity-80 mt-2 border-t border-white/20 pt-2">
                        {bloque.descripcion}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Calendario - Vista Desktop (Semanal con horas) */}
      <div className="p-6 hidden md:block">
        <div className="overflow-x-auto">
          <div className="min-w-max border border-gray-200 rounded-lg overflow-hidden bg-white">
            {/* Header con días */}
            <div className="grid grid-cols-8 bg-gray-50">
              <div className="p-4 text-center font-medium text-gray-700 border-r border-gray-200 min-w-[80px]">
                <span className="text-sm">Hora</span>
              </div>
              {diasSemana.map((dia) => (
                <div
                  key={dia}
                  className="p-4 text-center font-medium text-gray-700 border-r border-gray-200 last:border-r-0 min-w-[120px]"
                >
                  <div className="text-sm">
                    {diasLabels[dia as keyof typeof diasLabels]}
                  </div>
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
                    <span className="whitespace-nowrap">
                      {formatTimeDisplay(
                        `${hour.toString().padStart(2, "0")}:00`
                      )}
                    </span>
                  </div>
                ))}
              </div>

              {/* Columnas de días */}
              {diasSemana.map((dia) => (
                <div
                  key={dia}
                  className="relative border-r border-gray-200 last:border-r-0"
                >
                  {/* Líneas de hora */}
                  {hours.map((hour) => (
                    <div
                      key={hour}
                      className="h-[40px] border-b border-gray-100"
                    ></div>
                  ))}

                  {/* Bloques de horario */}
                  <div className="absolute inset-0 p-1">
                    {getBloquesPorDia(dia).map((bloque, bloqueIndex) => {
                      const position = getBlockPosition(
                        bloque.hora_inicio,
                        bloque.hora_fin
                      );
                      const duracion = calcularDuracion(
                        bloque.hora_inicio,
                        bloque.hora_fin
                      );

                      if (position.cruzaMedianoche) {
                        // Renderizar dos bloques para horarios que cruzan medianoche
                        return (
                          <div key={bloqueIndex}>
                            {/* Primer bloque (antes de medianoche) */}
                            <div
                              className={`absolute left-1 right-1 ${getTipoColor(
                                bloque.tipo
                              )} text-white text-xs rounded shadow-sm overflow-hidden border-2 border-purple-300`}
                              style={{
                                top: `${position.primerBloque?.top ?? 0}px`,
                                height: `${
                                  position.primerBloque?.height ?? 0
                                }px`,
                                zIndex: 10,
                              }}
                            >
                              <div className="p-2 h-full flex flex-col justify-center">
                                <div className="font-medium text-center mb-1 text-xs">
                                  {getTipoLabel(bloque.tipo)}
                                </div>
                                <div className="text-center text-xs opacity-90">
                                  {formatTimeDisplay(bloque.hora_inicio)}
                                </div>
                                <div className="text-center text-xs opacity-90">
                                  ↓ 00:00
                                </div>
                                <div className="text-center text-xs opacity-80 mt-1">
                                  🌙 ({Math.floor(duracion / 60)}h{" "}
                                  {duracion % 60}m)
                                </div>
                              </div>
                            </div>

                            {/* Segundo bloque (después de medianoche) */}
                            <div
                              className={`absolute left-1 right-1 ${getTipoColor(
                                bloque.tipo
                              )} text-white text-xs rounded shadow-sm overflow-hidden border-2 border-purple-300`}
                              style={{
                                top: `${position.segundoBloque?.top ?? 0}px`,
                                height: `${
                                  position.segundoBloque?.height ?? 0
                                }px`,
                                zIndex: 10,
                              }}
                            >
                              <div className="p-2 h-full flex flex-col justify-center">
                                <div className="text-center text-xs opacity-90">
                                  00:00 ↓
                                </div>
                                <div className="text-center text-xs opacity-90">
                                  {formatTimeDisplay(bloque.hora_fin)}
                                </div>
                                {bloque.descripcion && (
                                  <div className="text-center text-xs opacity-80 mt-1 truncate">
                                    {bloque.descripcion}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      } else {
                        // Renderizar bloque normal
                        return (
                          <div
                            key={bloqueIndex}
                            className={`absolute left-1 right-1 ${getTipoColor(
                              bloque.tipo
                            )} text-white text-xs rounded shadow-sm overflow-hidden border border-white/20`}
                            style={{
                              top: `${position.normal?.top ?? 0}px`,
                              height: `${position.normal?.height ?? 0}px`,
                              zIndex: 10,
                            }}
                          >
                            <div className="p-2 h-full flex flex-col justify-center">
                              <div className="font-medium text-center mb-1 text-xs">
                                {getTipoLabel(bloque.tipo)}
                              </div>
                              <div className="text-center text-xs opacity-90">
                                {formatTimeDisplay(bloque.hora_inicio)}
                              </div>
                              <div className="text-center text-xs opacity-90">
                                {formatTimeDisplay(bloque.hora_fin)}
                              </div>
                              <div className="text-center text-xs opacity-80 mt-1">
                                {Math.floor(duracion / 60)}h {duracion % 60}m
                              </div>
                              {bloque.descripcion && (
                                <div className="text-center text-xs opacity-80 mt-1 truncate">
                                  {bloque.descripcion}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      }
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      {/* Información adicional */}
      {grupo.tipo === "grupal" &&
        grupo.motorizados &&
        grupo.motorizados.length > 0 && (
          <div className="mt-4 md:mt-6 bg-blue-50 rounded-lg p-3 md:p-4 mx-3 md:mx-6">
            <h4 className="font-medium text-sm md:text-base text-blue-900 mb-3">
              Motorizados asignados a este horario:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
              {grupo.motorizados.map((motorizado) => (
                <div
                  key={motorizado.id}
                  className="bg-white rounded p-2 md:p-3 border border-blue-200"
                >
                  <div className="font-medium text-sm md:text-base text-gray-900 break-words">
                    {motorizado.nombres} {motorizado.apellidos}
                  </div>
                  <div className="text-xs md:text-sm text-gray-600 break-words">
                    {motorizado.celular}
                  </div>
                  <div className="text-xs text-gray-500 break-words">
                    {motorizado.email}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* Resumen de bloques mejorado */}
      <div className="mt-4 md:mt-6 mb-3 md:mb-0 bg-gray-50 rounded-lg p-3 md:p-4 mx-3 md:mx-6">
        <h4 className="font-medium text-sm md:text-base text-gray-900 mb-3">
          Resumen de horarios:
        </h4>
        <div className="space-y-2">
          {grupo.bloques?.map((bloque, index) => {
            const diasArray = Array.isArray(bloque.dia_semana)
              ? bloque.dia_semana
              : [bloque.dia_semana];
            const duracion = calcularDuracion(
              bloque.hora_inicio,
              bloque.hora_fin
            );
            const esNocturno = cruzaMedianoche(
              bloque.hora_inicio,
              bloque.hora_fin
            );

            return (
              <div
                key={index}
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-3 bg-white rounded p-3 border"
              >
                <div className="flex items-start md:items-center gap-2 md:gap-3 min-w-0">
                  <div
                    className={`w-3 h-3 md:w-4 md:h-4 ${getTipoColor(
                      bloque.tipo
                    )} rounded flex-shrink-0 mt-0.5 md:mt-0 ${
                      esNocturno ? "border-2 border-purple-300" : ""
                    }`}
                  ></div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1 md:gap-2">
                      <span className="font-medium text-sm md:text-base">
                        {getTipoLabel(bloque.tipo)}
                      </span>
                      {bloque.descripcion && (
                        <span className="text-gray-600 text-xs md:text-sm break-words">
                          - {bloque.descripcion}
                        </span>
                      )}
                      {esNocturno && (
                        <span className="text-purple-600 text-xs whitespace-nowrap">
                          🌙 Nocturno
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-xs md:text-sm text-gray-600 pl-5 md:pl-0">
                  <div className="font-medium whitespace-nowrap">
                    {formatTimeDisplay(bloque.hora_inicio)} -{" "}
                    {formatTimeDisplay(bloque.hora_fin)}
                  </div>
                  <div className="text-xs text-gray-500">
                    ({Math.floor(duracion / 60)}h {duracion % 60}min)
                  </div>
                  <div className="text-xs text-gray-500 break-words">
                    {diasArray
                      .map((d) => diasLabels[d as keyof typeof diasLabels])
                      .join(", ")}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      </div>
    </div>
  );
}
