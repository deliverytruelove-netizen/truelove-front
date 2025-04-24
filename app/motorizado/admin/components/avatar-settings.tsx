"use client"

import { useState, useEffect } from "react"
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
import { useToast } from "@/hooks/use-toast"
import { useMotorizado } from "../context/MotorizadoContext"
import { cerrarSesion } from "../services/auth"

const BASE_URL = process.env.NEXT_PUBLIC_API_WEB?.replace("/api", "") || "http://localhost:8000"

const AvatarSettings = () => {
  const [userInitials, setUserInitials] = useState<string>("")
  const [fullName, setFullName] = useState<string>("")
  const [email, setEmail] = useState<string>("")
  const [avatarUrl, setAvatarUrl] = useState<string>("")
  const [imageError, setImageError] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { usuario, perfilData } = useMotorizado()

  const getImageUrl = (path: string | null) => {
    if (!path) return null
    if (path.startsWith("http")) return path

    // Remover /api/ si existe en la ruta
    const cleanPath = path.replace("/api/", "")
    return `${BASE_URL}/${cleanPath}`
  }

  useEffect(() => {
    if (usuario) {
      setEmail(usuario.email || "")
    }

    if (perfilData) {
      const firstName = perfilData.usuario?.name?.split(" ")[0] || perfilData.repartidor?.nombres || ""
      const lastName = perfilData.usuario?.name?.split(" ").slice(1).join(" ") || perfilData.repartidor?.apellidos || ""
      const fullName = `${firstName} ${lastName}`.trim()

      setFullName(fullName || perfilData.usuario?.email || "")
      setUserInitials(
        `${firstName.charAt(0)}${lastName.charAt(0) || firstName.charAt(1)}`.toUpperCase() ||
          (perfilData.usuario?.email || "").charAt(0).toUpperCase(),
      )

      // Si hay foto de perfil, la establecemos
      if (perfilData.repartidor?.documento_imagen_frente) {
        setAvatarUrl(perfilData.repartidor.documento_imagen_frente)
        setImageError(false)
      }
    }
  }, [usuario, perfilData])

  const handleImageError = () => {
    setImageError(true)
  }

  const handleLogout = () => {
    try {
      cerrarSesion()

      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente",
      })

      router.push("/login")
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
      toast({
        title: "Error",
        description: "No se pudo cerrar sesión correctamente",
        variant: "destructive",
      })
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
          <Avatar>
            {avatarUrl && !imageError ? (
              <Image
                src={getImageUrl(avatarUrl) || "/placeholder.svg?height=32&width=32&query=user"}
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
          <Link href={`/motorizado/admin/perfil/${usuario?.id}`}>
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
