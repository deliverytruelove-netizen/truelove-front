import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Truck, Store } from "lucide-react"

interface RecentRegistrationsProps {
  registrations: {
    fecha: string
    tipo: "usuario" | "motorizado" | "socio"
    nombre: string
    estado: string
  }[]
}

export function RecentRegistrations({ registrations }: RecentRegistrationsProps) {
  const getIcon = (tipo: string) => {
    switch (tipo) {
      case "usuario":
        return <User className="h-4 w-4" />
      case "motorizado":
        return <Truck className="h-4 w-4" />
      case "socio":
        return <Store className="h-4 w-4" />
      default:
        return null
    }
  }

  const getStatusBadge = (estado: string) => {
    switch (estado.toLowerCase()) {
      case "activo":
      case "aprobado":
        return <Badge className="bg-green-500 hover:bg-green-600">Activo</Badge>
      case "pendiente":
        return <Badge className="bg-green-500 hover:bg-green-600">Activo</Badge>
      case "rechazado":
      case "inactivo":
        return <Badge className="bg-green-500 hover:bg-green-600">Activo</Badge>
      default:
        return <Badge>{estado}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "Fecha desconocida"

    try {
      const date = new Date(dateString)
      return new Intl.DateTimeFormat("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date)
    } catch {
      return "Fecha inválida"
    }
  }

  return (
    <Card className="col-span-full h-full">
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">Usuarios Registrados Recientemente</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {registrations.length > 0 ? (
            registrations.map((reg, i) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-2">
                <div className="flex items-center gap-3 mb-2 sm:mb-0">
                  <div className="rounded-full bg-muted p-2 shrink-0">{getIcon(reg.tipo)}</div>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{reg.nombre}</p>
                    <p className="text-xs text-muted-foreground capitalize">{reg.tipo}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-4 ml-11 sm:ml-0">
                  {getStatusBadge(reg.estado)}
                  <span className="text-xs sm:text-sm text-muted-foreground">{formatDate(reg.fecha)}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-muted-foreground">No hay registros recientes</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
