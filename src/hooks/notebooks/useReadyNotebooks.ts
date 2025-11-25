import { getReadyNoteboks } from "@/actions";
import { mapNotebook } from "@/utils/notebook";
import { useQuery } from "@tanstack/react-query";

export const useReadyNotebooks = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["notebooks", "ready"],
    queryFn: () => getReadyNoteboks(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return { readyNotebooks: data?.map(mapNotebook), isLoading };
};
