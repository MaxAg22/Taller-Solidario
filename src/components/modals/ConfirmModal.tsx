import type { ConfirmModalType } from "@/interfaces";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const ConfirmModal = ({
  id,
  onConfirm,
  onClose,
  confirmLabel,
  destructive = false,
  title = "Eliminar equipo",
  description = "Esta acción no se puede deshacer. ¿Deseás eliminar este equipo?",
  isPending = false,
}: ConfirmModalType) => {
  if (!id) return null;

  return (
    <Dialog open onOpenChange={(open) => {
      if (!open && !isPending) onClose();
    }}>
      <DialogContent className="rounded-sm bg-card shadow-none sm:max-w-sm" showCloseButton={!isPending}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            disabled={isPending}
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            variant={destructive ? "destructive" : "default"}
            disabled={isPending}
            onClick={() => onConfirm(id)}
          >
            {isPending ? "Procesando…" : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
