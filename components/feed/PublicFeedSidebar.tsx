import React, { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "../ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { clientOnly } from "vike-react/clientOnly"
import { MapPinPenIcon } from "lucide-react"
import { useTranslation } from "react-i18next"

const LocationSelectionModal = clientOnly(() =>
    import("@/components/inputs/LocationSelectionModal")
)

const TagsList = React.memo(({ tags }: { tags: string[] }) => (
    <div className="gap-3 flex flex-col">
        {tags.map((val) => (
            <div key={val} className="flex items-center gap-3">
                <Checkbox id={val} />
                <Label htmlFor={val}>{val}</Label>
            </div>
        ))}
    </div>
))

interface Props {
    tags: string[] // Will come from API
}

const PublicFeedSidebar = ({ tags }: Props) => {
    const [locationModalOpen, setLocationModalOpen] = useState(false)
    const { t } = useTranslation()

    return (
        <div className="w-full md:w-1/4 p-4 bg-card text-card-foreground rounded-lg shadow-sm border border-border">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">{t("public_feed.sidebar.filterTitle")}</h2>
                <button className="text-sm text-primary hover:underline">
                    {t("public_feed.sidebar.clearFilters")}
                </button>
            </div>

            {/* Location modal */}
            {locationModalOpen && (
                <LocationSelectionModal
                    isOpen={locationModalOpen}
                    onOpenChange={() => setLocationModalOpen(false)}
                />
            )}

            <div className="space-y-6">
                {/* Location section */}
                <div className="hover:cursor-pointer" onClick={() => setLocationModalOpen(true)}>
                    <h3 className="text-md font-semibold mb-2">{t("public_feed.sidebar.locationTitle")}</h3>
                    <div className="flex flex-row items-center gap-3">
                        <p className="text-sm text-muted-foreground">
                            {t("public_feed.sidebar.locationPlaceholder")}
                        </p>
                        <MapPinPenIcon className="w-4 h-4 text-muted-foreground" />
                    </div>
                </div>

                {/* Type section */}
                <div>
                    <h3 className="text-md font-semibold mb-2">{t("public_feed.sidebar.typeTitle")}</h3>
                    <RadioGroup>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="all" id="all" />
                            <Label htmlFor="all">{t("public_feed.sidebar.typeOptions.all")}</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="restaurants" id="restaurants" />
                            <Label htmlFor="restaurants">{t("public_feed.sidebar.typeOptions.restaurants")}</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="coffee-shops" id="coffee-shops" />
                            <Label htmlFor="coffee-shops">{t("public_feed.sidebar.typeOptions.coffeeShops")}</Label>
                        </div>
                    </RadioGroup>
                </div>
            </div>

            {/* Tags section */}
            <div className="space-y-6 mt-6">
                <div>
                    <h3 className="text-md font-semibold mb-2">{t("public_feed.sidebar.tagsTitle")}</h3>
                    <TagsList tags={tags} />
                </div>
            </div>
        </div>
    )
}

export default PublicFeedSidebar
