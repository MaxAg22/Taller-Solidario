import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createOrder } from "@/actions";
import toast from "react-hot-toast";

export const useCreateOrder = ({ onSuccess }: any = {}) => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["notebooks"] });
      toast.success("Orden creada correctamente");
      onSuccess?.();
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
