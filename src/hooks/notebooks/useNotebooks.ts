import { getNotebooks } from "@/actions";
import { mapNotebook } from "@/utils/notebook";
import { useQuery } from "@tanstack/react-query";
import type { NotebookStatus } from "@/interfaces";

export const useNotebooks = (from: number, to: number, status: NotebookStatus | "all", search: string) => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["notebooks", from, to, status, search],
    queryFn: () => getNotebooks(from, to, status, search),
    staleTime: 1000 * 60 * 5, // 1 hour
  });

  return { notebooks: data?.notebooks?.map(mapNotebook), rowCount: data?.rowCount, isLoading, isError, refetch };
};
