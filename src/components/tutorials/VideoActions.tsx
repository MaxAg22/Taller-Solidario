import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2 } from "lucide-react";
import { deleteVideo } from "@/actions/videos";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { VideoFormModal } from "./VideoFormModal";

export function VideoActions({ video, onDeleted }: {
  video: { id: number; title: string; link: string };
  onDeleted: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const editTrigger = useRef<HTMLButtonElement | null>(null);
  const deleteTrigger = useRef<HTMLButtonElement | null>(null);
  const queryClient = useQueryClient();
  const deletion = useMutation({
    mutationFn: deleteVideo,
    onSuccess: async () => {
      setConfirmDelete(false);
      onDeleted();
      await queryClient.invalidateQueries({ queryKey: ["saved-videos"] });
    },
  });

  return (
    <>
      <div className="tutorials-card-actions">
        <Button ref={editTrigger} variant="ghost" size="icon-sm" className="size-7 text-muted-foreground hover:text-primary" aria-label={`Editar video ${video.title}`} title="Editar video" disabled={deletion.isPending} onClick={() => setIsEditing(true)}>
          <Pencil aria-hidden="true" />
        </Button>
        <Button ref={deleteTrigger} variant="ghost" size="icon-sm" className="size-7 text-muted-foreground hover:text-destructive" aria-label={`Eliminar video ${video.title}`} title="Eliminar video" disabled={deletion.isPending} onClick={() => {
          deletion.reset();
          setConfirmDelete(true);
        }}>
          <Trash2 aria-hidden="true" />
        </Button>
      </div>
      {isEditing && <VideoFormModal video={video} onClose={() => setIsEditing(false)} onClosed={() => editTrigger.current?.focus()} />}
      {confirmDelete && (
        <Dialog open onOpenChange={(open) => { if (!open && !deletion.isPending) setConfirmDelete(false); }}>
          <DialogContent className="rounded-sm bg-card shadow-none sm:max-w-sm" showCloseButton={!deletion.isPending} onCloseAutoFocus={(event) => {
            event.preventDefault();
            if (deletion.isSuccess) onDeleted();
            else deleteTrigger.current?.focus();
          }}>
            <DialogHeader>
              <DialogTitle>Eliminar video</DialogTitle>
              <DialogDescription>Se quitará “{video.title}” de Tutoriales. El archivo original seguirá en Drive.</DialogDescription>
            </DialogHeader>
            {deletion.error && <p role="alert" className="text-sm text-destructive">{deletion.error.message}</p>}
            <DialogFooter>
              <Button variant="outline" disabled={deletion.isPending} onClick={() => setConfirmDelete(false)}>Cancelar</Button>
              <Button variant="destructive" disabled={deletion.isPending} onClick={() => deletion.mutate(video.id)}>{deletion.isPending ? "Eliminando…" : "Eliminar"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
