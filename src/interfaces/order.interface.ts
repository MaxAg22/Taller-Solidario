import type { NotebookStatus } from "./notebook.interface";

export type OrderStatus = "En Preparación" | "Donado";

export type OrderAttach = { notebookId: string };

export type OrderDetach = { notebookId: string; status: NotebookStatus };

export interface CreateOrderPayload {
  recipient: string;
  deliveryDate: string;
  description: string | null;
}

export interface UpdateOrderPayload {
  id: string;
  recipient: string;
  deliveryDate: string;
  description: string | null;
  attach: OrderAttach[];
  detach: OrderDetach[];
}

export interface ChangeOrderStatusPayload {
  id: string;
  status: OrderStatus;
}

export interface OrderDraft {
  recipient: string;
  deliveryDate: string;
  description: string | null;
  attach: OrderAttach[];
  detach: OrderDetach[];
}

export interface OrderTeam {
  id: string;
  name: string;
  serialNumber: string;
  status: string;
  specs: string;
  pending: "Pendiente" | "Se quitará" | null;
}

export interface OrderFormModalProps {
  onClose: () => void;
  onCreated: (id: string) => void;
}

export interface OrderRemoveTeamModalProps {
  notebook: OrderTeam;
  onConfirm: (status: NotebookStatus) => void;
  onClose: () => void;
}
