"use client"

import { useState, useEffect } from "react"
import { MapPin, Phone, Mail, Calendar, Building2, Camera, Upload } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import axios from "axios"
import Image from "next/image"

interface UserProfile {
  nombre: string
  email: string
  telefono: string
  fecha_registro: string
  nombre_negocio: string
  direccion: string
  sucursales: number
  foto_perfil: string | null
  logo: string | null
}

const API_URL = process.env.NEXT_PUBLIC_API_WEB
const BASE_URL = API_URL?.replace("/api", "") // Remover /api para rutas de archivos

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [profileKey, setProfileKey] = useState(Date.now())

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = document.cookie
          .split("; ")
          .find((row) => row.startsWith("authToken="))
          ?.split("=")[1]

        if (!token) {
          throw new Error("No se encontró el token de autenticación")
        }

        const [userDataResponse, logoResponse] = await Promise.all([
          axios.get<UserProfile>(`${API_URL}/negocio/datos`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          axios.get(`${API_URL}/negocio/logo`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ])

        const userData = userDataResponse.data
        const logoData = logoResponse.data

        const updatedUser = {
          ...userData,
          foto_perfil: logoData.foto_perfil,
          logo: logoData.ruta_logo,
        }

        setUser(updatedUser)
        localStorage.setItem("userProfile", JSON.stringify(updatedUser))
        localStorage.setItem("lastProfileUpdate", new Date().getTime().toString())
      } catch (error) {
        console.error("Error al obtener los datos del usuario:", error)
        setError("No se pudo cargar la información del usuario.")
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) return

    const formData = new FormData()
    formData.append("foto", file)

    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("authToken="))
        ?.split("=")[1]

      if (!token) {
        throw new Error("No se encontró el token de autenticación")
      }

      const response = await axios.post<{ success: boolean; foto_perfil: string }>(
        `${API_URL}/negocio/foto-perfil`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (response.data.success) {
        const updatedUser = {
          ...user,
          foto_perfil: response.data.foto_perfil,
        }
        setUser(updatedUser)
        setProfileKey(Date.now())
        localStorage.setItem("userProfile", JSON.stringify(updatedUser))
        localStorage.setItem("lastProfileUpdate", new Date().getTime().toString())

        // Forzar recarga de datos después de la actualización
        setTimeout(() => {
          window.location.reload()
        }, 500)
      }
    } catch (error) {
      console.error("Error al subir la foto:", error)
      setError("Error al subir la foto de perfil")
    }
  }

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) return

    const formData = new FormData()
    formData.append("logo", file)

    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("authToken="))
        ?.split("=")[1]

      if (!token) {
        throw new Error("No se encontró el token de autenticación")
      }

      const response = await axios.post<{ success: boolean; ruta_logo: string }>(`${API_URL}/negocio/logo`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.data.success) {
        const updatedUser = {
          ...user,
          logo: response.data.ruta_logo,
        }
        setUser(updatedUser)
        localStorage.setItem("userProfile", JSON.stringify(updatedUser))
        localStorage.setItem("lastProfileUpdate", new Date().getTime().toString())

        // Forzar recarga de datos después de la actualización
        setTimeout(() => {
          window.location.reload()
        }, 500)
      }
    } catch (error) {
      console.error("Error al subir el logo:", error)
      setError("Error al subir el logo")
    }
  }

  const getImageUrl = (path: string | null) => {
    if (!path) return null
    if (path.startsWith("http")) return path

    // Remover /api/ si existe en la ruta
    const cleanPath = path.replace("/api/", "")
    return `${BASE_URL}/${cleanPath}`
  }

  if (loading) {
    return <div>Cargando...</div>
  }

  if (error || !user) {
    return <div>{error || "No se pudo cargar la información del usuario."}</div>
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="relative">
        {/* Banner */}
        <div className="h-48 bg-gradient-to-r from-red-600 to-red-400" />

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative -mt-24 sm:-mt-32 mb-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative group">
                <Avatar className="h-32 w-32 ring-4 ring-background">
                  {user.foto_perfil ? (
                    <div key={profileKey} className="h-full w-full">
                      <AvatarImage src={getImageUrl(user.foto_perfil) || "/placeholder.svg"} alt={user.nombre} />
                    </div>
                  ) : (
                    <AvatarFallback className="text-4xl bg-red-100 text-red-600">
                      {user.nombre.charAt(0)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute bottom-0 right-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => document.getElementById("photo-upload")?.click()}
                >
                  <Camera className="h-4 w-4" />
                </Button>
                <input id="photo-upload" type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-2xl font-bold text-foreground">{user.nombre}</h1>
                <p className="text-white">Información del perfil</p>
              </div>
            </div>
          </div>

          <div className="space-y-6 pb-8">
            {/* Business Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Información del Negocio</CardTitle>
                <CardDescription>Detalles principales de la empresa</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Nombre del Negocio</p>
                    <p className="text-foreground">{user.nombre_negocio}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Dirección</p>
                    <p className="text-foreground flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-red-500" />
                      {user.direccion}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Sucursales</p>
                  <p className="text-foreground flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-red-500" />
                    {user.sucursales}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Información Personal</CardTitle>
                <CardDescription>Datos de contacto y registro</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Nombre Completo</p>
                    <p className="text-foreground">{user.nombre}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Email</p>
                    <p className="text-foreground flex items-center gap-2">
                      <Mail className="h-4 w-4 text-red-500" />
                      {user.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Teléfono</p>
                    <p className="text-foreground flex items-center gap-2">
                      <Phone className="h-4 w-4 text-red-500" />
                      {user.telefono}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Fecha de Registro</p>
                    <p className="text-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-red-500" />
                      {user.fecha_registro}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Logo Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Logo del Negocio</CardTitle>
                <CardDescription>Logo de tu empresa</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="relative w-32 h-32">
                    {user.logo ? (
                      <Image
                        src={getImageUrl(user.logo) || "/placeholder.svg"}
                        alt="Logo del negocio"
                        fill
                        style={{ objectFit: "contain" }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted rounded-lg">
                        <Building2 className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <Button
                    onClick={() => document.getElementById("logo-upload")?.click()}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Actualizar Logo
                  </Button>
                  <input id="logo-upload" type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

