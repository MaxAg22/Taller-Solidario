import { changeOrderStatus } from "@/actions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const useChangeOrderStatus = ({ onSuccess }: { onSuccess?: () => void } = {}) => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: changeOrderStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["notebooks"] });
      toast.success("Estado de la orden actualizado");
      onSuccess?.();
    },
    onError: (error) => {
      toast.error("Ocurrió un error al cambiar el estado de la orden");
      console.log(error);
    },
  });

  return {
    mutate,
    isPending,
  };
};
