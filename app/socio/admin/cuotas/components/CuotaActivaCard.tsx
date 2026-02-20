"use client";

import { CuotaActiva, Periodo } from "../types/pago-cuota.types";
import { Calendar, CreditCard, Building2, Clock } from "lucide-react";
import {
  calcularDiasHastaPago,
  formatearFechaCorta,
  getProximaFechaPago,
} from "../utils/fecha-pago.utils";

interface CuotaActivaCardProps {
  cuota: CuotaActiva;
  periodoActual?: Periodo | null;
}

export default function CuotaActivaCard({ cuota, periodoActual }: CuotaActivaCardProps) {
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
    if (cuota.tipo_cuota === "porcentaje" && periodoActual) {
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

  const getEstadoCuota = () => {
    if (cuota.tipo_cuota !== "porcentaje" || !periodoActual) return null;
    const totalVentas = periodoActual.total_ventas ? parseFloat(periodoActual.total_ventas.toString()) : 0;
    if (cuota.monto_minimo && cuota.porcentaje_comision) {
      const porcentaje = parseFloat(cuota.porcentaje_comision.toString()) / 100;
      const montoCalculado = totalVentas * porcentaje;
      if (montoCalculado < parseFloat(cuota.monto_minimo.toString())) {
        const montoUsoApp = cuota.monto_uso_app ? parseFloat(cuota.monto_uso_app.toString()) : 0;
        return {
          tipo: 'minimo' as const,
          mensaje: montoUsoApp > 0
            ? `Comisión (S/ ${montoCalculado.toFixed(2)}) no alcanza el mínimo. Se cobra uso de app: S/ ${montoUsoApp.toFixed(2)}`
            : `Comisión (S/ ${montoCalculado.toFixed(2)}) no alcanza el mínimo`,
          color: 'text-blue-600'
        };
      }
    }
    return {
      tipo: 'normal' as const,
      mensaje: periodoActual.monto_calculado ? '✓ Calculado' : '⚠ Pendiente de cálculo',
      color: periodoActual.monto_calculado ? 'text-green-600' : 'text-amber-600'
    };
  };

  const montoAPagar = getMontoAPagar();
  const estadoCuota = getEstadoCuota();
  const diasRestantes = cuota.dia_pago ? calcularDiasHastaPago(cuota.dia_pago) : null;
  const proximaFechaPago = cuota.dia_pago ? getProximaFechaPago(cuota.dia_pago) : null;

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-4 space-y-3">
      <h2 className="text-lg font-bold text-gray-900">Cuota Activa</h2>

      {/* Monto principal */}
      <div className="bg-blue-50 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">Monto a Pagar</p>
            <p className="text-2xl font-bold text-blue-600">S/ {montoAPagar.toFixed(2)}</p>
          </div>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
            {getPeriodicidadLabel(cuota.periodicidad)}
          </span>
        </div>

        {/* Barra de progreso para porcentaje con límite */}
        {cuota.tipo_cuota === "porcentaje" && cuota.monto_maximo && periodoActual && (() => {
          const limite = parseFloat(cuota.monto_maximo.toString());
          const porcentajeBar = Math.min((montoAPagar / limite) * 100, 100);
          const colorBarra = porcentajeBar >= 100 ? "bg-red-500" : porcentajeBar >= 80 ? "bg-yellow-400" : "bg-green-500";
          const colorTexto = porcentajeBar >= 100 ? "text-red-600" : porcentajeBar >= 80 ? "text-yellow-600" : "text-green-600";
          return (
            <div className="mt-3 space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span className={colorTexto}>Deuda: S/ {montoAPagar.toFixed(2)}</span>
                <span className="text-gray-500">Tope: S/ {limite.toFixed(2)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                <div className={`h-2.5 rounded-full transition-all duration-500 ${colorBarra}`} style={{ width: `${porcentajeBar}%` }} />
              </div>
              {porcentajeBar >= 80 && (
                <p className={`text-xs font-medium ${colorTexto}`}>
                  {porcentajeBar >= 100 ? "🔴 Límite alcanzado" : "⚠️ Evite interrupción en sus operaciones"}
                </p>
              )}
            </div>
          );
        })()}
      </div>

      {/* Info porcentaje */}
      {cuota.tipo_cuota === "porcentaje" && periodoActual && (
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-gray-50 rounded-md p-2">
            <p className="text-xs text-gray-500">Ventas</p>
            <p className="text-sm font-semibold">S/ {periodoActual.total_ventas ? parseFloat(periodoActual.total_ventas.toString()).toFixed(2) : "0.00"}</p>
          </div>
          <div className="bg-gray-50 rounded-md p-2">
            <p className="text-xs text-gray-500">Pedidos</p>
            <p className="text-sm font-semibold">{periodoActual.cantidad_pedidos || 0}</p>
          </div>
          <div className="bg-gray-50 rounded-md p-2">
            <p className="text-xs text-gray-500">Comisión</p>
            <p className="text-sm font-semibold">{cuota.porcentaje_comision}%</p>
          </div>
        </div>
      )}

      {/* Estado */}
      {estadoCuota && estadoCuota.tipo === 'minimo' && (
        <div className="bg-blue-50 border border-blue-200 rounded-md px-3 py-2">
          <p className="text-xs text-blue-700">ℹ️ {estadoCuota.mensaje}</p>
        </div>
      )}

      {/* Día de Pago */}
      {cuota.dia_pago && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-bold text-blue-800">Día {cuota.dia_pago} de cada mes</p>
              {diasRestantes !== null && proximaFechaPago && (
                <p className="text-xs text-blue-600 flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3" />
                  {diasRestantes === 0 ? (
                    <span className="font-semibold text-green-700">¡Hoy es tu día de pago!</span>
                  ) : diasRestantes > 0 ? (
                    <>Próximo: {formatearFechaCorta(proximaFechaPago)} (en {diasRestantes} día{diasRestantes !== 1 ? "s" : ""})</>
                  ) : (
                    <span className="font-semibold text-red-700">Vencido hace {Math.abs(diasRestantes)} día{Math.abs(diasRestantes) !== 1 ? "s" : ""}</span>
                  )}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Datos bancarios compactos */}
      <div className="border-t pt-3">
        <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1.5">
          <Building2 className="w-4 h-4" /> Datos de la Cuenta
        </h3>
        <div className="bg-gray-50 rounded-md p-3 space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Banco</span>
            <span className="font-medium">{cuota.banco || "-"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Cuenta</span>
            <span className="font-mono font-semibold">{cuota.numero_cuenta}</span>
          </div>
          {cuota.tipo_cuenta && (
            <div className="flex justify-between">
              <span className="text-gray-500">Tipo</span>
              <span className="font-medium">{cuota.tipo_cuenta}</span>
            </div>
          )}
        </div>
      </div>

      {/* Métodos de pago */}
      {cuota.metodos_pago_disponibles && cuota.metodos_pago_disponibles.length > 0 && (
        <div className="border-t pt-3">
          <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1.5">
            <CreditCard className="w-4 h-4" /> Métodos de Pago
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {cuota.metodos_pago_disponibles.map((metodo) => (
              <span key={metodo} className="px-2.5 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium capitalize">
                {metodo}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
