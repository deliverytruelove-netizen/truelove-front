<<<<<<< HEAD
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
=======
import React from 'react';
import Image from 'next/image';
import Logo from '@/public/logo.png';

export default function Login() {
  return (
    <section className="h-full bg-white">
      <div className="container h-full p-10">
        <div className="flex h-full flex-wrap items-center justify-center text-neutral-800">
          <div className="w-full">
            <div className="block rounded-lg bg-white shadow-lg">
              <div className="g-0 lg:flex lg:flex-wrap">
                {/* Columna izquierda */}
                <div className="px-4 md:px-0 lg:w-6/12">
                  <div className="md:mx-6 md:p-12">
                    {/* Logo */}
                    <div className="text-center">
                      <Image
                        className="mx-auto w-48"
                        src={Logo}
                        alt="logo"
                      />
                      <h4 className="mb-12 mt-1 pb-1 text-xl font-semibold">
                        We are The Lotus Team
                      </h4>
                    </div>

                    <form>
                      <p className="mb-4">Please login to your account</p>

                      {/* Campo de usuario */}
                      <div className="relative mb-4">
                        <input
                          type="text"
                          className="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[1.6] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 peer-focus:text-primary dark:text-black dark:placeholder:text-neutral-300"
                          id="username"
                          placeholder="Username"
                        />
                        <label
                          htmlFor="username"
                          className="pointer-events-none absolute left-3 top-0 mb-0 max-w-[90%] origin-[0_0] truncate pt-[0.37rem] leading-[1.6] text-neutral-500 transition-all duration-200 ease-out peer-focus:-translate-y-[0.9rem] peer-focus:scale-[0.8] peer-focus:text-primary"
                        >
                          Username
                        </label>
                      </div>

                      {/* Campo de contraseña */}
                      <div className="relative mb-4">
                        <input
                          type="password"
                          className="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[1.6] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 peer-focus:text-primary dark:text-black dark:placeholder:text-neutral-300"
                          id="password"
                          placeholder="Password"
                        />
                        <label
                          htmlFor="password"
                          className="pointer-events-none absolute left-3 top-0 mb-0 max-w-[90%] origin-[0_0] truncate pt-[0.37rem] leading-[1.6] text-neutral-500 transition-all duration-200 ease-out peer-focus:-translate-y-[0.9rem] peer-focus:scale-[0.8] peer-focus:text-primary"
                        >
                          Password
                        </label>
                      </div>

                      {/* Botón de envío */}
                      <div className="mb-12 pb-1 pt-1 text-center">
                        <button
                          className="mb-3 inline-block w-full rounded px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-dark-3 transition duration-150 ease-in-out hover:shadow-dark-2 focus:shadow-dark-2 focus:outline-none"
                          type="button"
                          style={{
                            background: '#007bff', // Cambiar el color de fondo aquí
                          }}
                        >
                          Log in
                        </button>

                        {/* Enlace para recuperar contraseña */}
                        <a href="#!" className="text-sm text-blue-500 hover:underline">Forgot password?</a>
                      </div>

                      {/* Botón de registro */}
                      <div className="flex items-center justify-between pb-6">
                        <p className="mb-0 me-2">Don't have an account?</p>
                        <button
                          type="button"
                          className="inline-block rounded border-2 border-danger px-6 pb-[6px] pt-2 text-xs font-medium uppercase leading-normal text-danger transition duration-150 ease-in-out hover:border-danger-600 hover:bg-danger-50/50 hover:text-danger-600 focus:border-danger-600 focus:bg-danger-50/50 focus:text-danger-600 focus:outline-none"
                        >
                          Register
                        </button>
                      </div>
                    </form>
                  </div>
                </div>

                {/* Columna derecha con fondo y descripción */}
                <div className="flex items-center rounded-b-lg lg:w-6/12 lg:rounded-e-lg lg:rounded-bl-none bg-white">
                  <div className="px-4 py-6 text-black md:mx-6 md:p-12">
                    <h4 className="mb-6 text-xl font-semibold">
                      We are more than just a company
                    </h4>
                    <p className="text-sm">
                      Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
>>>>>>> 5ab54bc479f1f03d2f4bb12a0b68cf1f441938a8
}
