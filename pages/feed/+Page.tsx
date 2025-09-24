import PublicFeedBusinessCard from '@/components/feed/PublicFeedBusinessCard'
import PublicFeedHeader from '@/components/feed/PublicFeedHeader'
import PublicFeedSearchHero from '@/components/feed/PublicFeedSearchHero'
import PublicFeedSidebar from '@/components/feed/PublicFeedSidebar'
import DataPagination from '@/components/inputs/DataPagination'
import LandingFooter from '@/components/landing/LandingFooter'
import LandingHeader from '@/components/landing/LandingHeader'
import React from 'react'

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { BusinessCardDetails } from '@/models/BusinessCardDetails'
const FeedPage = () => {
    return (
        <div>
            <PublicFeedHeader />
            <div
                className='pt-40 md:pt-14 gap-10 flex flex-col pb-20'
            >
                <PublicFeedSearchHero />

                <div className="container mx-auto px-4 ">
                    <div className="flex flex-col md:flex-row gap-8">
                        {<PublicFeedSidebar />}
                        <div className="w-full md:w-3/4">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-sm text-gray-500">Found <span className="font-bold">376</span> results</span>
                                <div className="flex items-center space-x-2 text-sm text-gray-500">

                                    <span>Sort by</span>
                                    <Select>
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="default" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="rating_low">Rating: Low to High</SelectItem>
                                            <SelectItem value="rating_high">Rating: High to Low</SelectItem>
                                        </SelectContent>
                                    </Select>

                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {
                                    BusinessCardDetails.generateDummyData().map((val, index) => {
                                        return <PublicFeedBusinessCard
                                            businessDetails={val}
                                        />
                                    })
                                }



                            </div>
                        </div>
                    </div>
                    <div
                        className=''
                    >
                        <DataPagination />

                    </div>
                </div>
            </div>

            <LandingFooter />
        </div>
    )
}

export default FeedPage