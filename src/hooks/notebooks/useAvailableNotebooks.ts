import { getAvailableNotebooks } from "@/actions";
import { useQuery } from "@tanstack/react-query";

export const useAvailableNotebooks = () => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["notebooks", "available"],
    queryFn: () => getAvailableNotebooks(),
    staleTime: 1000 * 60 * 5,
  });

  return { notebooks: data, isLoading, isError, refetch };
};
