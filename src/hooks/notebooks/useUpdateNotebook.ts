import { updateNotebook } from "@/actions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const useUpdateNotebook = ({ onSuccess }: any = {}) => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: updateNotebook,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["notebooks"],
      });
      queryClient.invalidateQueries({ queryKey: ["inventory-summary"] });
      toast.success("Equipo actualizado correctamente!");
      onSuccess?.();
    },
    onError: (error) => {
      toast.error("Ocurrió un error al actualizar el equipo");
      console.log(error);
    },
  });

  return {
    mutate,
    isPending,
  };
};
