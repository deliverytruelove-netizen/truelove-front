// Utilidades para cálculo de fechas de pago

/**
 * Parsea una fecha string del backend de forma segura
 * Maneja: "2026-02-26", "2026-02-26T00:00:00.000000Z", null, undefined
 */
export function parseFechaSafe(dateStr: string | null | undefined): Date | null {
  if (!dateStr) return null
  const date = new Date(dateStr.includes("T") ? dateStr : dateStr + "T00:00:00")
  return isNaN(date.getTime()) ? null : date
}

/**
 * Formatea una fecha string del backend de forma segura
 * Retorna "—" si la fecha es inválida o null
 */
export function formatearFechaSafe(
  dateStr: string | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string {
  const date = parseFechaSafe(dateStr)
  if (!date) return "—"
  return date.toLocaleDateString("es-PE", options || { day: "2-digit", month: "short", year: "numeric" })
}

/**
 * Calcula días entre hoy y una fecha string del backend
 * Retorna null si la fecha es inválida
 */
export function calcularDiasHastaFecha(dateStr: string | null | undefined): number | null {
  const date = parseFechaSafe(dateStr)
  if (!date) return null
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  date.setHours(0, 0, 0, 0)
  return Math.ceil((date.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
}

/**
 * Calcula los días restantes hasta el próximo día de pago
 * @param diaPago - Día del mes (1-31) o día de semana (1=Lun...7=Dom) para semanal
 * @param periodicidad - Tipo de periodicidad (opcional, default "mensual")
 * @returns Número de días restantes (negativo si ya pasó)
 */
export function calcularDiasHastaPago(diaPago: number, periodicidad?: string): number {
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)

  if (periodicidad === "semanal") {
    // diaPago: 1=Lunes...7=Domingo → JS: 0=Domingo...6=Sábado
    const jsDay = diaPago === 7 ? 0 : diaPago // Convertir a formato JS
    const hoyDay = hoy.getDay()
    let diff = jsDay - hoyDay
    if (diff < 0) diff += 7
    return diff // 0 = hoy es el día de pago
  }

  // Mensual / quincenal / diario
  let proximoPago = new Date(hoy.getFullYear(), hoy.getMonth(), Math.min(diaPago, getDiasEnMes(hoy.getFullYear(), hoy.getMonth())))
  proximoPago.setHours(0, 0, 0, 0)

  if (proximoPago < hoy) {
    proximoPago = new Date(hoy.getFullYear(), hoy.getMonth() + 1, Math.min(diaPago, getDiasEnMes(hoy.getFullYear(), hoy.getMonth() + 1)))
    proximoPago.setHours(0, 0, 0, 0)
  }

  const diferenciaMilisegundos = proximoPago.getTime() - hoy.getTime()
  return Math.floor(diferenciaMilisegundos / (1000 * 60 * 60 * 24))
}

/**
 * Obtiene la próxima fecha de pago
 * @param diaPago - Día del mes (1-31) o día de semana (1=Lun...7=Dom) para semanal
 * @param periodicidad - Tipo de periodicidad (opcional, default "mensual")
 * @returns Fecha del próximo pago
 */
export function getProximaFechaPago(diaPago: number, periodicidad?: string): Date {
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)

  if (periodicidad === "semanal") {
    const jsDay = diaPago === 7 ? 0 : diaPago
    const hoyDay = hoy.getDay()
    let diff = jsDay - hoyDay
    if (diff < 0) diff += 7
    const proximoPago = new Date(hoy)
    proximoPago.setDate(proximoPago.getDate() + diff)
    return proximoPago
  }

  let proximoPago = new Date(hoy.getFullYear(), hoy.getMonth(), Math.min(diaPago, getDiasEnMes(hoy.getFullYear(), hoy.getMonth())))
  proximoPago.setHours(0, 0, 0, 0)

  if (proximoPago < hoy) {
    proximoPago = new Date(hoy.getFullYear(), hoy.getMonth() + 1, Math.min(diaPago, getDiasEnMes(hoy.getFullYear(), hoy.getMonth() + 1)))
    proximoPago.setHours(0, 0, 0, 0)
  }

  return proximoPago
}

/**
 * Obtiene la cantidad de días en un mes específico
 * @param año - Año
 * @param mes - Mes (0-11, donde 0 es enero)
 * @returns Número de días en el mes
 */
export function getDiasEnMes(año: number, mes: number): number {
  return new Date(año, mes + 1, 0).getDate()
}

/**
 * Verifica si un día de pago necesita nota explicativa (días > 28)
 * @param diaPago - Día del mes para el pago (1-31)
 * @returns true si necesita nota explicativa
 */
export function necesitaNotaExplicativa(diaPago: number): boolean {
  return diaPago > 28
}

/**
 * Genera la nota explicativa automática para días > 28
 * @param diaPago - Día del mes para el pago (1-31)
 * @returns Nota explicativa o null si no es necesaria
 */
export function getNotaExplicativaAutomatica(diaPago: number): string | null {
  if (!necesitaNotaExplicativa(diaPago)) {
    return null
  }
  
  return `En meses con menos de ${diaPago} días, el pago se realizará el último día del mes.`
}

/**
 * Formatea una fecha para mostrar en la interfaz
 * @param fecha - Fecha a formatear
 * @returns Fecha formateada como string
 */
export function formatearFecha(fecha: Date): string {
  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(fecha)
}

/**
 * Formatea una fecha para mostrar solo día y mes
 * @param fecha - Fecha a formatear
 * @returns Fecha formateada como "DD de MMM"
 */
export function formatearFechaCorta(fecha: Date): string {
  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "short",
  }).format(fecha)
}

/**
 * Calcula si hoy es el día de pago
 * @param diaPago - Día del mes para el pago (1-31)
 * @returns true si hoy es el día de pago
 */
export function esHoyDiaDePago(diaPago: number): boolean {
  const hoy = new Date()
  const diaHoy = hoy.getDate()
  const diasEnMesActual = getDiasEnMes(hoy.getFullYear(), hoy.getMonth())
  
  // Si el día de pago es mayor a los días del mes actual, usar el último día
  const diaEfectivo = Math.min(diaPago, diasEnMesActual)
  
  return diaHoy === diaEfectivo
}

/**
 * Obtiene el día efectivo de pago para el mes actual
 * (ajusta automáticamente para meses con menos días)
 * @param diaPago - Día del mes para el pago (1-31)
 * @returns Día efectivo de pago en el mes actual
 */
export function getDiaEfectivoPago(diaPago: number): number {
  const hoy = new Date()
  const diasEnMesActual = getDiasEnMes(hoy.getFullYear(), hoy.getMonth())
  
  return Math.min(diaPago, diasEnMesActual)
}