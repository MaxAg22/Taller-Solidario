import { useQuery } from "@tanstack/react-query";
import { getTutorials, tutorialsConfigured, tutorialsFolderId } from "@/actions/tutorials";

export function useTutorials() {
  return useQuery({
    queryKey: ["tutorials", tutorialsFolderId],
    queryFn: ({ signal }) => getTutorials(signal),
    enabled: tutorialsConfigured,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}
