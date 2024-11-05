import { flexRender, type Table } from '@tanstack/react-table'
import classNames from 'classnames'
import { RiArrowUpLine } from 'react-icons/ri'

interface Props {
  table: Table<any>
}

export const MainTable: React.FC<Props> = ({ table }) => {
  return (
    <table className="relative table-auto w-full min-w-[750px]">
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th
                key={header.id}
                scope="col"
                className="sticky top-0 px-2 lg:px-5 py-3 whitespace-nowrap text-color-main text-xs uppercase bg-secondary-100"
                align="left"
              >
                {header.isPlaceholder ? null : (
                  <div
                    className={classNames({
                      'flex items-center gap-2': true,
                      'cursor-pointer select-none': header.column.getCanSort()
                    })}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    <RiArrowUpLine
                      className={classNames({
                        'text-lg': true,
                        'opacity-0': header.column.getIsSorted() === false,
                        'rotate-0': header.column.getIsSorted() === 'asc',
                        'rotate-180': header.column.getIsSorted() === 'desc'
                      })}
                    />
                  </div>
                )}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody className="text-color-main text-xs">
        {table.getRowModel().rows.map((row) => (
          <tr
            key={row.id}
            className="border-b hover:bg-secondary-50/90 transition-colors"
          >
            {row.getVisibleCells().map((cell) => (
              <td scope="row" key={cell.id} className="px-2 lg:px-5 py-4">
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default MainTable
