import React, { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Label } from "../ui/label"
import { Form, Formik } from "formik"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { clientOnly } from "vike-react/clientOnly"
import { MapPinPenIcon } from "lucide-react"

const LocationSelectionModal = clientOnly(() =>
    import("@/components/inputs/LocationSelectionModal")
)

const restaurantTags = [
    "Halal",
    "Vegan",
    "Vegetarian",
    "Gluten-Free",
    "Organic",
    "Kosher",
    "Dairy-Free",
    "Nut-Free",
    "Locally Sourced",
    "Fair Trade",
    "Pet-Friendly",
    "Outdoor Seating",
    "Takeaway",
    "Delivery",
    "Kid-Friendly",
    "Wi-Fi",
    "Wheelchair Accessible",
]

const PublicFeedSidebar = () => {
    const [locationModalOpen, setLocationModalOpen] = useState(false)

    return (
        <div className="w-full md:w-1/4 p-4 bg-card text-card-foreground rounded-lg shadow-sm border border-border">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Filter</h2>
                <button className="text-sm text-primary hover:underline">
                    Clear filters
                </button>
            </div>

            {/* Location modal */}
            <LocationSelectionModal
                isOpen={locationModalOpen}
                onOpenChange={() => {
                    setLocationModalOpen(false)
                }}
            />

            {/* Form */}
            <Formik
                initialValues={{
                    searchType: "all",
                }}
                onSubmit={(values) => {
                    console.log(values)
                }}
            >
                {({ values, setFieldValue }) => (
                    <Form className="space-y-6">
                        {/* Location section */}
                        <div
                            className="hover:cursor-pointer"
                            onClick={() => setLocationModalOpen(true)}
                        >
                            <h3 className="text-md font-semibold mb-2">Location</h3>
                            <div className="flex flex-row items-center gap-3">
                                <p className="text-sm text-muted-foreground">
                                    Andorra la vella, AD 500
                                </p>
                                <MapPinPenIcon className="w-4 h-4 text-muted-foreground" />
                            </div>
                        </div>

                        {/* Type section */}
                        <div>
                            <h3 className="text-md font-semibold mb-2">Type</h3>
                            <RadioGroup
                                defaultValue={values.searchType}
                                value={values.searchType}
                                onValueChange={(val) => setFieldValue("searchType", val)}
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="all" id="all" />
                                    <Label htmlFor="all">All</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="restaurants" id="restaurants" />
                                    <Label htmlFor="restaurants">Restaurants</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="coffee-shops" id="coffee-shops" />
                                    <Label htmlFor="coffee-shops">Coffee shops</Label>
                                </div>
                            </RadioGroup>
                        </div>
                    </Form>
                )}
            </Formik>

            {/* Tags section */}
            <div className="space-y-6 mt-6">
                <div>
                    <h3 className="text-md font-semibold mb-2">Tags</h3>
                    <div className="gap-3 flex flex-col">
                        {restaurantTags.map((val) => (
                            <div key={val} className="flex items-center gap-3">
                                <Checkbox id={val} />
                                <Label htmlFor={val}>{val}</Label>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PublicFeedSidebar
