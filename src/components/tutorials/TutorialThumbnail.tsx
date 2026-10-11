import { Play } from "lucide-react";
import type { TutorialVideo } from "@/actions/tutorials";
import { tutorialDuration } from "@/utils/tutorials";

export function TutorialThumbnail({ video }: { video: TutorialVideo }) {
  const duration = tutorialDuration(video.videoMediaMetadata?.durationMillis);
  return (
    <span className="tutorials-thumbnail">
      <img className="tutorials-thumbnail-fallback" src={`${import.meta.env.BASE_URL}video.png`} alt="" />
      {video.thumbnailLink && (
        <img
          key={video.thumbnailLink}
          src={video.thumbnailLink}
          alt=""
          loading="lazy"
          decoding="async"
          onError={(event) => { event.currentTarget.hidden = true; }}
        />
      )}
      <span className="tutorials-thumbnail-play"><Play size={18} aria-hidden="true" /></span>
      {duration && <span className="tutorials-thumbnail-duration">{duration}</span>}
    </span>
  );
}
