// app/datosClaves/components/FormularioDatosClave.tsx
"use client"

import type React from "react"
import { Loader2 } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { fetchRucDataService } from "@/services/rucService"

interface FormularioDatosClaveProps {
  formData: {
    ruc: string
    razonSocial: string
  }
  setFormData: React.Dispatch<
    React.SetStateAction<{
      ruc: string
      razonSocial: string
    }>
  >
  isLoading: boolean
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
  isSaving: boolean
}

export default function FormularioDatosClave({
  formData,
  setFormData,
  isLoading,
  setIsLoading,
  isSaving,
}: FormularioDatosClaveProps) {
  const { toast } = useToast()

  // Manejar cambios en los inputs
  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))

    if (id === "ruc" && value.length === 11) {
      await fetchRucData(value)
    }
  }

  // Consultar datos del RUC
  const fetchRucData = async (ruc: string) => {
    if (ruc.length !== 11) return

    setIsLoading(true)
    try {
      const data = await fetchRucDataService(ruc)

      if (data.razonSocial) {
        setFormData((prev) => ({
          ...prev,
          razonSocial: data.razonSocial,
        }))
      } else {
        toast({
          title: "RUC no encontrado",
          description: "No se encontró información para el RUC ingresado",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un error al consultar el RUC",
        variant: "destructive",
      })
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md shadow-lg border-0 sm:shadow-lg sm:border sm:border-gray-200">
      <CardHeader>
        <CardTitle className="text-xl sm:text-2xl font-bold text-center sm:text-left">Algunos datos clave</CardTitle>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <form className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ruc">RUC</Label>
            <div className="relative">
              <Input
                id="ruc"
                placeholder="Ingrese su RUC"
                required
                type="text"
                maxLength={11}
                value={formData.ruc}
                onChange={handleInputChange}
                className={`${isLoading ? "pr-10" : ""} h-12 text-base`}
                disabled={isLoading || isSaving}
              />
              {isLoading && <Loader2 className="absolute right-3 top-2.5 h-5 w-5 animate-spin text-muted-foreground" />}
            </div>
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
              readOnly={isLoading}
              disabled={isLoading || isSaving}
              className="h-12 text-base"
            />
          </div>
        </form>
      </CardContent>
    </Card>
  )
}