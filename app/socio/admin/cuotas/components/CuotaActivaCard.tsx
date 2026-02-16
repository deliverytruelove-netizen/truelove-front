"use client";

import { CuotaActiva, Periodo } from "../types/pago-cuota.types";
import { Coins, Calendar, CreditCard, Building2, Clock } from "lucide-react";
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

  // Calcular el monto a mostrar según el tipo de cuota y las condiciones
  const getMontoAPagar = () => {
    // Si es cuota de porcentaje y hay período actual
    if (cuota.tipo_cuota === "porcentaje" && periodoActual) {
      // Si ya está calculado por el backend, usar ese valor
      if (periodoActual.monto_calculado) {
        return parseFloat(periodoActual.monto_calculado.toString());
      }
      
      // Si no está calculado, calcular en tiempo real siguiendo la misma lógica del backend
      const cantidadPedidos = periodoActual.cantidad_pedidos || 0;
      const totalVentas = periodoActual.total_ventas ? parseFloat(periodoActual.total_ventas.toString()) : 0;
      
      // CASO 1: Verificar si debe exonerar por mínimo de pedidos
      if (cuota.exonerar_si_menos_pedidos && cuota.minimo_pedidos) {
        if (cantidadPedidos < cuota.minimo_pedidos) {
          return 0; // Exonerado, no paga
        }
      }
      
      // CASO 2: Calcular porcentaje sobre ventas
      if (cuota.porcentaje_comision) {
        const porcentaje = parseFloat(cuota.porcentaje_comision.toString()) / 100;
        const montoCalculado = totalVentas * porcentaje;
        
        // CASO 3: Aplicar monto mínimo si corresponde
        if (cuota.monto_minimo && montoCalculado < parseFloat(cuota.monto_minimo.toString())) {
          return parseFloat(cuota.monto_minimo.toString());
        }
        
        return montoCalculado;
      }
      
      return 0;
    }
    // Si es cuota fija, mostrar el monto de la cuota
    return parseFloat(cuota.monto_cuota?.toString() || "0");
  };

  // Determinar el estado de la cuota
  const getEstadoCuota = () => {
    if (cuota.tipo_cuota !== "porcentaje" || !periodoActual) {
      return null;
    }
    
    const cantidadPedidos = periodoActual.cantidad_pedidos || 0;
    const totalVentas = periodoActual.total_ventas ? parseFloat(periodoActual.total_ventas.toString()) : 0;
    
    // Verificar exoneración por mínimo de pedidos
    if (cuota.exonerar_si_menos_pedidos && cuota.minimo_pedidos) {
      if (cantidadPedidos < cuota.minimo_pedidos) {
        return {
          tipo: 'exonerado',
          mensaje: `Exonerado - Pedidos insuficientes (${cantidadPedidos}/${cuota.minimo_pedidos})`,
          color: 'text-green-600'
        };
      }
    }
    
    // Verificar si aplica monto mínimo
    if (cuota.monto_minimo && cuota.porcentaje_comision) {
      const porcentaje = parseFloat(cuota.porcentaje_comision.toString()) / 100;
      const montoCalculado = totalVentas * porcentaje;
      
      if (montoCalculado < parseFloat(cuota.monto_minimo.toString())) {
        return {
          tipo: 'minimo',
          mensaje: `Monto mínimo aplicado (comisión calculada: S/ ${montoCalculado.toFixed(2)})`,
          color: 'text-blue-600'
        };
      }
    }
    
    // Cálculo normal
    return {
      tipo: 'normal',
      mensaje: periodoActual.monto_calculado ? '✓ Calculado' : '⚠ Pendiente de cálculo',
      color: periodoActual.monto_calculado ? 'text-green-600' : 'text-amber-600'
    };
  };

  const montoAPagar = getMontoAPagar();
  const estadoCuota = getEstadoCuota();

  // Calcular información del día de pago
  const diasRestantes = cuota.dia_pago
    ? calcularDiasHastaPago(cuota.dia_pago)
    : null;
  const proximaFechaPago = cuota.dia_pago
    ? getProximaFechaPago(cuota.dia_pago)
    : null;

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Cuota Activa</h2>

      <div className="space-y-4">
        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
          <Coins className="w-8 h-8 text-blue-600" />
          <div className="flex-1">
            <p className="text-sm text-gray-600">Monto a Pagar</p>
            <p className="text-2xl font-bold text-blue-600">
              S/ {montoAPagar.toFixed(2)}
            </p>
            {cuota.tipo_cuota === "porcentaje" && periodoActual && estadoCuota && (
              <div className="mt-2 space-y-1">
                {/* Información de ventas y pedidos */}
                <div className="text-xs text-gray-600">
                  {periodoActual.total_ventas && (
                    <p>💰 Ventas: S/ {parseFloat(periodoActual.total_ventas.toString()).toFixed(2)}</p>
                  )}
                  {periodoActual.cantidad_pedidos !== undefined && (
                    <p>📦 Pedidos: {periodoActual.cantidad_pedidos}
                      {cuota.minimo_pedidos && ` / ${cuota.minimo_pedidos} mínimo`}
                    </p>
                  )}
                  {cuota.porcentaje_comision && (
                    <p>📊 Comisión: {cuota.porcentaje_comision}%</p>
                  )}
                </div>
                
                {/* Estado de la cuota con mensaje descriptivo */}
                <div className={`text-xs font-semibold ${estadoCuota.color} mt-2 p-2 rounded ${
                  estadoCuota.tipo === 'exonerado' ? 'bg-green-50' : 
                  estadoCuota.tipo === 'minimo' ? 'bg-blue-50' : 
                  'bg-gray-50'
                }`}>
                  {estadoCuota.tipo === 'exonerado' && '🎉 '}
                  {estadoCuota.tipo === 'minimo' && 'ℹ️ '}
                  {estadoCuota.mensaje}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-gray-500" />
          <div>
            <p className="text-sm text-gray-600">Periodicidad</p>
            <p className="text-base font-medium text-gray-900">
              {getPeriodicidadLabel(cuota.periodicidad)}
            </p>
          </div>
        </div>

        {/* Sección de Día de Pago */}
        {cuota.dia_pago && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6 text-blue-600" />
              <div className="flex-1">
                <p className="text-sm text-blue-600 font-medium">Día de Pago</p>
                <p className="text-xl font-bold text-blue-800">
                  Día {cuota.dia_pago} de cada mes
                </p>
                {diasRestantes !== null && proximaFechaPago && (
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <p className="text-sm text-blue-600">
                      {diasRestantes === 0 ? (
                        <span className="font-semibold text-green-700">
                          ¡Hoy es tu día de pago!
                        </span>
                      ) : diasRestantes > 0 ? (
                        <>
                          Próximo pago: {formatearFechaCorta(proximaFechaPago)}{" "}
                          (en {diasRestantes} día
                          {diasRestantes !== 1 ? "s" : ""})
                        </>
                      ) : (
                        <span className="font-semibold text-red-700">
                          Pago vencido hace {Math.abs(diasRestantes)} día
                          {Math.abs(diasRestantes) !== 1 ? "s" : ""}
                        </span>
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Nota explicativa para días > 28 */}
            {cuota.dia_pago_nota && (
              <div className="mt-3 p-2 bg-blue-100 rounded-md">
                <p className="text-xs text-blue-800">
                  <span className="font-medium">Nota:</span>{" "}
                  {cuota.dia_pago_nota}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="border-t pt-4">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Datos de la Cuenta
          </h3>

          <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
            <div>
              <p className="text-sm text-gray-600">Banco</p>
              <p className="font-medium text-gray-900">
                {cuota.banco || "No especificado"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Número de Cuenta</p>
              <p className="font-mono text-lg font-semibold text-gray-900">
                {cuota.numero_cuenta}
              </p>
            </div>

            {cuota.tipo_cuenta && (
              <div>
                <p className="text-sm text-gray-600">Tipo de Cuenta</p>
                <p className="font-medium text-gray-900">{cuota.tipo_cuenta}</p>
              </div>
            )}
          </div>
        </div>

        {cuota.metodos_pago_disponibles &&
          cuota.metodos_pago_disponibles.length > 0 && (
            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Métodos de Pago Disponibles
              </h3>
              <div className="flex flex-wrap gap-2">
                {cuota.metodos_pago_disponibles.map((metodo) => (
                  <span
                    key={metodo}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium capitalize"
                  >
                    {metodo}
                  </span>
                ))}
              </div>
            </div>
          )}

        {cuota.descripcion && (
          <div className="border-t pt-4">
            <p className="text-sm text-gray-600">Descripción</p>
            <p className="text-gray-900 mt-1">{cuota.descripcion}</p>
          </div>
        )}
      </div>
    </div>
  );
}
