import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"

const ProfilePreferencesPage = () => {
    const [themeDark, setThemeDark] = useState(false)
    const [restaurantTypes, setRestaurantTypes] = useState({
        halal: true,
        vegan: false,
        glutenFree: true,
    })
    const [maxDistance, setMaxDistance] = useState(10) // in km

    const toggleRestaurantType = (type: keyof typeof restaurantTypes) => {
        setRestaurantTypes((prev) => ({ ...prev, [type]: !prev[type] }))
    }

    const saveTheme = () => alert(`Theme saved: ${themeDark ? "Dark" : "Light"}`)
    const saveRestaurantTypes = () =>
        alert(`Selected types: ${Object.entries(restaurantTypes)
            .filter(([_, v]) => v)
            .map(([k]) => k)
            .join(", ")}`)
    const saveMaxDistance = () => alert(`Max distance: ${maxDistance} km`)

    return (
        <div className="space-y-6">
            {/* Theme Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Theme</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <Label>Dark Mode</Label>
                        <Switch checked={themeDark} onCheckedChange={setThemeDark} />
                    </div>
                    <Button onClick={saveTheme} className="self-start">Save</Button>
                </CardContent>
            </Card>

            {/* Restaurant Types Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Restaurant Types</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                    {Object.entries(restaurantTypes).map(([type, value]) => (
                        <label key={type} className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={value}
                                onChange={() => toggleRestaurantType(type as keyof typeof restaurantTypes)}
                            />
                            {type.charAt(0).toUpperCase() + type.slice(1).replace(/([A-Z])/g, " $1")}
                        </label>
                    ))}
                    <Button onClick={saveRestaurantTypes} className="self-start mt-2">Save</Button>
                </CardContent>
            </Card>

            {/* Max Distance Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Max Distance</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <Label>Maximum Distance: {maxDistance} km</Label>
                    <Slider
                        value={[maxDistance]}
                        onValueChange={(val) => setMaxDistance(val[0])}
                        min={1}
                        max={50}
                    />
                    <Button onClick={saveMaxDistance} className="self-start">Save</Button>
                </CardContent>
            </Card>
        </div>
    )
}

export default ProfilePreferencesPage
