// app/socio/admin/configuracion/page.tsx
"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useAdminTheme } from "../components/theme-provider"

const API_URL = process.env.NEXT_PUBLIC_API_WEB

export default function ConfiguracionPage() {
  const { theme, setTheme } = useAdminTheme()
  const modoOscuro = theme === "dark"
  const [isLoading, setIsLoading] = useState(false)

  const handleModoOscuroChange = () => {
    setTheme(modoOscuro ? "light" : "dark")
  }

  const handleRequestDeletion = async () => {
    if (!confirm("¿Estás seguro de que quieres solicitar la eliminación de tu cuenta? Esta acción no se puede deshacer.")) {
      return
    }

    setIsLoading(true)
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("authToken="))
        ?.split("=")[1]

      if (!token) {
        alert("No se encontró el token de autenticación")
        return
      }

      const response = await fetch(`${API_URL}/account/request-deletion`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reason: "Solicitud de eliminación desde el panel de configuración"
        })
      })

      if (response.ok) {
        alert("Solicitud de eliminación enviada correctamente. El administrador revisará tu solicitud.")
      } else {
        const error = await response.json()
        alert(error.message || "Error al enviar la solicitud")
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Error al enviar la solicitud")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-6 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Configuración</h1>
      <Card className="dark:bg-gray-900 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="dark:text-gray-100">Preferencias de Usuario</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <Label htmlFor="modo-oscuro" className="flex flex-col space-y-1">
              <span className="dark:text-gray-100">Modo Oscuro</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">Cambiar el tema de la aplicación</span>
            </Label>
            <Switch id="modo-oscuro" checked={modoOscuro} onCheckedChange={handleModoOscuroChange} />
          </div>
          <div>
            <Button 
              variant="destructive" 
              className="w-full" 
              onClick={handleRequestDeletion}
              disabled={isLoading}
            >
              {isLoading ? "Enviando solicitud..." : "Solicitar Eliminación de Cuenta"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}