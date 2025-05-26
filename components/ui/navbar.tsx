// components\ui\navbar.tsx
"use client"

import type * as React from "react"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import Logotipo from "@/src/assets/img/logotipo.png"
import { saveCurrentProgress } from "@/services/registrationDataService"

interface NavbarProps {
  showSaveButton?: boolean
  children?: React.ReactNode
}

export default function NavbarWithSave({ showSaveButton = true, children }: NavbarProps) {
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()

  const handleSaveAndExit = async () => {
    setIsSaving(true)
    try {
      const result = await saveCurrentProgress(pathname)

      if (result.success) {
        toast({
          title: "Progreso guardado",
          description: "Tu progreso ha sido guardado exitosamente",
        })
        router.push("/")
      } else {
        toast({
          title: "Error",
          description: result.message || "Error al guardar el progreso",
          variant: "destructive",
        })
      }
    } catch  {
      toast({
        title: "Error",
        description: "Error al guardar el progreso",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <nav className="bg-[#e9eeea] py-2 w-full top-0 z-50 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex-shrink-0">
            <Image
              src={Logotipo || "/placeholder.svg"}
              alt="Logotipo"
              width={120}
              height={100}
              className="h-12 w-auto"
              priority
            />
          </Link>

          <div className="flex items-center space-x-4">
            {showSaveButton && (
              <Button
                onClick={handleSaveAndExit}
                disabled={isSaving}
                variant="default"
                className="bg-[#f34739] text-white hover:bg-[#d63c30] transition-all duration-300"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Guardar y salir"
                )}
              </Button>
            )}
            {children}
          </div>
        </div>
      </div>
    </nav>
  )
}
