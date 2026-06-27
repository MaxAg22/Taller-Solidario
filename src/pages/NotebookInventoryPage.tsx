import React, { useState, useMemo } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Spinner } from "../components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, PlusCircle } from "lucide-react";
import { useNotebooks } from "@/hooks";
import type { Notebook } from "../interfaces/notebook.interface";
import { NotebookFormModal } from "../components/forms/NotebookForm/NotebookFormModal";
import { useDeleteNotebook } from "@/hooks/notebooks/useDeleteNotebook";
import { ConfirmModal } from "../components/modals/ConfirmModal";
import { NotebookCard } from "@/components/notebooks/NotebookCard";

export default function NotebookInventoryPage() {
  const [selectedNotebook, setSelectedNotebook] = useState<Notebook | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // custom hook - tanstack query - supabase
  const { notebooks: ntbks, isLoading } = useNotebooks();
  const { mutate: deleteNotebook } = useDeleteNotebook();

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
    setDeletingId(id);

    deleteNotebook(id, {
      onSettled: () => {
        setDeletingId(null);
      },
    });
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

  return isLoading ? (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner className="w-10 h-10 size-15" />
    </div>
  ) : (
    <div className="min-h-screen bg-background text-foreground pt-2 sm:pt-4 lg:pt-6">
      {isModalOpen && (
        <NotebookFormModal
          notebook={selectedNotebook}
          onSave={handleSaveNotebook}
          onClose={handleCloseModal}
        />
      )}

      {confirmDeleteId && (
        <ConfirmModal
          confirmDeleteId={confirmDeleteId}
          handleDeleteNotebook={handleDeleteNotebook}
          setConfirmDeleteId={setConfirmDeleteId}
          item={"Equipo"}
        ></ConfirmModal>
      )}

      <div className="max-w-7xl mx-auto">
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
                  <SelectItem value="Instalar SO">Instalar SO</SelectItem>
                  <SelectItem value="Listo para Donar">
                    Listo para Donar
                  </SelectItem>
                  <SelectItem value="Donado">Donado</SelectItem>
                  <SelectItem value="Bloqueada">Bloqueada</SelectItem>
                  <SelectItem value="Desbloqueada">Desbloqueada</SelectItem>
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
            {filteredNotebooks.map((notebook) => (
              <div key={notebook.id}>
                <NotebookCard
                  notebook={notebook}
                  handleOpenModal={handleOpenModal}
                  setConfirmDeleteId={setConfirmDeleteId}
                  deletingId={deletingId}
                />
              </div>
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
