import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    fetchSitePagesApiCall,
    fetchSitePageApiCall,
    createSitePageApiCall,
    updateSitePageApiCall,
    saveSitePageDraftApiCall,
    publishSitePageApiCall,
    unpublishSitePageApiCall,
    deleteSitePageApiCall,
    fetchPublicSitePageApiCall,
    CreateSitePageDto,
    UpdateSitePageDto,
} from "./service";
import { SitePageContent } from "./types";
import { resolveAllPageBindings } from "./bindings";

export const useSitePages = (businessId: string) => {
    const queryClient = useQueryClient();

    const { data: pages, isFetching: fetchingPages, refetch } = useQuery({
        queryKey: ["site_pages", businessId],
        queryFn: () => fetchSitePagesApiCall(businessId),
        enabled: !!businessId,
    });

    const invalidate = () => queryClient.invalidateQueries({ queryKey: ["site_pages", businessId] });

    const createPageMutation = useMutation({
        mutationFn: (data: CreateSitePageDto) => createSitePageApiCall(businessId, data),
        onSuccess: () => {
            toast.success("Page created");
            invalidate();
        },
    });

    const updatePageMutation = useMutation({
        mutationFn: ({ pageId, data }: { pageId: string; data: UpdateSitePageDto }) =>
            updateSitePageApiCall(businessId, pageId, data),
        onSuccess: () => {
            toast.success("Page updated");
            invalidate();
        },
    });

    const deletePageMutation = useMutation({
        mutationFn: (pageId: string) => deleteSitePageApiCall(businessId, pageId),
        onSuccess: () => {
            toast.success("Page deleted");
            invalidate();
        },
    });

    const publishPageMutation = useMutation({
        mutationFn: (pageId: string) => publishSitePageApiCall(businessId, pageId),
        onSuccess: () => {
            toast.success("Page published");
            invalidate();
        },
    });

    const unpublishPageMutation = useMutation({
        mutationFn: (pageId: string) => unpublishSitePageApiCall(businessId, pageId),
        onSuccess: () => {
            toast.success("Page unpublished");
            invalidate();
        },
    });

    return {
        pages,
        fetchingPages,
        refetchPages: refetch,
        createPage: createPageMutation.mutate,
        isCreatingPage: createPageMutation.isPending,
        updatePage: updatePageMutation.mutate,
        isUpdatingPage: updatePageMutation.isPending,
        deletePage: deletePageMutation.mutate,
        isDeletingPage: deletePageMutation.isPending,
        publishPage: publishPageMutation.mutate,
        isPublishingPage: publishPageMutation.isPending,
        unpublishPage: unpublishPageMutation.mutate,
        isUnpublishingPage: unpublishPageMutation.isPending,
    };
};

export const useSitePage = (businessId: string, pageId: string | undefined) => {
    const queryClient = useQueryClient();

    const { data: page, isFetching: fetchingPage } = useQuery({
        queryKey: ["site_page", businessId, pageId],
        queryFn: () => fetchSitePageApiCall(businessId, pageId as string),
        enabled: !!businessId && !!pageId,
    });

    const saveDraftMutation = useMutation({
        mutationFn: (content: SitePageContent) => saveSitePageDraftApiCall(businessId, pageId as string, content),
        onSuccess: () => {
            toast.success("Draft saved");
            queryClient.invalidateQueries({ queryKey: ["site_page", businessId, pageId] });
        },
    });

    return {
        page,
        fetchingPage,
        saveDraft: saveDraftMutation.mutate,
        saveDraftAsync: saveDraftMutation.mutateAsync,
        isSavingDraft: saveDraftMutation.isPending,
    };
};

/**
 * Resolves live bindings for the current (unsaved) draft content — powers the
 * designer's "Preview" overlay so an owner sees real business data (name, photos,
 * menu, reviews) without publishing first. Only fetches while `enabled` (the
 * overlay is open), and re-resolves whenever the draft content changes.
 */
export const useSiteBuilderPreview = (businessId: string, content: SitePageContent, enabled: boolean) => {
    return useQuery({
        queryKey: ["site_builder_preview", businessId, content],
        queryFn: () => resolveAllPageBindings(businessId, content),
        enabled: enabled && !!businessId,
    });
};

export const usePublicSitePage = (businessId: string | undefined, slug: string) => {
    return useQuery({
        queryKey: ["public_site_page", businessId, slug],
        queryFn: () => fetchPublicSitePageApiCall(businessId as string, slug),
        enabled: !!businessId,
        retry: false,
    });
};
