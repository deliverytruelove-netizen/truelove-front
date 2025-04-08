// app\admin\components\layout\Header\SearchBox.tsx
"use client"

import type React from "react"
import { useEffect } from "react"
import { Search } from "lucide-react"

const SearchBox: React.FC = () => {
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
    <div className="relative w-full">
      <Search className="h-4 w-4 text-gray-500 absolute top-[50%] left-2 sm:left-3 -translate-y-[50%]" />
      <input
        id="search-input"
        type="text"
        placeholder="Buscar..."
        className="w-full h-9 pl-8 sm:pl-10 pr-4 sm:pr-12 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all bg-white"
      />
      <div className="absolute top-[50%] right-2 sm:right-3 -translate-y-[50%] hidden sm:flex items-center">
        <kbd className="hidden sm:block px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded text-xs text-gray-500 font-mono">
          ⌘K
        </kbd>
      </div>
    </div>
  )
}

export default SearchBox