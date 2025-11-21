import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import { SelectContent, SelectItem } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import type { Order, OrderFormModalProps, OrderStatus } from "@/interfaces";
import { Select, SelectTrigger, SelectValue } from "@radix-ui/react-select";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { useState } from "react";

import * as React from "react";
import { ChevronDownIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useCreateOrder } from "@/hooks/orders/useCreateOrder";

export const OrderFormModal: React.FC<OrderFormModalProps> = ({
  order,
  onSave,
  onClose,
}) => {
  const { register, handleSubmit } = useForm();

  const [formData, setFormData] = useState<Omit<Order, "id">>({
    name: order?.name || "",
    orderNumber: order?.orderNumber || "",
    description: order?.description || "",
    deadline: order?.deadline || "",
    totalNotebooks: order?.totalNotebooks || 0,
    readyNotebooks: order?.readyNotebooks || 0,
    status: order?.status || "Pendiente",
  });

  const { mutate: createOrder, isPending: isPendingCreate } = useCreateOrder({
    onSuccess: () => onSave(),
  });

  const [open, setOpen] = React.useState(false);
  const [date, setDate] = React.useState<Date | undefined>(
    order?.deadline ? new Date(order.deadline) : undefined
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: OrderStatus) => {
    setFormData((prev) => ({ ...prev, status: value }));
  };

  // TODOOO: VERIFICAR QUE NOTEBOOKENTREGADAS < NOTEBOOK A
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!date) {
      toast.error("La fecha de entrega es obligatoria");
      return;
    }

    if (!formData.totalNotebooks || !formData.readyNotebooks) {
      toast.error("El número de equipos es obligatorio");
      return;
    }

    const isEdit = !!order?.id;

    if (isEdit) {
      //updateNotebook({
      //  id: notebook.id,
      //  ...formData,
      //});
    } else {
      createOrder({
        ...formData,
        deadline: date?.toISOString().split("T")[0],
      });
      console.log("Creando", formData, date);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
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
            </div>
            {/* DESCRIPCION */}
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Input
                id="description"
                {...register("description")}
                placeholder="Preparar 15 notebooks con ubuntu"
              />
            </div>
            {/* ESTADO */}
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
                  <SelectItem value="Lista">Lista</SelectItem>
                  <SelectItem value="Pendiente">Pendiente</SelectItem>
                  <SelectItem value="Entregada">Entregada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* NOTEBOOKS A ENTREGAR */}
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="totalNotebooks">Notebooks a entregar</Label>
              <Input
                type="number"
                id="totalNotebooks"
                {...register("totalNotebooks")}
              />
            </div>

            {/* NOTEBOOKS LISTAS */}
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="readyNotebooks">Notebooks entregadas</Label>
              <Input
                type="number"
                id="readyNotebooks"
                {...register("readyNotebooks")}
              />
            </div>

            {/* FECHA DE ENTREGA */}
            <div className="flex flex-col gap-3">
              <Label htmlFor="date" className="px-1">
                Fecha de entrega
              </Label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    id="date"
                    className="w-48 justify-between font-normal"
                  >
                    {date ? date.toLocaleDateString() : "Select date"}
                    <ChevronDownIcon />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto overflow-hidden p-0"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    selected={date}
                    captionLayout="dropdown"
                    onSelect={(date) => {
                      setDate(date);
                      setOpen(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} type="button">
              Cancelar
            </Button>
            <Button type="submit">Guardar Cambios</Button>
            {/*CHANGE FOR IN PENDING */}
            {isPendingCreate && <Spinner></Spinner>}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};
