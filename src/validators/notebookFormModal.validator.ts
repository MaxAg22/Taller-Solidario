import { z } from "zod";
import { NOTEBOOK_STATUSES } from "@/utils/notebookStatus";

export type NotebookForm = z.infer<typeof notebookFormSchema>;

export const notebookFormSchema = z.object({
  serialNumber: z.string().optional(),
  model: z.string().nonempty({ message: "El modelo es requerido" }).max(200),
  brand: z.string().optional(),
  status: z.enum(NOTEBOOK_STATUSES.map((state) => state.value)),
  specs: z.string().optional(),
  repairNeeded: z.string().optional(),
  repairHistory: z.string().optional(),
});
