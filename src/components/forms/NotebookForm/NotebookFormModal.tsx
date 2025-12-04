import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Controller, useForm } from "react-hook-form";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";
import type {
  NotebookFormModalProps,
  UpdateNotebook,
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
import { zodResolver } from "@hookform/resolvers/zod";
import { useUpdateNotebook } from "@/hooks/notebooks/useUpdateNotebook";
import {
  notebookFormSchema,
  type NotebookForm,
} from "@/validators/notebookFormModal.validator";

export const NotebookFormModal: React.FC<NotebookFormModalProps> = ({
  notebook,
  onSave,
  onClose,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<NotebookForm>({
    resolver: zodResolver(notebookFormSchema),
    defaultValues: {
      serialNumber: notebook?.serialNumber || "",
      brand: notebook?.brand || "Gob. Ed.",
      model: notebook?.model || "",
      status: notebook?.status || "Recibido",
      specs: notebook?.specs || "",
      repairNeeded: notebook?.repairNeeded || "",
      repairHistory: notebook?.repairHistory || "",
    },
  });

  const { mutate: createNotebook, isPending: isPendingCreate } =
    useCreateNotebook({ onSuccess: () => onSave() });
  const { mutate: updateNotebook, isPending: isPendingUpdate } =
    useUpdateNotebook({ onSuccess: () => onSave() });

  const onSubmit = (data: NotebookForm) => {
    const isEdit = !!notebook?.id;

    if (isEdit) {
      updateNotebook({
        id: notebook.id,
        ...data,
      } as UpdateNotebook);
    } else {
      createNotebook({
        ...data,
        entryDate: new Date().toISOString().split("T")[0],
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex justify-center items-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit(onSubmit)}>
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
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8 pt-8">
            <div className="space-y-2">
              <Label htmlFor="model">Modelo</Label>
              <Input
                id="model"
                {...register("model")}
                placeholder="Ej: Juana Manso V3"
              />
              {errors.model && (
                <p className="text-red-500 text-sm">{errors.model.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="brand">Marca</Label>
              <Input
                id="brand"
                {...register("brand")}
                placeholder="Ej: Gob. Ed."
              />
              {errors.brand && (
                <p className="text-red-500 text-sm">{errors.brand.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Recibido">Recibido</SelectItem>
                      <SelectItem value="En Reparación">
                        En Reparación
                      </SelectItem>
                      <SelectItem value="Listo para Donar">
                        Listo para Donar
                      </SelectItem>
                      <SelectItem value="Donado">Donado</SelectItem>
                      <SelectItem value="Bloqueada">Bloqueada</SelectItem>
                      <SelectItem value="Desbloqueada">Desbloqueada</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.status && (
                <p className="text-red-500 text-sm">{errors.status.message}</p>
              )}
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="specs">Especificaciones</Label>
              <Textarea
                id="specs"
                {...register("specs")}
                placeholder="Ej: Intel Celeron N4020, 4GB RAM, 120GB SSD..."
              />
              {errors.specs && (
                <p className="text-red-500 text-sm">{errors.specs.message}</p>
              )}
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="repairNeeded">Tareas a Realizar</Label>
              <Textarea
                id="repairNeeded"
                {...register("repairNeeded")}
                placeholder="Describir los problemas detectados y las reparaciones necesarias."
              />
              {errors.repairNeeded && (
                <p className="text-red-500 text-sm">
                  {errors.repairNeeded.message}
                </p>
              )}
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="repairHistory">Historial de Reparaciones</Label>
              <Textarea
                id="repairHistory"
                {...register("repairHistory")}
                placeholder="Registrar las reparaciones y cambios realizados."
              />
              {errors.repairHistory && (
                <p className="text-red-500 text-sm">
                  {errors.repairHistory.message}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} type="button">
              Cancelar
            </Button>
            <Button type="submit">Guardar Cambios</Button>
            {(isPendingCreate || isPendingUpdate) && <Spinner></Spinner>}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};
