"use client"

import { useState, useEffect, useCallback } from "react"
import { User, Settings, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import Link from "next/link"

const API_URL = process.env.NEXT_PUBLIC_API_WEB
const BASE_URL = API_URL?.replace("/api", "") // Remover /api para rutas de archivos

const AvatarSettings = () => {
  const [userInitials, setUserInitials] = useState<string>("")
  const [fullName, setFullName] = useState<string>("")
  const [email, setEmail] = useState<string>("")
  const [avatarUrl, setAvatarUrl] = useState<string>("")
  const [imageError, setImageError] = useState(false)
  const router = useRouter()

  const getImageUrl = (path: string | null) => {
    if (!path) return null
    if (path.startsWith("http")) return path

    // Remover /api/ si existe en la ruta
    const cleanPath = path.replace("/api/", "")
    return `${BASE_URL}/${cleanPath}`
  }

  const obtenerDatosUsuario = useCallback(async () => {
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("authToken="))
        ?.split("=")[1]

      if (!token) {
        throw new Error("No se encontró el token de autenticación")
      }

      const response = await fetch(`${API_URL}/motorizado/datos`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Error al obtener datos del usuario")
      }

      const datos = await response.json()

      const firstName = datos.nombre?.split(" ")[0] || ""
      const lastName = datos.nombre?.split(" ")[1] || ""
      const fullName = `${firstName} ${lastName}`.trim()

      setFullName(fullName || datos.email)
      setEmail(datos.email)
      setUserInitials(
        `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || datos.email.charAt(0).toUpperCase(),
      )

      if (datos.foto_perfil) {
        setAvatarUrl(datos.foto_perfil)
        setImageError(false)
      }
    } catch (error) {
      console.error("Error al obtener datos del usuario:", error)
      setImageError(true)
    }
  }, [])

  useEffect(() => {
    obtenerDatosUsuario()
  }, [obtenerDatosUsuario])

  const handleImageError = () => {
    setImageError(true)
  }

  const handleLogout = () => {
    localStorage.removeItem("authToken")
    localStorage.removeItem("user")
    localStorage.removeItem("userRole")
    localStorage.removeItem("userProfile")
    localStorage.removeItem("lastProfileUpdate")
    document.cookie = "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;"
    document.cookie = "userRole=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;"
    router.push("/login")
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
          <Avatar>
            {avatarUrl && !imageError ? (
              <Image
                src={getImageUrl(avatarUrl) || "/placeholder.svg"}
                alt={fullName}
                width={32}
                height={32}
                className="h-full w-full rounded-full object-cover"
                onError={handleImageError}
                unoptimized
              />
            ) : (
              <AvatarFallback>{userInitials}</AvatarFallback>
            )}
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{fullName}</p>
            <p className="text-xs leading-none text-muted-foreground">{email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/motorizado/admin/perfil">
            <User className="mr-2 h-4 w-4" />
            <span>Perfil</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/motorizado/admin/configuracion">
            <Settings className="mr-2 h-4 w-4" />
            <span>Configuración</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Cerrar sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default AvatarSettings
