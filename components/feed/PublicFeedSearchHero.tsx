import React from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Search } from 'lucide-react'

const PublicFeedSearchHero = () => {
    const { t } = useTranslation()

    return (
        <section className="relative overflow-hidden bg-background pt-16 pb-8 md:pt-24 md:pb-12">
            {/* Background elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-4xl mx-auto text-center space-y-8">
                    {/* Hero Text */}
                    <div className="space-y-4">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground"
                        >
                            {t("public_feed.searchHero.title")}
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
                        >
                            {t("public_feed.searchHero.subtitle", "Discover the best local businesses, curated just for you.")}
                        </motion.p>
                    </div>

                    {/* Search Bar */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="relative max-w-2xl mx-auto"
                    >
                        <div className="group relative flex items-center bg-card/50 backdrop-blur-xl border border-border rounded-full p-2 shadow-2xl shadow-primary/5 transition-all duration-300 hover:border-primary/50 hover:shadow-primary/10">
                            <div className="flex items-center flex-1 px-4">
                                <Search className="w-5 h-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 bg-transparent border-none focus:outline-none focus:ring-0 text-foreground placeholder:text-muted-foreground transition-all"
                                    placeholder={t("public_feed.searchHero.searchPlaceholder")}
                                />
                            </div>
                            <button className="hidden md:flex px-8 py-3 bg-primary text-primary-foreground rounded-full font-semibold transition-all hover:opacity-90 active:scale-95 shadow-lg shadow-primary/20">
                                {t("public_feed.searchHero.searchButton", "Search")}
                            </button>
                        </div>
                    </motion.div>

                    {/* Quick Stats or Tags could go here */}
                </div>
            </div>
        </section>
    )
}

export default PublicFeedSearchHero

