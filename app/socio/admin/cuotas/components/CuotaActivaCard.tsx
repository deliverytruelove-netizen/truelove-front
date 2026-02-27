"use client";

import { CuotaActiva, Periodo } from "../types/pago-cuota.types";
import { Calendar, CreditCard, Building2, Clock, TrendingUp, Percent, Info } from "lucide-react";
import {
  calcularDiasHastaPago,
  formatearFechaSafe,
  calcularDiasHastaFecha,
} from "../utils/fecha-pago.utils";

interface CuotaActivaCardProps {
  cuota: CuotaActiva;
  periodoActual?: Periodo | null;
}

export default function CuotaActivaCard({ cuota, periodoActual }: CuotaActivaCardProps) {
  const esPorcentaje = cuota.tipo_cuota === "porcentaje"

  const getPeriodicidadLabel = (periodicidad: string) => {
    const labels: Record<string, string> = {
      diario: "Diaria",
      semanal: "Semanal",
      quincenal: "Quincenal",
      mensual: "Mensual",
    };
    return labels[periodicidad] || periodicidad;
  };

  const getMontoAPagar = () => {
    if (esPorcentaje && periodoActual) {
      if (periodoActual.monto_calculado) {
        return parseFloat(periodoActual.monto_calculado.toString());
      }
      const cantidadPedidos = periodoActual.cantidad_pedidos || 0;
      const totalVentas = periodoActual.total_ventas ? parseFloat(periodoActual.total_ventas.toString()) : 0;
      if (cuota.exonerar_si_menos_pedidos && cuota.minimo_pedidos) {
        if (cantidadPedidos < cuota.minimo_pedidos) return 0;
      }
      if (cuota.porcentaje_comision) {
        const porcentaje = parseFloat(cuota.porcentaje_comision.toString()) / 100;
        const montoCalculado = totalVentas * porcentaje;
        if (cuota.monto_minimo && montoCalculado < parseFloat(cuota.monto_minimo.toString())) {
          return cuota.monto_uso_app ? parseFloat(cuota.monto_uso_app.toString()) : 0;
        }
        return montoCalculado;
      }
      return 0;
    }
    return parseFloat(cuota.monto_cuota?.toString() || "0");
  };

  const montoAPagar = getMontoAPagar();

  // Días restantes: para porcentaje usar fecha_vencimiento, para fijo usar dia_pago
  const diasRestantes = (() => {
    if (esPorcentaje && periodoActual?.fecha_vencimiento) {
      return calcularDiasHastaFecha(periodoActual.fecha_vencimiento);
    }
    if (!cuota.dia_pago) return null;
    return calcularDiasHastaPago(cuota.dia_pago, cuota.periodicidad);
  })();

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-700 px-4 py-3">
        <h2 className="text-base font-semibold text-white flex items-center gap-2">
          {esPorcentaje ? <Percent className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
          {esPorcentaje ? "Comisión Activa" : "Cuota Activa"}
        </h2>
      </div>

      <div className="p-4 space-y-3">
        {/* Monto principal */}
        <div className="bg-brand-50 dark:bg-brand-900/20 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {esPorcentaje ? "Comisión del Período" : "Monto a Pagar"}
              </p>
              <p className="text-2xl font-bold text-brand-700 dark:text-brand-400">
                S/ {montoAPagar.toFixed(2)}
              </p>
            </div>
            <span className="text-xs px-2 py-1 rounded-full font-medium bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-400">
              {getPeriodicidadLabel(cuota.periodicidad)}
            </span>
          </div>

        </div>

        {/* Info porcentaje: Ventas, Pedidos, Comisión */}
        {esPorcentaje && periodoActual && (
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2.5 border border-gray-200 dark:border-gray-700">
              <TrendingUp className="w-4 h-4 text-brand-500 mx-auto mb-1" />
              <p className="text-xs text-gray-500 dark:text-gray-400">Ventas</p>
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                S/ {periodoActual.total_ventas ? parseFloat(periodoActual.total_ventas.toString()).toFixed(2) : "0.00"}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2.5 border border-gray-200 dark:border-gray-700">
              <CreditCard className="w-4 h-4 text-brand-500 mx-auto mb-1" />
              <p className="text-xs text-gray-500 dark:text-gray-400">Pedidos</p>
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                {periodoActual.cantidad_pedidos || 0}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2.5 border border-gray-200 dark:border-gray-700">
              <Percent className="w-4 h-4 text-brand-500 mx-auto mb-1" />
              <p className="text-xs text-gray-500 dark:text-gray-400">Comisión</p>
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{cuota.porcentaje_comision}%</p>
            </div>
          </div>
        )}

        {/* Desglose del cálculo para porcentaje */}
        {esPorcentaje && periodoActual && (() => {
          const totalVentas = periodoActual.total_ventas ? parseFloat(periodoActual.total_ventas.toString()) : 0;
          const comisionBruta = cuota.porcentaje_comision ? totalVentas * parseFloat(cuota.porcentaje_comision.toString()) / 100 : 0;
          const montoMinimo = cuota.monto_minimo ? parseFloat(cuota.monto_minimo.toString()) : null;
          if (totalVentas <= 0) return null;
          return (
            <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
              <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-1">
                <Info className="w-3.5 h-3.5" /> Desglose del Cálculo
              </h4>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Ventas del período</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">S/ {totalVentas.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Comisión ({cuota.porcentaje_comision}%)</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">S/ {comisionBruta.toFixed(2)}</span>
                </div>
                {montoMinimo !== null && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Mínimo requerido</span>
                    <span className={`font-medium ${comisionBruta >= montoMinimo ? "text-green-600 dark:text-green-400" : "text-yellow-600 dark:text-yellow-400"}`}>
                      S/ {montoMinimo.toFixed(2)} {comisionBruta >= montoMinimo ? "✓" : "✗"}
                    </span>
                  </div>
                )}
                <div className="border-t border-gray-200 dark:border-gray-600 pt-1.5 flex justify-between">
                  <span className="font-semibold text-gray-700 dark:text-gray-300">Total a pagar</span>
                  <span className="font-bold text-brand-700 dark:text-brand-400">S/ {montoAPagar.toFixed(2)}</span>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Período y Vencimiento */}
        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Calendar className="w-5 h-5 text-brand-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1">
              {esPorcentaje && periodoActual ? (
                <>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
                      Período: {formatearFechaSafe(periodoActual.periodo_inicio, { day: "2-digit", month: "short" })} - {formatearFechaSafe(periodoActual.periodo_fin, { day: "2-digit", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <Clock className="w-3 h-3 text-gray-400" />
                    {diasRestantes !== null ? (
                      diasRestantes === 0 ? (
                        <span className="font-semibold text-yellow-600 dark:text-yellow-400">Vence hoy</span>
                      ) : diasRestantes > 0 ? (
                        <span className="text-gray-500 dark:text-gray-400">
                          Vence el {formatearFechaSafe(periodoActual.fecha_vencimiento, { day: "2-digit", month: "short" })} ({diasRestantes} día{diasRestantes !== 1 ? "s" : ""})
                        </span>
                      ) : (
                        <span className="font-semibold text-brand-600 dark:text-brand-400">
                          Venció hace {Math.abs(diasRestantes)} día{Math.abs(diasRestantes) !== 1 ? "s" : ""}
                        </span>
                      )
                    ) : (
                      <span className="text-gray-400 dark:text-gray-500">Sin fecha de vencimiento</span>
                    )}
                  </div>
                </>
              ) : cuota.dia_pago ? (
                <>
                  <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
                    {(() => {
                      switch (cuota.periodicidad) {
                        case "semanal": {
                          const diasSemana = ["", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
                          return `${diasSemana[cuota.dia_pago!] || `Día ${cuota.dia_pago}`} de cada semana`
                        }
                        case "quincenal":
                          return `Día ${cuota.dia_pago} de cada quincena`
                        default:
                          return `Día ${cuota.dia_pago} de cada mes`
                      }
                    })()}
                  </p>
                  {diasRestantes !== null && (
                    <div className="flex items-center gap-1 text-xs">
                      <Clock className="w-3 h-3 text-gray-400" />
                      {diasRestantes === 0 ? (
                        <span className="font-semibold text-green-600 dark:text-green-400">¡Hoy es tu día de pago!</span>
                      ) : diasRestantes > 0 ? (
                        <span className="text-gray-500 dark:text-gray-400">
                          Próximo pago en {diasRestantes} día{diasRestantes !== 1 ? "s" : ""}
                        </span>
                      ) : (
                        <span className="font-semibold text-brand-600 dark:text-brand-400">
                          Vencido hace {Math.abs(diasRestantes)} día{Math.abs(diasRestantes) !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">Sin día de pago configurado</p>
              )}
            </div>
          </div>
        </div>

        {/* Datos bancarios */}
        <div className="border-t dark:border-gray-700 pt-3">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-1.5">
            <Building2 className="w-4 h-4" /> Datos de la Cuenta
          </h3>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-3 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Banco</span>
              <span className="font-medium dark:text-gray-200">{cuota.banco || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Cuenta</span>
              <span className="font-mono font-semibold dark:text-gray-200">{cuota.numero_cuenta}</span>
            </div>
            {cuota.tipo_cuenta && (
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Tipo</span>
                <span className="font-medium dark:text-gray-200">{cuota.tipo_cuenta}</span>
              </div>
            )}
          </div>
        </div>

        {/* Métodos de pago */}
        {cuota.metodos_pago_disponibles && cuota.metodos_pago_disponibles.length > 0 && (
          <div className="border-t dark:border-gray-700 pt-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4" /> Métodos de Pago
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {cuota.metodos_pago_disponibles.map((metodo) => (
                <span key={metodo} className="px-2.5 py-0.5 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 rounded-full text-xs font-medium capitalize">
                  {metodo}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
