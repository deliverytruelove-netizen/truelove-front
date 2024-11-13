"use client"

import * as React from "react"
import { useState } from "react"
import Image from "next/image"
import { Heart, Star, Coffee, Eye, EyeOff, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import Logotipo from '@/src/assets/img/logotipo.png'

export default function Component() {
  const [formData, setFormData] = useState({ username: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Implement your form submission logic here
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="flex min-h-screen ">
      {/* Left Section */}
      <div className="hidden w-1/2 lg:flex lg:items-center lg:justify-center">
        <div className="max-w-lg space-y-12 p-8">
          <div className="flex justify-center">
            <div className="h-20 w-56">
              <Image
                src={Logotipo}
                alt="True Love Portal"
                width={224}
                height={80}
                className="h-full w-auto"
                priority
              />
            </div>
          </div>
          <div className="space-y-8">
            <h1 className="text-center text-4xl font-serif text-gray-700">
              Conecta, Crece, Ama con <span className="text-red-500">True Love</span> Portal
            </h1>
            <div className="space-y-6">
              {[
                {
                  icon: Heart,
                  text: "Encuentra conexiones auténticas y duraderas con personas afines.",
                },
                {
                  icon: Star,
                  text: "Descubre eventos y experiencias únicas para compartir momentos especiales.",
                },
                {
                  icon: Coffee,
                  text: "Participa en comunidades temáticas y expande tu círculo social.",
                },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="rounded-full bg-[#F24141] p-3 text-white">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <p className="text-lg text-gray-700">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex w-full items-center justify-center p-8 lg:w-1/2">
        <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-3xl font-serif text-[#F24141]">
               <span className="text-red-500 font-bold "> Bienvenido</span> De Vuelta

              </h2>
              <p className="text-gray-600">Ingresa a tu cuenta</p>
              <div className="relative">
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="peer w-full rounded-lg border border-gray-300 p-4 text-gray-900 placeholder-transparent focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Correo electrónico"
                />
                <label
                  htmlFor="username"
                  className="absolute left-2 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-sm text-gray-500 duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:px-2 peer-focus:text-red-600"
                >
                  Correo electrónico
                </label>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="peer w-full rounded-lg border border-gray-300 p-4 text-gray-900 placeholder-transparent focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Contraseña"
                />
                <label
                  htmlFor="password"
                  className="absolute left-2 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-sm text-gray-500 duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:px-2 peer-focus:text-pink-600"
                >
                  Contraseña
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Recuérdame
                </label>
              </div>
              <div className="text-sm">
                <a href="#" className="font-medium text-pink-600 hover:text-pink-500">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full rounded-lg bg-red-600 p-3 text-center text-sm font-semibold text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Iniciar sesión
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">O continúa con</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-500 shadow-sm hover:bg-gray-50"
              >
                <svg className="h-5 w-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M20 10c0-5.523-4.477-10-10-10S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z" clipRule="evenodd" />
                </svg>
                <span>Facebook</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-500 shadow-sm hover:bg-gray-50"
              >
                <Phone className="h-5 w-5" />
                <span>Celular</span>
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}