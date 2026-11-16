import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useCreateOrder } from "@/hooks/orders/useCreateOrder";
import type { OrderFormModalProps } from "@/interfaces";
import {
  orderFormSchema,
  type OrderForm,
} from "@/validators/orderFormModal.validator";

export const OrderFormModal: React.FC<OrderFormModalProps> = ({
  onClose,
  onCreated,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OrderForm>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      recipient: "",
      deliveryDate: "",
      description: "",
    },
  });

  const { mutate: createOrder, isPending } = useCreateOrder({
    onSuccess: (order) => onCreated(order.id),
  });

  const onSubmit = (data: OrderForm) => {
    createOrder({
      recipient: data.recipient,
      deliveryDate: data.deliveryDate,
      description: data.description ? data.description : null,
    });
  };

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent showCloseButton={false} className="order-form-modal p-0 sm:max-w-[620px] bg-card">
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <DialogTitle className="text-[26px] leading-tight">
                  Crear orden
                </DialogTitle>
                <DialogDescription className="mt-2">
                  Registrá el destinatario y la fecha de entrega de la donación.
                </DialogDescription>
              </div>
              <Button
                aria-label="Cerrar formulario"
                variant="ghost"
                size="icon"
                onClick={onClose}
                type="button"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="recipient">Destinatario</Label>
              <Input
                id="recipient"
                {...register("recipient")}
                placeholder="Ej: Escuela Ibarzabal"
              />
              {errors.recipient && (
                <p className="text-red-500 text-sm">{errors.recipient.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="deliveryDate">Fecha de entrega</Label>
              <Input
                id="deliveryDate"
                type="date"
                {...register("deliveryDate")}
              />
              {errors.deliveryDate && (
                <p className="text-red-500 text-sm">{errors.deliveryDate.message}</p>
              )}
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Ej: Equipamiento para el aula de informática."
              />
              {errors.description && (
                <p className="text-red-500 text-sm">{errors.description.message}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-3 border-t py-6">
            <Button variant="outline" onClick={onClose} type="button">
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Spinner />}
              Crear orden
            </Button>
          </CardFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
