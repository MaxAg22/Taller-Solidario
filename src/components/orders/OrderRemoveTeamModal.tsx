import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NOTEBOOK_STATUSES } from "@/utils/notebookStatus";
import type { NotebookStatus, OrderRemoveTeamModalProps } from "@/interfaces";

export const OrderRemoveTeamModal: React.FC<OrderRemoveTeamModalProps> = ({
  notebook,
  onConfirm,
  onClose,
}) => {
  const [status, setStatus] = useState<NotebookStatus>("Listo para Donar");

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="rounded-sm bg-card shadow-none sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Quitar equipo</DialogTitle>
          <DialogDescription>
            Elegí el estado con el que {notebook.name} volverá al Inventario al guardar los cambios de la orden.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="return-status">Estado de retorno</Label>
          <Select
            value={status}
            onValueChange={(value) => setStatus(value as NotebookStatus)}
          >
            <SelectTrigger id="return-status" className="w-full">
              <SelectValue placeholder="Seleccionar estado" />
            </SelectTrigger>
            <SelectContent>
              {NOTEBOOK_STATUSES.map((state) => (
                <SelectItem key={state.value} value={state.value}>
                  <span className="inventory-status-dot" style={{ backgroundColor: state.color }} aria-hidden="true" />
                  {state.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={() => onConfirm(status)}>
            Quitar de la orden
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
