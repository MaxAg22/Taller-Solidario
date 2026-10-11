import type { ConfirmModalType } from "@/interfaces";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const ConfirmModal = ({
  confirmDeleteId,
  handleDeleteNotebook,
  setConfirmDeleteId,
  isPending = false,
}: ConfirmModalType) => {
  if (!confirmDeleteId) return null;

  return (
    <Dialog open onOpenChange={(open) => {
      if (!open && !isPending) setConfirmDeleteId(null);
    }}>
      <DialogContent className="rounded-sm bg-card shadow-none sm:max-w-sm" showCloseButton={!isPending}>
        <DialogHeader>
          <DialogTitle>Eliminar equipo</DialogTitle>
          <DialogDescription>
            Esta acción no se puede deshacer. ¿Deseás eliminar este equipo?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            disabled={isPending}
            onClick={() => setConfirmDeleteId(null)}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            disabled={isPending}
            onClick={() => handleDeleteNotebook(confirmDeleteId)}
          >
            {isPending ? "Eliminando…" : "Eliminar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
