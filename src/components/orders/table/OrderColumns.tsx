"use client"

import { createColumnHelper } from "@tanstack/react-table"
import type { Tables } from "@/supabase/supabase"
import { type DataTableFeatures } from "@/components/shared/table/data-table-features"
import { formatDeliveryDate } from "@/utils/order"

type OrderRow = Tables<"orders">

const columnHelper = createColumnHelper<DataTableFeatures, OrderRow>()

export const orderColumns = columnHelper.columns([
  columnHelper.accessor("recipient", {
    header: "Destinatario",
  }),
  columnHelper.accessor("deliveryDate", {
    header: "Fecha de entrega",
    cell: ({ row }) => formatDeliveryDate(row.original.deliveryDate),
  }),
  columnHelper.accessor("status", {
    header: "Estado",
  }),
])
