import type { OrderStatus, Order } from "@/interfaces/order.interface";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";

const statusColors: { [key in OrderStatus]: string } = {
  Lista: "bg-blue-100 text-blue-800 border-blue-300",
  Pendiente: "bg-yellow-100 text-yellow-800 border-yellow-300",
  Entregada: "bg-green-100 text-green-800 border-green-300",
  //: "bg-gray-100 text-gray-800 border-gray-300",
  //Bloqueada: "bg-red-100 text-red-800 border-red-300",
  //Desbloqueada: "bg-orange-100 text-orange-800 border-orange-300",
};

interface OrderCardProps {
  order: Order;
  handleOpenModal: (order: Order) => void;
  setConfirmDeleteId: (id: string) => void;
  deletingId: string | null;
}

export const OrderCard = ({
  order,
  handleOpenModal,
  setConfirmDeleteId,
  deletingId,
}: OrderCardProps) => {
  return (
    <Card key={order.id} className="flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">
            {order.name} - ({order.orderNumber})
          </CardTitle>
          <span
            className={`px-2 py-1 text-xs font-semibold rounded-full border ${
              statusColors[order.status]
            }`}
          >
            {order.status}
          </span>
        </div>
        <CardDescription>{order.description}</CardDescription>
      </CardHeader>
      <CardContent className="grow space-y-3">
        <div>
          <h4 className="font-semibold text-sm">Equipos entregados:</h4>
          <p className="text-sm text-muted-foreground">
            {order.readyNotebooks} / {order.totalNotebooks}
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <p className="text-xs text-muted-foreground">
          Fecha de entrega: {order.deadline}
        </p>
        <div className="flex gap-2">
          {/* Boton para hacer update */}

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenModal(order)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setConfirmDeleteId(order.id)}
          >
            {deletingId === order.id ? (
              <Spinner />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
