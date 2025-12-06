import React, { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "../ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { clientOnly } from "vike-react/clientOnly"
import { MapPinPenIcon, SlidersHorizontal } from "lucide-react"
import { useTranslation } from "react-i18next"
import { BusinessTag } from "@/models/business/BusinessTag"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { t } from "i18next"

const LocationSelectionModal = clientOnly(() =>
    import("@/components/inputs/LocationSelectionModal")
)

const TagsList = React.memo(({ tags }: { tags: BusinessTag[] }) => (
    <div className="gap-3 flex flex-col">
        {tags.map((val) => (
            <div key={val.id} className="flex items-center gap-3">
                <Checkbox id={val.id} />
                <Label htmlFor={val.id}>
                    {t(`public_feed.sidebar.tags.${val.name}`)}
                </Label>
            </div>
        ))}
    </div>
))

interface Props {
    tags: BusinessTag[] // Will come from API
}

const PublicFeedSidebar = ({ tags }: Props) => {
    const [locationModalOpen, setLocationModalOpen] = useState(false)
    const [filterModalOpen, setFilterModalOpen] = useState(false)
    const { t } = useTranslation()

    const FiltersContent = (
        <>
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                    {t("public_feed.sidebar.filterTitle")}
                </h2>
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
                <div
                    className="hover:cursor-pointer"
                    onClick={() => setLocationModalOpen(true)}
                >
                    <h3 className="text-md font-semibold mb-2">
                        {t("public_feed.sidebar.locationTitle")}
                    </h3>
                    <div className="flex flex-row items-center gap-3">
                        <p className="text-sm text-muted-foreground">
                            {t("public_feed.sidebar.locationPlaceholder")}
                        </p>
                        <MapPinPenIcon className="w-4 h-4 text-muted-foreground" />
                    </div>
                </div>

                {/* Type section */}
                <div>
                    <h3 className="text-md font-semibold mb-2">
                        {t("public_feed.sidebar.typeTitle")}
                    </h3>
                    <RadioGroup>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="all" id="all" />
                            <Label htmlFor="all">
                                {t("public_feed.sidebar.typeOptions.all")}
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="restaurants" id="restaurants" />
                            <Label htmlFor="restaurants">
                                {t("public_feed.sidebar.typeOptions.restaurants")}
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="coffee-shops" id="coffee-shops" />
                            <Label htmlFor="coffee-shops">
                                {t("public_feed.sidebar.typeOptions.coffeeShops")}
                            </Label>
                        </div>
                    </RadioGroup>
                </div>
            </div>

            {/* Tags section */}
            <div className="space-y-6 mt-6">
                <div>
                    <h3 className="text-md font-semibold mb-2">
                        {t("public_feed.sidebar.tagsTitle")}
                    </h3>
                    <TagsList tags={tags} />
                </div>
            </div>
        </>
    )

    return (
        <>
            {/* Desktop view */}
            <div className="hidden md:block w-full md:w-1/4 p-4 bg-card text-card-foreground rounded-lg shadow-sm border border-border">
                {FiltersContent}
            </div>

            {/* Mobile view */}
            <div className="block md:hidden w-full px-4 py-2">
                <Dialog open={filterModalOpen} onOpenChange={setFilterModalOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                            <SlidersHorizontal className="w-4 h-4" />
                            {t("public_feed.sidebar.filterButton", "Filters")}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle>{t("public_feed.sidebar.filterTitle")}</DialogTitle>
                        </DialogHeader>
                        <div className="mt-4">{FiltersContent}</div>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    )
}

export default PublicFeedSidebar
