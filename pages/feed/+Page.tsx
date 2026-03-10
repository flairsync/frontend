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

// ✅ i18n
import { useTranslation, Trans } from 'react-i18next'
import WebsiteFooter from '@/components/shared/WebsiteFooter'

// trying to optimize it 
import { clientOnly } from 'vike-react/clientOnly'
import { useBusinessTags } from '@/features/business/tags/useBusinessTags'
import { useDiscoverySearch } from '@/features/discovery/useDiscovery';
import { usePlatformCountries } from '@/features/shared/usePlatformCountries';

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
            staggerChildren: 0.05 // Faster stagger
        }
    }
}

const FeedPage = () => {
    const { t } = useTranslation()
    const {
        businessTags
    } = useBusinessTags();

    // Local Search State
    const [searchInput, setSearchInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const limit = 30; // Matches dummy size

    // Location State
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
    const [locationState, setLocationState] = useState<LocationFilterState>({
        useCustomLocation: false,
        radius: 50000, // default 50km in meters
    });

    // Sidebar Filter State
    const [selectedTypeId, setSelectedTypeId] = useState<string | undefined>();
    const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
    const [locationErrorReason, setLocationErrorReason] = useState<string | undefined>();

    // ✅ Automatic Geolocation on Mount
    React.useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setLocationState(prev => ({
                        ...prev,
                        lat: latitude,
                        lng: longitude,
                        useCustomLocation: false
                    }));
                },
                (error) => {
                    console.error("Geolocation error:", error);
                    setIsLocationModalOpen(true);
                    if (error.code === error.PERMISSION_DENIED) {
                        setLocationErrorReason("denied");
                    } else {
                        setLocationErrorReason("error");
                    }
                },
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
            );
        } else {
            setIsLocationModalOpen(true);
            setLocationErrorReason("unsupported");
        }
    }, []);

    // Fetch Discovery Businesses
    const { data: searchData, isLoading } = useDiscoverySearch({
        page,
        limit,
        q: searchQuery || undefined,
        radius: locationState.radius, // already in meters
        lat: locationState.lat,
        lng: locationState.lng,
        countryId: locationState.countryId,
        typeId: selectedTypeId === 'all' ? undefined : (selectedTypeId ? parseInt(selectedTypeId) : undefined),
        tagIds: selectedTagIds.length > 0 ? selectedTagIds.join(',') : undefined
    });

    const handleSearch = () => {
        setSearchQuery(searchInput);
        setPage(1); // Reset page on new search
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
        setLocationState({
            useCustomLocation: false,
            radius: 50000
        });
        setPage(1);
    };

    const { platformCountries } = usePlatformCountries();

    // Memoize location label
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

    // Memoize mapping
    const businesses = useMemo(() => {
        if (!searchData?.businesses) return [];
        return searchData.businesses.map(b => BusinessCardDetails.fromDiscoveryBusiness(b));
    }, [searchData]);

    const totalResults = searchData?.total || 0;

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

                    {/* Location Override Trigger */}
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
                        // Override logic: if countryId is set, clear lat/lng
                        if (newState.countryId) {
                            newState.lat = undefined;
                            newState.lng = undefined;
                        }
                        setLocationState(newState);
                        setPage(1); // Reset page on new location
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
                            onLocationClick={() => setIsLocationModalOpen(true)}
                            onClearFilters={handleClearFilters}
                            locationLabel={locationLabel}
                        />

                        {/* Main Content */}
                        <div className="flex-1 space-y-8">
                            {/* Controls Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card/30 backdrop-blur-sm p-4 rounded-3xl border border-border/40">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-xl text-primary">
                                        <LayoutGrid size={20} />
                                    </div>
                                    <span className="text-sm font-semibold text-foreground/70">
                                        <Trans i18nKey="public_feed.resultsFound" count={totalResults}>
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
                            {isLoading ? (
                                <div className="w-full py-20 flex flex-col items-center justify-center space-y-4">
                                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                                </div>
                            ) : businesses.length > 0 ? (
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
                                    <h3 className="text-xl font-bold text-foreground">No businesses found</h3>
                                    <p className="text-muted-foreground">Try adjusting your search criteria</p>
                                </div>
                            )}

                            {/* Pagination */}
                            {totalResults > 0 && (
                                <div className="pt-8 border-t border-border/40">
                                    <DataPagination
                                        current={page}
                                        total={totalResults}
                                        pageSize={limit}
                                        onChange={(p) => setPage(p)}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <WebsiteFooter />
        </div>
    )
}

export default FeedPage
