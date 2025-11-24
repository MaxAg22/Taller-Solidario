import { Button } from "@/components/ui/button";
import { useForm, Controller } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SelectContent, SelectItem } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import type { OrderFormModalProps } from "@/interfaces";
import { Select, SelectTrigger, SelectValue } from "@radix-ui/react-select";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

import * as React from "react";
import { ChevronDownIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useCreateOrder } from "@/hooks/orders/useCreateOrder";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  orderFormSchema,
  type OrderForm,
} from "@/validators/orderFormModal.validator";
import { useUpdateOrder } from "@/hooks/orders/useUpdateNotebooks";

export const OrderFormModal: React.FC<OrderFormModalProps> = ({
  order,
  onSave,
  onClose,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<OrderForm>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      name: order?.name || "",
      description: order?.description || "",
      totalNotebooks: order?.totalNotebooks || 0,
      readyNotebooks: order?.readyNotebooks || 0,
      status: order?.status || "Pendiente",
      deadline: order?.deadline ? new Date(order.deadline) : undefined,
    },
  });

  const { mutate: createOrder, isPending: isPendingCreate } = useCreateOrder({
    onSuccess: () => onSave(),
  });
  const { mutate: updateOrder, isPending: isPendingUpdate } = useUpdateOrder({
    onSuccess: () => onSave(),
  });

  const [open, setOpen] = React.useState(false);

  const onSubmit = (data: OrderForm) => {
    const isEdit = !!order?.id;

    if (isEdit) {
      updateOrder({
        id: order.id,
        name: data.name,
        description: data.description || "",
        totalNotebooks: data.totalNotebooks,
        readyNotebooks: data.readyNotebooks,
        deadline: data.deadline || "",
        status: data.status,
      });
    } else {
      createOrder({
        ...data,
        deadline: data.deadline.toISOString().split("T")[0],
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>
                  {order ? "Editar Orden" : "Agregar Nueva Orden"}
                </CardTitle>
                <CardDescription>
                  {order
                    ? "Modifica los detalles de la orden seleccionada."
                    : "Completa la información de la orden que ingresa al taller."}
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
            {/* NOMBRE */}
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Ej: Orden para PUC"
              />
              {errors.name && (
                <p className="text-red-500 text-sm">{errors.name.message}</p>
              )}
            </div>
            {/* DESCRIPCION */}
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Input
                id="description"
                {...register("description")}
                placeholder="Preparar 15 notebooks con ubuntu"
              />
              {errors.description && (
                <p className="text-red-500 text-sm">
                  {errors.description.message}
                </p>
              )}
            </div>
            {/* ESTADO */}
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
                      <SelectItem value="Lista">Lista</SelectItem>
                      <SelectItem value="Pendiente">Pendiente</SelectItem>
                      <SelectItem value="Entregada">Entregada</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.status && (
                <p className="text-red-500 text-sm">{errors.status.message}</p>
              )}
            </div>
            {/* NOTEBOOKS A ENTREGAR */}
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="totalNotebooks">Notebooks a entregar</Label>
              <Input
                type="number"
                id="totalNotebooks"
                {...register("totalNotebooks", { valueAsNumber: true })}
              />
              {errors.totalNotebooks && (
                <p className="text-red-500 text-sm">
                  {errors.totalNotebooks.message}
                </p>
              )}
            </div>
            {/* NOTEBOOKS LISTAS */}
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="readyNotebooks">Notebooks entregadas</Label>
              <Input
                type="number"
                id="readyNotebooks"
                {...register("readyNotebooks", { valueAsNumber: true })}
              />
              {errors.readyNotebooks && (
                <p className="text-red-500 text-sm">
                  {errors.readyNotebooks.message}
                </p>
              )}
            </div>
            {/* FECHA DE ENTREGA */}
            <div className="flex flex-col gap-3">
              <Label htmlFor="date" className="px-1">
                Fecha de entrega
              </Label>
              <Controller
                control={control}
                name="deadline"
                render={({ field }) => (
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        type="button"
                        id="date"
                        className="w-48 justify-between font-normal"
                      >
                        {field.value
                          ? field.value.toLocaleDateString()
                          : "Select date"}
                        <ChevronDownIcon />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto overflow-hidden p-0"
                      align="start"
                    >
                      <Calendar
                        mode="single"
                        selected={field.value}
                        captionLayout="dropdown"
                        onSelect={(date) => {
                          field.onChange(date);
                          setOpen(false);
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
              {errors.deadline && (
                <p className="text-red-500 text-sm">
                  {errors.deadline.message}
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
