import { PreviousLimitIcon } from '@/components/icons'
import { type Table } from '@tanstack/react-table'
import { RiArrowLeftSLine } from 'react-icons/ri'
import { getStateTable } from './utils'
import { DEFAULT_PAGE_SIZE } from '../../../config/constanst'

interface Props<T> {  
  table: Table<T>  
}

export const Pagination= <T,>({ table }: Props<T>) => { 
  return (
    <div className="sticky bottom-0 bg-white flex flex-col sm:flex-row sm:justify-between border-t items-center px-2 lg:px-5 py-4">
      <div className="flex justify-between sm:justify-normal w-full items-center gap-4">
        <select
          defaultValue={DEFAULT_PAGE_SIZE}
          className="border text-color-main rounded-sm outline-primary-400 py-2 px-3"
          onChange={(e) => {
            table.setPageSize(+e.target.value)
          }}
        >
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="20">20</option>
        </select>
        <div className="text-color-main whitespace-nowrap">
          {getStateTable(table).firstIndex > getStateTable(table).lastIndex
            ? getStateTable(table).lastIndex
            : getStateTable(table).firstIndex}{' '}
          - {getStateTable(table).lastIndex}{' '}
          {getStateTable(table).totalRows === 0
            ? getStateTable(table).lastIndex
            : 'muchas'}
        </div>
      </div>
      <div className="flex items-center justify-center gap-1">
        <button
          className="hover:bg-gray-100 p-1 rounded-full transition-colors"
          onClick={() => {
            table.setPageIndex(0)
          }}
        >
          <PreviousLimitIcon className="text-2xl text-color-main" />
        </button>
        <button
          className="enabled:hover:bg-gray-100 disabled:text-color-main/50 p-1 rounded-full transition-colors text-color-main"
          onClick={() => {
            table.previousPage()
          }}
          disabled={!table.getCanPreviousPage()}
        >
          <RiArrowLeftSLine className="text-2xl" />
        </button>
        <button
          className="enabled:hover:bg-gray-100 disabled:text-color-main/50 p-1 rounded-full transition-colors rotate-180 text-color-main"
          onClick={() => {
            table.nextPage()
          }}
          disabled={!table.getCanNextPage()}
        >
          <RiArrowLeftSLine className="text-2xl" />
        </button>
        <button
          className="hover:bg-gray-100 p-1 rounded-full transition-colors rotate-180"
          onClick={() => {
            table.setPageIndex(table.getPageCount() - 1)
          }}
        >
          <PreviousLimitIcon className="text-2xl text-color-main" />
        </button>
      </div>
    </div>
  )
}

export default Pagination
