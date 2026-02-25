import React, { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "../ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { clientOnly } from "vike-react/clientOnly"
import { MapPin, SlidersHorizontal, ChevronRight } from "lucide-react"
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
import { Separator } from "@/components/ui/separator"

const LocationSelectionModal = clientOnly(() =>
    import("@/components/inputs/LocationSelectionModal")
)

const TagsList = React.memo(({ tags, t }: { tags?: BusinessTag[], t: any }) => (
    <div className="space-y-3">
        {tags?.map((val) => (
            <div key={val.id} className="flex items-center space-x-3 group">
                <Checkbox
                    id={val.id}
                    className="border-muted-foreground/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-colors"
                />
                <Label
                    htmlFor={val.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 group-hover:text-primary transition-colors cursor-pointer"
                >
                    {t(`shared.tags.${val.name}`)}
                </Label>
            </div>
        ))}
    </div>
))

interface Props {
    tags?: BusinessTag[]
}

const PublicFeedSidebar = ({ tags }: Props) => {
    const [locationModalOpen, setLocationModalOpen] = useState(false)
    const [filterModalOpen, setFilterModalOpen] = useState(false)
    const { t } = useTranslation()

    const FiltersContent = (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex justify-between items-end">
                <h2 className="text-2xl font-bold tracking-tight">
                    {t("public_feed.sidebar.filterTitle")}
                </h2>
                <button className="text-xs font-semibold text-primary hover:underline underline-offset-4 transition-all">
                    {t("public_feed.sidebar.clearFilters")}
                </button>
            </div>

            <Separator className="bg-border/50" />

            {/* Location section */}
            <div className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/70">
                    {t("public_feed.sidebar.locationTitle")}
                </h3>
                <button
                    onClick={() => setLocationModalOpen(true)}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-transparent hover:border-primary/20 hover:bg-muted transition-all group"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-background shadow-sm text-primary group-hover:scale-110 transition-transform">
                            <MapPin className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium text-foreground/80">
                            {t("public_feed.sidebar.locationPlaceholder")}
                        </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </button>
            </div>

            {/* Type section */}
            <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/70">
                    {t("public_feed.sidebar.typeTitle")}
                </h3>
                <RadioGroup defaultValue="all" className="grid gap-2">
                    {[
                        { id: 'all', label: t("public_feed.sidebar.typeOptions.all") },
                        { id: 'restaurants', label: t("public_feed.sidebar.typeOptions.restaurants") },
                        { id: 'coffee-shops', label: t("public_feed.sidebar.typeOptions.coffeeShops") }
                    ].map((option) => (
                        <div key={option.id} className="relative">
                            <RadioGroupItem value={option.id} id={option.id} className="peer sr-only" />
                            <Label
                                htmlFor={option.id}
                                className="flex items-center justify-between p-3 rounded-xl border border-border bg-card shadow-sm hover:bg-accent transition-all cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:ring-1 peer-data-[state=checked]:ring-primary/20 peer-data-[state=checked]:bg-primary/5"
                            >
                                <span className="text-sm font-medium">{option.label}</span>
                                <div className="w-2 h-2 rounded-full bg-primary opacity-0 peer-data-[state=checked]:opacity-100 transition-opacity" />
                            </Label>
                        </div>
                    ))}
                </RadioGroup>
            </div>

            {/* Tags section */}
            <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/70">
                    {t("public_feed.sidebar.tagsTitle")}
                </h3>
                <TagsList tags={tags} t={t} />
            </div>

            {/* Location modal */}
            {locationModalOpen && (
                <LocationSelectionModal
                    isOpen={locationModalOpen}
                    onOpenChange={() => setLocationModalOpen(false)}
                />
            )}
        </div>
    )

    return (
        <>
            {/* Desktop view */}
            <aside className="hidden md:block w-full md:w-1/4">
                <div className="sticky top-[calc(var(--public-header-height)+1.5rem)] p-6 bg-card border border-border/50 rounded-2xl shadow-sm">
                    {FiltersContent}
                </div>
            </aside>

            {/* Mobile view */}
            <div className="block md:hidden w-full px-4 mb-4">
                <Dialog open={filterModalOpen} onOpenChange={setFilterModalOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="w-full h-12 rounded-xl flex items-center justify-between px-4 border-border/50 bg-card hover:bg-accent shadow-sm">
                            <div className="flex items-center gap-2">
                                <SlidersHorizontal className="w-4 h-4 text-primary" />
                                <span className="font-semibold">{t("public_feed.sidebar.filterButton", "Filters")}</span>
                            </div>
                            <Separator orientation="vertical" className="h-4 mx-2" />
                            <span className="text-xs text-muted-foreground font-medium">Any type, Any location</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md rounded-t-3xl sm:rounded-3xl border-none shadow-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-left text-2xl font-bold">{t("public_feed.sidebar.filterTitle")}</DialogTitle>
                        </DialogHeader>
                        <div className="mt-6">{FiltersContent}</div>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    )
}

export default PublicFeedSidebar

