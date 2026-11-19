import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createColumnHelper } from "@tanstack/react-table";
import { describe, expect, it, vi } from "vitest";
import { DataTable } from "@/components/shared/table/DataTable";
import { type DataTableFeatures } from "@/components/shared/table/data-table-features";

interface Row {
  id: string;
  name: string;
}

const columnHelper = createColumnHelper<DataTableFeatures, Row>();
const columns = [columnHelper.accessor("name", { header: "Nombre" })];

const data: Row[] = [
  { id: "1", name: "Equipo uno" },
  { id: "2", name: "Equipo dos" },
];

function dataRows() {
  return screen.getAllByRole("row").filter((row) => row.querySelector("td"));
}

describe("DataTable", () => {
  it("con rowState: la fila con estado recibe la clase mapeada y la fila sin estado no", () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        rowState={{
          get: (row) => (row.id === "2" ? "removing" : null),
          style: { removing: "orders-row-removing" },
        }}
      />,
    );

    const rows = dataRows();
    expect(rows).toHaveLength(2);
    expect(rows[0].className).not.toContain("orders-row-removing");
    expect(rows[1].className).toContain("orders-row-removing");
  });

  it("sin rowState: ninguna fila tiene clase de estado", () => {
    render(<DataTable columns={columns} data={data} />);

    const rows = dataRows();
    expect(rows).toHaveLength(2);
    rows.forEach((row) => expect(row.className).not.toContain("orders-row-"));
  });

  it("onRowClick: click en una fila llama al callback con la fila", async () => {
    const onRowClick = vi.fn();
    render(<DataTable columns={columns} data={data} onRowClick={onRowClick} />);

    await userEvent.click(screen.getByText("Equipo dos"));

    expect(onRowClick).toHaveBeenCalledTimes(1);
    expect(onRowClick).toHaveBeenCalledWith({ id: "2", name: "Equipo dos" });
  });

  it("muestra emptyMessage cuando no hay data", () => {
    render(
      <DataTable
        columns={columns}
        data={[]}
        emptyMessage="No hay órdenes disponibles"
      />,
    );

    expect(screen.getByRole("cell", { name: "No hay órdenes disponibles" })).toHaveClass(
      "inventory-table-empty",
    );
  });

  it("muestra Cargando… cuando isLoading=true y no hay data", () => {
    render(<DataTable columns={columns} data={[]} isLoading />);

    expect(screen.getByRole("cell", { name: "Cargando…" })).toHaveClass("inventory-table-empty");
  });

  it("con pagination: muestra los botones Anterior/Siguiente", () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        pagination={{ pageIndex: 0, pageSize: 14 }}
        setPagination={vi.fn()}
        rowCount={20}
      />,
    );

    expect(screen.getByRole("button", { name: "Anterior" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Siguiente" })).toBeEnabled();
  });

  it("sin pagination: no muestra los botones de paginación", () => {
    render(<DataTable columns={columns} data={data} />);

    expect(screen.queryByRole("button", { name: "Anterior" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Siguiente" })).not.toBeInTheDocument();
  });
});
