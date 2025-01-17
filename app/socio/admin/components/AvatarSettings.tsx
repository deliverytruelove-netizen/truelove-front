'use client'

import { useState, useEffect } from 'react'
import { User, Settings, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
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
import Link from 'next/link'

const AvatarSettings = () => {
  const [userInitials, setUserInitials] = useState<string>('')
  const [fullName, setFullName] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [avatarUrl, setAvatarUrl] = useState<string>('')
  const [imageError, setImageError] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser)
        const firstName = user?.name || ''
        const lastName = user?.lastName || ''
        const fullName = `${firstName} ${lastName}`.trim()
        const email = user?.email || ''
        const profilePhoto = user?.profile_photo || user?.avatar || user?.photo_url
        
        // Configurar iniciales
        const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
        setUserInitials(initials || email.charAt(0).toUpperCase())
        setFullName(fullName || email)
        setEmail(email)
        
        // Usar la foto de perfil del backend si existe
        if (profilePhoto) {
          // Usar la ruta relativa, Next.js se encargará de la redirección
          setAvatarUrl(`/storage/${profilePhoto}`)
        } else {
          // Fallback a UI Avatars si no hay foto
          setAvatarUrl(getUIAvatarUrl(fullName || email))
        }
      } catch (error) {
        console.error('Error parsing user data:', error)
        setImageError(true)
      }
    }
  }, [])

  const getUIAvatarUrl = (name: string) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&bold=true&format=svg`
  }

  const handleImageError = () => {
    setImageError(true)
    setAvatarUrl(getUIAvatarUrl(fullName || email))
  }

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    localStorage.removeItem('userRole')
    document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
    document.cookie = 'userRole=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
    router.push('/login')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
          <Avatar>
            {avatarUrl && !imageError && (
              <Image
                src={avatarUrl || "/placeholder.svg"}
                alt={fullName}
                width={32}
                height={32}
                className="h-full w-full rounded-full object-cover"
                onError={handleImageError}
                unoptimized
              />
            )}
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{fullName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/socio/admin/perfil">
            <User className="mr-2 h-4 w-4" />
            <span>Perfil</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/socio/admin/configuracion">
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

