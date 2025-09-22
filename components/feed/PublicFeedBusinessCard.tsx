import { BusinessCardDetails } from "@/models/BusinessCardDetails"
import React from "react"

type Props = {
    businessDetails: BusinessCardDetails
}

const GetStars = ({ rating }: { rating: number }) => {
    const fullStars = Math.floor(rating)
    const halfStar = rating % 1 >= 0.5 ? 1 : 0
    const emptyStars = 5 - fullStars - halfStar

    return (
        <div className="flex items-center gap-1">
            {/* Full stars */}
            {Array(fullStars)
                .fill(0)
                .map((_, i) => (
                    <svg
                        key={`full-${i}`}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-5 h-5 text-yellow-500"
                    >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                ))}

            {/* Half star */}
            {halfStar === 1 && (
                <svg
                    key="half"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    className="w-5 h-5 text-yellow-500"
                >
                    <defs>
                        <linearGradient id="halfGrad">
                            <stop offset="50%" stopColor="currentColor" />
                            <stop offset="50%" stopColor="transparent" />
                        </linearGradient>
                    </defs>
                    <path
                        fill="url(#halfGrad)"
                        stroke="currentColor"
                        strokeWidth="1"
                        d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                    />
                </svg>
            )}

            {/* Empty stars */}
            {Array(emptyStars)
                .fill(0)
                .map((_, i) => (
                    <svg
                        key={`empty-${i}`}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="none"
                        stroke="currentColor"
                        className="w-5 h-5 text-muted-foreground"
                    >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                ))}

            <p className="text-sm text-muted-foreground">({rating})</p>
        </div>
    )
}

const PublicFeedBusinessCard = ({ businessDetails }: Props) => {
    return (
        <a href={`business/${businessDetails.link}`}>
            <div className="bg-card text-card-foreground rounded-lg shadow-sm overflow-hidden flex flex-col h-full border border-border hover:cursor-pointer hover:scale-105 transition-all ease-in-out duration-300">
                {/* Image */}
                <div className="relative">
                    <img
                        src={businessDetails.image}
                        alt="Restaurant"
                        className="w-full h-48 object-cover"
                    />
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col justify-between flex-grow">
                    <div>
                        <h3 className="text-xl font-semibold">{businessDetails.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                            {businessDetails.status}
                        </p>

                        <div className="flex items-center text-lg">
                            <GetStars rating={businessDetails.rating} />
                        </div>

                        <p className="mt-2 font-bold text-lg">$30 and under</p>
                        <p className="text-sm text-muted-foreground mt-1">(1687 reviews)</p>
                    </div>
                </div>
            </div>
        </a>
    )
}

export default PublicFeedBusinessCard
