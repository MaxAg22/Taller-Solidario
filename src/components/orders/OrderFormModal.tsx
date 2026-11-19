import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateOrder } from "@/hooks/orders/useCreateOrder";
import type { OrderFormModalProps } from "@/interfaces";
import {
  orderFormSchema,
  type OrderForm,
} from "@/validators/orderFormModal.validator";
import { FormModal } from "@/components/shared/FormModal";

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
    <FormModal
      contentClassName="order-form-modal p-0 sm:max-w-[620px] bg-card"
      title="Crear orden"
      description="Registrá el destinatario y la fecha de entrega de la donación."
      isPending={isPending}
      submitLabel="Crear orden"
      onClose={onClose}
      onSubmit={handleSubmit(onSubmit)}
    >
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
    </FormModal>
  );
};
