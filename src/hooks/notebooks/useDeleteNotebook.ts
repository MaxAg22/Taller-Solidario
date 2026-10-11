import { deleteNotebook } from "@/actions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const useDeleteNotebook = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: deleteNotebook,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["notebooks"],
      });
      toast.success("Equipo eliminado correctamente!");
    },
    onError: (error) => {
      toast.error("Ocurrió un error al eliminar el equipo");
      console.log(error);
    },
  });

  return {
    mutate,
    isPending,
  };
};
