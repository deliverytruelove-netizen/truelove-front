// components/ui/pagination.tsx
"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  perPage: number
  onPageChange: (page: number) => void
  onPerPageChange: (perPage: number) => void
  itemsInCurrentPage: number
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  perPage,
  onPageChange,
  onPerPageChange,
  itemsInCurrentPage,
}: PaginationProps) {
  // Calcular el rango de elementos mostrados
  const startItem = itemsInCurrentPage > 0 ? (currentPage - 1) * perPage + 1 : 0
  const endItem = Math.min(currentPage * perPage, totalItems)

  // Generar array de números de página a mostrar
  const getPageNumbers = () => {
    const maxPagesToShow = window.innerWidth < 640 ? 3 : 5
    const pages: number[] = []

    if (totalPages <= maxPagesToShow) {
      // Mostrar todas las páginas si son pocas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Lógica para mostrar páginas con elipsis
      if (currentPage <= Math.floor(maxPagesToShow / 2) + 1) {
        // Cerca del inicio
        for (let i = 1; i <= maxPagesToShow; i++) {
          pages.push(i)
        }
      } else if (currentPage >= totalPages - Math.floor(maxPagesToShow / 2)) {
        // Cerca del final
        for (let i = totalPages - maxPagesToShow + 1; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        // En el medio
        for (let i = currentPage - Math.floor(maxPagesToShow / 2); i <= currentPage + Math.floor(maxPagesToShow / 2); i++) {
          pages.push(i)
        }
      }
    }

    return pages
  }

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 p-3 sm:p-4 border-t">
      {/* Selector de items por página */}
      <div className="flex items-center gap-2 text-xs sm:text-sm">
        <span className="text-gray-500 hidden sm:inline">Mostrar</span>
        <Select
          value={perPage.toString()}
          onValueChange={(value) => onPerPageChange(Number(value))}
        >
          <SelectTrigger className="w-[60px] sm:w-[70px] h-8 text-xs sm:text-sm">
            <SelectValue placeholder={perPage.toString()} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5</SelectItem>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="25">25</SelectItem>
            <SelectItem value="50">50</SelectItem>
            <SelectItem value="100">100</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-gray-500 hidden sm:inline">por página</span>
      </div>

      {/* Información de rango */}
      <div className="flex items-center gap-1 order-3 sm:order-2">
        <span className="text-xs sm:text-sm text-gray-500">
          <span className="sm:hidden">
            {startItem}-{endItem} de {totalItems}
          </span>
          <span className="hidden sm:inline">
            Mostrando {startItem} a {endItem} de {totalItems} resultados
          </span>
        </span>
      </div>

      {/* Controles de paginación */}
      <div className="flex items-center order-2 sm:order-3">
        {/* Primera página */}
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="h-7 w-7 sm:h-8 sm:w-8"
        >
          <ChevronsLeft className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>

        {/* Página anterior */}
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-7 w-7 sm:h-8 sm:w-8 ml-1"
        >
          <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>

        {/* Números de página */}
        <div className="flex items-center mx-1 sm:mx-2">
          {getPageNumbers().map((pageNum) => (
            <Button
              type="button"
              key={pageNum}
              variant={currentPage === pageNum ? "default" : "outline"}
              size="icon"
              onClick={() => onPageChange(pageNum)}
              className={`h-7 w-7 sm:h-8 sm:w-8 mx-0.5 text-xs sm:text-sm ${
                currentPage === pageNum ? "bg-red-600 hover:bg-red-700" : ""
              }`}
            >
              {pageNum}
            </Button>
          ))}
        </div>

        {/* Página siguiente */}
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-7 w-7 sm:h-8 sm:w-8 mr-1"
        >
          <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>

        {/* Última página */}
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="h-7 w-7 sm:h-8 sm:w-8"
        >
          <ChevronsRight className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
      </div>
    </div>
  )
}
