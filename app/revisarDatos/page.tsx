'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import Navbar from "@/components/ui/navbar"
import StepNavigation from '@/components/ui/StepNavigation'
import DeliveryImage from "@/public/img/negocio.jpg"

export default function ReviewData() {
  const router = useRouter()
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const currentStep = 7
  const totalSteps = 8

  const businessData = {
    name: "Confecciones LADY",
    type: "Tienda",
    vertical: "Salud & Belleza",
    branches: "1",
    contactMethod: "WhatsApp",
    phone: "+51949229756"
  }

  const addressData = {
    street: "Pasaje Los Amancaes",
    postalCode: "15803",
    city: "San Juan de Miraflores"
  }

  const legalData = {
    businessName: "Manuel Hipólito Aguado Sierra",
    ruc: "10427993120",
    billingEmail: "ladysct11@gmail.com",
    billingAddress: "Pasaje Los Amancaes 6, 15803, San Juan de Miraflores, Peru"
  }

  const bankData = {
    accountHolder: "Manuel Aguado Sierra",
    accountNumber: "19316426064082",
    bankName: "BANCO DE CREDITO DEL PERU",
    accountType: "Cuenta de Ahorro",
    holderDocument: "10427993120",
    cci: "00219311642606408219"
  }

  const handleNext = () => {
    if (acceptedTerms) {
      router.push('/next-step')
    }
  }

  const handleBack = () => {
    router.back()
  }

  const handleEdit = (section: string) => {
    console.log(`Editing section: ${section}`)
    // Handle edit logic here
  }

  return (
    <section className="min-h-screen w-full bg-gray-50">
      <Navbar />
      <div className="grid lg:grid-cols-2">
        <div className="relative hidden h-full min-h-[600px] lg:block">
          <Image
            alt="Delivery service illustration"
            src={DeliveryImage}
            layout="fill"
            objectFit="cover"
          />
        </div>
        <div className="flex items-center justify-center p-6 lg:p-8">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Revisa tus datos</CardTitle>
              <p className="text-sm text-muted-foreground">
                Por favor verifica que la información sea correcta.
              </p>
            </CardHeader>
            <ScrollArea className="h-[60vh]">
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Datos del negocio</h3>
                    <Button 
                      variant="link" 
                      className="text-pink-600 hover:text-pink-700"
                      onClick={() => handleEdit('business')}
                    >
                      Editar
                    </Button>
                  </div>
                  <div className="grid gap-3">
                    <div className="grid grid-cols-2 gap-2">
                      <span className="text-sm text-muted-foreground">Nombre del local</span>
                      <span className="text-sm font-medium">{businessData.name}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="text-sm text-muted-foreground">Tipo de Negocio</span>
                      <span className="text-sm font-medium">{businessData.type}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="text-sm text-muted-foreground">Vertical de negocio</span>
                      <span className="text-sm font-medium">{businessData.vertical}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="text-sm text-muted-foreground">Sucursales</span>
                      <span className="text-sm font-medium">{businessData.branches}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="text-sm text-muted-foreground">Método de contacto preferido</span>
                      <span className="text-sm font-medium">{businessData.contactMethod}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="text-sm text-muted-foreground">Teléfono del local</span>
                      <span className="text-sm font-medium">{businessData.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Dirección del Negocio</h3>
                    <Button 
                      variant="link" 
                      className="text-pink-600 hover:text-pink-700"
                      onClick={() => handleEdit('address')}
                    >
                      Editar
                    </Button>
                  </div>
                  <div className="grid gap-3">
                    <div className="grid grid-cols-2 gap-2">
                      <span className="text-sm text-muted-foreground">Calle</span>
                      <span className="text-sm font-medium">{addressData.street}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="text-sm text-muted-foreground">Código Postal</span>
                      <span className="text-sm font-medium">{addressData.postalCode}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="text-sm text-muted-foreground">Ciudad</span>
                      <span className="text-sm font-medium">{addressData.city}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Datos legales</h3>
                    <Button 
                      variant="link" 
                      className="text-pink-600 hover:text-pink-700"
                      onClick={() => handleEdit('legal')}
                    >
                      Editar
                    </Button>
                  </div>
                  <div className="grid gap-3">
                    <div className="grid grid-cols-2 gap-2">
                      <span className="text-sm text-muted-foreground">Razón Social</span>
                      <span className="text-sm font-medium">{legalData.businessName}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="text-sm text-muted-foreground">RUC</span>
                      <span className="text-sm font-medium">{legalData.ruc}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="text-sm text-muted-foreground">Email de facturación</span>
                      <span className="text-sm font-medium">{legalData.billingEmail}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="text-sm text-muted-foreground">Dirección de facturación</span>
                      <span className="text-sm font-medium">{legalData.billingAddress}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Datos bancarios</h3>
                    <Button 
                      variant="link" 
                      className="text-pink-600 hover:text-pink-700"
                      onClick={() => handleEdit('bank')}
                    >
                      Editar
                    </Button>
                  </div>
                  <div className="grid gap-3">
                    <div className="grid grid-cols-2 gap-2">
                      <span className="text-sm text-muted-foreground">Titular de Cuenta bancaria</span>
                      <span className="text-sm font-medium">{bankData.accountHolder}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="text-sm text-muted-foreground">Número de cuenta bancaria</span>
                      <span className="text-sm font-medium">{bankData.accountNumber}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="text-sm text-muted-foreground">Nombre del banco</span>
                      <span className="text-sm font-medium">{bankData.bankName}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="text-sm text-muted-foreground">Tipo de Cuenta Bancaria</span>
                      <span className="text-sm font-medium">{bankData.accountType}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="text-sm text-muted-foreground">Documento del titular</span>
                      <span className="text-sm font-medium">{bankData.holderDocument}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="text-sm text-muted-foreground">Código de Cuenta Interbancaria (CCI)</span>
                      <span className="text-sm font-medium">{bankData.cci}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Relación comercial</h3>
                    <Button 
                      variant="link" 
                      className="text-pink-600 hover:text-pink-700"
                      onClick={() => handleEdit('commercial')}
                    >
                      Cambiar
                    </Button>
                  </div>
                  <div className="space-y-4">
                    <p className="text-sm font-medium">Logistica + Pelican Admin (Shop)</p>
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="terms"
                        checked={acceptedTerms}
                        onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                      />
                      <Label htmlFor="terms" className="text-sm">
                        Para finalizar el registro, te pedimos que leas y aceptes los{' '}
                        <a href="#" className="text-pink-600 hover:text-pink-700 underline">
                          términos y condiciones
                        </a>
                        {' '}con los que trabajaremos juntos.
                      </Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </ScrollArea>
          </Card>
        </div>
      </div>

      <StepNavigation
        currentStep={currentStep}
        totalSteps={totalSteps}
        onNext={handleNext}
        onBack={handleBack}
        isNextDisabled={!acceptedTerms}
      />
    </section>
  )
}