'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from "next/image"
import Link from "next/link"
import { Loader2, CheckCircle } from 'lucide-react'
import { Button } from "@/components/ui/button"
import emailIcon from "@/public/img/gmail.png"
import EmailEnviado from '@/public/img/data.svg'

import Navbar from '@/components/ui/navbar'
import EmailImage from '@/public/img/emailsended.jpg'

function ImprovedNotification({ message, duration = 3000 } : {message: string, duration?: number}) {
  const [isVisible, setIsVisible] = useState(true)
 
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
    }, duration)

    return () => clearTimeout(timer)
  }, [duration])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 right-4 z-50 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg flex items-center"
        >
          <CheckCircle className="w-5 h-5 mr-2" />
          <span>{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email')
  const registrationId = searchParams.get('registration_id')
  const [verificationCode, setVerificationCode] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [showNotification, setShowNotification] = useState(false)

  useEffect(() => {
    if (!email || !registrationId) {
      router.push('/')
    }

    const isUserVerified = localStorage.getItem('isVerified')
    if (isUserVerified === 'true') {
      router.push('/acercaNegocio')
    }

    // Disable back navigation
    const handlePopState = (event: PopStateEvent) => {
      event.preventDefault()
      window.history.pushState(null, '', window.location.href)
    }

    window.history.pushState(null, '', window.location.href)
    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [email, registrationId, router])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (resendCooldown > 0) {
      timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1)
      }, 1000)
    }
    return () => clearTimeout(timer)
  }, [resendCooldown])

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch(process.env.NEXT_PUBLIC_API_WEB + '/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email,
          code: verificationCode.trim(),
          registration_id: registrationId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Error al verificar el código')
      }

      setIsVerified(true)
      localStorage.setItem('isVerified', 'true')
      setTimeout(() => {
        router.push('/acercaNegocio')
      }, 3000)
      
    } catch (error) {
      console.error('Verification error:', error)
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('Error al verificar el código. Por favor, intente nuevamente.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    if (!email || !registrationId || isLoading || resendCooldown > 0) return

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('http://localhost:8000/api/resend-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          registration_id: registrationId 
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Error al reenviar el código')
      }

      setResendCooldown(60)
      setShowNotification(true)
      setTimeout(() => setShowNotification(false), 3000)
    } catch (error) {
      console.error('Resend error:', error)
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('Error al reenviar el código')
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (!email || !registrationId) {
    return null
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="min-h-screen flex flex-col items-center justify-center p-4 relative">
        {!isVerified && (
          <Image
            src={EmailImage}
            alt="Background"
            layout="fill"
            objectFit="cover"
            quality={100}
            className="z-0"
          />
        )}
        <Navbar />
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 z-10"
        >
          <div className="flex flex-col items-center">
            {!isVerified && (
              <div className="mb-6">
                <Image 
                  src={emailIcon} 
                  alt="Email Icon" 
                  width={50} 
                  height={50} 
                />
              </div>
            )}

            {isVerified ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <Image
                  src={EmailEnviado}
                  alt="Email Enviado"
                  width={60}
                  height={60}
                  className="mx-auto mb-4"
                />
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  ¡Verificación exitosa!
                </h2>
                <p className="text-gray-600">
                  Serás redirigido en unos segundos...
                </p>
              </motion.div>
            ) : (
              <>
                <h2 className="text-xl font-bold text-gray-800 mb-2 text-center">
                  Te enviamos un correo electrónico de verificación
                </h2>

                <p className="text-gray-600 text-center mb-6">
                  Te enviamos un correo electrónico a la dirección{" "}
                  <span className="font-bold">{email}</span>
                </p>
                
                <form onSubmit={handleVerification} className="w-full space-y-4">
                  <div>
                    <label 
                      htmlFor="verificationCode" 
                      className="block text-sm font-medium text-gray-700"
                    >
                      Código de verificación
                    </label>
                    <input
                      type="text"
                      id="verificationCode"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#f34739] focus:border-[#f34739]"
                      placeholder="Ingrese el código de 6 dígitos"
                      required
                      disabled={isLoading}
                      maxLength={6}
                      autoComplete="off"
                    />
                  </div>

                  {error && (
                    <p className="text-red-500 text-sm text-center">{error}</p>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full bg-[#f34739] text-white hover:bg-[#d63c30] flex items-center justify-center"
                    disabled={isLoading || verificationCode.length !== 6}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verificando...
                      </>
                    ) : (
                      'Verificar'
                    )}
                  </Button>
                </form>

                <div className="text-center text-sm text-gray-500 mt-4">
                  ¿No lo recibiste?{" "}
                  <button 
                    onClick={handleResendCode} 
                    className="text-[#d63c30] hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading || resendCooldown > 0}
                    type="button"
                  >
                    {resendCooldown > 0 ? `Reenviar (${resendCooldown}s)` : 'Reenviar'}
                  </button>{" "}
                  o{" "}
                  <Link href="/" className="text-[#d63c30] hover:underline">
                    cambiar
                  </Link>{" "}
                  la dirección de correo
                </div>
              </>
            )}
          </div>
        </motion.div>
        {showNotification && (
          <ImprovedNotification message="Se ha reenviado el código a su correo" />
        )}
      </div>
    </Suspense>
  )
}

