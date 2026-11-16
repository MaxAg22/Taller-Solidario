import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/shared/table/DataTable";
import { orderColumns } from "@/components/orders/table/OrderColumns";
import { OrderFormModal } from "@/components/orders/OrderFormModal";
import { useOrders } from "@/hooks";

export default function OrdersPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 14,
  });
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const from = pagination.pageIndex * pagination.pageSize;
  const to = from + pagination.pageSize - 1;
  const { orders, rowCount, isLoading, isError, refetch } = useOrders(
    from,
    to,
    searchTerm,
    dateFrom,
    dateTo,
  );

  const resetPagination = () => setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  const hasFilters = searchTerm.trim() !== "" || dateFrom !== "" || dateTo !== "";
  const emptyMessage = hasFilters
    ? "No se encontraron resultados"
    : "No hay órdenes disponibles";

  return (
    <div className="inventory-page">
      <div className="inventory-heading">
        <div>
          <h1>Órdenes</h1>
          <p className="inventory-heading-subtitle">Órdenes de donación registradas</p>
        </div>
        <Button className="inventory-add" onClick={() => setIsCreateOpen(true)}>
          <Plus size={20} aria-hidden="true" /> Crear orden
        </Button>
      </div>

      <div className="inventory-toolbar">
        <div className="inventory-search">
          <Search size={20} aria-hidden="true" />
          <Input
            aria-label="Buscar órdenes por destinatario"
            placeholder="Buscar por destinatario..."
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.target.value);
              resetPagination();
            }}
          />
        </div>
        <label className="inventory-date-filter">
          Fecha desde
          <Input
            type="date"
            aria-label="Filtrar por fecha de entrega desde"
            value={dateFrom}
            onChange={(event) => {
              setDateFrom(event.target.value);
              resetPagination();
            }}
          />
        </label>
        <label className="inventory-date-filter">
          Fecha hasta
          <Input
            type="date"
            aria-label="Filtrar por fecha de entrega hasta"
            value={dateTo}
            onChange={(event) => {
              setDateTo(event.target.value);
              resetPagination();
            }}
          />
        </label>
        {isError ? (
          <div className="inventory-feedback" role="alert">
            <p>No se pudo cargar la lista de órdenes.</p>
            <Button variant="outline" onClick={() => refetch()}>Reintentar</Button>
          </div>
        ) : (
          <p className="inventory-results" role="status">
            {isLoading ? "Cargando órdenes…" : `${orders?.length ?? 0} de ${rowCount ?? 0} órdenes`}
          </p>
        )}
      </div>

      <div className="inventory-table-section">
        <DataTable
          columns={orderColumns}
          data={orders ?? []}
          pagination={pagination}
          setPagination={setPagination}
          rowCount={rowCount}
          isLoading={isLoading}
          emptyMessage={emptyMessage}
          onRowClick={(order) => navigate(`/ordenes/${order.id}`)}
        />
      </div>

      {isCreateOpen && (
        <OrderFormModal
          onClose={() => setIsCreateOpen(false)}
          onCreated={(id) => {
            setIsCreateOpen(false);
            navigate(`/ordenes/${id}`);
          }}
        />
      )}
    </div>
  );
}
