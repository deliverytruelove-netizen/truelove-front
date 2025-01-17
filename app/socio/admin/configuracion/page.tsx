'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export default function ConfiguracionPage() {
  const [notificaciones, setNotificaciones] = useState(true)
  const [modoOscuro, setModoOscuro] = useState(false)

  const handleNotificacionesChange = () => {
    setNotificaciones(!notificaciones)
    // Aquí iría la lógica para actualizar las preferencias de notificaciones
  }

  const handleModoOscuroChange = () => {
    setModoOscuro(!modoOscuro)
    // Aquí iría la lógica para cambiar el tema de la aplicación
  }

  return (
    <div className="max-w-2xl mx-auto py-6 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Configuración</h1>
      <Card>
        <CardHeader>
          <CardTitle>Preferencias de Usuario</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <Label htmlFor="notificaciones" className="flex flex-col space-y-1">
              <span>Notificaciones</span>
              <span className="text-sm text-gray-500">Recibir notificaciones por email</span>
            </Label>
            <Switch
              id="notificaciones"
              checked={notificaciones}
              onCheckedChange={handleNotificacionesChange}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="modo-oscuro" className="flex flex-col space-y-1">
              <span>Modo Oscuro</span>
              <span className="text-sm text-gray-500">Cambiar el tema de la aplicación</span>
            </Label>
            <Switch
              id="modo-oscuro"
              checked={modoOscuro}
              onCheckedChange={handleModoOscuroChange}
            />
          </div>
          <div>
            <Button variant="outline" className="w-full">Cerrar Sesión en Todos los Dispositivos</Button>
          </div>
          <div>
            <Button variant="destructive" className="w-full">Eliminar Cuenta</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

