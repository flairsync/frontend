import PublicFeedHeader from '@/components/feed/PublicFeedHeader'
import PublicFeedSearchHero from '@/components/feed/PublicFeedSearchHero'
import PublicFeedSidebar from '@/components/feed/PublicFeedSidebar'
import DataPagination from '@/components/inputs/DataPagination'
import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { LayoutGrid, ListFilter, Loader2, MapPin } from 'lucide-react'
import type { LocationFilterState } from '@/components/inputs/LocationSelectionModal'

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { BusinessCardDetails } from '@/models/BusinessCardDetails'
import { FetchDiscoveryBusinessesParams } from '@/features/discovery/discovery.api'
import { useSuspenseDiscoverySearch } from '@/features/discovery/useDiscovery'

// ✅ i18n
import { useTranslation, Trans } from 'react-i18next'
import WebsiteFooter from '@/components/shared/WebsiteFooter'

import { clientOnly } from 'vike-react/clientOnly'
import { useBusinessTags } from '@/features/business/tags/useBusinessTags'
import { usePlatformCountries } from '@/features/shared/usePlatformCountries';
import { withFallback } from 'vike-react-query'

const FILTER_STORAGE_KEY = 'public_feed_filters';

const PublicFeedBusinessCard = clientOnly(() =>
    import("@/components/feed/PublicFeedBusinessCard")
)

const LocationSelectionModal = clientOnly(() =>
    import("@/components/inputs/LocationSelectionModal")
)

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05
        }
    }
}

// Inner component — server-rendered via useSuspenseQuery with default params on first load
const BusinessGrid = withFallback(
    ({ params, page, limit, onPageChange, t, hasActiveFilters, onClearFilters }: {
        params: FetchDiscoveryBusinessesParams;
        page: number;
        limit: number;
        onPageChange: (p: number) => void;
        t: ReturnType<typeof useTranslation<'feed'>>['t'];
        hasActiveFilters: boolean;
        onClearFilters: () => void;
    }) => {
        const { data: searchData } = useSuspenseDiscoverySearch(params);

        const businesses = useMemo(() => {
            if (!searchData?.businesses) return [];
            return searchData.businesses.map((b: any) => BusinessCardDetails.fromDiscoveryBusiness(b));
        }, [searchData]);

        const totalResults = searchData?.total ?? 0;

        return (
            <>
                {/* Controls Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card/30 backdrop-blur-sm p-4 rounded-3xl border border-border/40">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-xl text-primary">
                            <LayoutGrid size={20} />
                        </div>
                        <span className="text-sm font-semibold text-foreground/70">
                            <Trans i18nKey="public_feed.resultsFound" count={totalResults} t={t}>
                                Found <span className="text-foreground font-bold text-lg">{totalResults}</span> results
                            </Trans>
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center space-x-2 text-sm font-bold text-muted-foreground bg-muted/50 px-3 py-2 rounded-xl">
                            <ListFilter size={16} />
                            <span>{t("public_feed.sortBy")}</span>
                        </div>
                        <Select defaultValue="default">
                            <SelectTrigger className="w-[180px] h-10 rounded-xl border-border/50 bg-background shadow-sm">
                                <SelectValue placeholder={t("public_feed.sortOptions.default")} />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="default" className="rounded-lg">
                                    {t("public_feed.sortOptions.default", "Default")}
                                </SelectItem>
                                <SelectItem value="rating_high" className="rounded-lg">
                                    {t("public_feed.sortOptions.rating_high")}
                                </SelectItem>
                                <SelectItem value="rating_low" className="rounded-lg">
                                    {t("public_feed.sortOptions.rating_low")}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Business cards grid */}
                {businesses.length > 0 ? (
                    <motion.div
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
                    >
                        {businesses.map((val, index) => (
                            <PublicFeedBusinessCard key={val.link || index} businessDetails={val} />
                        ))}
                    </motion.div>
                ) : (
                    <div className="w-full py-20 flex flex-col items-center justify-center space-y-2">
                        <h3 className="text-xl font-bold text-foreground">{t("feed_page.no_businesses_found")}</h3>
                        <p className="text-muted-foreground">
                            {hasActiveFilters
                                ? t("feed_page.no_results_filtered_reason")
                                : t("feed_page.try_adjusting_search")}
                        </p>
                        {hasActiveFilters && (
                            <button
                                onClick={onClearFilters}
                                className="text-sm font-semibold text-primary hover:underline"
                            >
                                {t("feed_page.clear_filters")}
                            </button>
                        )}
                    </div>
                )}

                {/* Pagination */}
                {totalResults > 0 && (
                    <div className="pt-8 border-t border-border/40">
                        <DataPagination
                            current={page}
                            total={totalResults}
                            pageSize={limit}
                            onChange={onPageChange}
                        />
                    </div>
                )}
            </>
        );
    },
    // Loading fallback
    () => (
        <div className="w-full py-20 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
    )
);

const FeedPage = () => {
    const { t } = useTranslation("feed")
    const { businessTags } = useBusinessTags();

    const [searchInput, setSearchInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const limit = 30;

    const [isInitialized, setIsInitialized] = useState(false);
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
    const [locationState, setLocationState] = useState<LocationFilterState>({
        useCustomLocation: false,
        radius: 50000,
    });

    const [selectedTypeId, setSelectedTypeId] = useState<string | undefined>();
    const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
    const [selectedMinRating, setSelectedMinRating] = useState<number | undefined>();
    const [locationErrorReason, setLocationErrorReason] = useState<string | undefined>();

    const { platformCountries } = usePlatformCountries();

    // ✅ Persistence: Save to localStorage (Only after initial load is complete)
    React.useEffect(() => {
        if (!isInitialized) return;

        const filters = {
            locationState,
            selectedTypeId,
            selectedTagIds,
            selectedMinRating,
        };
        localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(filters));
    }, [locationState, selectedTypeId, selectedTagIds, selectedMinRating, isInitialized]);

    // ✅ Priority Logic on Mount
    React.useEffect(() => {
        if (isInitialized) return;

        // N/C3 (QA Test Report + Retest, 2026-11-18): this used to request geolocation on every
        // fresh visit and, on success, silently switch to a 50km "Nearby You" radius search with
        // no opt-in — so any visitor who hasn't explicitly chosen a location (the common case)
        // saw 0 results unless they happened to be standing near one of the handful of test
        // businesses. The feed now defaults to the same unfiltered, global list it already
        // server-renders for crawlers, and only narrows by location once the visitor explicitly
        // picks one via the location modal (which does its own geolocation lookup when opened).
        // A visitor's own earlier explicit choice (including "use my location") is still restored
        // from localStorage below — this just stops a location filter being assumed by default.
        const stored = localStorage.getItem(FILTER_STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (parsed.locationState && (parsed.locationState.lat || parsed.locationState.countryId)) {
                    setLocationState(parsed.locationState);
                    if (parsed.selectedTypeId) setSelectedTypeId(parsed.selectedTypeId);
                    if (parsed.selectedTagIds) setSelectedTagIds(parsed.selectedTagIds);
                    if (parsed.selectedMinRating) setSelectedMinRating(parsed.selectedMinRating);
                }
            } catch (e) {
                console.error("Error parsing stored filters:", e);
            }
        }

        const timeoutId = setTimeout(() => setIsInitialized(true), 50);
        return () => clearTimeout(timeoutId);

    }, [isInitialized]);

    const handleSearch = () => {
        setSearchQuery(searchInput);
        setPage(1);
    };

    const handleTagToggle = (tagId: string) => {
        setSelectedTagIds(prev =>
            prev.includes(tagId)
                ? prev.filter(id => id !== tagId)
                : [...prev, tagId]
        );
        setPage(1);
    };

    const handleClearFilters = () => {
        setSelectedTypeId(undefined);
        setSelectedTagIds([]);
        setSelectedMinRating(undefined);
        setLocationState({
            useCustomLocation: false,
            radius: 50000
        });
        localStorage.removeItem(FILTER_STORAGE_KEY);
        setPage(1);
    };

    const locationLabel = useMemo(() => {
        if (locationState.countryId && platformCountries) {
            const country = platformCountries.find(c => c.id === locationState.countryId);
            if (country) return country.name;
        }
        if (locationState.useCustomLocation) {
            return t("public_feed.sidebar.customLocation", "Custom Location");
        }
        if (locationState.lat && locationState.lng) {
            return t("public_feed.sidebar.nearby", "Nearby You");
        }
        return undefined;
    }, [locationState, platformCountries, t]);

    const hasActiveFilters = Boolean(
        searchQuery || selectedTypeId || selectedTagIds.length > 0 || selectedMinRating
        || locationState.countryId || locationState.lat || locationState.useCustomLocation
    );

    // Build query params — on server these default to no-location (shows global results for crawlers)
    const searchParams: FetchDiscoveryBusinessesParams = {
        page,
        limit,
        q: searchQuery || undefined,
        radius: locationState.radius ? locationState.radius / 1000 : undefined,
        lat: locationState.lat,
        lng: locationState.lng,
        countryId: locationState.countryId,
        typeId: selectedTypeId === 'all' ? undefined : (selectedTypeId ? parseInt(selectedTypeId) : undefined),
        tagIds: selectedTagIds.length > 0 ? selectedTagIds.join(',') : undefined,
        minRating: selectedMinRating,
    };

    return (
        <div className="min-h-screen bg-background">
            <PublicFeedHeader />

            <main className="pt-20 pb-20 space-y-12">
                <div className="relative">
                    <PublicFeedSearchHero
                        searchQuery={searchInput}
                        setSearchQuery={setSearchInput}
                        onSearch={handleSearch}
                    />

                    <div className="absolute bottom-6 right-6 md:right-12 z-20">
                        <button
                            onClick={() => setIsLocationModalOpen(true)}
                            className="flex items-center gap-2 bg-background/80 backdrop-blur-md border border-border/50 text-foreground px-4 py-2.5 rounded-full shadow-lg hover:shadow-xl hover:bg-muted transition-all"
                        >
                            <MapPin size={18} className="text-primary" />
                            <span className="text-sm font-semibold">
                                {locationLabel || t("public_feed.sidebar.locationPlaceholder")}
                            </span>
                        </button>
                    </div>
                </div>

                <LocationSelectionModal
                    isOpen={isLocationModalOpen}
                    onOpenChange={(open) => {
                        setIsLocationModalOpen(open);
                        if (!open) setLocationErrorReason(undefined);
                    }}
                    defaultState={locationState}
                    reason={locationErrorReason}
                    onSave={(newState) => {
                        if (newState.countryId) {
                            newState.lat = undefined;
                            newState.lng = undefined;
                        }
                        setLocationState(newState);
                        setPage(1);
                        setLocationErrorReason(undefined);
                    }}
                />

                <div className="container mx-auto px-4">
                    <div className="flex flex-col lg:flex-row gap-12">
                        {/* Sidebar */}
                        <PublicFeedSidebar
                            tags={businessTags}
                            selectedTypeId={selectedTypeId}
                            onTypeChange={(id) => {
                                setSelectedTypeId(id);
                                setPage(1);
                            }}
                            selectedTagIds={selectedTagIds}
                            onTagToggle={handleTagToggle}
                            selectedMinRating={selectedMinRating}
                            onMinRatingChange={(r) => {
                                setSelectedMinRating(r);
                                setPage(1);
                            }}
                            onLocationClick={() => setIsLocationModalOpen(true)}
                            onClearFilters={handleClearFilters}
                            locationLabel={locationLabel}
                        />

                        {/* Main Content — server-rendered on first load with default params */}
                        <div className="flex-1 space-y-8">
                            <BusinessGrid
                                params={searchParams}
                                page={page}
                                limit={limit}
                                onPageChange={setPage}
                                t={t}
                                hasActiveFilters={hasActiveFilters}
                                onClearFilters={handleClearFilters}
                            />
                        </div>
                    </div>
                </div>
            </main>

            <WebsiteFooter />
        </div>
    )
}

export default FeedPage
