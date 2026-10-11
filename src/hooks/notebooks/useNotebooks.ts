import { getNotebooks } from "@/actions";
import { mapNotebook } from "@/utils/notebook";
import { useQuery } from "@tanstack/react-query";

export const useNotebooks = (from: number, to: number) => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["notebooks", from, to],
    queryFn: () => getNotebooks(from, to),
    staleTime: 1000 * 60 * 5, // 1 hour
  });

  return { notebooks: data?.notebooks?.map(mapNotebook), rowCount: data?.rowCount, isLoading, isError, refetch };
};
