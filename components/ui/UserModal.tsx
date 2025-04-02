"use client"

import type React from "react"
import { X } from "lucide-react"

interface UserModalProps {
  isOpen: boolean
  onClose: () => void
  newUser: { name: string; email: string; usuario: string; password: string }
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onCreateUser: () => void
  isLoading?: boolean
}

const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  newUser,
  onChange,
  onCreateUser,
  isLoading = false,
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-md relative overflow-hidden animate-in fade-in zoom-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Crear Usuario</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors rounded-full p-1 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Nombre
            </label>
            <input
              id="name"
              type="text"
              name="name"
              placeholder="Ingrese nombre completo"
              value={newUser.name}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#e74c3c] focus:border-transparent text-gray-900"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="ejemplo@correo.com"
              value={newUser.email}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#e74c3c] focus:border-transparent text-gray-900"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="usuario" className="block text-sm font-medium text-gray-700">
              Nombre de usuario
            </label>
            <input
              id="usuario"
              type="text"
              name="usuario"
              placeholder="Ingrese nombre de usuario"
              value={newUser.usuario}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#e74c3c] focus:border-transparent text-gray-900"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="Ingrese contraseña"
              value={newUser.password}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#e74c3c] focus:border-transparent text-gray-900"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onCreateUser}
            disabled={isLoading}
            className="px-4 py-2 bg-[#1abc9c] text-white rounded-md hover:bg-[#16a085] focus:outline-none focus:ring-2 focus:ring-[#1abc9c] focus:ring-offset-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? "Creando..." : "Crear Usuario"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default UserModal

