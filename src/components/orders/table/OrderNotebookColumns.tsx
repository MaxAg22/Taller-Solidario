"use client"

import { createColumnHelper } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { type DataTableFeatures } from "@/components/shared/table/data-table-features"
import type { OrderTeam } from "@/interfaces"

const columnHelper = createColumnHelper<DataTableFeatures, OrderTeam>()

export const orderNotebookColumns = (onRemove?: (notebook: OrderTeam) => void) =>
  columnHelper.columns([
    columnHelper.accessor("name", {
      header: "Nombre de equipo",
      cell: ({ row }) => (
        <span>
          {row.original.name}
          {row.original.pending && (
            <span className="orders-team-tag">{row.original.pending}</span>
          )}
        </span>
      ),
    }),
    columnHelper.accessor("serialNumber", {
      header: "N.° de Serie",
    }),
    columnHelper.accessor("status", {
      header: "Estado",
    }),
    columnHelper.accessor("specs", {
      header: "Especificaciones",
    }),
    columnHelper.display({
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => (
        onRemove ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onRemove(row.original)}
          >
            Quitar
          </Button>
        ) : null
      ),
    }),
  ])
