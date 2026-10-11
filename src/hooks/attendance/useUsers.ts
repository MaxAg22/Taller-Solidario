import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { createUser, deleteUser, getUsers, updateUser } from "@/actions";

export function useUsers(from: number, to: number, search: string) {
  return useQuery({
    queryKey: ["users", from, to, search],
    queryFn: () => getUsers(from, to, search),
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createUser,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Alumno agregado correctamente");
    },
    onError: () => toast.error("No se pudo agregar el alumno."),
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["users"] }),
        queryClient.invalidateQueries({ queryKey: ["attendances"] }),
      ]);
      toast.success("Alumno eliminado correctamente");
    },
    onError: () => toast.error("No se pudo eliminar el alumno."),
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateUser,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Nombre actualizado correctamente");
    },
    onError: () => toast.error("No se pudo actualizar el nombre del alumno."),
  });
}
