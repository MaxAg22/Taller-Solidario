import { getOrders } from "@/actions";
import { mapOrder } from "@/utils/notebook";
import { useQuery } from "@tanstack/react-query";

export const useOrder = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: () => getOrders(),
    staleTime: 1000 * 60 * 5, // 1 hour
  });

  return { orders: data?.map(mapOrder), isLoading };
};
