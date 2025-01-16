'use client'

import { useState, useEffect } from 'react'
import { Menu, User, Plus, Edit, Trash } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Link from 'next/link'

// Tipo para los elementos del menú
type MenuItem = {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
}

export default function MenuPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [newItem, setNewItem] = useState<Omit<MenuItem, 'id'>>({ name: '', description: '', price: 0, category: '' })

  useEffect(() => {
    // Obtener el email del usuario del localStorage
    const user = localStorage.getItem('user')
    if (user) {
      const userData = JSON.parse(user)
      setUserEmail(userData.email)
    }

    // Simular la carga de elementos del menú desde una API
    setMenuItems([
      { id: 1, name: 'Hamburguesa Clásica', description: 'Carne, lechuga, tomate, queso', price: 15, category: 'Hamburguesas' },
      { id: 2, name: 'Pizza Margherita', description: 'Salsa de tomate, mozzarella, albahaca', price: 20, category: 'Pizzas' },
      { id: 3, name: 'Ensalada César', description: 'Lechuga, pollo, crutones, aderezo césar', price: 12, category: 'Ensaladas' },
    ])
  }, [])

  const handleAddItem = () => {
    setMenuItems([...menuItems, { ...newItem, id: Date.now() }])
    setNewItem({ name: '', description: '', price: 0, category: '' })
  }

  const handleDeleteItem = (id: number) => {
    setMenuItems(menuItems.filter(item => item.id !== id))
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className={`bg-white w-64 min-h-screen p-4 ${sidebarOpen ? '' : 'hidden'} md:block`}>
        <nav>
          <h2 className="text-xl font-bold mb-4">Menu</h2>
          <ul>
            {[
              { name: 'Dashboard', href: '/socio/admin' },
              { name: 'Menú', href: '/socio/admin/menu' },
              { name: 'Pedidos', href: '/socio/admin/pedidos' },
              { name: 'Finanzas', href: '/socio/admin/finanzas' },
              { name: 'Configuración', href: '/socio/admin/configuracion' }
            ].map((item) => (
              <li key={item.name} className="mb-2">
                <Link href={item.href}>
                  <Button variant="ghost" className="w-full justify-start">{item.name}</Button>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <Button variant="ghost" className="md:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <Menu className="h-6 w-6" />
            </Button>
            <h1 className="text-2xl font-semibold text-gray-900">Gestión de Menú</h1>
            <div className="flex items-center">
              <span className="mr-2">{userEmail}</span>
              <User className="h-8 w-8 text-gray-500" />
            </div>
          </div>
        </header>

        {/* Menu Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            {/* Add New Item Form */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Agregar Nuevo Producto</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="name">Nombre del Producto</Label>
                      <Input 
                        id="name" 
                        value={newItem.name} 
                        onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="price">Precio</Label>
                      <Input 
                        id="price" 
                        type="number" 
                        value={newItem.price} 
                        onChange={(e) => setNewItem({...newItem, price: parseFloat(e.target.value)})}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea 
                      id="description" 
                      value={newItem.description} 
                      onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Categoría</Label>
                    <Input 
                      id="category" 
                      value={newItem.category} 
                      onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                    />
                  </div>
                  <Button type="button" onClick={handleAddItem}>
                    <Plus className="mr-2 h-4 w-4" /> Agregar Producto
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Menu Items List */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {menuItems.map((item) => (
                <Card key={item.id}>
                  <CardHeader>
                    <CardTitle>{item.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500 mb-2">{item.description}</p>
                    <p className="font-bold">S/ {item.price.toFixed(2)}</p>
                    <p className="text-sm text-gray-500 mt-2">Categoría: {item.category}</p>
                    <div className="mt-4 flex justify-end space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="mr-2 h-4 w-4" /> Editar
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteItem(item.id)}>
                        <Trash className="mr-2 h-4 w-4" /> Eliminar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

