import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createNotebook } from "@/actions";
import toast from "react-hot-toast";

export const useCreateNotebook = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: createNotebook,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["notebooks"],
      });
    },
    onError: (error) => {
      toast.error("Ocurrió un error al crear el equipo");
      console.log(error);
    },
  });

  return {
    mutate,
    isPending,
  };
};
