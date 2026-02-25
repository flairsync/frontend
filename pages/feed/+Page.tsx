import PublicFeedHeader from '@/components/feed/PublicFeedHeader'
import PublicFeedSearchHero from '@/components/feed/PublicFeedSearchHero'
import PublicFeedSidebar from '@/components/feed/PublicFeedSidebar'
import DataPagination from '@/components/inputs/DataPagination'
import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { LayoutGrid, ListFilter } from 'lucide-react'

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

const PublicFeedBusinessCard = clientOnly(() =>
    import("@/components/feed/PublicFeedBusinessCard")
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

    // Memoize dummy data so it doesn't change on every render
    const businesses = useMemo(() => BusinessCardDetails.generateDummyData(), []);

    return (
        <div className="min-h-screen bg-background">
            <PublicFeedHeader />

            <main className="pt-20 pb-20 space-y-12">
                <PublicFeedSearchHero />

                <div className="container mx-auto px-4">
                    <div className="flex flex-col lg:flex-row gap-12">
                        {/* Sidebar */}
                        <PublicFeedSidebar
                            tags={businessTags}
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
                                        <Trans i18nKey="public_feed.resultsFound" count={376}>
                                            Found <span className="text-foreground font-bold text-lg">376</span> results
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

                            {/* Pagination */}
                            <div className="pt-8 border-t border-border/40">
                                <DataPagination />
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <WebsiteFooter />
        </div>
    )
}

export default FeedPage
