"use client"

import { Ban, Calendar, Coins, AlertTriangle, ArrowRight, Mail, LogOut } from "lucide-react"
import { Periodo } from "../types/pago-cuota.types"

interface PantallaBloqueoCuotaProps {
  periodosVencidos: Periodo[]
  mensaje?: string
  diasVencimiento?: number
  onIrAPagar?: () => void
  onCerrarSesion?: () => void
}

export default function PantallaBloqueoCuota({
  periodosVencidos,
  mensaje,
  diasVencimiento,
  onIrAPagar,
  onCerrarSesion,
}: PantallaBloqueoCuotaProps) {
  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
  }

  const totalAdeudado = periodosVencidos.reduce((sum, periodo) => sum + Number(periodo.monto_esperado), 0)

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-red-50 via-white to-orange-50 z-50 overflow-hidden">
      <div className="h-screen flex flex-col">
        {/* Header Section */}
        <header className="bg-gradient-to-r from-red-600 to-red-700 text-white py-6 sm:py-8 px-4 sm:px-6 lg:px-8 flex-shrink-0">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-white bg-opacity-20 backdrop-blur-sm p-3 sm:p-4 rounded-xl border-2 border-white border-opacity-40">
                  <Ban className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
                    Acceso Suspendido
                  </h1>
                  <p className="text-sm sm:text-base text-red-100 mt-1">
                    {mensaje || "Tu acceso ha sido bloqueado por pagos vencidos"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {diasVencimiento !== undefined && (
                  <div className="hidden sm:flex items-center px-4 py-2 bg-white bg-opacity-20 backdrop-blur-sm rounded-lg border border-white border-opacity-30">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    <span className="font-semibold text-sm">
                      {diasVencimiento === 0
                        ? "Vencido hoy"
                        : diasVencimiento === 1
                          ? "Vencido hace 1 día"
                          : `Vencido hace ${diasVencimiento} días`}
                    </span>
                  </div>
                )}
                {onCerrarSesion && (
                  <button
                    onClick={onCerrarSesion}
                    className="flex items-center gap-2 px-4 py-2 bg-white bg-opacity-20 backdrop-blur-sm rounded-lg border border-white border-opacity-30 hover:bg-opacity-30 transition-all text-sm font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Cerrar Sesión</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto scrollbar-custom px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Períodos Vencidos */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-red-50 to-orange-50 border-b border-red-200 px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-600 rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-lg sm:text-xl font-bold text-gray-900">Períodos Vencidos</h2>
                        <p className="text-xs sm:text-sm text-gray-600">Regulariza estos pagos para recuperar tu acceso</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 space-y-3">
                    {periodosVencidos.map((periodo) => (
                      <div
                        key={periodo.id}
                        className="bg-white border-l-4 border-red-600 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                <span className="text-red-700 font-bold text-sm">#{periodo.numero_periodo}</span>
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-gray-900 text-sm sm:text-base">Período {periodo.numero_periodo}</span>
                                <span className="px-2 py-0.5 bg-red-600 text-white text-xs font-medium rounded uppercase">
                                  Vencido
                                </span>
                              </div>
                              <div className="flex items-center gap-4 text-xs text-gray-600">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {formatFecha(periodo.fecha_vencimiento)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="text-xs text-gray-500">Monto</div>
                            <div className="text-xl font-bold text-red-600">S/ {Number(periodo.monto_esperado).toFixed(2)}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column - Total y Acciones */}
              <div className="space-y-4">
                {/* Total Adeudado */}
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-xl shadow-lg p-6 overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-5 rounded-full -mr-12 -mt-12"></div>

                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                      <Coins className="w-5 h-5 text-red-400" />
                      <p className="text-gray-300 text-xs font-medium uppercase tracking-wide">Total Adeudado</p>
                    </div>
                    <p className="text-3xl sm:text-4xl font-bold mb-1">S/ {totalAdeudado.toFixed(2)}</p>
                    <p className="text-gray-400 text-xs">{periodosVencidos.length} {periodosVencidos.length === 1 ? 'período vencido' : 'períodos vencidos'}</p>
                  </div>
                </div>

                {/* Instrucciones */}
                <div className="bg-white rounded-xl border border-blue-200 shadow-md p-5">
                  <h3 className="font-bold text-gray-900 mb-3 text-sm flex items-center gap-2">
                    <div className="p-1.5 bg-blue-100 rounded-lg">
                      <AlertTriangle className="w-4 h-4 text-blue-600" />
                    </div>
                    ¿Cómo recuperar mi acceso?
                  </h3>
                  <ol className="space-y-2.5">
                    {[
                      "Realiza el pago de los períodos vencidos",
                      "Sube tu comprobante de pago",
                      "Espera la aprobación del administrador",
                      "Tu acceso será restaurado automáticamente"
                    ].map((step, index) => (
                      <li key={index} className="flex items-start gap-2.5">
                        <span className="flex-shrink-0 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </span>
                        <span className="text-gray-700 text-xs leading-relaxed pt-0.5">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Botón de Acción */}
                {onIrAPagar ? (
                  <button
                    onClick={onIrAPagar}
                    className="w-full py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold text-sm sm:text-base rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Ir a Pagar Ahora
                    <ArrowRight className="w-5 h-5" />
                  </button>
                ) : (
                  <div className="bg-white rounded-xl shadow-md border border-gray-200 p-5 text-center">
                    <Mail className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-3 text-xs">Para más información, contacta con el administrador</p>
                    <a
                      href="mailto:soporte@truelove.com"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium text-sm rounded-lg transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      Contactar Soporte
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 py-4 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-sm text-gray-600">
              Si ya realizaste el pago, por favor espera la aprobación del administrador
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}
