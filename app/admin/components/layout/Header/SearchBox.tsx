// app\admin\components\layout\Header\SearchBox.tsx
"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Search } from "lucide-react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { Button } from "@/components/ui/button"
import { DialogTitle } from "@/components/ui/dialog"
import { useNavigation } from "../../../context/navigation-context"
import { useRouter } from "next/navigation"

const SearchBox: React.FC = () => {
  const [open, setOpen] = useState(false)
  const { navItems } = useNavigation()
  const router = useRouter()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  const handleSelect = (path: string) => {
    router.push(path)
    setOpen(false)
  }

  // Separar los elementos de navegación por categoría
  const mainNavItems = navItems.filter((item) => item.path === "/admin/dashboard")
  const userNavItems = navItems.filter((item) => item.path !== "/admin/dashboard")

  return (
    <>
      <Button
        variant="outline"
        className="relative w-72 justify-start text-sm text-muted-foreground h-9 px-2 sm:px-3 border-gray-200 hover:border-red-300 hover:bg-white hover:text-red-500 transition-colors"
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4 mr-2" />
        <span>Buscar...</span>
        <kbd className="pointer-events-none absolute right-2 sm:right-3 hidden h-5 select-none items-center gap-1 rounded border bg-gray-50 px-1.5 font-mono text-[10px] font-medium text-gray-500 opacity-100 sm:flex">
          ⌘K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <DialogTitle className="sr-only">Búsqueda</DialogTitle>
        <CommandInput placeholder="¿Qué estás buscando?" />
        <CommandList>
          <CommandEmpty>
            <div className="flex flex-col items-center justify-center py-6">
              <Search className="h-10 w-10 text-gray-300 mb-2" />
              <p>No se encontraron resultados.</p>
              <p className="text-xs text-gray-500 mt-1">Intenta con otra búsqueda</p>
            </div>
          </CommandEmpty>

          {mainNavItems.length > 0 && (
            <CommandGroup heading="Principal">
              {mainNavItems.map((item) => (
                <CommandItem key={item.path} onSelect={() => handleSelect(item.path)}>
                  <item.icon className="mr-2 h-4 w-4 text-red-500" />
                  <span>{item.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {userNavItems.length > 0 && (
            <>
              {mainNavItems.length > 0 && <CommandSeparator />}
              <CommandGroup heading="Gestión de Usuarios">
                {userNavItems.map((item) => (
                  <CommandItem key={item.path} onSelect={() => handleSelect(item.path)}>
                    <item.icon className="mr-2 h-4 w-4 text-red-500" />
                    <span>{item.title}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          <CommandSeparator />
          <div className="px-3 py-3 text-xs text-gray-500 text-center">
            Presiona <kbd className="px-1 py-0.5 bg-gray-50 border border-gray-200 rounded text-xs">↑</kbd>{" "}
            <kbd className="px-1 py-0.5 bg-gray-50 border border-gray-200 rounded text-xs">↓</kbd> para navegar,{" "}
            <kbd className="px-1 py-0.5 bg-gray-50 border border-gray-200 rounded text-xs">Enter</kbd> para seleccionar
          </div>
        </CommandList>
      </CommandDialog>
    </>
  )
}

export default SearchBox
