import { fetchUsers } from "../../usuarios/services/User.service"
import { fetchMotorizados } from "../../motorizado/services/motorizado.service"
import { fetchSocios } from "../../socios/services/Socios.service"
import type { User } from "../../usuarios/types/User.types"
import type { Motorizado } from "../../motorizado/types/motorizado.types"
import type { Socio } from "../../socios/types/Socios.types"

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
}

export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  try {
    // Fetch all data in parallel
    const [usuarios, motorizados, socios] = await Promise.all([fetchUsers(), fetchMotorizados(), fetchSocios()])

    // Process users data
    const usuariosStats = {
      total: usuarios.length,
      administradores: usuarios.filter((u: User) => u.role_id === 1).length,
      empresas: usuarios.filter((u: User) => u.role_id === 2).length,
      motorizados: usuarios.filter((u: User) => u.role_id === 3).length,
      activos: usuarios.filter((u: User) => u.estado === 1).length,
      inactivos: usuarios.filter((u: User) => u.estado === 0).length,
    }

    // Process motorized data
    const motorizadosStats = {
      total: motorizados.length,
      pendientes: motorizados.filter((m: Motorizado) => !m.aprobado).length,
      aprobados: motorizados.filter((m: Motorizado) => m.aprobado).length,
      rechazados: 0, // No hay campo de rechazado en el tipo, asumimos 0
    }

    // Process business partners data
    const tiposNegocio: Record<string, number> = {}
    socios.forEach((socio: Socio) => {
      const tipo = socio.businessType || "Otro"
      tiposNegocio[tipo] = (tiposNegocio[tipo] || 0) + 1
    })

    // Usamos tipos explícitos para evitar el uso de 'any'
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

    // Get recent registrations (last 10)
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

    return {
      usuarios: usuariosStats,
      motorizados: motorizadosStats,
      socios: sociosStats,
      registrosRecientes: todosRegistros,
    }
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    throw error
  }
}
