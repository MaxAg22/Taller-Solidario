export interface TutorialVideo {
  id: string;
  name: string;
  thumbnailLink?: string;
  resourceKey?: string;
  videoMediaMetadata?: { durationMillis?: string };
}

export const tutorialsFolderId = (import.meta.env.VITE_TUTORIALS_DRIVE_FOLDER_ID ?? "").trim();
const apiKey = (import.meta.env.VITE_GOOGLE_DRIVE_API_KEY ?? "").trim();
export const tutorialsConfigured = Boolean(tutorialsFolderId && apiKey);

export async function getTutorials(signal?: AbortSignal): Promise<TutorialVideo[]> {
  if (!tutorialsConfigured) throw new Error("La biblioteca de videos todavía no está conectada.");
  if (!/^[\w-]+$/.test(tutorialsFolderId)) throw new Error("La carpeta de videos no está configurada correctamente.");

  const videos: TutorialVideo[] = [];
  let pageToken: string | undefined;
  do {
    const params = new URLSearchParams({
      key: apiKey,
      q: `'${tutorialsFolderId}' in parents and trashed = false and mimeType contains 'video/'`,
      fields: "nextPageToken,files(id,name,thumbnailLink,resourceKey,videoMediaMetadata(durationMillis))",
      orderBy: "name_natural",
      pageSize: "1000",
      supportsAllDrives: "true",
      includeItemsFromAllDrives: "true",
    });
    if (pageToken) params.set("pageToken", pageToken);
    const response = await fetch(`https://www.googleapis.com/drive/v3/files?${params}`, { signal });
    if (!response.ok) throw new Error("No se pudieron cargar los videos. Verificá la conexión y el acceso a la carpeta.");
    const result: { files?: TutorialVideo[]; nextPageToken?: string } = await response.json();
    videos.push(...(result.files ?? []));
    pageToken = result.nextPageToken;
  } while (pageToken);
  return videos;
}
