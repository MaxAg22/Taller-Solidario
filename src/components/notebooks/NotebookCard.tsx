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
  "Listo para Donar": "bg-green-100 text-green-800 border-green-300",
  Donado: "bg-gray-100 text-gray-800 border-gray-300",
  Bloqueada: "bg-red-100 text-red-800 border-red-300",
  Desbloqueada: "bg-orange-100 text-orange-800 border-orange-300",
};

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
          <h4 className="font-semibold text-sm">Tareas Pendientes:</h4>
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
