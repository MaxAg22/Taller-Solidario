import { deleteOrder } from "@/actions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const useDeleteOrder = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: deleteOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["orders"],
      });
      toast.success("Orden eliminada correctamente!");
    },
    onError: (error) => {
      toast.error("Ocurrió un error al eliminar la orden");
      console.log(error);
    },
  });

  return {
    mutate,
    isPending,
  };
};
