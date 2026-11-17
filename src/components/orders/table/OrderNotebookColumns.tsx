"use client"

import { createColumnHelper } from "@tanstack/react-table"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { type DataTableFeatures } from "@/components/shared/table/data-table-features"
import { NOTEBOOK_STATUSES } from "@/utils/notebookStatus"
import type { OrderTeam } from "@/interfaces"

const columnHelper = createColumnHelper<DataTableFeatures, OrderTeam>()

export const orderNotebookColumns = (onRemove?: (notebook: OrderTeam) => void) =>
  columnHelper.columns([
    columnHelper.accessor("name", {
      header: "Nombre de equipo",
    }),
    columnHelper.accessor("serialNumber", {
      header: "N.° de Serie",
    }),
    columnHelper.accessor("status", {
      header: "Estado",
      cell: ({ row }) =>
        row.original.pending === "Se quitará" && row.original.removeStatus ? (
          <span className="orders-removing-status" title="El equipo volverá al Inventario con este estado al guardar">
            {NOTEBOOK_STATUSES.find((state) => state.value === row.original.removeStatus)?.label ?? row.original.removeStatus}
          </span>
        ) : (
          <span className="inventory-table-status" data-status={String(row.original.status)}>{row.original.status}</span>
        ),
    }),
    columnHelper.accessor("specs", {
      header: "Especificaciones",
    }),
    columnHelper.display({
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => {
        if (!onRemove) {
          return (
            <Button
              variant="ghost"
              size="icon-sm"
              className="orders-remove-icon size-7 text-muted-foreground/50 hover:text-muted-foreground"
              aria-label={`Quitar equipo ${row.original.serialNumber}`}
              title="Quitar de la orden (solo disponible en modo edición)"
              disabled
            >
              <Trash2 aria-hidden="true" />
            </Button>
          );
        }

        if (row.original.pending === "Se quitará") {
          return (
            <Button
              variant="ghost"
              size="icon-sm"
              className="orders-remove-icon size-7 text-destructive hover:text-destructive"
              aria-label={`Quitar equipo ${row.original.serialNumber}`}
              title="Quitar de la orden"
              onClick={() => onRemove(row.original)}
            >
              <Trash2 aria-hidden="true" />
            </Button>
          );
        }

        return (
          <Button
            variant="ghost"
            size="icon-sm"
            className="orders-remove-icon size-7 text-muted-foreground hover:text-destructive"
            aria-label={`Quitar equipo ${row.original.serialNumber}`}
            title="Quitar de la orden"
            onClick={() => onRemove(row.original)}
          >
            <Trash2 aria-hidden="true" />
          </Button>
        );
      },
    }),
  ]);
