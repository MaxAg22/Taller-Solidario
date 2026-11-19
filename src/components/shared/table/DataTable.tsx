"use client"

import {
  FlexRender,
  useTable,
  type ColumnDef,
  type OnChangeFn,
  type PaginationState,
  type RowData,
} from "@tanstack/react-table"

import { cn } from "@/lib/utils"
import { features, type DataTableFeatures } from "./data-table-features"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface RowState<TData> {
  get: (row: TData) => string | null
  style: Record<string, string>
}

interface DataTableProps<TData extends RowData> {
  columns: ColumnDef<DataTableFeatures, TData, any>[]
  data: TData[]
  rowState?: RowState<TData>
  pagination?: PaginationState
  setPagination?: OnChangeFn<PaginationState>
  rowCount?: number
  onRowClick?: (row: TData) => void
  emptyMessage?: string
  isLoading?: boolean
}

export function DataTable<TData extends RowData>({
  columns,
  data,
  rowState,
  pagination,
  setPagination,
  rowCount,
  onRowClick,
  emptyMessage = "No hay equipos disponibles.",
  isLoading = false,
}: DataTableProps<TData>) {
  const table = useTable({
    features,
    data,
    columns,
    state: pagination ? { pagination } : {},
    onPaginationChange: setPagination,
    manualPagination: true,
    rowCount,
  })

  return (
    <div className="inventory-table-panel">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : (
                      <FlexRender header={header} />
                    )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className={cn(
                  onRowClick ? "cursor-pointer focus-visible:outline-2 focus-visible:outline-primary focus-visible:-outline-offset-2" : undefined,
                  rowState?.style[rowState.get(row.original) ?? ""],
                )}
                tabIndex={onRowClick ? 0 : undefined}
                onClick={() => onRowClick?.(row.original)}
                onKeyDown={(event) => {
                  if (event.target === event.currentTarget && (event.key === "Enter" || event.key === " ")) {
                    event.preventDefault()
                    onRowClick?.(row.original)
                  }
                }}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    data-column={cell.column.id}
                    onClick={cell.column.id === "actions" ? (event) => event.stopPropagation() : undefined}
                  >
                    {cell.column.id === "status" ? (
                      <span className="inventory-table-status" data-status={String(cell.getValue())}>
                        <FlexRender cell={cell} />
                      </span>
                    ) : (
                      <FlexRender cell={cell} />
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="inventory-table-empty">
                {isLoading ? "Cargando…" : emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {pagination && setPagination && (
        <div className="inventory-table-pagination">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={isLoading || !table.getCanPreviousPage()}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={isLoading || !table.getCanNextPage()}
          >
            Siguiente
          </Button>
        </div>
      )}
    </div>
  )
}
