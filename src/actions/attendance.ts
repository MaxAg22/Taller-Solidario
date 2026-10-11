import { supabase } from "@/supabase/client";
import type { AttendanceChange, AttendanceRecord, AttendanceUser } from "@/interfaces";

export async function getUsers(from: number, to: number, search: string) {
  let query = supabase
    .from("users")
    .select("id, name", { count: "exact" });

  if (search.trim()) query = query.ilike("name", `%${search.trim()}%`);

  const { data, count, error } = await query.order("name").order("id").range(from, to);
  if (error) throw error;
  return { users: data ?? [], rowCount: count ?? 0 };
}

export async function createUser(name: string) {
  const trimmedName = name.trim();
  if (!trimmedName || trimmedName.length > 255) throw new Error("Ingresá un nombre de hasta 255 caracteres.");
  const { data, error } = await supabase
    .from("users")
    .insert({ name: trimmedName })
    .select("id, name")
    .single();
  if (error) throw error;
  return data;
}

export async function deleteUser(id: AttendanceUser["id"]) {
  const { data, error } = await supabase.from("users").delete().eq("id", id).select("id");
  if (error) throw error;
  if (!data?.length) throw new Error("No se pudo eliminar el alumno.");
}

export async function updateUser({ id, name }: AttendanceUser) {
  const trimmedName = name.trim();
  if (!trimmedName || trimmedName.length > 255) throw new Error("Ingresá un nombre de hasta 255 caracteres.");
  const { data, error } = await supabase
    .from("users")
    .update({ name: trimmedName })
    .eq("id", id)
    .select("id, name")
    .single();
  if (error) throw error;
  return data;
}

export async function getAttendances(start: string, end: string, ids: AttendanceUser["id"][]) {
  if (!ids.length) return [];
  const { data, error } = await supabase
    .from("attendance")
    .select("id, date")
    .in("id", ids)
    .gte("date", start)
    .lte("date", end);
  if (error) throw error;
  return (data ?? []).filter((row): row is AttendanceRecord => row.date !== null);
}

export async function saveAttendance({ id, date, is_present }: AttendanceChange) {
  if (!is_present) {
    const { error } = await supabase.from("attendance").delete().eq("id", id).eq("date", date);
    if (error) throw error;
    return;
  }

  const { data, error } = await supabase
    .from("attendance")
    .upsert({ id, date }, { onConflict: "id,date" })
    .select("id, date")
    .single();
  if (error) throw error;
  return data;
}

export async function getAttendanceReportUsers(signal: AbortSignal) {
  const users: AttendanceUser[] = [];
  let total = Infinity;
  while (users.length < total) {
    const { data, count, error } = await supabase.from("users")
      .select("id, name", { count: "exact" })
      .order("name").order("id")
      .range(users.length, users.length + 499)
      .abortSignal(signal);
    if (error) throw error;
    if (count === null || (!data?.length && users.length < count)) throw new Error("No se pudo cargar la lista completa de alumnos.");
    users.push(...(data ?? []));
    total = count;
  }
  return users;
}

export async function getAttendanceReportCounts(start: string, end: string, signal: AbortSignal) {
  const counts: Record<number, number> = {};
  let offset = 0;
  let total = Infinity;
  while (offset < total) {
    const { data, count, error } = await supabase.from("attendance")
      .select("id, date", { count: "exact" })
      .gte("date", start).lte("date", end)
      .order("date").order("id")
      .range(offset, offset + 499)
      .abortSignal(signal);
    if (error) throw error;
    if (count === null || (!data?.length && offset < count)) throw new Error("No se pudo cargar la asistencia completa del período.");
    for (const record of data ?? []) counts[record.id] = (counts[record.id] ?? 0) + 1;
    offset += data?.length ?? 0;
    total = count;
  }
  return counts;
}
