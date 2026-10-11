import { useRef, useState } from "react";
import { Film, RefreshCw } from "lucide-react";
import { tutorialsConfigured } from "@/actions/tutorials";
import { useTutorials } from "@/hooks/tutorials/useTutorials";
import { TutorialPlayer } from "@/components/tutorials/TutorialPlayer";
import { TutorialThumbnail } from "@/components/tutorials/TutorialThumbnail";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

export default function TutorialsPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedTrigger = useRef<HTMLButtonElement | null>(null);
  const query = useTutorials();
  const videos = query.data ?? [];
  const selected = videos.find((video) => video.id === selectedId);

  return (
    <div className="tutorials-page">
      <div className="inventory-heading">
        <h1>Tutoriales</h1>
        <Button variant="outline" className="tutorials-refresh" disabled={!tutorialsConfigured || query.isFetching} onClick={() => void query.refetch()}>
          <RefreshCw size={15} className={query.isFetching ? "animate-spin" : undefined} aria-hidden="true" />
          {query.isFetching ? "Actualizando…" : "Actualizar"}
        </Button>
      </div>
      {!tutorialsConfigured ? (
        <div className="tutorials-notice" role="status">
          <Film size={24} aria-hidden="true" />
          <h2>Tutoriales no disponibles</h2>
          <p>La biblioteca de videos todavía no está conectada.</p>
        </div>
      ) : (
        <>
          {query.isError && (
            <div className="attendance-feedback" role="alert">
              <p>{query.error.message}</p>
              <Button variant="outline" size="sm" disabled={query.isFetching} onClick={() => void query.refetch()}>Reintentar</Button>
            </div>
          )}
            <section className="tutorials-library" aria-label="Biblioteca de tutoriales" aria-busy={query.isFetching}>
              <div className="tutorials-library-header">
                <h2>Videos <span role="status">({videos.length})</span></h2>
              </div>
              <ul className="tutorials-gallery">
                {videos.map((video) => (
                    <li key={video.id}>
                      <button type="button" className="tutorials-card" aria-haspopup="dialog" aria-label={`Ver ${video.name}`} onClick={(event) => {
                        selectedTrigger.current = event.currentTarget;
                        setSelectedId(video.id);
                      }}>
                        <TutorialThumbnail video={video} />
                        <span className="tutorials-card-name">{video.name}</span>
                      </button>
                    </li>
                ))}
              </ul>
              {!videos.length && (
                <p className="tutorials-gallery-empty" role="status">
                  {query.isLoading ? "Cargando videos…" : query.isError ? "La lista de videos no está disponible." : "Todavía no hay videos en esta carpeta."}
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
        </>
      )}
    </div>
  );
}
