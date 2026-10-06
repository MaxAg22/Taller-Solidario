import { getNotebooksMetrics } from "@/actions";
import { useQuery } from "@tanstack/react-query";

export const useNotebooksMetrics = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["notebooks-metrics"],
    queryFn: getNotebooksMetrics,
    staleTime: 1000 * 60 * 5,
  });

  return { metrics: data, isLoading };
};
