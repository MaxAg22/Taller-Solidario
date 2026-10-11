import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NotebookFormModal } from "@/components/forms/NotebookForm/NotebookFormModal";
import { InventorySummary } from "@/components/notebooks/InventorySummary";
import { useNotebooks } from "@/hooks";
import { NOTEBOOK_STATUSES } from "@/utils/notebookStatus";

export default function NotebookInventoryPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { notebooks, isLoading, isError, refetch } = useNotebooks();

  const filteredNotebooks = useMemo(() => {
    const term = searchTerm.trim().toLocaleLowerCase("es");
    return (notebooks ?? []).filter((notebook) =>
      (statusFilter === "all" || notebook.status === statusFilter) &&
      [notebook.serialNumber, notebook.brand, notebook.model].some((value) =>
        value.toLocaleLowerCase("es").includes(term)
      )
    );
  }, [notebooks, searchTerm, statusFilter]);

  return (
    <div className="inventory-page">
      <div className="inventory-heading">
        <h1>Inventario de equipos</h1>
        <p>Gestión de netbooks del taller</p>
      </div>

      <InventorySummary notebooks={notebooks ?? []} isLoading={isLoading} hasError={isError} />

      <div className="inventory-toolbar">
        <div className="inventory-search">
          <Search size={20} aria-hidden="true" />
          <Input
            aria-label="Buscar equipos por serie, marca o modelo"
            placeholder="Buscar por serie, marca o modelo..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="inventory-filter" aria-label="Filtrar por estado">
            <SelectValue placeholder="Todos los estados" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            {NOTEBOOK_STATUSES.map((state) => (
              <SelectItem key={state.value} value={state.value}>
                <span className="inventory-status-dot" style={{ backgroundColor: state.color }} aria-hidden="true" />
                {state.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button className="inventory-add" onClick={() => setIsModalOpen(true)}>
          <Plus size={20} aria-hidden="true" /> Agregar equipo
        </Button>
      </div>

      {isError ? (
        <div className="inventory-feedback" role="alert">
          <p>No se pudo cargar el inventario.</p>
          <Button variant="outline" onClick={() => refetch()}>Reintentar</Button>
        </div>
      ) : (
        <p className="inventory-results" role="status">
          {isLoading ? "Cargando inventario…" : `${filteredNotebooks.length} de ${notebooks?.length ?? 0} equipos`}
        </p>
      )}

      {/* Agregar aquí la tabla de inventario usando filteredNotebooks. */}

      {isModalOpen && (
        <NotebookFormModal notebook={null} onSave={() => setIsModalOpen(false)} onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
}
