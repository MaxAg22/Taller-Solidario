import { getOrders } from "@/actions";
import { useQuery } from "@tanstack/react-query";
import type { OrderStatus } from "@/interfaces";

export const useOrders = (
  from: number,
  to: number,
  search: string,
  deliveryDateFrom?: string,
  deliveryDateTo?: string,
  status?: OrderStatus | null,
) => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["orders", from, to, search, deliveryDateFrom, deliveryDateTo, status],
    queryFn: () => getOrders(from, to, search, deliveryDateFrom, deliveryDateTo, status),
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
