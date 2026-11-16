import { useState } from "react";
import { Trash2 } from "lucide-react";
import type { Notebook } from "@/interfaces";
import { useDeleteNotebook } from "@/hooks/notebooks/useDeleteNotebook";
import { ConfirmModal } from "@/components/modals/ConfirmModal";
import { Button } from "@/components/ui/button";

export function NotebookActions({ notebook }: { notebook: Notebook }) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const { mutate: deleteNotebook, isPending } = useDeleteNotebook();

  return (
    <>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          className="size-7 text-destructive hover:text-destructive"
          aria-label={`Eliminar equipo ${notebook.serialNumber}`}
          title="Eliminar equipo"
          disabled={isPending}
          onClick={() => setConfirmDeleteId(notebook.id)}
        >
          <Trash2 aria-hidden="true" />
        </Button>
      </div>

      {confirmDeleteId !== null && (
        <ConfirmModal
          id={confirmDeleteId}
          onClose={() => setConfirmDeleteId(null)}
          confirmLabel="Eliminar"
          destructive
          isPending={isPending}
          onConfirm={(id) => deleteNotebook(id, {
            onSuccess: () => setConfirmDeleteId(null),
          })}
        />
      )}
    </>
  );
}
