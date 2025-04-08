import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, AlertCircle, CheckCircle, Clock } from "lucide-react"

interface ActivitySummaryProps {
  pendingApprovals: number
  recentActivity: number
  lastLogin?: string
}

export function ActivitySummary({ pendingApprovals, recentActivity, lastLogin }: ActivitySummaryProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "No disponible"

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
    <Card className="col-span-full lg:col-span-1 h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Activity className="h-5 w-5" />
          Resumen de Actividad
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium">Aprobaciones Pendientes</p>
              <p className="text-sm text-muted-foreground">
                {pendingApprovals} {pendingApprovals === 1 ? "registro requiere" : "registros requieren"} tu aprobación
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium">Actividad Reciente</p>
              <p className="text-sm text-muted-foreground">
                {recentActivity} {recentActivity === 1 ? "nuevo registro" : "nuevos registros"} en las últimas 24 horas
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium">Último Acceso</p>
              <p className="text-sm text-muted-foreground">{formatDate(lastLogin)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
