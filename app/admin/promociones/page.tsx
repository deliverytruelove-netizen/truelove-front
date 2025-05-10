// app\admin\promociones\page.tsx
"use client"

import type React from "react"
import MainLayout from "../components/MainLayout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import GestionBanner from "./components/GestionBnner"
import GestionPromociones from "./components/GestionPromociones"
import GestionDescuentos from "./components/GestionDescuentos"

const Promociones: React.FC = () => {
  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <Tabs defaultValue="banners" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="banners">Banners</TabsTrigger>
            <TabsTrigger value="promociones">Promociones</TabsTrigger>
            <TabsTrigger value="descuentos">Descuentos</TabsTrigger>
          </TabsList>

          <TabsContent value="banners">
            <GestionBanner />
          </TabsContent>

          <TabsContent value="promociones">
            <GestionPromociones />
          </TabsContent>

          <TabsContent value="descuentos">
            <GestionDescuentos />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}

export default Promociones