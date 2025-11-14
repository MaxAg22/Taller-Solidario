import React, { useState, useMemo, useEffect } from "react";
import { Button } from "../ui/button";
import { mapNotebook } from "@/utils/notebook";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "../ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, PlusCircle, Pencil, Trash2, X } from "lucide-react";
import { useNotebooks } from "@/hooks";
import type {
  NotebookStatus,
  Notebook,
  NotebookFormModalProps,
} from "../../interfaces/notebook.interface";

// --- TIPOS Y DATOS DE EJEMPLO ---

const initialNotebooks: Notebook[] = [
  {
    id: "1",
    serialNumber: "GNB-001-A",
    brand: "Gob. Ed.",
    model: "Juana Manso V1",
    status: "Listo para Donar",
    specs: "Intel Celeron N4020, 4GB RAM, 120GB SSD",
    repairNeeded: "Pantalla no enciende, posible flex dañado.",
    repairHistory:
      "Se cambió el flex de la pantalla. Se instaló SO nuevo. Limpieza interna completa.",
    entryDate: "2023-10-15",
  },
  {
    id: "2",
    serialNumber: "GNB-002-B",
    brand: "Gob. Ed.",
    model: "Conectar Igualdad G5",
    status: "En Reparación",
    specs: "Intel Atom, 2GB RAM, 64GB eMMC",
    repairNeeded: "El teclado no responde en varias teclas. Batería agotada.",
    repairHistory: "Ingresó por falla de teclado. Pendiente de repuesto.",
    entryDate: "2023-11-01",
  },
  {
    id: "3",
    serialNumber: "GNB-003-C",
    brand: "Gob. Ed.",
    model: "Juana Manso V2",
    status: "Recibido",
    specs: "Intel Celeron N4500, 8GB RAM, 240GB SSD",
    repairNeeded: "Diagnóstico inicial pendiente.",
    repairHistory: "",
    entryDate: "2023-11-20",
  },
  {
    id: "4",
    serialNumber: "GNB-004-D",
    brand: "Gob. Ed.",
    model: "Conectar Igualdad G7",
    status: "Donado",
    specs: "Intel Celeron, 4GB RAM, 128GB SSD",
    repairNeeded: "Ninguno.",
    repairHistory:
      "Se reemplazó disco duro por un SSD. Se actualizó la RAM a 8GB. Se instaló software educativo.",
    entryDate: "2023-09-05",
  },
];

const statusColors: { [key in NotebookStatus]: string } = {
  Recibido: "bg-blue-100 text-blue-800 border-blue-300",
  "En Reparación": "bg-yellow-100 text-yellow-800 border-yellow-300",
  "Listo para Donar": "bg-green-100 text-green-800 border-green-300",
  Donado: "bg-gray-100 text-gray-800 border-gray-300",
};

// --- COMPONENTE DEL FORMULARIO MODAL ---

const NotebookFormModal: React.FC<NotebookFormModalProps> = ({
  notebook,
  onSave,
  onClose,
}) => {
  const [formData, setFormData] = useState<Omit<Notebook, "id" | "entryDate">>({
    serialNumber: notebook?.serialNumber || "",
    brand: notebook?.brand || "Gob. Ed.",
    model: notebook?.model || "",
    status: notebook?.status || "Recibido",
    specs: notebook?.specs || "",
    repairNeeded: notebook?.repairNeeded || "",
    repairHistory: notebook?.repairHistory || "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: NotebookStatus) => {
    setFormData((prev) => ({ ...prev, status: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.serialNumber || !formData.model) {
      alert("El número de serie y el modelo son obligatorios.");
      return;
    }
    const notebookToSave: Notebook = {
      ...formData,
      id: notebook?.id || Date.now().toString(),
      entryDate: notebook?.entryDate || new Date().toISOString().split("T")[0],
    };
    onSave(notebookToSave);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>
                  {notebook ? "Editar Equipo" : "Agregar Nuevo Equipo"}
                </CardTitle>
                <CardDescription>
                  {notebook
                    ? "Modifica los detalles del equipo seleccionado."
                    : "Completa la información del equipo que ingresa al taller."}
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                type="button"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="serialNumber">Número de Serie</Label>
              <Input
                id="serialNumber"
                name="serialNumber"
                value={formData.serialNumber}
                onChange={handleChange}
                placeholder="Ej: GNB-005-E"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Modelo</Label>
              <Input
                id="model"
                name="model"
                value={formData.model}
                onChange={handleChange}
                placeholder="Ej: Juana Manso V3"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brand">Marca</Label>
              <Input
                id="brand"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                placeholder="Ej: Gob. Ed."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select
                onValueChange={handleSelectChange}
                defaultValue={formData.status}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Recibido">Recibido</SelectItem>
                  <SelectItem value="En Reparación">En Reparación</SelectItem>
                  <SelectItem value="Listo para Donar">
                    Listo para Donar
                  </SelectItem>
                  <SelectItem value="Donado">Donado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="specs">Especificaciones</Label>
              <Textarea
                id="specs"
                name="specs"
                value={formData.specs}
                onChange={handleChange}
                placeholder="Ej: Intel Celeron N4020, 4GB RAM, 120GB SSD..."
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="repairNeeded">Tareas a Realizar</Label>
              <Textarea
                id="repairNeeded"
                name="repairNeeded"
                value={formData.repairNeeded}
                onChange={handleChange}
                placeholder="Describir los problemas detectados y las reparaciones necesarias."
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="repairHistory">Historial de Reparaciones</Label>
              <Textarea
                id="repairHistory"
                name="repairHistory"
                value={formData.repairHistory}
                onChange={handleChange}
                placeholder="Registrar las reparaciones y cambios realizados."
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} type="button">
              Cancelar
            </Button>
            <Button type="submit">Guardar Cambios</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
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

  if (isLoading || !ntbks) {
    <Spinner></Spinner>;
  }

  const handleOpenModal = (notebook: Notebook | null) => {
    setSelectedNotebook(notebook);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedNotebook(null);
  };

  const handleSaveNotebook = (notebookToSave: Notebook) => {
    const exists = notebooks.some((n) => n.id === notebookToSave.id);
    if (exists) {
      setNotebooks(
        notebooks.map((n) => (n.id === notebookToSave.id ? notebookToSave : n))
      );
    } else {
      setNotebooks([notebookToSave, ...notebooks]);
    }
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
