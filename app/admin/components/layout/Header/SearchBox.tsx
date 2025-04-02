// app\admin\components\layout\Header\SearchBox.tsx
"use client"

import type React from "react"

import { useEffect } from "react"
import { Search } from "lucide-react"

const SearchBox: React.FC = () => {
  // Atajo de teclado para enfocar el campo de búsqueda
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        const searchInput = document.getElementById("search-input")
        if (searchInput) {
          searchInput.focus()
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  return (
    <div className="flex-1 items-center justify-center lg:max-w-md">
      <div className="relative">
        <Search className="h-4 w-4 text-gray-500 absolute top-[50%] left-3 -translate-y-[50%]" />
        <input
          id="search-input"
          type="text"
          placeholder="Buscar o escribir comando..."
          className="border border-gray-200 pl-10 pr-16 rounded-full text-gray-700 w-full py-2 bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
        />
        <div className="absolute top-[50%] right-3 -translate-y-[50%] flex items-center">
          <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded text-xs text-gray-500 font-mono">
            ⌘K
          </kbd>
        </div>
      </div>
    </div>
  )
}

export default SearchBox

