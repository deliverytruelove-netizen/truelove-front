'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import Image from "next/image"
import Persona from "@/public/img/person.jpg"
import Navbar from "@/components/ui/navbar"
import { useState, useEffect } from "react"
import Link from 'next/link'

export default function Component() {
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 5
  const [formData, setFormData] = useState({
    ruc: '',
    razonSocial: '',
    email: '',
    phone: ''
  })
  const [isFormValid, setIsFormValid] = useState(false)

  useEffect(() => {
    const isValid = Object.values(formData).every(value => value.trim() !== '')
    setIsFormValid(isValid)
  }, [formData])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  const handleNext = () => {
    if (isFormValid) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps))
    }
  }

  // Eliminar esta función
  // const handleBack = () => {
  //   setCurrentStep((prev) => Math.max(prev - 1, 1))
  // }

  return (
    <section className="min-h-screen w-full">
      <Navbar />
      <div className="grid lg:grid-cols-2">
        <div className="relative hidden h-full min-h-[600px] lg:block">
          <Image
            alt="Background image"
            className="absolute inset-0 h-full w-full object-cover"
            height="1080"
            src={Persona}
            style={{
              aspectRatio: "16/9",
              objectFit: "cover",
            }}
            width="1920"
          />
        </div>
        <div className="flex items-center justify-center p-6 lg:p-8">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Algunos datos clave</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ruc">RUC</Label>
                  <Input 
                    id="ruc" 
                    placeholder="Ingrese su RUC" 
                    required 
                    type="text"
                    value={formData.ruc}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="razonSocial">Razón Social</Label>
                  <Input 
                    id="razonSocial" 
                    placeholder="Ingrese su Razón Social" 
                    required 
                    type="text"
                    value={formData.razonSocial}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <Input 
                    id="email" 
                    placeholder="Ingrese su correo" 
                    required 
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input 
                    id="phone" 
                    placeholder="Ingrese su teléfono" 
                    required 
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Navigation and Progress Bar */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-white p-4">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <Button 
            variant="ghost" 
            className="text-gray-600 hover:text-gray-900"
            asChild
          >
            <Link href="/ubicar-local">Atrás</Link>
          </Button>

          <div className="flex flex-col items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {totalSteps - currentStep} pasos para terminar
            </span>
            <Progress value={(currentStep / totalSteps) * 100} className="w-[200px]" />
          </div>

          <Button 
            onClick={handleNext}
            disabled={!isFormValid}
            className="bg-[#f34739] text-white hover:bg-[#d63c30] disabled:opacity-50"
          >
            Continuar
          </Button>
        </div>
      </div>
    </section>
  )
}