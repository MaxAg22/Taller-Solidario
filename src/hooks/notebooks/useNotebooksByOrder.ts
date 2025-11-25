import { getNotebooksByOrder } from "@/actions";
import { mapNotebook } from "@/utils/notebook";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

export const useNotebooksByOrder = (orderId: string) => {
  const { data, isLoading } = useQuery({
    queryKey: ["notebooks", orderId],
    queryFn: () => getNotebooksByOrder(orderId),
    staleTime: 1000 * 60 * 5, // 1 hour
  });

  const notebooks = useMemo(() => data?.map(mapNotebook), [data]);

  return { notebooks, isLoading };
};
