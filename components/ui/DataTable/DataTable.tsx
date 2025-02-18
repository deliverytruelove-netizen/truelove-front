"use client"

import type React from "react"

import { CircleSpinner, NoDataIcon } from "@/components/icons"
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type PaginationState,
  type RowSelectionState,
  type Row,
  flexRender,
} from "@tanstack/react-table"
import { useEffect, useState } from "react"

interface Props<T> {
  columns: Array<ColumnDef<T, unknown>>
  data: T[]
  globalFilter: string
  loading?: boolean
  setSorting: React.Dispatch<React.SetStateAction<SortingState>>
  setPagination: React.Dispatch<React.SetStateAction<PaginationState>>
  sorting: SortingState
  pagination: PaginationState
  getRowId?: (originalRow: T, index: number, parent?: Row<T> | undefined) => string
  setSelectedRowsParent?: React.Dispatch<React.SetStateAction<Array<T>>>
  height?: number
}

const DataTable = <T,>({
  columns,
  data,
  globalFilter,
  sorting,
  pagination,
  loading = false,
  setSorting,
  setPagination,
  getRowId,
  setSelectedRowsParent,
  height = undefined,
}: Props<T>) => {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  const table = useReactTable({
    data,
    columns,
    pageCount: Math.ceil(data.length / pagination.pageSize),
    state: {
      globalFilter,
      sorting,
      pagination,
      rowSelection,
    },
    enableSorting: true,
    manualPagination: true,
    getRowId: getRowId ? (originalRow, index, parent) => String(getRowId(originalRow, index, parent)) : undefined,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
  })

  useEffect(() => {
    if (setSelectedRowsParent) {
      const selectedRows = table.getSelectedRowModel().rows.map((row) => row.original)
      setSelectedRowsParent(selectedRows as T[])
    }
  }, [setSelectedRowsParent, table]) // Removed rowSelection from dependencies

  const tableHeight = height ?? (data.length === 0 ? 210 : 500)

  return (
    <div className="relative bg-white rounded-md border">
      <div className="relative" style={{ height: `${tableHeight}px` }}>
        {/* Tabla con header fijo */}
        <div className="overflow-auto h-full">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 z-10 bg-white border-b">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="h-12 px-4 text-left align-middle font-medium text-muted-foreground bg-white"
                      style={{
                        width: header.getSize(),
                        minWidth: header.getSize(),
                      }}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-b transition-colors hover:bg-muted/50">
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="p-4 align-middle"
                      style={{
                        width: cell.column.getSize(),
                        minWidth: cell.column.getSize(),
                      }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Estados de carga y sin datos */}
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
            <span className="text-xl text-color-main/50 mb-4">Cargando registros...</span>
            <CircleSpinner style={{ opacity: 0.5 }} />
          </div>
        )}

        {!loading && data.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white">
            <span className="text-xl text-color-main/50 mb-4">No se encontraron registros para mostrar</span>
            <NoDataIcon className="text-7xl opacity-50" />
          </div>
        )}
      </div>

      {/* Paginación */}
      {data.length > 0 && (
        <div className="border-t p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Anterior
            </button>
            <button
              className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default DataTable

