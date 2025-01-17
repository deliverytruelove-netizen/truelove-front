'use client'

import { useState } from 'react'
import { Plus, Search, ChevronDown, LayoutGrid, ListPlus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

interface Section {
  id: number;
  name: string;
  isActive: boolean;
  products: Product[];
}

interface Product {
  id: number;
  name: string;
  price: number;
  image?: string;
  isAvailable: boolean;
}

function OptionsView() {
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
          Agrega opciones para que tus clientes elijan, por ejemplo, papas fritas o ensalada.
          También puedes agregar productos que ya tienes en el menú como opción.
        </p>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input placeholder="Código De Barras" />
            </div>
            <Button className="bg-red-600 hover:bg-red-500 /90 whitespace-nowrap">
              Búsqueda
            </Button>
          </div>

          <div className="space-y-4">
            {['Pollo', 'Vegetariana'].map((option, index) => (
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
                    <Label htmlFor={`age-${index}`}>
                      Este producto requiere confirmación de mayoría de edad
                    </Label>
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

export default function MenuPage() {
  const [activeView, setActiveView] = useState<'menu' | 'options'>('menu')
  const [sections] = useState<Section[]>([
    {
      id: 1,
      name: 'Desayuno',
      isActive: true,
      products: []
    },
    {
      id: 2,
      name: 'Almuerzo',
      isActive: true,
      products: [
        { id: 1, name: 'Pollo Tasty', price: 2500, isAvailable: true },
        { id: 2, name: 'Hamburguesa Clásica', price: 1000, isAvailable: true }
      ]
    },
    {
      id: 3,
      name: 'Platos vegetarianos',
      isActive: true,
      products: []
    },
    {
      id: 4,
      name: 'Bebidas',
      isActive: true,
      products: []
    }
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-6 px-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Menú</h1>
          <Select defaultValue="1">
            <SelectTrigger className="w-full sm:w-[280px]">
              <SelectValue placeholder="Seleccionar local" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Test Restaurant (363701)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-4">
                <nav className="flex lg:flex-col gap-2">
                  <Button
                    variant={activeView === 'menu' ? 'default' : 'ghost'}
                    className={cn(
                      "flex-1 lg:w-full justify-start",
                      activeView === 'menu' && "bg-red-600 hover:bg-red-600/90"
                    )}
                    onClick={() => setActiveView('menu')}
                  >
                    <LayoutGrid className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Secciones y productos</span>
                  </Button>
                  <Button
                    variant={activeView === 'options' ? 'default' : 'ghost'}
                    className={cn(
                      "flex-1 lg:w-full justify-start",
                      activeView === 'options' && "bg-red-600 hover:bg-red-600/90"
                    )}
                    onClick={() => setActiveView('options')}
                  >
                    <ListPlus className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Opciones y adicionales</span>
                  </Button>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
                <CardTitle>
                  {activeView === 'menu' ? 'Secciones y productos' : 'Opciones y adicionales'}
                </CardTitle>
                <Button className="bg-red-600 hover:bg-red-600/90">
                  <Plus className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">
                    {activeView === 'menu' ? 'Agregar nuevo' : 'Crear Opciones y adicionales'}
                  </span>
                  <span className="sm:hidden">Agregar</span>
                </Button>
              </CardHeader>
              <CardContent>
                {activeView === 'menu' ? (
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                      <Input
                        className="pl-10"
                        placeholder="Búsqueda"
                        type="search"
                      />
                    </div>
                    <div className="space-y-4">
                      {sections.map((section) => (
                        <div key={section.id} className="rounded-lg border">
                          <div className="flex items-center justify-between p-4 flex-wrap gap-4">
                            <div className="flex items-center space-x-4 flex-wrap">
                              <ChevronDown className="h-4 w-4 shrink-0" />
                              <h3 className="font-medium">{section.name}</h3>
                              <button className="text-red-500 text-sm whitespace-nowrap">
                                Editar sección
                              </button>
                            </div>
                            <Switch checked={section.isActive} />
                          </div>
                          {section.products.length > 0 && (
                            <div className="border-t p-4">
                              <div className="space-y-4">
                                {section.products.map((product) => (
                                  <div
                                    key={product.id}
                                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                                  >
                                    <div className="flex items-center space-x-4">
                                      <div className="h-10 w-10 bg-gray-200 rounded shrink-0" />
                                      <span className="font-medium">{product.name}</span>
                                    </div>
                                    <div className="flex items-center space-x-4 ml-14 sm:ml-0">
                                      <span className="text-gray-600">{product.price.toFixed(2)} NIO</span>
                                      <span className="text-green-500 text-sm whitespace-nowrap">
                                        • Disponible
                                      </span>
                                      <Button variant="ghost" size="sm" className="ml-auto sm:ml-0">
                                        <ChevronDown className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <OptionsView />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

