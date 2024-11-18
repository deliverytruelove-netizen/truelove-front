'use client'

import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'
import Image from "next/image"
import { CircleHelp } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import Navbar from "@/components/ui/navbar"
import StepNavigation from '@/components/ui/StepNavigation'
import Persona from "@/public/img/person.jpg"

export default function DatosBancarios() {
  const router = useRouter()
  const [currentStep] = useState(5)
  const totalSteps = 6
  const [formData, setFormData] = useState({
    accountHolder: '',
    accountNumber: '',
    bankName: '',
    accountType: '',
    documentNumber: '',
    cci: '',
    useBusinessAddress: true
  })
  const [isFormValid, setIsFormValid] = useState(false)

  useEffect(() => {
    const isValid = Object.values(formData).every(value => 
      typeof value === 'boolean' ? true : value.trim() !== ''
    )
    setIsFormValid(isValid)
  }, [formData])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  const handleSelectChange = (id: string, value: string) => {
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, useBusinessAddress: checked }))
  }

  const handleNext = () => {
    if (isFormValid) {
      // Here you would typically send the data to your backend
      console.log('Form data:', formData)
      // Navigate to the next step
      router.push('/planes')
    }
  }

  const handleBack = () => {
    router.back()
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
              <CardTitle className="text-2xl font-bold">Datos Bancarios</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="accountHolder">
                    Titular de Cuenta bancaria <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="accountHolder"
                      placeholder="titular"
                      required
                      value={formData.accountHolder}
                      onChange={handleInputChange}
                      className="pr-10"
                    />
                    <CircleHelp className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountNumber">
                    Número de cuenta bancaria <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="accountNumber"
                      required
                      value={formData.accountNumber}
                      onChange={handleInputChange}
                      className="pr-10"
                    />
                    <CircleHelp className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bankName">
                    Nombre del banco <span className="text-destructive">*</span>
                  </Label>
                  <Select onValueChange={(value) => handleSelectChange('bankName', value)}>
                    <SelectTrigger id="bankName">
                      <SelectValue placeholder="Seleccionar banco" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bcp">BCP</SelectItem>
                      <SelectItem value="bbva">BBVA</SelectItem>
                      <SelectItem value="interbank">Interbank</SelectItem>
                      <SelectItem value="scotiabank">Scotiabank</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountType">
                    Tipo de Cuenta Bancaria <span className="text-destructive">*</span>
                  </Label>
                  <Select onValueChange={(value) => handleSelectChange('accountType', value)}>
                    <SelectTrigger id="accountType">
                      <SelectValue placeholder="Seleccionar tipo de cuenta" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="savings">Cuenta de Ahorros</SelectItem>
                      <SelectItem value="checking">Cuenta Corriente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="documentNumber">
                    Documento del titular (RUC) <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="documentNumber"
                      required
                      value={formData.documentNumber}
                      onChange={handleInputChange}
                      className="pr-10"
                    />
                    <CircleHelp className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cci">
                    Código de Cuenta Interbancaria (CCI) <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="cci"
                      required
                      value={formData.cci}
                      onChange={handleInputChange}
                      className="pr-10"
                    />
                    <CircleHelp className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                <div className="flex items-start space-x-3 pt-4">
                  <Checkbox
                    id="useBusinessAddress"
                    checked={formData.useBusinessAddress}
                    onCheckedChange={handleCheckboxChange}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor="useBusinessAddress"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Mi dirección de facturación es la misma que la dirección del negocio
                    </label>
                    {formData.useBusinessAddress && (
                      <p className="text-sm text-muted-foreground">
                        Pasaje Los Amancaes
                        <br />
                        15803, San Juan de Miraflores
                      </p>
                    )}
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <StepNavigation
        currentStep={currentStep}
        totalSteps={totalSteps}
        onNext={handleNext}
        onBack={handleBack}
        isNextDisabled={!isFormValid}
      />
    </section>
  )
}