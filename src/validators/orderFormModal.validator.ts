import { z } from "zod";

export type OrderForm = z.infer<typeof orderFormSchema>;

export const orderFormSchema = z.object({
  recipient: z.string().nonempty({ message: "El destinatario es requerido" }),
  deliveryDate: z.string().nonempty({ message: "La fecha de entrega es requerida" }),
  description: z.string().optional(),
});
