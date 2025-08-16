// app\socio\admin\perfil\page.tsx
"use client"

import { useState, useEffect } from "react"
import { MapPin, Phone, Mail, Calendar, Building2, Camera, Upload } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import AddressEditor from "../components/AddressEditor"
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

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [profileKey, setProfileKey] = useState(Date.now())
  // const [currentView, setCurrentView] = useState<'profile' | 'address'>('profile')

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

        // Usar las mismas llamadas API que tenías originalmente
        const userDataResponse = await fetch(`${process.env.NEXT_PUBLIC_API_WEB}/negocio/datos`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const logoResponse = await fetch(`${process.env.NEXT_PUBLIC_API_WEB}/negocio/logo`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!userDataResponse.ok) {
          throw new Error("Error al obtener datos del usuario")
        }

        const userData = await userDataResponse.json()
        const logoData = logoResponse.ok ? await logoResponse.json() : { foto_perfil: null, ruta_logo: null }

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

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_WEB}/negocio/foto-perfil`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (response.ok) {
        const result = await response.json()
        const updatedUser = {
          ...user,
          foto_perfil: result.foto_perfil,
        }
        setUser(updatedUser)
        setProfileKey(Date.now())
        localStorage.setItem("userProfile", JSON.stringify(updatedUser))
        localStorage.setItem("lastProfileUpdate", new Date().getTime().toString())

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

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_WEB}/negocio/logo`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (response.ok) {
        const result = await response.json()
        const updatedUser = {
          ...user,
          logo: result.ruta_logo,
        }
        setUser(updatedUser)
        localStorage.setItem("userProfile", JSON.stringify(updatedUser))
        localStorage.setItem("lastProfileUpdate", new Date().getTime().toString())

        setTimeout(() => {
          window.location.reload()
        }, 500)
      }
    } catch (error) {
      console.error("Error al subir el logo:", error)
      setError("Error al subir el logo")
    }
  }

  // const handleAddressUpdate = (newAddress: string) => {
  //   if (user) {
  //     const updatedUser = {
  //       ...user,
  //       direccion: newAddress,
  //     }
  //     setUser(updatedUser)
  //     localStorage.setItem("userProfile", JSON.stringify(updatedUser))
  //     localStorage.setItem("lastProfileUpdate", new Date().getTime().toString())
  //   }
  // }

  const getImageUrl = (path: string | null) => {
    if (!path) return null
    if (path.startsWith("http")) return path

    const API_URL = process.env.NEXT_PUBLIC_API_WEB
    const BASE_URL = API_URL?.replace("/api", "")
    const cleanPath = path.replace("/api/", "")
    return `${BASE_URL}/${cleanPath}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-4">
          <p className="text-red-600 font-medium mb-2">{error || "No se pudo cargar la información del usuario."}</p>
          <Button onClick={() => window.location.reload()} className="bg-red-600 hover:bg-red-700">
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

  // Show Address Editor View
  // if (currentView === 'address') {
  //   return (
  //     <AddressEditor
  //       currentAddress={user.direccion}
  //       onAddressUpdate={handleAddressUpdate}
  //       onBack={() => setCurrentView('profile')}
  //     />
  //   )
  // }

  // Show Profile View
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative">
        {/* Banner */}
        <div className="h-32 sm:h-48 bg-gradient-to-r from-red-600 to-red-400" />

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative -mt-16 sm:-mt-24 mb-6">
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              <div className="relative group">
                <Avatar className="h-24 w-24 sm:h-32 sm:w-32 ring-4 ring-white shadow-lg">
                  {user.foto_perfil ? (
                    <div key={profileKey} className="h-full w-full">
                      <AvatarImage src={getImageUrl(user.foto_perfil) || "/placeholder.svg"} alt={user.nombre} />
                    </div>
                  ) : (
                    <AvatarFallback className="text-2xl sm:text-4xl bg-red-100 text-red-600">
                      {user.nombre.charAt(0)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute bottom-0 right-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  onClick={() => document.getElementById("photo-upload")?.click()}
                >
                  <Camera className="h-4 w-4" />
                </Button>
                <input id="photo-upload" type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{user.nombre}</h1>
                <p className="text-gray-600 text-sm sm:text-base">Información del perfil</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
            {/* Business Information */}
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle className="text-red-600 text-lg sm:text-xl">Información del Negocio</CardTitle>
              
              </CardHeader>
              <CardContent className="space-y-4 flex-1">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Nombre del Negocio</p>
                    <p className="text-gray-900 text-sm sm:text-base">{user.nombre_negocio}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Dirección</p>
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-gray-900 flex items-start gap-2 flex-1 text-sm sm:text-base">
                        <MapPin className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                        <span className="break-words">{user.direccion}</span>
                      </p>
                      {/* <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setCurrentView('address')}
                        className="ml-2 hover:bg-red-50 hover:text-red-600 flex-shrink-0"
                        title="Editar dirección"
                      >
                        <Edit className="h-4 w-4" />
                      </Button> */}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Sucursales</p>
                    <p className="text-gray-900 flex items-center gap-2 text-sm sm:text-base">
                      <Building2 className="h-4 w-4 text-red-500" />
                      {user.sucursales}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Personal Information */}
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle className="text-red-600 text-lg sm:text-xl">Información Personal</CardTitle>
               
              </CardHeader>
              <CardContent className="space-y-4 flex-1">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Nombre Completo</p>
                    <p className="text-gray-900 text-sm sm:text-base">{user.nombre}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Email</p>
                    <p className="text-gray-900 flex items-center gap-2 text-sm sm:text-base break-all">
                      <Mail className="h-4 w-4 text-red-500 flex-shrink-0" />
                      {user.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Teléfono</p>
                    <p className="text-gray-900 flex items-center gap-2 text-sm sm:text-base">
                      <Phone className="h-4 w-4 text-red-500" />
                      {user.telefono}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Fecha de Registro</p>
                    <p className="text-gray-900 flex items-center gap-2 text-sm sm:text-base">
                      <Calendar className="h-4 w-4 text-red-500" />
                      {user.fecha_registro}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Logo Section */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-red-600 text-lg sm:text-xl">Logo del Negocio</CardTitle>
                <CardDescription>Logo de tu empresa</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0">
                    {user.logo ? (
                      <Image
                        src={getImageUrl(user.logo) || "/placeholder.svg"}
                        alt="Logo del negocio"
                        className="w-full h-full object-contain rounded-lg border"
                        width={128}
                        height={128}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg border">
                        <Building2 className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <Button
                    onClick={() => document.getElementById("logo-upload")?.click()}
                    className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
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