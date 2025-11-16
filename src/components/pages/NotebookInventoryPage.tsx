import React, { useState, useMemo } from "react";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";
import { Spinner } from "../ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, PlusCircle, Pencil, Trash2 } from "lucide-react";
import { useNotebooks } from "@/hooks";
import type {
  NotebookStatus,
  Notebook,
} from "../../interfaces/notebook.interface";
import { NotebookFormModal } from "../forms/NotebookForm/NotebookFormModal";

const statusColors: { [key in NotebookStatus]: string } = {
  Recibido: "bg-blue-100 text-blue-800 border-blue-300",
  "En Reparación": "bg-yellow-100 text-yellow-800 border-yellow-300",
  "Listo para Donar": "bg-green-100 text-green-800 border-green-300",
  Donado: "bg-gray-100 text-gray-800 border-gray-300",
};

// --- COMPONENTE PRINCIPAL DE LA PÁGINA ---

export default function NotebookInventoryPage() {
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [selectedNotebook, setSelectedNotebook] = useState<Notebook | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // custom hook - tanstack query - supabase
  const { notebooks: ntbks, isLoading } = useNotebooks();

  const handleOpenModal = (notebook: Notebook | null) => {
    setSelectedNotebook(notebook);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedNotebook(null);
  };

  const handleSaveNotebook = () => {
    handleCloseModal();
  };

  const handleDeleteNotebook = (id: string) => {
    if (
      window.confirm(
        "¿Estás seguro de que quieres eliminar este equipo? Esta acción no se puede deshacer."
      )
    ) {
      setNotebooks(notebooks.filter((n) => n.id !== id));
    }
  };

  const filteredNotebooks = useMemo(() => {
    if (!ntbks) return [];

    return ntbks
      .filter((notebook) => {
        if (statusFilter === "all") return true;
        return notebook.status === statusFilter;
      })
      .filter((notebook) => {
        const term = searchTerm.toLowerCase();
        return (
          notebook.serialNumber.toLowerCase().includes(term) ||
          notebook.brand.toLowerCase().includes(term) ||
          notebook.model.toLowerCase().includes(term)
        );
      });
  }, [ntbks, searchTerm, statusFilter]);

  if (isLoading || !ntbks) {
    return <Spinner></Spinner>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8">
      {isModalOpen && (
        <NotebookFormModal
          notebook={selectedNotebook}
          onSave={handleSaveNotebook}
          onClose={handleCloseModal}
        />
      )}
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-primary">
            Taller Solidario de Notebooks
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestión de inventario para equipos recuperados y donados.
          </p>
        </header>

        <Card className="mb-8">
          <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-full sm:w-1/2 lg:w-1/3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por serie, marca o modelo..."
                className="pl-10"
                value={searchTerm}
                onChange={(e: {
                  target: { value: React.SetStateAction<string> };
                }) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-auto">
              <Select onValueChange={setStatusFilter} value={statusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="Recibido">Recibido</SelectItem>
                  <SelectItem value="En Reparación">En Reparación</SelectItem>
                  <SelectItem value="Listo para Donar">
                    Listo para Donar
                  </SelectItem>
                  <SelectItem value="Donado">Donado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="sm:ml-auto w-full sm:w-auto">
              <Button className="w-full" onClick={() => handleOpenModal(null)}>
                <PlusCircle className="mr-2 h-4 w-4" /> Agregar Equipo
              </Button>
            </div>
          </CardContent>
        </Card>

        {filteredNotebooks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotebooks.map((notebook) => (
              <Card key={notebook.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{notebook.model}</CardTitle>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full border ${
                        statusColors[notebook.status]
                      }`}
                    >
                      {notebook.status}
                    </span>
                  </div>
                  <CardDescription>
                    {notebook.serialNumber} - {notebook.brand}
                  </CardDescription>
                </CardHeader>
                <CardContent className="grow space-y-3">
                  <div>
                    <h4 className="font-semibold text-sm">Especificaciones:</h4>
                    <p className="text-sm text-muted-foreground">
                      {notebook.specs || "No especificadas"}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">
                      Tareas Pendientes:
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {notebook.repairNeeded || "Ninguna"}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Historial:</h4>
                    <p className="text-sm text-muted-foreground">
                      {notebook.repairHistory || "Sin historial"}
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                  <p className="text-xs text-muted-foreground">
                    Ingreso: {notebook.entryDate}
                  </p>
                  <div className="flex gap-2">
                    {/* Boton para hacer update */}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenModal(notebook)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteNotebook(notebook.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <h2 className="text-xl font-semibold text-muted-foreground">
              No se encontraron equipos
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Intenta ajustar tu búsqueda o filtro, o agrega un nuevo equipo.
            </p>
            <Button className="mt-4" onClick={() => handleOpenModal(null)}>
              <PlusCircle className="mr-2 h-4 w-4" /> Agregar Primer Equipo
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
