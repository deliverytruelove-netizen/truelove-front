// app\admin\components\layout\Header\AvatarSettings.tsx
"use client"

import type React from "react"
import { createPortal } from "react-dom"
import { motion } from "framer-motion"
import { useState, useEffect, useRef } from "react"
import { UserCircle, Settings, LogOut, HelpCircle, Bell } from "lucide-react"
import { useRouter } from "next/navigation"

const AvatarSettings: React.FC = () => {
  // Estados para manejar el menú y la información del usuario
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const [userInitials, setUserInitials] = useState<string>("U")
  const [userName, setUserName] = useState<string>("Usuario")
  const [email, setEmail] = useState<string>("")
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  // Efecto para cargar la información del usuario
  useEffect(() => {
    setMounted(true)
    try {
      const storedUser = localStorage.getItem("user")
      if (storedUser) {
        const user = JSON.parse(storedUser)

        // Usar el campo 'name' como nombre de usuario
        if (user?.name) {
          setUserName(user.name)
          // Iniciales basadas en el nombre de usuario
          setUserInitials(user.name.substring(0, 1).toUpperCase())
        }

        // Establecer el email
        if (user?.email) {
          setEmail(user.email)
        }
      }
    } catch (error) {
      console.error("Error al cargar datos del usuario:", error)
    }

    return () => {
      setMounted(false)
    }
  }, [])

  // Función para manejar el cierre de sesión
  const handleLogout = () => {
    localStorage.removeItem("authToken")
    localStorage.removeItem("user")
    localStorage.removeItem("userRole")
    document.cookie = "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;"
    router.push("/login")
  }

  // Efecto para cerrar el menú al hacer clic fuera
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setShowMenu(false)
      }
    }

    window.addEventListener("click", handleOutsideClick)
    return () => window.removeEventListener("click", handleOutsideClick)
  }, [])

  // Calcular la posición del menú
  const getMenuPosition = () => {
    if (!buttonRef.current) return { top: 70, right: 20 }

    const rect = buttonRef.current.getBoundingClientRect()
    return {
      top: rect.bottom + 8,
      right: Math.min(window.innerWidth - rect.right, 20), // Limitar el valor máximo a 20px
    }
  }

  const { top, right } = getMenuPosition()

  return (
    <div className="relative z-30">
      <button
        ref={buttonRef}
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Configuración de usuario"
      >
        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-red-500 to-red-600 text-white flex items-center justify-center font-medium shadow-sm">
          {userInitials}
        </div>
        <span className="text-gray-700 font-medium hidden md:block">{userName}</span>
        <svg className="w-4 h-4 text-gray-500 hidden md:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>

      {mounted &&
        showMenu &&
        createPortal(
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.15 }}
            style={{
              position: "fixed",
              top: `${top}px`,
              right: `${right}px`,
              width: "16rem",
              zIndex: 9999,
            }}
            className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
          >
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 text-white flex items-center justify-center font-medium shadow-sm">
                  {userInitials}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{userName}</p>
                  <p className="text-sm text-gray-500 truncate">{email}</p>
                </div>
              </div>
            </div>

            <div className="p-2">
              <button className="w-full flex items-center gap-2.5 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-sm">
                <UserCircle className="h-4 w-4 text-gray-500" />
                <span>Editar perfil</span>
              </button>
              <button className="w-full flex items-center gap-2.5 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-sm">
                <Bell className="h-4 w-4 text-gray-500" />
                <span>Notificaciones</span>
              </button>
              <button className="w-full flex items-center gap-2.5 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-sm">
                <Settings className="h-4 w-4 text-gray-500" />
                <span>Configuraciones de la cuenta</span>
              </button>
              <button className="w-full flex items-center gap-2.5 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-sm">
                <HelpCircle className="h-4 w-4 text-gray-500" />
                <span>Apoyo</span>
              </button>
            </div>

            <div className="p-2 border-t border-gray-100">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
              >
                <LogOut className="h-4 w-4" />
                <span>Cerrar sesión</span>
              </button>
            </div>
          </motion.div>,
          document.body,
        )}
    </div>
  )
}

export default AvatarSettings
