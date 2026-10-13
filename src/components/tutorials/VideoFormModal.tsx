import { useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createVideo, updateVideo } from "@/actions/videos";
import { parseDriveVideoLink } from "@/utils/tutorials";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function VideoFormModal({ video, onClose, onClosed }: {
  video?: { id: number; title: string; link: string };
  onClose: () => void;
  onClosed: () => void;
}) {
  const [title, setTitle] = useState(video?.title ?? "");
  const [link, setLink] = useState(video?.link ?? "");
  const [validationError, setValidationError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (values: { title: string; link: string }) => video
      ? updateVideo({ id: video.id, ...values })
      : createVideo(values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["saved-videos"] });
      onClose();
    },
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (mutation.isPending || !title.trim()) return;
    setValidationError(null);
    mutation.reset();
    try {
      parseDriveVideoLink(link);
    } catch (error) {
      setValidationError((error as Error).message);
      return;
    }
    mutation.mutate({ title, link });
  }

  const error = validationError ?? mutation.error?.message;
  return (
    <Dialog open onOpenChange={(open) => { if (!open && !mutation.isPending) onClose(); }}>
      <DialogContent className="rounded-sm bg-card shadow-none" showCloseButton={!mutation.isPending} onCloseAutoFocus={(event) => {
        event.preventDefault();
        onClosed();
      }}>
        <DialogHeader>
          <DialogTitle>{video ? "Editar video" : "Agregar video"}</DialogTitle>
          <DialogDescription>{video ? "Modificá el título o el enlace del video de Google Drive." : "Ingresá el título y el enlace al video de Google Drive."}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tutorial-video-title">Título</Label>
            <Input id="tutorial-video-title" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={255} required disabled={mutation.isPending} autoComplete="off" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tutorial-video-link">Enlace de Drive</Label>
            <Input id="tutorial-video-link" type="url" value={link} onChange={(event) => setLink(event.target.value)} placeholder="https://drive.google.com/file/d/…/view" required disabled={mutation.isPending} autoComplete="off" aria-describedby="tutorial-video-link-help" />
            <p id="tutorial-video-link-help" className="text-sm text-muted-foreground">Para videos privados, el visor necesita reconocer una cuenta de Google con acceso.</p>
          </div>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" disabled={mutation.isPending} onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={mutation.isPending || !title.trim() || !link.trim()}>{mutation.isPending ? "Guardando…" : video ? "Guardar cambios" : "Agregar video"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
