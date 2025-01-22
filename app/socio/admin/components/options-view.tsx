"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function OptionsView() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-1">
          <Label>Nombre</Label>
          <Input placeholder="Ejemplo: Opción de guarniciones, Opción de extras" />
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="onePerOption" />
          <Label htmlFor="onePerOption">Una vez por opción</Label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Número mínimo de Opciones</Label>
          <Input type="number" placeholder="0" />
        </div>
        <div>
          <Label>Número máximo de Opciones</Label>
          <Input type="number" placeholder="1" />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-2">Opciones</h3>
        <p className="text-sm text-gray-500 mb-4">
          Agrega opciones para que tus clientes elijan, por ejemplo, papas fritas o ensalada. También puedes agregar
          productos que ya tienes en el menú como opción.
        </p>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input placeholder="Código De Barras" />
            </div>
            <Button className="bg-red-600 hover:bg-red-500/90 whitespace-nowrap">Búsqueda</Button>
          </div>

          <div className="space-y-4">
            {["Pollo", "Vegetariana"].map((option, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label>Nombre de la Opción</Label>
                  <Input value={option} readOnly />
                </div>
                <div>
                  <Label>Precio</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2">+NIO</span>
                    <Input className="pl-12" type="number" placeholder="0" />
                  </div>
                </div>
                <div className="col-span-1 md:col-span-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id={`age-${index}`} />
                    <Label htmlFor={`age-${index}`}>Este producto requiere confirmación de mayoría de edad</Label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

