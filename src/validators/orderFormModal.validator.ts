import { z } from "zod";

export type OrderForm = z.infer<typeof orderFormSchema>;

export const orderFormSchema = z
  .object({
    name: z.string().nonempty({ message: "El nombre es requerido" }).max(200),
    description: z.string().max(500).optional(),
    totalNotebooks: z
      .number({ message: "El número de notebooks totales es requerido" })
      .min(0, { message: "El número de notebooks totales debe ser mayor a 0" }),
    readyNotebooks: z
      .number({ message: "El número de notebooks listas es requerido" })
      .min(0, { message: "El número de notebooks listas debe ser mayor a 0" }),
    status: z.enum(["Lista", "Pendiente", "Entregada"]),
    deadline: z.date({ message: "La fecha de vencimiento es requerida" }),
  })
  .refine((data) => data.totalNotebooks >= data.readyNotebooks, {
    message:
      "El número de notebooks totales debe ser mayor al de número de notebooks listas",
    path: ["readyNotebooks"],
  });
