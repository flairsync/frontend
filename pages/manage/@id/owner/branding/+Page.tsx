"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"

import { clientOnly } from "vike-react/clientOnly"
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
            <AccordionItem value="logo" className="border rounded-lg px-3">
                <AccordionTrigger>Logo</AccordionTrigger>
                <AccordionContent className="space-y-4 py-2">
                    <Input
                        placeholder="Logo URL"
                        value={logoUrl}
                        onChange={(e) => setLogoUrl(e.target.value)}
                    />
                    <Button onClick={saveLogo}>Save</Button>
                </AccordionContent>
            </AccordionItem>

            {/* Gallery */}
            <AccordionItem value="gallery" className="border rounded-lg px-3">
                <AccordionTrigger>Gallery</AccordionTrigger>
                <AccordionContent className="space-y-4 py-2">
                    <div className="space-y-2">
                        {galleryUrls.length === 0 && <p>No images added yet.</p>}
                        {galleryUrls.map((url, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <span>{url}</span>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() =>
                                        setGalleryUrls(galleryUrls.filter((_, i) => i !== index))
                                    }
                                >
                                    Remove
                                </Button>
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={addGalleryImage}>Add Image</Button>
                        <Button onClick={saveGallery}>Save Gallery</Button>
                    </div>
                </AccordionContent>
            </AccordionItem>


            {/* Virtual tour */}
            <AccordionItem value="virtua_tour" className="border rounded-lg px-3">
                <AccordionTrigger>Virtual tour</AccordionTrigger>
                <AccordionContent className="space-y-4 py-2">
                    <BusinessBrandingVirtualViewer />
                </AccordionContent>
            </AccordionItem>

            {/* Description */}
            <AccordionItem value="description" className="border rounded-lg px-3">
                <AccordionTrigger>Description</AccordionTrigger>
                <AccordionContent className="space-y-4 py-2">
                    <Textarea
                        placeholder="Write a description about your restaurant or coffee shop"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                    <Button onClick={saveDescription}>Save Description</Button>
                </AccordionContent>
            </AccordionItem>

            {/* Video */}
            <AccordionItem value="video" className="border rounded-lg px-3">
                <AccordionTrigger>Video</AccordionTrigger>
                <AccordionContent className="space-y-4 py-2">
                    <Input
                        placeholder="Video URL"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                    />
                    <Button onClick={saveVideo}>Save Video</Button>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    )
}

export default BusinessBrandingPage
