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
import { usePageContext } from "vike-react/usePageContext"
import { useMyBusiness } from "@/features/business/useMyBusiness"
const BusinessBrandingVirtualViewer = clientOnly(() =>
    import("@/components/management/branding/BusinessBrandingVirtualViewer")
)


const BusinessBrandingPage = () => {

    const {
        routeParams
    } = usePageContext();


    const {
        myBusinessFullDetails,
        fetchingMyBusinessFullDetails,
        updatingMyBusiness,
        updateBusinessLogo,
        updatingBusinessLogo,
        updateMyBusinessGallery,
        updatingMyBusinessGallery,

    } = useMyBusiness(routeParams.id);


    return (
        <Accordion type="single" collapsible className="w-full space-y-2" onValueChange={(val) => {

        }} >
            {/* Logo */}
            <AccordionItem value="logo" className="border rounded-lg px-3  ">
                <AccordionTrigger className="hover:cursor-pointer ">Logo</AccordionTrigger>

                <AccordionContent className="space-y-4 py-2">
                    <BusinessBrandingLogoUpload
                        onSave={(f) => {
                            updateBusinessLogo({
                                file: f
                            })
                        }}
                        currentLogoUrl={myBusinessFullDetails?.logo}
                        loading={fetchingMyBusinessFullDetails || updatingBusinessLogo}

                    />
                </AccordionContent>
            </AccordionItem>

            {/* Gallery */}
            <AccordionItem value="gallery" className="border rounded-lg px-3" >
                <AccordionTrigger className="hover:cursor-pointer ">Gallery</AccordionTrigger>
                <AccordionContent className="space-y-4 py-2">
                    <BusinessBrandingGalleryUpload
                        loading={fetchingMyBusinessFullDetails || updatingMyBusinessGallery}
                        businessMedia={myBusinessFullDetails?.media || []}
                        onSave={(updateData) => {
                            updateMyBusinessGallery(updateData);
                        }}
                    />
                </AccordionContent>
            </AccordionItem>


            {/* Virtual tour */}
            {/*   
         // FUTURE FEATURE 
         <AccordionItem value="virtua_tour" className="border rounded-lg px-3">
                <AccordionTrigger className="hover:cursor-pointer ">Virtual tour</AccordionTrigger>
                <AccordionContent className="space-y-4 py-2">
                    <BusinessBrandingVirtualViewer />
                </AccordionContent>
            </AccordionItem> */}


        </Accordion>
    )
}

export default BusinessBrandingPage
