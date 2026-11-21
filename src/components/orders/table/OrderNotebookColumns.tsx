"use client"

import { createColumnHelper } from "@tanstack/react-table"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { type DataTableFeatures } from "@/components/shared/table/data-table-features"
import { NOTEBOOK_STATUSES } from "@/utils/notebookStatus"
import type { OrderNotebookRow } from "@/interfaces"

const columnHelper = createColumnHelper<DataTableFeatures, OrderNotebookRow>()

export const orderNotebookColumns = (onRemove?: (notebook: OrderNotebookRow) => void) =>
  columnHelper.columns([
    columnHelper.accessor("name", {
      header: "Nombre de equipo",
      cell: ({ row }) => (
        <span>
          {row.original.name}
          {row.original.pending === "Pendiente" && (
            <span className="orders-pending-tag">Pendiente</span>
          )}
        </span>
      ),
    }),
    columnHelper.accessor("notebook.serialNumber", {
      header: "N.° de Serie",
    }),
    columnHelper.accessor("notebook.status", {
      header: "Estado",
      cell: ({ row }) =>
        row.original.pending === "Se quitará" && row.original.removeStatus ? (
          <span className="orders-removing-status" title="El equipo volverá al Inventario con este estado al guardar">
            {NOTEBOOK_STATUSES.find((state) => state.value === row.original.removeStatus)?.label ?? row.original.removeStatus}
          </span>
        ) : (
          <span className="inventory-table-status" data-status={String(row.original.notebook.status ?? "")}>{row.original.notebook.status}</span>
        ),
    }),
    columnHelper.accessor("notebook.specs", {
      header: "Especificaciones",
    }),
    columnHelper.display({
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => {
        const className =
          row.original.pending === "Se quitará"
            ? "orders-remove-icon size-7 text-destructive hover:text-destructive"
            : onRemove
              ? "orders-remove-icon size-7 text-muted-foreground hover:text-destructive"
              : "orders-remove-icon size-7 text-muted-foreground/50 hover:text-muted-foreground";

        return (
          <Button
            variant="ghost"
            size="icon-sm"
            className={className}
            aria-label={`Quitar equipo ${row.original.notebook.serialNumber?.toString() ?? ""}`}
            title={onRemove ? "Quitar de la orden" : "Quitar de la orden (solo disponible en modo edición)"}
            disabled={!onRemove}
            onClick={() => onRemove?.(row.original)}
          >
            <Trash2 aria-hidden="true" />
          </Button>
        );
      },
    }),
  ]);
