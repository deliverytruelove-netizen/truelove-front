// app\reparto\components\form-steps\StepOne.tsx
"use client"

import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface StepOneProps {
  departamento: string
  onDepartamentoChange: (value: string) => void
}

export function StepOne({ departamento, onDepartamentoChange }: StepOneProps) {
  return (
    <div className="space-y-4">
      <Label className="text-lg font-medium text-gray-900">Selecciona tu ciudad</Label>
      <Select value={departamento} onValueChange={onDepartamentoChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Elige ciudad/zona de reparto" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="AREQUIPA">AREQUIPA</SelectItem>
          <SelectItem value="HUACHO">HUACHO</SelectItem>
          <SelectItem value="LIMA">LIMA</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

