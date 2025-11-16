import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";
import type {
  NotebookStatus,
  Notebook,
  NotebookFormModalProps,
} from "../../../interfaces/notebook.interface";
import { Label } from "../../ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "../../ui/input";
import { useCreateNotebook } from "@/hooks/notebooks/useCreateNotebook";
import { Spinner } from "@/components/ui/spinner";
import toast from "react-hot-toast";

export const NotebookFormModal: React.FC<NotebookFormModalProps> = ({
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

  const { mutate: createNotebook, isPending } = useCreateNotebook();

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
    if (!formData.model) {
      toast.error("El número de serie y el modelo son obligatorios.");
      return;
    }

    createNotebook({
      id: notebook?.id || Date.now().toString(),
      brand: formData.brand,
      entryDate: notebook?.entryDate || new Date().toISOString().split("T")[0],
      model: formData.model,
      repairHistory: formData.repairHistory,
      repairNeeded: formData.repairNeeded,
      specs: formData.specs,
      status: formData.status,
    });

    onSave();
  };

  if (isPending) return <Spinner></Spinner>;

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
