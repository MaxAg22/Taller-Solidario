import type { Notebook } from "./notebook.interface";

export type OrderStatus = "Lista" | "Pendiente" | "Entregada";

export interface Order {
  id: string;
  name: string;
  orderNumber: string;
  description: string;
  deadline: string;
  totalNotebooks: number;
  readyNotebooks: number;
  status: OrderStatus;
}

export interface OrderFormModalProps {
  order: Order | null;
  readyNotebooks: Notebook[] | undefined;
  onSave: () => void;
  onClose: () => void;
}

export interface UpdateOrder {
  id: string;
  name: string;
  description: string;
  totalNotebooks: number;
  readyNotebooks: number;
  deadline: Date;
  status: OrderStatus;
  newNotebooksSelected: string[];
  oldNotebooksSelected: string[];
}

export interface CreateOrder {
  name: string;
  description: string;
  totalNotebooks: number;
  readyNotebooks: number;
  deadline: string;
  status: OrderStatus;
  newNotebooksSelected: string[];
}
