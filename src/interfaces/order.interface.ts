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
  onSave: () => void;
  onClose: () => void;
}
