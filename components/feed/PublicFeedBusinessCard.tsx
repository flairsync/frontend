import React, { memo } from "react"
import { motion } from "framer-motion"
import { Star, Clock, MapPin, ExternalLink } from "lucide-react"
import { Badge } from "../ui/badge"
import { BusinessCardDetails } from "@/models/BusinessCardDetails"

type Props = {
    businessDetails: BusinessCardDetails
}

const GetStars = memo(({ rating }: { rating: number }) => {
    return (
        <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
                <Star
                    key={i}
                    size={14}
                    className={`${i < Math.floor(rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : i < rating
                            ? "fill-yellow-400/50 text-yellow-400/50"
                            : "text-muted-foreground/30"
                        }`}
                />
            ))}
            <span className="ml-1.5 text-xs font-bold text-foreground/80">{rating}</span>
        </div>
    )
})

GetStars.displayName = "GetStars"

const PublicFeedBusinessCard = memo(({ businessDetails }: Props) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -6 }}
            transition={{
                duration: 0.2,
                ease: [0.23, 1, 0.32, 1] // Custom snappy ease
            }}
            style={{
                willChange: "transform, opacity",
                backfaceVisibility: "hidden"
            }}
            className="group relative flex flex-col h-full bg-card border border-border/50 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-primary/5 transition-shadow duration-300"
        >
            <a href={`business/${businessDetails.link}`} className="flex flex-col h-full">
                {/* Image Container */}
                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    <img
                        src={businessDetails.image}
                        alt={businessDetails.name}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Overlays */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300" />

                    {/* Status Badge */}
                    <div className="absolute top-4 left-4">
                        <Badge className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 transition-colors rounded-full px-3 py-1 text-[10px] uppercase tracking-wider font-bold">
                            {businessDetails.status}
                        </Badge>
                    </div>

                    {/* Quick Action Button */}
                    <div className="absolute bottom-4 right-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                        <div className="p-2.5 rounded-full bg-primary text-primary-foreground shadow-xl">
                            <ExternalLink size={16} />
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-grow space-y-4">
                    <div className="space-y-1">
                        <h3 className="text-xl font-bold tracking-tight group-hover:text-primary transition-colors line-clamp-1">
                            {businessDetails.name}
                        </h3>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin size={12} />
                            <span className="text-xs font-medium">Paris, France</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <GetStars rating={businessDetails.rating} />
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Clock size={12} className="text-primary/60" />
                            <span className="text-[10px] font-bold uppercase tracking-tight">Open Now</span>
                        </div>
                    </div>

                    <div className="pt-2 mt-auto border-t border-border/30 flex items-center justify-between">
                        <p className="text-sm font-bold text-foreground/90">
                            $30 <span className="text-muted-foreground/50 font-medium">and under</span>
                        </p>
                        <p className="text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                            1.6k+ reviews
                        </p>
                    </div>
                </div>
            </a>
        </motion.div>
    )
})

PublicFeedBusinessCard.displayName = "PublicFeedBusinessCard"

export default PublicFeedBusinessCard
