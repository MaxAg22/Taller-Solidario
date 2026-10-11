import { ExternalLink } from "lucide-react";
import type { TutorialVideo } from "@/actions/tutorials";
import { tutorialDuration, tutorialUrl } from "@/utils/tutorials";

export function TutorialPlayer({ video }: { video: TutorialVideo }) {
  const duration = tutorialDuration(video.videoMediaMetadata?.durationMillis);
  return (
    <section className="tutorials-player" aria-label="Visor de tutoriales">
      <div className="tutorials-video">
        <iframe
          key={video.id}
          src={tutorialUrl(video, "preview")}
          title={`Video: ${video.name}`}
          allow="autoplay; fullscreen"
          allowFullScreen
        />
      </div>
      <div className="tutorials-video-details">
        <h2>{video.name}</h2>
        {duration && <p className="tutorials-duration">{duration}</p>}
        <div className="tutorials-video-source">
          <span>Google Drive</span>
          <a href={tutorialUrl(video, "view")} target="_blank" rel="noopener noreferrer">
            Abrir en Drive <ExternalLink size={14} aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
