import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SalesChart } from './components/Grafico'
import Link from 'next/link'

export default function SocioDashboard() {
  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Dashboard de Socio</h1>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: 'Ventas Totales', value: 'S/ 4,000', description: 'Último mes' },
          { title: 'Pedidos', value: '120', description: 'Último mes' },
          { title: 'Clientes Nuevos', value: '25', description: 'Último mes' },
          { title: 'Calificación', value: '4.8', description: 'Promedio' },
        ].map((item, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.value}</div>
              <p className="text-xs text-muted-foreground">{item.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Actions and Chart */}
      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Link href="/socio/admin/menu">
              <Button variant="outline" className="w-full">Gestionar Menú</Button>
            </Link>
            <Link href="/socio/admin/pedidos">
              <Button variant="outline" className="w-full">Ver Pedidos Pendientes</Button>
            </Link>
            <Link href="/socio/admin/configuracion">
              <Button variant="outline" className="w-full">Actualizar Horario</Button>
            </Link>
            <Button variant="outline" className="w-full">Contactar Soporte</Button>
          </CardContent>
        </Card>

        {/* Sales Chart */}
        <SalesChart />
      </div>
    </div>
  )
}

