"use client"

import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface StepTwoProps {
  vehiculo: string
  onVehiculoChange: (value: string) => void
}

export function StepTwo({ vehiculo, onVehiculoChange }: StepTwoProps) {
  return (
    <div className="space-y-4">
      <Label className="text-lg font-medium text-gray-900">Selecciona tu vehículo</Label>
      <Select value={vehiculo} onValueChange={onVehiculoChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Elige tu vehículo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="MOTO">MOTO</SelectItem>
          <SelectItem value="BICICLETA">BICICLETA</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

