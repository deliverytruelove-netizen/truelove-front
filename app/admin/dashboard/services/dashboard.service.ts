// app/admin/dashboard/services/dashboard.service.ts
import { fetchUsers } from "../../usuarios/services/User.service"
import { fetchMotorizados } from "../../motorizado/services/motorizado.service"
import { fetchSocios } from "../../socios/services/Socios.service"
import { fetchRankings } from "./rankings.service"
import type { User } from "../../usuarios/types/User.types"
import type { Motorizado } from "../../motorizado/types/motorizado.types"
import type { Socio } from "../../socios/types/Socios.types"
import type { TopClient, TopStore } from "./rankings.service"
import { fetchLocalRatings } from "./ratings.service"
// Tipo para las estadísticas del dashboard
export type DashboardStats = {
  usuarios: {
    total: number
    administradores: number
    empresas: number
    motorizados: number
    activos: number
    inactivos: number
  }
  motorizados: {
    total: number
    pendientes: number
    aprobados: number
    rechazados: number
  }
  socios: {
    total: number
    pendientes: number
    aprobados: number
    rechazados: number
    porTipoNegocio: Record<string, number>
  }
  registrosRecientes: {
    fecha: string
    tipo: "usuario" | "motorizado" | "socio"
    nombre: string
    estado: string
  }[]
  // Nuevos campos para rankings
  topClients: TopClient[]
  topStores: TopStore[]
}

/**
 * Función para obtener todas las estadísticas del dashboard
 * @returns Estadísticas completas del dashboard
 */
export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  try {
    // Obtener todos los datos en paralelo
    const [usuarios, motorizados, socios, rankings] = await Promise.all([
      fetchUsers(), 
      fetchMotorizados(), 
      fetchSocios(),
      fetchRankings()
    ])

    // Procesar datos de usuarios
    const usuariosStats = {
      total: usuarios.length,
      administradores: usuarios.filter((u: User) => u.role_id === 1).length,
      empresas: usuarios.filter((u: User) => u.role_id === 2).length,
      motorizados: usuarios.filter((u: User) => u.role_id === 3).length,
      activos: usuarios.filter((u: User) => u.estado === 1).length,
      inactivos: usuarios.filter((u: User) => u.estado === 0).length,
    }

    // Procesar datos de motorizados
    const motorizadosStats = {
      total: motorizados.length,
      pendientes: motorizados.filter((m: Motorizado) => !m.aprobado).length,
      aprobados: motorizados.filter((m: Motorizado) => m.aprobado).length,
      rechazados: 0, // No hay campo de rechazado en el tipo, asumimos 0
    }

    // Procesar datos de socios comerciales
    const tiposNegocio: Record<string, number> = {}
    socios.forEach((socio: Socio) => {
      const tipo = socio.businessType || "Otro"
      tiposNegocio[tipo] = (tiposNegocio[tipo] || 0) + 1
    })

   
    interface SocioWithApproval extends Socio {
      aprobado?: boolean
    }

    const sociosConAprobacion = socios as SocioWithApproval[]

    const sociosStats = {
      total: socios.length,
      pendientes: sociosConAprobacion.filter((s) => s.aprobado === false).length,
      aprobados: sociosConAprobacion.filter((s) => s.aprobado === true).length,
      rechazados: 0, // No hay campo de rechazado en el tipo, asumimos 0
      porTipoNegocio: tiposNegocio,
    }

    // Obtener registros recientes (últimos 10)
    const registrosUsuarios = usuarios.map((u: User) => ({
      fecha: u.created_at || "",
      tipo: "usuario" as const,
      nombre: u.name || "",
      estado: u.estado === 1 ? "Activo" : "Inactivo",
    }))

    const registrosMotorizados = motorizados.map((m: Motorizado) => ({
      fecha: m.created_at || "",
      tipo: "motorizado" as const,
      nombre: `${m.nombres || ""} ${m.apellidos || ""}`,
      estado: m.aprobado ? "Aprobado" : "Pendiente",
    }))

    const registrosSocios = socios.map((s: Socio) => ({
      fecha: s.created_at || "",
      tipo: "socio" as const,
      nombre: `${s.name || ""} ${s.lastName || ""}`,
      estado: "Pendiente", // Asumimos pendiente por defecto
    }))

    // Combinamos todos los registros
    const todosRegistros = [...registrosUsuarios, ...registrosMotorizados, ...registrosSocios]
      .filter((reg) => Boolean(reg.fecha)) // Filtrar registros sin fecha
      .sort((a, b) => {
        try {
          return new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
        } catch {
          return 0
        }
      })
      .slice(0, 10)

    // Retornar todos los datos combinados
    return {
      usuarios: usuariosStats,
      motorizados: motorizadosStats,
      socios: sociosStats,
      registrosRecientes: todosRegistros,
      // Añadir los datos de rankings
      topClients: rankings.topClients,
      topStores: rankings.topStores,
    }
  } catch (error) {
    console.error("Error al obtener estadísticas del dashboard:", error)
    throw error
  }
}

export const fetchLocalRatingData = async (localId: number) => {
  try {
    return await fetchLocalRatings(localId)
  } catch (error) {
    console.error("Error al obtener datos de calificaciones:", error)
    throw error
  }
}