"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import type { FormData } from "../../types/form-types"

interface StepFourProps {
  formData: FormData
  updateFormData: (field: keyof FormData, value: FormData[keyof FormData]) => void
}

export function StepFour({ formData, updateFormData }: StepFourProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label>¿Tienes más de 18 años?</Label>
        <RadioGroup
          value={formData.mayorEdad}
          onValueChange={(value) => updateFormData("mayorEdad", value)}
          className="flex space-x-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="si" id="si" />
            <Label htmlFor="si">Sí</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="no" id="no" />
            <Label htmlFor="no">No</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>Código</Label>
          <Select defaultValue="+51">
            <SelectTrigger>
              <SelectValue placeholder="+51" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="+51">+51</SelectItem>
              <SelectItem value="+54">+54</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-2">
          <Label htmlFor="celular">Número de celular</Label>
          <Input
            id="celular"
            type="tel"
            value={formData.celular}
            onChange={(e) => updateFormData("celular", e.target.value)}
            required
            maxLength={9}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="email">Correo electrónico</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => updateFormData("email", e.target.value)}
          required
        />
      </div>

      <div className="flex items-start space-x-2 ">
        <Checkbox
          id="politica"
          checked={formData.aceptaPolitica}
          onCheckedChange={(checked: boolean) => updateFormData("aceptaPolitica", checked)}
        />
        <Label htmlFor="politica" className="text-sm text-gray-500">
          Estoy de acuerdo con la política de privacidad y acepto ser contactado por canales de terceros.
        </Label>
      </div>
    </div>
  )
}
