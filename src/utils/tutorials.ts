import type { TutorialVideo } from "@/actions/tutorials";

export function tutorialDuration(milliseconds?: string) {
  const value = Number(milliseconds);
  if (!milliseconds || !Number.isFinite(value) || value < 0) return null;
  const seconds = Math.floor(value / 1000);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return hours
    ? `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`
    : `${minutes}:${String(seconds % 60).padStart(2, "0")}`;
}

export function tutorialUrl(video: TutorialVideo, mode: "preview" | "view") {
  const url = new URL(`https://drive.google.com/file/d/${encodeURIComponent(video.id)}/${mode}`);
  if (video.resourceKey) url.searchParams.set("resourcekey", video.resourceKey);
  return url.toString();
}
