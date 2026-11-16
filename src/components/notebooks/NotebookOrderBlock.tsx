import { Link } from "react-router-dom";
import { formatDeliveryDate } from "@/utils/order";

interface NotebookOrderBlockProps {
  order: {
    id: string;
    recipient: string;
    deliveryDate: string;
  };
}

export function NotebookOrderBlock({ order }: NotebookOrderBlockProps) {
  return (
    <div className="notebook-order-block">
      <strong>Orden de donación</strong>
      <Link to={`/ordenes/${order.id}`}>{order.recipient}</Link>
      <span>Fecha de entrega: {formatDeliveryDate(order.deliveryDate)}</span>
    </div>
  );
}
