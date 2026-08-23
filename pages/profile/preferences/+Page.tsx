"use client"

import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

const ProfilePreferencesPage = () => {
    const { t } = useTranslation("profile")
    const [themeDark, setThemeDark] = useState(false)
    const [restaurantTypes, setRestaurantTypes] = useState({
        halal: true,
        vegan: false,
        glutenFree: true,
    })
    const [maxDistance, setMaxDistance] = useState(10)

    const toggleRestaurantType = (type: keyof typeof restaurantTypes) => {
        setRestaurantTypes((prev) => ({ ...prev, [type]: !prev[type] }))
    }

    const restaurantTypeLabel = (type: keyof typeof restaurantTypes) => t(`preferences_page.restaurant_types.${type}`)

    const saveTheme = () => alert(t("preferences_page.theme_saved", { theme: themeDark ? t("preferences_page.dark") : t("preferences_page.light") }))
    const saveRestaurantTypes = () =>
        alert(
            t("preferences_page.selected_types", {
                types: Object.entries(restaurantTypes)
                    .filter(([_, v]) => v)
                    .map(([k]) => restaurantTypeLabel(k as keyof typeof restaurantTypes))
                    .join(", ")
            })
        )
    const saveMaxDistance = () => alert(t("preferences_page.max_distance_saved", { distance: maxDistance }))

    return (
        <Accordion type="single" collapsible className="w-full space-y-2">
            {/* Theme */}
            <AccordionItem value="theme" className="border rounded-lg px-3">
                <AccordionTrigger>{t("preferences_page.theme")}</AccordionTrigger>
                <AccordionContent className="space-y-4 py-2">
                    <div className="flex items-center justify-between">
                        <Label>{t("preferences_page.dark_mode")}</Label>
                        <Switch checked={themeDark} onCheckedChange={setThemeDark} />
                    </div>
                    <Button onClick={saveTheme}>{t("preferences_page.save")}</Button>
                </AccordionContent>
            </AccordionItem>

            {/* Restaurant Types */}
            <AccordionItem value="restaurant-types" className="border rounded-lg px-3">
                <AccordionTrigger>{t("preferences_page.restaurant_types_title")}</AccordionTrigger>
                <AccordionContent className="space-y-3 py-2">
                    {Object.entries(restaurantTypes).map(([type, value]) => (
                        <label key={type} className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={value}
                                onChange={() =>
                                    toggleRestaurantType(type as keyof typeof restaurantTypes)
                                }
                            />
                            {restaurantTypeLabel(type as keyof typeof restaurantTypes)}
                        </label>
                    ))}
                    <Button onClick={saveRestaurantTypes}>{t("preferences_page.save")}</Button>
                </AccordionContent>
            </AccordionItem>

            {/* Max Distance */}
            <AccordionItem value="max-distance" className="border rounded-lg px-3">
                <AccordionTrigger>{t("preferences_page.max_distance")}</AccordionTrigger>
                <AccordionContent className="space-y-4 py-2">
                    <Label className="text-sm">
                        {t("preferences_page.maximum_distance", { distance: maxDistance })}
                    </Label>
                    <Slider
                        value={[maxDistance]}
                        onValueChange={(val) => setMaxDistance(val[0])}
                        min={1}
                        max={50}
                    />
                    <Button onClick={saveMaxDistance}>{t("preferences_page.save")}</Button>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    )
}

export default ProfilePreferencesPage
