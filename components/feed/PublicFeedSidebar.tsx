import React, { useState } from "react"
import { Label } from "../ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { MapPin, SlidersHorizontal, ChevronRight, ChevronDown, ChevronUp, Star } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
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
import { useBusinessTypes } from "@/features/business/types/useBusinessTypes"
import { cn } from "@/lib/utils"

const TAGS_VISIBLE_DEFAULT = 8

interface Props {
    tags?: BusinessTag[]
    selectedTypeId?: string
    onTypeChange: (typeId: string) => void
    selectedTagIds: string[]
    onTagToggle: (tagId: string) => void
    selectedMinRating?: number
    onMinRatingChange: (rating: number | undefined) => void
    onLocationClick: () => void
    onClearFilters: () => void
    locationLabel?: string
}

// ---- Collapsible section wrapper ---- //
function FilterSection({
    title,
    children,
    defaultOpen = true,
}: {
    title: string
    children: React.ReactNode
    defaultOpen?: boolean
}) {
    const [open, setOpen] = useState(defaultOpen)
    return (
        <div className="space-y-3">
            <button
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between group"
            >
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70 group-hover:text-muted-foreground transition-colors">
                    {title}
                </h3>
                <motion.span
                    animate={{ rotate: open ? 180 : 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="inline-flex text-muted-foreground/50"
                >
                    <ChevronDown size={14} />
                </motion.span>
            </button>
            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        style={{ overflow: "hidden" }}
                    >
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

// ---- Rating filter ---- //
function RatingFilter({
    selected,
    onChange,
}: {
    selected?: number
    onChange: (r: number | undefined) => void
}) {
    const options = [2, 3, 4, 5]
    return (
        <div className="flex flex-wrap gap-2">
            <button
                onClick={() => onChange(undefined)}
                className={cn(
                    "flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold border transition-all",
                    selected === undefined
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                )}
            >
                Any
            </button>
            {options.map(r => (
                <button
                    key={r}
                    onClick={() => onChange(selected === r ? undefined : r)}
                    className={cn(
                        "flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold border transition-all",
                        selected === r
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-card border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                    )}
                >
                    <Star size={11} className={selected === r ? "fill-primary-foreground text-primary-foreground" : "fill-yellow-400 text-yellow-400"} />
                    {r}+
                </button>
            ))}
        </div>
    )
}

// ---- Tags as pill toggles ---- //
function TagPills({
    tags,
    selectedTagIds,
    onTagToggle,
    t,
}: {
    tags?: BusinessTag[]
    selectedTagIds: string[]
    onTagToggle: (id: string) => void
    t: any
}) {
    const [expanded, setExpanded] = useState(false)
    if (!tags || tags.length === 0) return null

    const hiddenCount = tags.length - TAGS_VISIBLE_DEFAULT
    const alwaysVisible = tags.slice(0, TAGS_VISIBLE_DEFAULT)
    const extra = tags.slice(TAGS_VISIBLE_DEFAULT)

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
                {alwaysVisible.map(tag => {
                    const active = selectedTagIds.includes(tag.id)
                    return (
                        <motion.button
                            key={tag.id}
                            layout
                            onClick={() => onTagToggle(tag.id)}
                            className={cn(
                                "px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors",
                                active
                                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                    : "bg-card border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                            )}
                        >
                            {t(`shared.tags.${tag.name}`, tag.name)}
                        </motion.button>
                    )
                })}
                <AnimatePresence initial={false}>
                    {expanded && extra.map((tag, i) => {
                        const active = selectedTagIds.includes(tag.id)
                        return (
                            <motion.button
                                key={tag.id}
                                layout
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.15, delay: i * 0.03 }}
                                onClick={() => onTagToggle(tag.id)}
                                className={cn(
                                    "px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors",
                                    active
                                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                        : "bg-card border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                                )}
                            >
                                {t(`shared.tags.${tag.name}`, tag.name)}
                            </motion.button>
                        )
                    })}
                </AnimatePresence>
            </div>
            {tags.length > TAGS_VISIBLE_DEFAULT && (
                <button
                    onClick={() => setExpanded(e => !e)}
                    className="text-xs font-semibold text-primary hover:underline underline-offset-4 transition-all flex items-center gap-1"
                >
                    <motion.span
                        animate={{ rotate: expanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="inline-flex"
                    >
                        <ChevronDown size={12} />
                    </motion.span>
                    {expanded ? "Show less" : `${hiddenCount} more`}
                </button>
            )}
        </div>
    )
}

const PublicFeedSidebar = ({
    tags,
    selectedTypeId,
    onTypeChange,
    selectedTagIds,
    onTagToggle,
    selectedMinRating,
    onMinRatingChange,
    onLocationClick,
    onClearFilters,
    locationLabel,
}: Props) => {
    const [filterModalOpen, setFilterModalOpen] = useState(false)
    const { t } = useTranslation()
    const { businessTypes } = useBusinessTypes()

    const typeOptions = [
        { id: 'all', label: t("shared.actions.all") },
        ...(businessTypes?.map(bt => ({ id: bt.id.toString(), label: t(`business_types.${bt.name}`) })) || [])
    ]

    const activeFilterCount = [
        selectedTypeId && selectedTypeId !== 'all',
        selectedTagIds.length > 0,
        selectedMinRating !== undefined,
    ].filter(Boolean).length

    const FiltersContent = (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold tracking-tight">
                    {t("public_feed.sidebar.filterTitle")}
                </h2>
                <button
                    onClick={onClearFilters}
                    className="text-xs font-semibold text-primary hover:underline underline-offset-4 transition-all"
                >
                    {t("public_feed.sidebar.clearFilters")}
                </button>
            </div>

            <Separator className="bg-border/50" />

            {/* Location */}
            <FilterSection title={t("public_feed.sidebar.locationTitle")}>
                <button
                    onClick={onLocationClick}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-transparent hover:border-primary/20 hover:bg-muted transition-all group"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-background shadow-sm text-primary group-hover:scale-110 transition-transform">
                            <MapPin className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium text-foreground/80 truncate max-w-[150px]">
                            {locationLabel || t("public_feed.sidebar.locationPlaceholder")}
                        </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </button>
            </FilterSection>

            <Separator className="bg-border/30" />

            {/* Rating */}
            <FilterSection title="Minimum Rating">
                <RatingFilter selected={selectedMinRating} onChange={onMinRatingChange} />
            </FilterSection>

            <Separator className="bg-border/30" />

            {/* Type */}
            <FilterSection title={t("public_feed.sidebar.typeTitle")}>
                <RadioGroup
                    value={selectedTypeId || 'all'}
                    onValueChange={onTypeChange}
                    className="grid gap-1.5"
                >
                    {typeOptions.map((option) => (
                        <div key={option.id} className="relative">
                            <RadioGroupItem value={option.id} id={`type-${option.id}`} className="peer sr-only" />
                            <Label
                                htmlFor={`type-${option.id}`}
                                className="flex items-center justify-between px-3 py-2 rounded-xl border border-border bg-card text-sm font-medium hover:bg-accent transition-all cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:ring-1 peer-data-[state=checked]:ring-primary/20 peer-data-[state=checked]:bg-primary/5"
                            >
                                {option.label}
                            </Label>
                        </div>
                    ))}
                </RadioGroup>
            </FilterSection>

            <Separator className="bg-border/30" />

            {/* Tags */}
            <FilterSection title={t("public_feed.sidebar.tagsTitle")}>
                <TagPills
                    tags={tags}
                    selectedTagIds={selectedTagIds}
                    onTagToggle={onTagToggle}
                    t={t}
                />
            </FilterSection>
        </div>
    )

    return (
        <>
            {/* Desktop */}
            <aside className="hidden md:block w-full md:w-1/4">
                <div className="sticky top-[calc(var(--public-header-height)+1.5rem)] p-6 bg-card border border-border/50 rounded-2xl shadow-sm max-h-[calc(100vh-8rem)] overflow-y-auto">
                    {FiltersContent}
                </div>
            </aside>

            {/* Mobile */}
            <div className="block md:hidden w-full px-4 mb-4">
                <Dialog open={filterModalOpen} onOpenChange={setFilterModalOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="w-full h-12 rounded-xl flex items-center justify-between px-4 border-border/50 bg-card hover:bg-accent shadow-sm">
                            <div className="flex items-center gap-2">
                                <SlidersHorizontal className="w-4 h-4 text-primary" />
                                <span className="font-semibold">{t("public_feed.sidebar.filterButton", "Filters")}</span>
                                {activeFilterCount > 0 && (
                                    <span className="bg-primary text-primary-foreground text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                                        {activeFilterCount}
                                    </span>
                                )}
                            </div>
                            <Separator orientation="vertical" className="h-4 mx-2" />
                            <span className="text-xs text-muted-foreground font-medium truncate max-w-[180px]">
                                {[
                                    locationLabel,
                                    selectedTypeId && selectedTypeId !== 'all' ? (typeOptions.find(o => o.id === selectedTypeId)?.label) : undefined,
                                    selectedTagIds.length > 0 ? `${selectedTagIds.length} tags` : undefined,
                                    selectedMinRating ? `${selectedMinRating}★+` : undefined,
                                ].filter(Boolean).join(' · ') || t("public_feed.sidebar.anyType", "No filters")}
                            </span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md rounded-t-3xl sm:rounded-3xl border-none shadow-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-left text-xl font-bold">{t("public_feed.sidebar.filterTitle")}</DialogTitle>
                        </DialogHeader>
                        <div className="mt-4">{FiltersContent}</div>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    )
}

export default PublicFeedSidebar
