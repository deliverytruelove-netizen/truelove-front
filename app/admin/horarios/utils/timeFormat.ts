// app/admin/horarios/utils/timeFormat.ts

/**
 * Convierte hora de formato 24h a 12h con AM/PM
 * @param time24 - Hora en formato 24h (ej: "14:30")
 * @returns Hora en formato 12h (ej: "02:30 PM")
 */
export function format24to12(time24: string): string {
  if (!time24) return ""
  
  const [hours, minutes] = time24.split(":").map(Number)
  
  if (isNaN(hours) || isNaN(minutes)) return time24
  
  const period = hours >= 12 ? "PM" : "AM"
  const hours12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
  
  return `${hours12.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")} ${period}`
}

/**
 * Convierte hora de formato 12h con AM/PM a 24h
 * @param time12 - Hora en formato 12h (ej: "02:30 PM")
 * @returns Hora en formato 24h (ej: "14:30")
 */
export function format12to24(time12: string): string {
  if (!time12) return ""
  
  const match = time12.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (!match) return time12
  
  const [, hoursStr, minutesStr, period] = match
  let hours = parseInt(hoursStr, 10)
  const minutes = parseInt(minutesStr, 10)
  
  if (period.toUpperCase() === "PM" && hours !== 12) {
    hours += 12
  } else if (period.toUpperCase() === "AM" && hours === 12) {
    hours = 0
  }
  
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
}

/**
 * Genera array de horas en formato 12h con AM/PM
 * @param interval - Intervalo en minutos (default: 15)
 * @returns Array de horas en formato 12h
 */
export function generateTimeOptions12h(interval: number = 15): string[] {
  const times: string[] = []
  
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += interval) {
      const time24 = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
      times.push(format24to12(time24))
    }
  }
  
  return times
}

/**
 * Genera array de horas en formato 24h
 * @param interval - Intervalo en minutos (default: 15)
 * @returns Array de horas en formato 24h
 */
export function generateTimeOptions24h(interval: number = 15): string[] {
  const times: string[] = []
  
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += interval) {
      times.push(`${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`)
    }
  }
  
  return times
}
