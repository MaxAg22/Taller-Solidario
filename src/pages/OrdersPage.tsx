import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable } from "@/components/shared/table/DataTable";
import { orderColumns } from "@/components/orders/table/OrderColumns";
import { OrderFormModal } from "@/components/orders/OrderFormModal";
import { useOrders } from "@/hooks";
import { ORDER_STATUSES } from "@/utils/orderStatus";

export default function OrdersPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
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
    statusFilter === "todos" ? null : (statusFilter as (typeof ORDER_STATUSES)[number]["value"]),
  );

  const resetPagination = () => setPagination((prev) => ({ pageIndex: 0, pageSize: prev.pageSize }));
  const hasFilters = searchTerm.trim() !== "" || dateFrom !== "" || dateTo !== "" || statusFilter !== "todos";
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
        <div className="inventory-search-filter">
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
        </div>
        <div className="inventory-status-filter">
          <Label>Estado</Label>
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value);
              resetPagination();
            }}
          >
            <SelectTrigger aria-label="Filtrar por estado" className="inventory-filter">
              <SelectValue placeholder="Todos los estados" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los estados</SelectItem>
              {ORDER_STATUSES.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <span className="inventory-status-dot" style={{ backgroundColor: option.color }} aria-hidden="true" />
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="inventory-date-filter">
          <Label>Fecha desde</Label>
          <Input
            type="date"
            aria-label="Filtrar por fecha de entrega desde"
            value={dateFrom}
            onChange={(event) => {
              setDateFrom(event.target.value);
              resetPagination();
            }}
          />
        </div>
        <div className="inventory-date-filter">
          <Label>Fecha hasta</Label>
          <Input
            type="date"
            aria-label="Filtrar por fecha de entrega hasta"
            value={dateTo}
            onChange={(event) => {
              setDateTo(event.target.value);
              resetPagination();
            }}
          />
        </div>
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
