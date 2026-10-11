import { getInventorySummary } from "@/actions";
import { useQuery } from "@tanstack/react-query";

export const useInventorySummary = () => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["inventory-summary"],
    queryFn: () => getInventorySummary(),
    staleTime: 1000 * 60 * 5, // 1 hour
  });

  return {
    perStatus: data?.perStatus ?? [],
    rowCount: data?.rowCount ?? 0,
    isLoading,
    isError,
    refetch,
  };};
