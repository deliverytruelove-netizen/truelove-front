import { rankItem } from '@tanstack/match-sorter-utils'
import { type FilterFnOption, type Row } from '@tanstack/react-table'

/**
 * Filter records
 * @param row - Row data to filter
 * @param columnId - Column id
 * @param value - Value to filter
 * @param addMeta - Add meta data
 * @returns - Boolean
 */
export const filterRecords: FilterFnOption<any> = (
  row: Row<any>,  
  columnId: string,
  value: string | number,
  addMeta: (meta: { itemRank: any }) => void
) => {
  const itemRank = rankItem(row.getValue(columnId), String(value))

  addMeta({ itemRank })

  return itemRank.passed
}
