'use client'

import { motion } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { RiAccountCircleLine, RiLogoutBoxLine, RiSettings4Line } from 'react-icons/ri'
import { useRouter } from 'next/navigation'

const AvatarSettings: React.FC = () => {
  const [showMenuAvatar, setShowMenuAvatar] = useState(false)
  const avatarMenuRef = useRef<HTMLDivElement | null>(null)
  const [userInitials, setUserInitials] = useState<string>('')
  const [firstName, setFirstName] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const router = useRouter() //añadir useRouter

  // Obtener las iniciales del usuario desde localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      const user = JSON.parse(storedUser) // Convertir el string JSON a objeto
      const firstName = user?.name || ''
      const lastName = user?.lastName || ''
      const fullName = `${firstName.toUpperCase()} ${lastName.toUpperCase()}`
      const email = user?.email || ''
      // Obtener las iniciales del nombre y apellido
      const initials = `${firstName.charAt(0).toUpperCase()}${lastName.charAt(0).toUpperCase()}`
      setUserInitials(initials)
      setFirstName(fullName)
      setEmail(email)
    }
  }, [])

  const handleLogout = () => {
    // Eliminar token del localStorage
    localStorage.removeItem('authToken')
    //eliminamos los datos de usuario del local storage
    localStorage.removeItem('user')
    
    // Eliminar la cookie , estable una fecha de expiracion en el pasado
    document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
    
    // Redirigir al login usando useRouter
    router.push('/login')
  }


  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent): void => {
      if (
        avatarMenuRef.current !== null &&
        !avatarMenuRef.current.contains(e.target as Node)
      ) {
        setShowMenuAvatar(false)
      }
    }

    window.addEventListener('click', handleOutsideClick)

    return () => {
      window.removeEventListener('click', handleOutsideClick)
    }
  }, [])

  return (
    <div className="flex items-center">
      <div ref={avatarMenuRef} className="relative flex items-center">
        <button
          className="rounded-full overflow-hidden w-10 h-10 bg-gray-200 flex items-center justify-center"
          onClick={() => {
            setShowMenuAvatar((cs) => !cs)
          }}
        >
          <span className="font-medium text-gray-600 uppercase">
            {userInitials}
          </span>
        </button>
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          variants={{
            open: { opacity: 1, scale: 1, display: 'block' },
            close: { opacity: 0, scale: 0.5, display: 'none' }
          }}
          animate={showMenuAvatar ? 'open' : 'close'}
          transition={{ type: 'tween', duration: 0.1 }}
          className="bg-white shadow-2xl top-[140%] w-44 overflow-hidden absolute z-50 right-0 rounded-md text-color-main flex flex-col divide-y"
        >
          <div className="py-2">
            <div className="px-4 py-2 hover:bg-gray-100 w-full transition-colors">
              <div className="font-medium">
                {firstName}
              </div>
              <div className="text-sm truncate">
                {email}
              </div>
            </div>
          </div>
          <div className="flex flex-col py-2 gap-1">
            <div className="flex gap-2 py-2 items-center px-4 hover:text-gray-900 cursor-pointer hover:bg-gray-100 w-full transition-colors">
              <span>
                <RiAccountCircleLine className="text-xl" />
              </span>
              Perfil
            </div>
            <div className="flex gap-2 py-2 items-center px-4 hover:text-gray-900 cursor-pointer hover:bg-gray-100 w-full transition-colors">
              <span>
                <RiSettings4Line className="text-xl" />
              </span>
              Configuración
            </div>
          </div>
          <div className="py-2">
            <button
              className="flex gap-2 py-2 items-center px-4 text-left hover:text-gray-900 cursor-pointer hover:bg-gray-100 w-full transition-colors"
              onClick={handleLogout}
            >
              <span>
                <RiLogoutBoxLine className="text-xl" />
              </span>
              Cerrar sesión
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default AvatarSettings
