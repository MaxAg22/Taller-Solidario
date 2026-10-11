import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getAttendances, saveAttendance } from "@/actions";
import type { AttendanceUser } from "@/interfaces";

export function useAttendances(start: string, end: string, ids: AttendanceUser["id"][]) {
  return useQuery({
    queryKey: ["attendances", start, end, ids],
    queryFn: () => getAttendances(start, end, ids),
    enabled: ids.length > 0,
    staleTime: 1000 * 60 * 5,
  });
}

export function useSaveAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveAttendance,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["attendances"] });
    },
    onError: () => toast.error("No se pudo guardar la asistencia. Intentá nuevamente."),
  });
}
