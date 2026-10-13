import { supabase } from "@/supabase/client";
import type { TutorialVideo } from "@/interfaces/tutorial.interface";
import { parseDriveVideoLink } from "@/utils/tutorials";

function videoError(code: string, fallback: string) {
  return new Error(code === "PGRST205" || code === "42P01"
    ? "La API de Supabase no encuentra public.videos en el proyecto configurado. Verificá el proyecto y el esquema de la tabla."
    : fallback);
}

export async function getSavedVideos(signal?: AbortSignal): Promise<TutorialVideo[]> {
  const { data, error } = await supabase.from("videos")
    .select("id, title, link").order("title").abortSignal(signal ?? new AbortController().signal);
  if (error) throw videoError(error.code, "No se pudieron cargar los videos guardados.");
  return (data ?? []).map((video) => {
    const { fileId, resourceKey } = parseDriveVideoLink(video.link);
    return { id: fileId, name: video.title, resourceKey, savedVideo: { id: video.id, link: video.link } };
  });
}

export async function createVideo({ title, link }: { title: string; link: string }) {
  const name = title.trim();
  if (!name || name.length > 255) throw new Error("Ingresá un título de hasta 255 caracteres.");
  const parsed = parseDriveVideoLink(link);
  const { error } = await supabase.from("videos").insert({ title: name, link: parsed.link });
  if (error) {
    if (error.code === "23505") throw new Error("Este video ya está agregado.");
    throw videoError(error.code, "No se pudo guardar el video. Verificá la conexión y los permisos de la tabla.");
  }
}

export async function updateVideo({ id, title, link }: { id: number; title: string; link: string }) {
  const name = title.trim();
  if (!name || name.length > 255) throw new Error("Ingresá un título de hasta 255 caracteres.");
  const parsed = parseDriveVideoLink(link);
  const { data, error } = await supabase.from("videos")
    .update({ title: name, link: parsed.link }).eq("id", id).select("id");
  if (error) {
    if (error.code === "23505") throw new Error("Este video ya está agregado.");
    throw videoError(error.code, "No se pudo editar el video. Verificá la conexión y los permisos de la tabla.");
  }
  if (!data?.length) throw new Error("El video ya no está disponible o no tenés permiso para editarlo.");
}

export async function deleteVideo(id: number) {
  const { data, error } = await supabase.from("videos").delete().eq("id", id).select("id");
  if (error) throw videoError(error.code, "No se pudo eliminar el video. Verificá la conexión y los permisos de la tabla.");
  if (!data?.length) throw new Error("El video ya no está disponible o no tenés permiso para eliminarlo.");
}
