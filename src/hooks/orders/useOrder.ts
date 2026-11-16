import { getOrder } from "@/actions";
import { useQuery } from "@tanstack/react-query";

export const useOrder = (id?: string) => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["orders", id],
    queryFn: () => getOrder(id as string),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

  return {
    order: data?.order,
    notebooks: data?.notebooks,
    isLoading,
    isError,
    refetch,
  };
};
