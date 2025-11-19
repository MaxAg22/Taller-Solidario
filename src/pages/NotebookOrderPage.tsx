import React, { useState, useMemo } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Spinner } from "../components/ui/spinner";
import { Search, PlusCircle } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmModal } from "../components/modals/ConfirmModal";
import { OrderCard } from "@/components/orders/OrderCard";
import type { Order } from "@/interfaces/order.interface";

export const Orders: Order[] = [
  {
    id: "1",
    name: "Reparación de pantallas",
    orderNumber: "ORD-001",
    description: "Reemplazo de pantallas dañadas y pruebas de funcionamiento",
    deadline: "2025-11-25",
    totalNotebooks: 8,
    readyNotebooks: 3,
    status: "Pendiente",
  },
  {
    id: "2",
    name: "Mantenimiento preventivo",
    orderNumber: "ORD-002",
    description:
      "Limpieza interna, control térmico y actualización de software",
    deadline: "2025-12-03",
    totalNotebooks: 15,
    readyNotebooks: 15,
    status: "Lista",
  },
  {
    id: "3",
    name: "Diagnóstico inicial",
    orderNumber: "ORD-003",
    description: "Revisión general del nuevo lote recibido",
    deadline: "2025-11-30",
    totalNotebooks: 12,
    readyNotebooks: 0,
    status: "Pendiente",
  },
  {
    id: "4",
    name: "Reparación avanzada",
    orderNumber: "ORD-004",
    description: "Cambio de motherboards y reinstalación del sistema operativo",
    deadline: "2025-12-10",
    totalNotebooks: 6,
    readyNotebooks: 6,
    status: "Entregada",
  },
];

// --- COMPONENTE PRINCIPAL DE LA PÁGINA ---

export default function NotebookOrderPage() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // custom hook - tanstack query - supabase

  const handleOpenModal = (order: Order | null) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const handleSaveNotebook = () => {
    handleCloseModal();
  };

  const handleDeleteNotebook = (id: string) => {
    setDeletingId(id);
  };

  const filteredOrders = useMemo(() => {
    if (!Orders) return [];

    return Orders.filter((order) => {
      if (statusFilter === "all") return true;
      return order.status === statusFilter;
    }).filter((order) => {
      const term = searchTerm.toLowerCase();
      return (
        order.orderNumber.toLowerCase().includes(term) ||
        order.name.toLowerCase().includes(term)
      );
    });
  }, [Orders, searchTerm, statusFilter]);

  if (!Orders) {
    return <Spinner></Spinner>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground pt-2 sm:pt-4 lg:pt-6">
      {confirmDeleteId && (
        <ConfirmModal
          confirmDeleteId={confirmDeleteId}
          handleDeleteNotebook={handleDeleteNotebook}
          setConfirmDeleteId={setConfirmDeleteId}
        ></ConfirmModal>
      )}

      <div className="max-w-7xl mx-auto">
        <Card className="mb-8">
          <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-full sm:w-1/2 lg:w-1/3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              {/* CHANGE ORDER SEARCH */}
              <Input
                placeholder="Buscar por nombre o número de orden."
                className="pl-10"
                value={searchTerm}
                onChange={(e: {
                  target: { value: React.SetStateAction<string> };
                }) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-auto">
              <Select onValueChange={setStatusFilter} value={statusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="Lista">Lista</SelectItem>
                  <SelectItem value="Pendiente">Pendiente</SelectItem>
                  <SelectItem value="Entregada">Entregada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="sm:ml-auto w-full sm:w-auto">
              <Button className="w-full" onClick={() => handleOpenModal(null)}>
                <PlusCircle className="mr-2 h-4 w-4" /> Agregar Orden
              </Button>
            </div>
          </CardContent>
        </Card>

        {filteredOrders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrders.map((order) => (
              <OrderCard
                order={order}
                handleOpenModal={handleOpenModal}
                setConfirmDeleteId={setConfirmDeleteId}
                deletingId={deletingId}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <h2 className="text-xl font-semibold text-muted-foreground">
              No se encontraron ordenes
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Intenta ajustar tu búsqueda o filtro, o agrega una nueva orden.
            </p>
            <Button className="mt-4" onClick={() => handleOpenModal(null)}>
              <PlusCircle className="mr-2 h-4 w-4" /> Agregar Primer Orden
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
