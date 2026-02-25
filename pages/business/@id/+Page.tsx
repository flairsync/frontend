import BusinessDetailsHero from '@/components/business_details/BusinessDetailsHero';
import BusinessDetailsContact from '@/components/business_details/BusinessDetailsContact';
import BusinessDetailsInfoCards from '@/components/business_details/BusinessDetailsInfoCards';
import BusinessDetailsMenu from '@/components/business_details/BusinessDetailsMenu';
import BusinessDetailsReviews from '@/components/business_details/BusinessDetailsReviews';
import BusinessDetailsTiming from '@/components/business_details/BusinessDetailsTiming';
import PublicFeedHeader from '@/components/feed/PublicFeedHeader';
import React from 'react'
import { motion } from 'framer-motion'
import WebsiteFooter from '@/components/shared/WebsiteFooter';
import BusinessDetailsTableReservation from '@/components/business_details/BusinessDetailsTableReservation';

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15
        }
    }
}

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
}

const BusinessPage = () => {
    return (
        <div className="min-h-screen bg-background">
            <PublicFeedHeader />

            <main className="pt-24 pb-20">
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="max-w-6xl mx-auto px-6 space-y-24"
                >
                    <motion.div variants={item}>
                        <BusinessDetailsHero />
                    </motion.div>

                    <motion.div variants={item}>
                        <BusinessDetailsInfoCards />
                    </motion.div>

                    <motion.div variants={item}>
                        <BusinessDetailsMenu />
                    </motion.div>

                    <motion.div variants={item}>
                        <BusinessDetailsTableReservation />
                    </motion.div>

                    <motion.div variants={item}>
                        <BusinessDetailsTiming />
                    </motion.div>

                    <motion.div variants={item}>
                        <BusinessDetailsReviews />
                    </motion.div>

                    <motion.div variants={item}>
                        <BusinessDetailsContact />
                    </motion.div>
                </motion.div>
            </main>

            <WebsiteFooter />
        </div>
    )
}

export default BusinessPage