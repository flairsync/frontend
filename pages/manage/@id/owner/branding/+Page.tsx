"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"

import { clientOnly } from "vike-react/clientOnly"
import { CardDescription } from "@/components/ui/card"
import BusinessBrandingLogoUpload from "@/components/management/branding/BusinessBrandingLogoUpload"
import BusinessBrandingGalleryUpload from "@/components/management/branding/BusinessBrandingGalleryUpload"
const BusinessBrandingVirtualViewer = clientOnly(() =>
    import("@/components/management/branding/BusinessBrandingVirtualViewer")
)


const BusinessBrandingPage = () => {
    // Logo
    const [logoUrl, setLogoUrl] = useState("")

    // Gallery
    const [galleryUrls, setGalleryUrls] = useState<string[]>([])

    // Description
    const [description, setDescription] = useState("")

    // Video
    const [videoUrl, setVideoUrl] = useState("")

    const saveLogo = () => alert("Logo saved")
    const saveGallery = () => alert("Gallery saved")
    const saveDescription = () => alert("Description saved")
    const saveVideo = () => alert("Video saved")

    // Function to add new gallery URL (or could be replaced with file upload)
    const addGalleryImage = () => {
        const url = prompt("Enter image URL")
        if (url) setGalleryUrls([...galleryUrls, url])
    }

    return (
        <Accordion type="single" collapsible className="w-full space-y-2">
            {/* Logo */}
            <AccordionItem value="logo" className="border rounded-lg px-3  ">
                <AccordionTrigger className="hover:cursor-pointer ">Logo</AccordionTrigger>

                <AccordionContent className="space-y-4 py-2">
                    <BusinessBrandingLogoUpload
                        onSave={(f) => { }}

                    />
                </AccordionContent>
            </AccordionItem>

            {/* Gallery */}
            <AccordionItem value="gallery" className="border rounded-lg px-3">
                <AccordionTrigger className="hover:cursor-pointer ">Gallery</AccordionTrigger>
                <AccordionContent className="space-y-4 py-2">
                    <BusinessBrandingGalleryUpload
                        onSave={(f) => {

                        }}
                    />
                </AccordionContent>
            </AccordionItem>


            {/* Virtual tour */}
            <AccordionItem value="virtua_tour" className="border rounded-lg px-3">
                <AccordionTrigger className="hover:cursor-pointer ">Virtual tour</AccordionTrigger>
                <AccordionContent className="space-y-4 py-2">
                    <BusinessBrandingVirtualViewer />
                </AccordionContent>
            </AccordionItem>

            {/* Description */}
            <AccordionItem value="description" className="border rounded-lg px-3">
                <AccordionTrigger className="hover:cursor-pointer ">Description</AccordionTrigger>
                <AccordionContent className="space-y-4 py-2">
                    <Textarea
                        placeholder="Write a description about your restaurant or coffee shop"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                    <Button onClick={saveDescription}>Save Description</Button>
                </AccordionContent>
            </AccordionItem>

        </Accordion>
    )
}

export default BusinessBrandingPage
