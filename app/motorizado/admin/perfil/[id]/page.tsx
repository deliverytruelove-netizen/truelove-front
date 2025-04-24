"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, User, Phone, Mail, MapPin, Calendar, Truck, FileCheck, Shield } from 'lucide-react'
import Link from "next/link"
import Image from "next/image"
import { MotorizadoProvider } from "../../context/MotorizadoContext"
import Sidebar from "../../components/sidebar"
import Header from "../../components/header"
import { obtenerDatosRepartidor } from "../../services/auth"
import type { PerfilData } from "../../types"

const BASE_URL = process.env.NEXT_PUBLIC_API_WEB?.replace("/api", "") || "http://localhost:8000"

function formatDate(dateString: string) {
  if (!dateString) return ""
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date)
}

function PerfilContent() {
  const params = useParams()
  const userId = params.id as string
  const [perfilData, setPerfilData] = useState<PerfilData | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
//   const { usuario } = useMotorizado()

  useEffect(() => {
    const cargarDatosPerfil = async () => {
      try {
        setLoading(true)
        const datos = await obtenerDatosRepartidor()
        setPerfilData(datos)
      } catch (error) {
        console.error("Error al cargar datos del perfil:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos del perfil",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    cargarDatosPerfil()
  }, [toast, userId])

  const getImageUrl = (path: string | null) => {
    if (!path) return null
    if (path.startsWith("http")) return path

    // Remover /api/ si existe en la ruta
    const cleanPath = path.replace("/api/", "")
    return `${BASE_URL}/${cleanPath}`
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="mt-1 h-4 w-32" />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!perfilData) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <User className="mb-2 h-10 w-10 text-muted-foreground" />
        <p className="mb-4 text-center text-muted-foreground">No se encontraron datos del perfil</p>
        <Button asChild>
          <Link href="/motorizado/admin">Volver al panel</Link>
        </Button>
      </div>
    )
  }

  const { usuario: user, repartidor } = perfilData

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/motorizado/admin">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Perfil de Motorizado</h1>
      </div>

      <div className="flex flex-col items-center justify-center rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800 md:flex-row md:items-start md:justify-start">
        <div className="mb-4 flex flex-col items-center md:mb-0 md:mr-6">
          {repartidor?.documento_imagen_frente ? (
            <div className="relative h-32 w-32 overflow-hidden rounded-full">
              <Image
                src={getImageUrl(repartidor.documento_imagen_frente) || "/placeholder.svg?height=128&width=128&query=user"}
                alt={`${user?.name || "Usuario"}`}
                width={128}
                height={128}
                className="h-full w-full rounded-full object-cover"
                unoptimized
              />
            </div>
          ) : (
            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-primary/10 text-4xl font-bold text-primary">
              {user?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
            </div>
          )}

          <Badge className="mt-2" variant="outline">
            Motorizado
          </Badge>
        </div>

        <div className="flex-1 text-center md:text-left">
          <h2 className="text-2xl font-bold">{user?.name || "Usuario"}</h2>
          <p className="text-muted-foreground">{user?.email}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Truck className="h-3 w-3" />
              {repartidor?.vehiculo || "No especificado"}
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {repartidor?.departamento || "No especificado"}
            </Badge>
            {repartidor?.aprobado && (
              <Badge variant="success" className="flex items-center gap-1 bg-green-100 text-green-800">
                <Shield className="h-3 w-3" />
                Verificado
              </Badge>
            )}
          </div>
        </div>
      </div>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="personal">Datos Personales</TabsTrigger>
          <TabsTrigger value="documentos">Documentos</TabsTrigger>
          <TabsTrigger value="cuenta">Cuenta</TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Información Personal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-2">
                  <User className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Nombre Completo</p>
                    <p className="text-sm text-muted-foreground">
                      {repartidor?.nombres} {repartidor?.apellidos}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Phone className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Teléfono</p>
                    <p className="text-sm text-muted-foreground">{repartidor?.celular || "No especificado"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Mail className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Correo Electrónico</p>
                    <p className="text-sm text-muted-foreground">{repartidor?.email || user?.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Departamento</p>
                    <p className="text-sm text-muted-foreground">{repartidor?.departamento || "No especificado"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Información de Identificación</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-2">
                  <FileCheck className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Tipo de Documento</p>
                    <p className="text-sm text-muted-foreground">{repartidor?.tipo_documento || "No especificado"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <FileCheck className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Número de Documento</p>
                    <p className="text-sm text-muted-foreground">{repartidor?.nro_documento || "No especificado"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Truck className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Tipo de Vehículo</p>
                    <p className="text-sm text-muted-foreground">{repartidor?.vehiculo || "No especificado"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="documentos">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Documento - Frente</CardTitle>
              </CardHeader>
              <CardContent>
                {repartidor?.documento_imagen_frente ? (
                  <div className="overflow-hidden rounded-md">
                    <Image
                      src={
                        getImageUrl(repartidor.documento_imagen_frente) ||
                        "/placeholder.svg?height=300&width=500&query=document"
                       || "/placeholder.svg"}
                      alt="Documento frente"
                      width={500}
                      height={300}
                      className="h-auto w-full object-cover"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="flex h-40 items-center justify-center rounded-md border border-dashed">
                    <p className="text-muted-foreground">No hay imagen disponible</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Documento - Reverso</CardTitle>
              </CardHeader>
              <CardContent>
                {repartidor?.documento_imagen_reverso ? (
                  <div className="overflow-hidden rounded-md">
                    <Image
                      src={
                        getImageUrl(repartidor.documento_imagen_reverso) ||
                        "/placeholder.svg?height=300&width=500&query=document"
                       || "/placeholder.svg"}
                      alt="Documento reverso"
                      width={500}
                      height={300}
                      className="h-auto w-full object-cover"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="flex h-40 items-center justify-center rounded-md border border-dashed">
                    <p className="text-muted-foreground">No hay imagen disponible</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cuenta">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Información de la Cuenta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-2">
                  <User className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Nombre de Usuario</p>
                    <p className="text-sm text-muted-foreground">{user?.usuario || "No especificado"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Shield className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Estado de la Cuenta</p>
                    <Badge variant={user?.estado ? "success" : "destructive"} className="mt-1">
                      {user?.estado ? "Activo" : "Inactivo"}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Shield className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Estado de Aprobación</p>
                    <Badge variant={repartidor?.aprobado ? "success" : "destructive"} className="mt-1">
                      {repartidor?.aprobado ? "Aprobado" : "Pendiente"}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Calendar className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Fecha de Registro</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(repartidor?.created_at || user?.created_at || "")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Calendar className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Última Actualización</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(repartidor?.updated_at || user?.updated_at || "")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Acciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full" asChild>
                  <Link href="/motorizado/admin/configuracion">Editar Perfil</Link>
                </Button>
                <Button variant="outline" className="w-full">
                  Cambiar Contraseña
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default function PerfilPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <MotorizadoProvider>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out dark:bg-gray-800 lg:translate-x-0 lg:static lg:inset-0`}
        >
          <Sidebar />
        </aside>

        {/* Main content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Top bar */}
          <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

          {/* Main content */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6 dark:bg-gray-900">
            <div className="mx-auto max-w-7xl">
              <PerfilContent />
            </div>
          </main>
        </div>
      </div>
    </MotorizadoProvider>
  )
}
