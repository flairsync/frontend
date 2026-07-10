import {
    fetchDiscoveryMenuApiCall,
    fetchDiscoveryProfileApiCall,
    fetchReviewsApiCall,
    fetchReviewStatsApiCall,
} from "@/features/discovery/discovery.api";
import { DiscoveryBusinessProfile } from "@/models/discovery/DiscoveryBusinessProfile";
import { BusinessMenu } from "@/models/business/menu/BusinessMenu";
import { SitePageContent } from "./types";

export type BindingSource = "menuCategory" | "businessReviews" | "businessReviewStats" | "businessProfile";

export interface Binding {
    source: BindingSource;
    [key: string]: any;
}

export async function resolveBinding(businessId: string, binding: Binding): Promise<any> {
    switch (binding.source) {
        case "menuCategory": {
            const raw = await fetchDiscoveryMenuApiCall(businessId);
            const menuData = Array.isArray(raw) ? raw[0] : raw;
            const menu = BusinessMenu.parseApiResponse(menuData);
            const categories = menu?.categories || [];
            return binding.categoryId ? categories.filter((c) => c.id === binding.categoryId) : categories;
        }
        case "businessReviews": {
            const res = await fetchReviewsApiCall(businessId, { limit: binding.limit ?? 6 });
            return res.data;
        }
        case "businessReviewStats":
            return fetchReviewStatsApiCall(businessId);
        case "businessProfile": {
            const data = await fetchDiscoveryProfileApiCall(businessId);
            return DiscoveryBusinessProfile.parseApiResponse(data);
        }
        default:
            return null;
    }
}

/** Resolves every binding on a single component instance in parallel. */
export async function resolveComponentBindings(
    businessId: string,
    bindings?: Record<string, Binding>
): Promise<Record<string, any>> {
    if (!bindings) return {};
    const entries = Object.entries(bindings);
    const resolved = await Promise.all(entries.map(([, binding]) => resolveBinding(businessId, binding)));
    return Object.fromEntries(entries.map(([key], i) => [key, resolved[i]]));
}

/**
 * Resolves bindings for every component instance across every section of a page
 * in parallel — keyed by component instance id. Call once alongside the page-content
 * fetch (e.g. inside a useSuspenseQuery) so the public renderer stays server-rendered.
 */
export async function resolveAllPageBindings(
    businessId: string,
    content: SitePageContent
): Promise<Record<string, Record<string, any>>> {
    const instances = content.sections.flatMap((s) => s.components);
    const entries = await Promise.all(
        instances.map(async (instance) => [instance.id, await resolveComponentBindings(businessId, instance.bindings)] as const)
    );
    return Object.fromEntries(entries);
}
