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
import type { NotebookFormModalProps } from "@/interfaces/notebook.interface";
import { Label } from "@/components/ui/label";
import {
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { NOTEBOOK_STATUSES } from "@/utils/notebookStatus";
import { useCreateNotebook } from "@/hooks/notebooks/useCreateNotebook";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUpdateNotebook } from "@/hooks/notebooks/useUpdateNotebook";
import { useOrder } from "@/hooks/orders/useOrder";
import { NotebookOrderBlock } from "@/components/notebooks/NotebookOrderBlock";
import {
  notebookFormSchema,
  type NotebookForm,
} from "@/validators/notebookFormModal.validator";
import { FormModal } from "@/components/shared/FormModal";

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
  const { order: notebookOrder } = useOrder(notebook?.orderId ?? undefined, {
    enabled: !!notebook?.orderId,
  });

  const onSubmit = (data: NotebookForm) => {
    const isEdit = !!notebook?.id;

    if (isEdit) {
      updateNotebook({
        id: notebook.id,
        brand: data.brand ?? "",
        model: data.model,
        status: data.status,
        specs: data.specs ?? "",
        repairNeeded: data.repairNeeded ?? "",
        repairHistory: data.repairHistory ?? "",
      });
    } else {
      createNotebook({
        ...data,
        entryDate: new Date().toISOString().split("T")[0],
      });
    }
  };

  return (
    <FormModal
      contentClassName="notebook-form-modal p-0 sm:max-w-[940px] bg-card"
      title={notebook ? "Editar equipo" : "Agregar nuevo equipo"}
      description={
        notebook
          ? "Modifica los detalles del equipo seleccionado."
          : "Completá los datos de la netbook que ingresa al taller."
      }
      isPending={isPendingCreate || isPendingUpdate}
      submitLabel={notebook ? "Guardar cambios" : "Agregar equipo"}
      onClose={onClose}
      onSubmit={handleSubmit(onSubmit)}
    >
      <CardContent className="grid grid-cols-1 md:grid-cols-2">
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
        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="status">Estado</Label>
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={!!notebook?.orderId}
              >
                <SelectTrigger id="status" className="w-full">
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  {NOTEBOOK_STATUSES.map((state) => (
                    <SelectItem key={state.value} value={state.value}>
                      <span className="inventory-status-dot" style={{ backgroundColor: state.color }} aria-hidden="true" />
                      {state.label}
                    </SelectItem>
                  ))}
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
        <div className="space-y-2">
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
        <div className="space-y-2">
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
        {notebook?.orderId && notebookOrder && (
          <NotebookOrderBlock order={notebookOrder} />
        )}
      </CardContent>
    </FormModal>
  );
};
