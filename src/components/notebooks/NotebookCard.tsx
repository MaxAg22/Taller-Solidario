import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
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
    <Card key={notebook.id} className="flex h-full flex-col overflow-hidden">
      <CardHeader className="space-y-3 p-4 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Serie
            </p>
            <CardTitle className="truncate font-mono text-2xl font-black leading-none tracking-tight">
              #{notebook.serialNumber || "S/N"}
            </CardTitle>
          </div>
          <span
            className={`shrink-0 rounded-full border px-2 py-1 text-xs font-semibold ${
              statusColors[notebook.status]
            }`}
          >
            {notebook.status}
          </span>
        </div>
        <div className="min-w-0">
          <CardDescription className="truncate text-sm font-semibold text-foreground">
            {notebook.model || "Modelo sin cargar"}
          </CardDescription>
          <p className="truncate text-xs text-muted-foreground">
            {notebook.brand || "Marca sin cargar"}
          </p>
        </div>
      </CardHeader>
      <CardContent className="grow space-y-2 px-4 pb-3">
        <div className="rounded-md border bg-muted/30 p-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Specs
          </p>
          <p className="line-clamp-2 text-xs text-foreground">
            {shortText(notebook.specs, "No especificadas")}
          </p>
        </div>
        <div className="rounded-md border bg-muted/30 p-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Tareas
          </p>
          <p className="line-clamp-2 text-xs text-foreground">
            {shortText(notebook.repairNeeded, "Ninguna")}
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between gap-2 p-4 pt-0">
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
            onClick={() => setConfirmDeleteId(notebook.id)}
          >
            {deletingId === notebook.id ? (
              <Spinner />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
