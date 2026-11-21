import { getOrder } from "@/actions";
import { mapNotebook } from "@/utils/notebook";
import { useQuery } from "@tanstack/react-query";

export const useOrder = (id?: string, options: { enabled?: boolean } = {}) => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["orders", id],
    queryFn: () => getOrder(id as string),
    enabled: !!id && (options.enabled ?? true),
    staleTime: 1000 * 60 * 5,
  });

  return {
    order: data?.order,
    notebooks: data?.notebooks?.map(mapNotebook),
    isLoading,
    isError,
    refetch,
  };
};
