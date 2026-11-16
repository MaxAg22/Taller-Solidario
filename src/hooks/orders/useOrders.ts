import { getOrders } from "@/actions";
import { useQuery } from "@tanstack/react-query";

export const useOrders = (
  from: number,
  to: number,
  search: string,
  deliveryDateFrom?: string,
  deliveryDateTo?: string,
) => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["orders", from, to, search, deliveryDateFrom, deliveryDateTo],
    queryFn: () => getOrders(from, to, search, deliveryDateFrom, deliveryDateTo),
    staleTime: 1000 * 60 * 5,
  });

  return {
    orders: data?.orders,
    rowCount: data?.rowCount,
    isLoading,
    isError,
    refetch,
  };
};
