import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createOrder } from "@/actions";
import toast from "react-hot-toast";

export const useCreateOrder = ({ onSuccess }: { onSuccess?: (order: { id: string }) => void } = {}) => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: createOrder,
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Orden creada correctamente");
      onSuccess?.(order);
    },
    onError: (error) => {
      toast.error("Ocurrió un error al crear la orden");
      console.log(error);
    },
  });

  return {
    mutate,
    isPending,
  };
};
