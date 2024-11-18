'use client'

import { useState } from "react"
import { useRouter } from 'next/navigation'
import Image from "next/image"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Navbar from "@/components/ui/navbar"
import StepNavigation from '@/components/ui/StepNavigation'
import Persona from "@/public/img/person.jpg"


export default function Component() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    ruc: '',
    razonSocial: '',
    email: '',
    phone: ''
  })

  const isFormValid = Object.values(formData).every(value => value.trim() !== '')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  const handleNext = () => {
    if (isFormValid) {
      console.log('Form data:', formData)
      router.push('/datosBancarios')
    }
  }

  return (
    <section className="min-h-screen w-full bg-gray-50">
      <Navbar />
      <div className="grid lg:grid-cols-2">
        <div className="relative hidden h-full min-h-[600px] lg:block">
          <Image
            alt="Business person working on a laptop"
            className="absolute inset-0 h-full w-full object-cover"
            height={1080}
            src={Persona}
            style={{
              aspectRatio: "16/9",
              objectFit: "cover",
            }}
            width={1920}
          />
        </div>
        <div className="flex items-center justify-center p-6 lg:p-8">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Algunos datos clave</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
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

      <StepNavigation
        currentStep={4}
        totalSteps={6}
        onNext={handleNext}
        onBack={() => router.back()}
        isNextDisabled={!isFormValid}
      />
    </section>
  )
}