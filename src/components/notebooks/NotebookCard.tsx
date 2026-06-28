import { Card, CardContent } from "../ui/card";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";
import type { Notebook, NotebookStatus } from "@/interfaces";

const statusColors: { [key in NotebookStatus]: string } = {
  Recibido: "bg-blue-100 text-blue-800 border-blue-300",
  "En Reparación": "bg-yellow-100 text-yellow-800 border-yellow-300",
  "Instalar SO": "bg-indigo-100 text-indigo-800 border-indigo-300",
  "Listo para Donar": "bg-green-100 text-green-800 border-green-300",
  Donado: "bg-gray-100 text-gray-800 border-gray-300",
  Bloqueada: "bg-red-100 text-red-800 border-red-300",
  Desbloqueada: "bg-orange-100 text-orange-800 border-orange-300",
};

const shortText = (value: string, fallback: string) => value?.trim() || fallback;

interface NotebookCardProps {
  notebook: Notebook;
  handleOpenModal: (notebook: Notebook) => void;
  setConfirmDeleteId: (id: string) => void;
  deletingId: string | null;
}

export const NotebookCard = ({
  notebook,
  handleOpenModal,
  setConfirmDeleteId,
  deletingId,
}: NotebookCardProps) => {
  return (
    <Card key={notebook.id} className="overflow-hidden">
      <CardContent className="grid gap-3 p-4 md:grid-cols-[150px_1.1fr_1.5fr_auto] md:items-center">
        <div className="flex items-start justify-between gap-3 md:block md:space-y-2">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Serie
            </p>
            <p className="font-mono text-2xl font-black leading-none tracking-tight md:text-xl">
              #{notebook.serialNumber || "S/N"}
            </p>
          </div>
          <span
            className={`rounded-full border px-2 py-1 text-xs font-semibold ${
              statusColors[notebook.status]
            }`}
          >
            {notebook.status}
          </span>
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">
            {notebook.model || "Modelo sin cargar"}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {notebook.brand || "Marca sin cargar"} · Ingreso: {notebook.entryDate}
          </p>
        </div>

        <div className="min-w-0 space-y-1 rounded-md border bg-muted/30 p-2 md:border-0 md:bg-transparent md:p-0">
          <p className="truncate text-xs text-foreground">
            <span className="font-semibold text-muted-foreground">Specs: </span>
            {shortText(notebook.specs, "No especificadas")}
          </p>
          <p className="truncate text-xs text-foreground">
            <span className="font-semibold text-muted-foreground">Tareas: </span>
            {shortText(notebook.repairNeeded, "Ninguna")}
          </p>
        </div>

        <div className="flex justify-end gap-2">
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
            onClick={() => setConfirmDeleteId(notebook.id)}
          >
            {deletingId === notebook.id ? (
              <Spinner />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
