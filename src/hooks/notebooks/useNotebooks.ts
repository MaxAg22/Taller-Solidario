import { getNotebooks } from "@/actions";
import { mapNotebook } from "@/utils/notebook";
import { useQuery } from "@tanstack/react-query";

export const useNotebooks = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["notebooks"],
    queryFn: () => getNotebooks(),
    staleTime: 1000 * 60 * 5, // 1 hour
  });

  return { notebooks: data?.map(mapNotebook), isLoading };
};
