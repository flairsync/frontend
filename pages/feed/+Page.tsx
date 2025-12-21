import PublicFeedHeader from '@/components/feed/PublicFeedHeader'
import PublicFeedSearchHero from '@/components/feed/PublicFeedSearchHero'
import PublicFeedSidebar from '@/components/feed/PublicFeedSidebar'
import DataPagination from '@/components/inputs/DataPagination'
import React from 'react'

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

//import PublicFeedBusinessCard from '@/components/feed/PublicFeedBusinessCard'

// trying to optimize it 
import { clientOnly } from 'vike-react/clientOnly'
import { useBusinessTags } from '@/features/business/tags/useBusinessTags'

const PublicFeedBusinessCard = clientOnly(() =>
    import("@/components/feed/PublicFeedBusinessCard")
)

const FeedPage = () => {
    const { t } = useTranslation()
    const {
        businessTags
    } = useBusinessTags();

    return (
        <div>
            <PublicFeedHeader />
            <div className='pt-40 md:pt-14 gap-10 flex flex-col pb-20'>
                <PublicFeedSearchHero />

                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row gap-8">
                        <PublicFeedSidebar
                            tags={businessTags}
                        />
                        <div className="w-full md:w-3/4">
                            <div className="flex justify-between items-center mb-4">
                                {/* Results count */}
                                <span className="text-sm text-gray-500">
                                    <Trans i18nKey="public_feed.resultsFound" count={376}>
                                        Found <span className="font-bold">376</span> results
                                    </Trans>
                                </span>

                                {/* Sort by */}
                                <div className="flex items-center space-x-2 text-sm text-gray-500">
                                    <span>{t("public_feed.sortBy")}</span>
                                    <Select>
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder={t("public_feed.sortOptions.default")} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="rating_low">
                                                {t("public_feed.sortOptions.rating_low")}
                                            </SelectItem>
                                            <SelectItem value="rating_high">
                                                {t("public_feed.sortOptions.rating_high")}
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Business cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {BusinessCardDetails.generateDummyData().map((val, index) => (
                                    <PublicFeedBusinessCard key={index} businessDetails={val} />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div>
                        <DataPagination />
                    </div>
                </div>
            </div>
            <WebsiteFooter />
        </div>
    )
}

export default FeedPage
