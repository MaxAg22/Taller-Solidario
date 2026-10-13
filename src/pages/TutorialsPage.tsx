import { useRef, useState } from "react";
import { Plus, RefreshCw } from "lucide-react";
import { VideoFormModal } from "@/components/tutorials/VideoFormModal";
import { VideoActions } from "@/components/tutorials/VideoActions";
import { useTutorials } from "@/hooks/tutorials/useTutorials";
import { TutorialPlayer } from "@/components/tutorials/TutorialPlayer";
import { TutorialThumbnail } from "@/components/tutorials/TutorialThumbnail";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

export default function TutorialsPage() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [addingVideo, setAddingVideo] = useState(false);
  const addTrigger = useRef<HTMLButtonElement | null>(null);
  const selectedTrigger = useRef<HTMLButtonElement | null>(null);
  const query = useTutorials();
  const videos = query.data ?? [];
  const isFetching = query.isFetching;
  const isLoading = query.isLoading;
  const selected = videos.find((video) => video.savedVideo.id === selectedId);

  return (
    <div className="tutorials-page">
      <div className="inventory-heading">
        <h1>Tutoriales</h1>
        <div className="tutorials-heading-actions">
          <Button variant="outline" className="tutorials-refresh" disabled={isFetching} onClick={() => void query.refetch()}>
            <RefreshCw size={15} className={isFetching ? "animate-spin" : undefined} aria-hidden="true" />
            {isFetching ? "Actualizando…" : "Actualizar"}
          </Button>
          <Button ref={addTrigger} onClick={() => setAddingVideo(true)}><Plus size={15} aria-hidden="true" />Agregar video</Button>
        </div>
      </div>
      {addingVideo && <VideoFormModal onClose={() => {
        setAddingVideo(false);
      }} onClosed={() => addTrigger.current?.focus()} />}
      {query.isError && (
        <div className="attendance-feedback" role="alert">
          <p>{query.error.message}</p>
          <Button variant="outline" size="sm" disabled={isFetching} onClick={() => void query.refetch()}>Reintentar</Button>
        </div>
      )}
      <section className="tutorials-library" aria-label="Biblioteca de tutoriales" aria-busy={isFetching}>
        <div className="tutorials-library-header">
          <h2>Videos <span role="status">({videos.length})</span></h2>
        </div>
        <ul className="tutorials-gallery">
          {videos.map((video) => (
              <li key={video.savedVideo.id} className="tutorials-card-container">
                <button type="button" className="tutorials-card" aria-haspopup="dialog" aria-label={`Ver ${video.name}`} onClick={(event) => {
                  selectedTrigger.current = event.currentTarget;
                  setSelectedId(video.savedVideo.id);
                }}>
                  <TutorialThumbnail video={video} />
                  <span className="tutorials-card-name">{video.name}</span>
                </button>
                <VideoActions
                  video={{ ...video.savedVideo, title: video.name }}
                  onDeleted={() => addTrigger.current?.focus()}
                />
              </li>
          ))}
        </ul>
        {!videos.length && (
          <p className="tutorials-gallery-empty" role="status">
            {isLoading ? "Cargando videos…" : query.isError ? "No se pudieron cargar los videos." : "Todavía no hay videos. Agregá uno con su título y enlace de Drive."}
          </p>
        )}
      </section>
      {selected && (
        <Dialog open onOpenChange={(open) => { if (!open) setSelectedId(null); }}>
          <DialogContent className="tutorials-viewer" onCloseAutoFocus={(event) => {
            event.preventDefault();
            selectedTrigger.current?.focus();
          }}>
            <DialogTitle className="sr-only">{selected.name}</DialogTitle>
            <DialogDescription className="sr-only">Reproductor de tutorial de Google Drive.</DialogDescription>
            <TutorialPlayer video={selected} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
