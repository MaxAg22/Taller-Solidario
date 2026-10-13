import { useQuery } from "@tanstack/react-query";
import { getSavedVideos } from "@/actions/videos";

export function useTutorials() {
  return useQuery({
    queryKey: ["saved-videos"],
    queryFn: ({ signal }) => getSavedVideos(signal),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}
