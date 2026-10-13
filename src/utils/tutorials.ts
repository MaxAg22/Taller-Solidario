import type { TutorialVideo } from "@/interfaces/tutorial.interface";

export function parseDriveVideoLink(link: string) {
  let url: URL;
  try {
    url = new URL(link.trim());
  } catch {
    throw new Error("Ingresá un enlace válido a un video de Google Drive.");
  }
  if (url.protocol !== "https:" || url.hostname !== "drive.google.com" || url.username || url.password || url.port) {
    throw new Error("El enlace debe ser de Google Drive (https://drive.google.com).");
  }
  const fileId = url.pathname.match(/^\/file\/d\/([\w-]+)(?:\/(?:view|preview|edit))?\/?$/)?.[1]
    ?? (/^\/(?:open|uc)\/?$/.test(url.pathname) ? url.searchParams.get("id") : null);
  if (!fileId || !/^[\w-]+$/.test(fileId)) {
    throw new Error("Pegá el enlace de un video, no el de una carpeta de Drive.");
  }
  const resourceKey = url.searchParams.get("resourcekey") || undefined;
  if (resourceKey && !/^[\w-]+$/.test(resourceKey)) {
    throw new Error("El enlace de Drive contiene una clave de recurso inválida.");
  }
  const normalized = new URL(`https://drive.google.com/file/d/${fileId}/view`);
  if (resourceKey) normalized.searchParams.set("resourcekey", resourceKey);
  return { fileId, resourceKey, link: normalized.toString() };
}

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
