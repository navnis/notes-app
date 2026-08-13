import { useQuery } from "@tanstack/react-query";
import { listTagsRequest } from "@/api/tags";

export const tagsQueryKey = ["tags"] as const;

export function useTags() {
  return useQuery({
    queryKey: tagsQueryKey,
    queryFn: listTagsRequest,
  });
}
