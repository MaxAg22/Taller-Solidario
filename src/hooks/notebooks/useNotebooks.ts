import { getNotebooks } from "@/actions";
import { mapNotebook } from "@/utils/notebook";
import { useQuery } from "@tanstack/react-query";

interface UseNotebooksOptions {
  page?: number;
  pageSize?: number;
  searchTerm?: string;
  statusFilter?: string;
}

export const useNotebooks = ({
  page = 1,
  pageSize = 10,
  searchTerm,
  statusFilter,
}: UseNotebooksOptions = {}) => {
  const { data, isLoading } = useQuery({
    queryKey: ["notebooks", page, pageSize, searchTerm, statusFilter],
    queryFn: () => getNotebooks(page, pageSize, { searchTerm, statusFilter }),
    staleTime: 1000 * 60 * 5,
  });

  return {
    notebooks: data?.data.map(mapNotebook),
    count: data?.count,
    isLoading,
  };
};
