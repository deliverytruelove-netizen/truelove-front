import { type Table } from '@tanstack/react-table'

/**
 * Get state table
 * @param table Table
 * @returns Object with total rows, first index and last index
 */
export const getStateTable = <T>(
  table: Table<T>
): {
  totalRows: number
  firstIndex: number
  lastIndex: number
} => {
  const totalRows = table.getFilteredRowModel().rows.length
  const pageSize = table.getState().pagination.pageSize
  const pageIndex = table.getState().pagination.pageIndex
  const rowsPerPage = table.getRowModel().rows.length
  const firstIndex = pageIndex * pageSize + 1
  const lastIndex = pageIndex * pageSize + rowsPerPage

  return {
    totalRows,
    firstIndex,
    lastIndex
  }
}
