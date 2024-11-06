'use client'

import { CircleSpinner, NoDataIcon } from '@/components/icons'
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
  type Row  // Agrega esta importación
} from '@tanstack/react-table';
import classNames from 'classnames'
import { MainTable } from './MainTable'
import Pagination from './Pagination'
import { filterRecords } from './utils'
import { useEffect, useState } from 'react'

interface Props<T> {
  columns: Array<ColumnDef<T, unknown>>;
  data: T[];
  globalFilter: string;
  loading?: boolean;
  setSorting: React.Dispatch<React.SetStateAction<SortingState>>;
  setPagination: React.Dispatch<React.SetStateAction<PaginationState>>;
  sorting: SortingState;
  pagination: PaginationState;
  getRowId?: (originalRow: T, index: number, parent?: Row<T> | undefined) => string;
  state?: unknown;
  setSelectedRowsParent?: React.Dispatch<React.SetStateAction<Array<T>>>;
  height?: number;
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
  state,
  setSelectedRowsParent,
  height = undefined
}: Props<T>) => {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const table = useReactTable({
    data,
    columns,
    pageCount:
      pagination.pageSize === data.length
        ? pagination.pageIndex + 2
        : pagination.pageIndex + 1,
    state: {
      globalFilter,
      sorting,
      pagination,
      rowSelection
    },
    manualSorting: true,
    manualPagination: true,
    getRowId: getRowId
      ? (originalRow, index, parent) => String(getRowId(originalRow, index, parent))
      : undefined,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: filterRecords,
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection
  });

  useEffect(() => {
    const handleSelectionState = (selections: RowSelectionState): void => {
      if (setSelectedRowsParent) {
        setSelectedRowsParent((prev) =>
          Object.keys(selections).map((key) =>
            table.getSelectedRowModel().rowsById[key]?.original as T
          )
        );
      }
    };

    handleSelectionState(rowSelection);
  }, [rowSelection, setSelectedRowsParent, table]);

  return (
    <div>
      <div
        className={classNames({
          'overflow-x-auto relative': true,
          'h-[210px]': data.length === 0 && height === undefined,
          'h-[500px]': data.length > 0 && height === undefined,
          [`h-[${height}px]`]: height !== undefined
        })}
      >
        <MainTable table={table} />
        {loading && (
          <div className="w-full sticky left-0 text-center text-color-main flex flex-col gap-4 items-center text-sm py-4">
            <span className="text-xl text-color-main/50">
              Cargando registros...
            </span>
            <CircleSpinner style={{ opacity: 0.5 }} />
          </div>
        )}
        {!loading && data.length === 0 && (
          <div className="w-full sticky left-0 text-center text-color-main flex flex-col gap-4 items-center text-sm py-4">
            <span className="text-xl text-color-main/50">
              No se encontraron registros para mostrar
            </span>
            <NoDataIcon className="text-7xl opacity-50" />
          </div>
        )}
      </div>
      {(data.length > 0 || pagination.pageIndex > 0) && (
        <Pagination table={table} />
      )}
    </div>
  );
};

export default DataTable;
