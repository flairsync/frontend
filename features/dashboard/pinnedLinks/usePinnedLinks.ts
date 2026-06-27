import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PinnedLink } from "@/models/PinnedLink";
import {
  createPinnedLinkApiCall,
  deletePinnedLinkApiCall,
  fetchPinnedLinksApiCall,
  reorderPinnedLinksApiCall,
} from "./service";

const pinnedLinksKey = (businessId: string) => ["pinned_links", businessId];

export const usePinnedLinks = (businessId: string) => {
  const { data: pinnedLinks, isPending: loadingPinnedLinks } = useQuery<PinnedLink[]>({
    queryKey: pinnedLinksKey(businessId),
    queryFn: () => fetchPinnedLinksApiCall(businessId),
    enabled: !!businessId,
  });

  return { pinnedLinks: pinnedLinks ?? [], loadingPinnedLinks };
};

export const useAddPinnedLink = (businessId: string) => {
  const queryClient = useQueryClient();

  const { mutate: addPinnedLink, isPending: addingPinnedLink } = useMutation({
    mutationFn: (path: string) => createPinnedLinkApiCall(businessId, path),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pinnedLinksKey(businessId) });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? "Failed to pin link. Please try again.");
    },
  });

  return { addPinnedLink, addingPinnedLink };
};

export const useRemovePinnedLink = (businessId: string) => {
  const queryClient = useQueryClient();

  const { mutate: removePinnedLink, isPending: removingPinnedLink } = useMutation({
    mutationFn: (id: string) => deletePinnedLinkApiCall(businessId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pinnedLinksKey(businessId) });
    },
    onError: () => {
      toast.error("Failed to unpin link. Please try again.");
    },
  });

  return { removePinnedLink, removingPinnedLink };
};

export const useReorderPinnedLinks = (businessId: string) => {
  const queryClient = useQueryClient();

  const { mutate: reorderPinnedLinks } = useMutation({
    mutationFn: (items: { id: string; order: number }[]) =>
      reorderPinnedLinksApiCall(businessId, items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pinnedLinksKey(businessId) });
    },
    onError: () => {
      toast.error("Failed to save the new order. Please try again.");
      queryClient.invalidateQueries({ queryKey: pinnedLinksKey(businessId) });
    },
  });

  return { reorderPinnedLinks };
};
