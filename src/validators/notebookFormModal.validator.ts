import { z } from "zod";

export type NotebookForm = z.infer<typeof notebookFormSchema>;

export const notebookFormSchema = z.object({
  serialNumber: z.string().optional(),
  model: z.string().nonempty({ message: "El modelo es requerido" }).max(200),
  brand: z.string().optional(),
  status: z.enum([
    "Recibido",
    "En Reparación",
    "Listo para Donar",
    "Donado",
    "Bloqueada",
    "Desbloqueada",
  ]),
  specs: z.string().optional(),
  repairNeeded: z.string().optional(),
  repairHistory: z.string().optional(),
});
