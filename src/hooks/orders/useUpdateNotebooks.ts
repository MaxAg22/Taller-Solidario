import { updateOrder } from "@/actions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const useUpdateOrder = ({ onSuccess }: any = {}) => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: updateOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["orders"],
      });
      toast.success("Orden actualizada correctamente!");
      onSuccess?.();
    },
    onError: (error) => {
      toast.error("Ocurrió un error al actualizar la orden");
      console.log(error);
    },
  });

  return {
    mutate,
    isPending,
  };
};
