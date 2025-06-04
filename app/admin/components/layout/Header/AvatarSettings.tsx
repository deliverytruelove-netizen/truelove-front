// app\admin\components\layout\Header\AvatarSettings.tsx
"use client"

import type React from "react"
import { createPortal } from "react-dom"
import { motion } from "framer-motion"
import { useState, useEffect, useRef } from "react"
import { UserCircle, Settings, LogOut, HelpCircle, Bell } from 'lucide-react'
import { useRouter } from "next/navigation"
import { showAlert, confirmAlert } from "@/components/ui/DataTable/Alert"

// Interfaz para las solicitudes de eliminación
interface DeletionRequest {
  id: number
  user_id: number
  reason: string
  status: string
  requested_at: string
  user: {
    id: number
    name: string
    email: string
    usuario: string
  }
}

const AvatarSettings: React.FC = () => {
  // Estados para manejar el menú y la información del usuario
  const [showMenu, setShowMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const notificationsRef = useRef<HTMLDivElement | null>(null)
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const [userInitials, setUserInitials] = useState<string>("U")
  const [userName, setUserName] = useState<string>("Usuario")
  const [email, setEmail] = useState<string>("")
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const [deletionRequests, setDeletionRequests] = useState<number>(0)
  const [requests, setRequests] = useState<DeletionRequest[]>([])

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
  const handleLogout = async () => {
    const result = await confirmAlert({
      title: "¿Cerrar sesión?",
      text: "¿Estás seguro de que quieres cerrar sesión?",
      icon: "question",
      confirmButtonText: "Sí, cerrar sesión",
      cancelButtonText: "Cancelar"
    })

    if (result.isConfirmed) {
      localStorage.removeItem("authToken")
      localStorage.removeItem("user")
      localStorage.removeItem("userRole")
      document.cookie = "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;"
      router.push("/login")
    }
  }

  // Función para obtener solicitudes de eliminación
  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("authToken")
      if (!token) return

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_WEB}/admin/deletion-requests`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      
      if (response.ok) {
        const data: DeletionRequest[] = await response.json()
        setRequests(data)
        setDeletionRequests(data.length)
      }
    } catch (error) {
      console.error("Error fetching deletion requests:", error)
    }
  }

  useEffect(() => {
    fetchRequests()
    // Actualizar cada 30 segundos
    const interval = setInterval(fetchRequests, 30000)
    return () => clearInterval(interval)
  }, [])

  // Función para aprobar solicitud desde notificaciones
  const handleApproveFromNotification = async (requestId: number, userName: string) => {
    const result = await confirmAlert({
      title: "¿Eliminar cuenta?",
      text: `¿Estás seguro de que quieres eliminar la cuenta de ${userName}? Esta acción no se puede deshacer.`,
      icon: "warning",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar"
    })

    if (!result.isConfirmed) return

    try {
      const token = localStorage.getItem("authToken")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_WEB}/admin/deletion-requests/${requestId}/approve`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        await showAlert({
          title: "¡Éxito!",
          text: "Usuario eliminado correctamente",
          icon: "success"
        })
        fetchRequests() // Recargar
      } else {
        await showAlert({
          title: "Error",
          text: "Error al procesar la solicitud",
          icon: "error"
        })
      }
    } catch (error) {
      console.error("Error:", error)
      await showAlert({
        title: "Error",
        text: "Error al procesar la solicitud",
        icon: "error"
      })
    }
  }

  // Función para rechazar solicitud desde notificaciones
  const handleRejectFromNotification = async (requestId: number, userName: string) => {
    const result = await confirmAlert({
      title: "¿Rechazar solicitud?",
      text: `¿Estás seguro de que quieres rechazar la solicitud de eliminación de ${userName}?`,
      icon: "question",
      confirmButtonText: "Sí, rechazar",
      cancelButtonText: "Cancelar"
    })

    if (!result.isConfirmed) return

    try {
      const token = localStorage.getItem("authToken")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_WEB}/admin/deletion-requests/${requestId}/reject`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        await showAlert({
          title: "¡Éxito!",
          text: "Solicitud rechazada correctamente",
          icon: "success"
        })
        fetchRequests() // Recargar
      } else {
        await showAlert({
          title: "Error",
          text: "Error al procesar la solicitud",
          icon: "error"
        })
      }
    } catch (error) {
      console.error("Error:", error)
      await showAlert({
        title: "Error",
        text: "Error al procesar la solicitud",
        icon: "error"
      })
    }
  }

  // Efecto para cerrar el menú al hacer clic fuera
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        notificationsRef.current &&
        !notificationsRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setShowMenu(false)
        setShowNotifications(false)
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

  // Calcular la posición del panel de notificaciones
  const getNotificationsPosition = () => {
    if (!buttonRef.current) return { top: 70, right: 280 }

    const rect = buttonRef.current.getBoundingClientRect()
    return {
      top: rect.bottom + 8,
      right: Math.min(window.innerWidth - rect.right + 260, 280), // Al lado del menú principal
    }
  }

  const { top, right } = getMenuPosition()
  const { top: notifTop, right: notifRight } = getNotificationsPosition()

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
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-sm relative"
              >
                <Bell className="h-4 w-4 text-gray-500" />
                <span>Notificaciones</span>
                {deletionRequests > 0 && (
                  <span className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {deletionRequests}
                  </span>
                )}
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

      {mounted &&
        showNotifications &&
        createPortal(
          <motion.div
            ref={notificationsRef}
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.15 }}
            style={{
              position: "fixed",
              top: `${notifTop}px`,
              right: `${notifRight}px`,
              width: "20rem",
              maxHeight: "24rem",
              zIndex: 9999,
            }}
            className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
          >
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Notificaciones</h3>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {requests.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">No hay notificaciones pendientes</div>
              ) : (
                requests.map((request) => (
                  <div key={request.id} className="p-3 border-b border-gray-50 hover:bg-gray-50">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                        <UserCircle className="h-5 w-5 text-red-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">{request.user.name}</span> solicita eliminar su cuenta
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(request.requested_at).toLocaleDateString()}
                        </p>
                        {request.reason && (
                          <p className="text-xs text-gray-600 mt-1 italic">
                            &ldquo;{request.reason}&rdquo;
                          </p>
                        )}
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => handleApproveFromNotification(request.id, request.user.name)}
                            className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                          >
                            Eliminar
                          </button>
                          <button
                            onClick={() => handleRejectFromNotification(request.id, request.user.name)}
                            className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded hover:bg-gray-300"
                          >
                            Rechazar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {requests.length > 0 && (
              <div className="p-3 border-t border-gray-100">
                <button
                  onClick={() => router.push("/admin/notificaciones")}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Ver todas las notificaciones
                </button>
              </div>
            )}
          </motion.div>,
          document.body,
        )}
    </div>
  )
}

export default AvatarSettings