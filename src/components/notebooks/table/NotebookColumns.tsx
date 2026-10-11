"use client"

import { createColumnHelper } from "@tanstack/react-table"
import { type DataTableFeatures } from "./data-table-features"
import type { Notebook } from "@/interfaces"


// Use `accessor` for data columns and `display` for columns without one.
const columnHelper = createColumnHelper<DataTableFeatures, Notebook>()


export const columns = columnHelper.columns([
  columnHelper.accessor("brand", {
    header: "Equipo",
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
  columnHelper.accessor("entryDate", {
    header: "Ingreso",
  }),

])