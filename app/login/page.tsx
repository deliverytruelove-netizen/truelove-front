'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { EyeIcon, EyeOffIcon } from 'lucide-react'
import Logo from '@/src/assets/img/logotipo.png'

export default function Login() {
  const [showPassword, setShowPassword] = React.useState(false)

  return (
    <section className="min-h-screen bg-white flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl overflow-hidden">
        <div className="grid md:grid-cols-2 gap-6">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="p-6 flex flex-col justify-between"
          >
            <div>
              <CardHeader className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <Image src={Logo} alt="logo" width={150} height={150} />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-600">Inicia sesión con tu correo electrónico</CardTitle>
              </CardHeader>
              <CardContent>
                <form>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Usuario</Label>
                      <Input id="username" placeholder="Ingresa tu usuario" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Contraseña</Label>
                      <div className="relative">
                        <Input 
                          id="password" 
                          type={showPassword ? "text" : "password"} 
                          placeholder="Ingresa tu contraseña" 
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        >
                          {showPassword ? <EyeOffIcon className="h-4 w-4 text-gray-500" /> : <EyeIcon className="h-4 w-4 text-gray-500" />}
                        </button>
                      </div>
                    </div>
                  </div>
                  <Button className="w-full mt-6 bg-[#f34739]" type="submit">
                    Iniciar sesión
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Link href="/forgot-password" className="text-sm text-red-600 hover:underline">
                  ¿Olvidaste tu contraseña?
                </Link>
              </CardFooter>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-[#f34739] text-white p-6 flex flex-col justify-center"
          >
            <h2 className="text-2xl font-bold mb-4">Somos el Equipo True Love</h2>
            <p className="mb-4">
              Únete a nosotros en nuestra misión de llevar el amor a la puerta de nuestros clientes con cada entrega.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Servicio de calidad
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Entregas rápidas
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Satisfacción garantizada
              </li>
            </ul>
          </motion.div>
        </div>
      </Card>
    </section>
  )
}
