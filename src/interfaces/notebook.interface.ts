export type NotebookStatus =
  | "Recibido"
  | "En Reparación"
  | "Listo para Donar"
  | "Donado"
  | "Bloqueada"
  | "Instalar SO";

export interface Notebook {
  id: string;
  serialNumber: string;
  brand: string;
  model: string;
  status: NotebookStatus;
  specs: string;
  repairNeeded: string;
  repairHistory: string;
  entryDate: string;
}

export interface UpdateNotebook {
  id: string;
  brand: string;
  model: string;
  status: NotebookStatus;
  specs: string;
  repairNeeded: string;
  repairHistory: string;
}

export interface NotebookFormModalProps {
  notebook: Notebook | null;
  onSave: () => void;
  onClose: () => void;
}
