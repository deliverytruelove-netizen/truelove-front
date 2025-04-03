"use client"

import type React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface UserModalProps {
  isOpen: boolean
  onClose: () => void
  newUser: {
    name: string
    email: string
    usuario: string
    password: string
    role_id?: number
  }
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onCreateUser: () => void
  isLoading: boolean
}

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, newUser, onChange, onCreateUser, isLoading }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onCreateUser()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Crear Usuario Administrador</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid w-full items-center gap-2">
            <label htmlFor="name" className="text-sm font-medium">
              Nombre completo
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={newUser.name}
              onChange={onChange}
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#e74c3c] focus:border-transparent"
              placeholder="Ingrese nombre completo"
              required
            />
          </div>
          <div className="grid w-full items-center gap-2">
            <label htmlFor="email" className="text-sm font-medium">
              Correo electrónico
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={newUser.email}
              onChange={onChange}
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#e74c3c] focus:border-transparent"
              placeholder="ejemplo@correo.com"
              required
            />
          </div>
          <div className="grid w-full items-center gap-2">
            <label htmlFor="usuario" className="text-sm font-medium">
              Nombre de usuario
            </label>
            <input
              type="text"
              id="usuario"
              name="usuario"
              value={newUser.usuario}
              onChange={onChange}
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#e74c3c] focus:border-transparent"
              placeholder="Ingrese nombre de usuario"
              required
            />
          </div>
          <div className="grid w-full items-center gap-2">
            <label htmlFor="password" className="text-sm font-medium">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={newUser.password}
              onChange={onChange}
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#e74c3c] focus:border-transparent"
              placeholder="Ingrese contraseña"
              required
            />
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="mr-2" disabled={isLoading}>
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-[#1abc9c] hover:bg-[#16a085]"
              disabled={isLoading || !newUser.name || !newUser.email || !newUser.usuario || !newUser.password}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                "Crear Usuario"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default UserModal

