"use client"

import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { Separator } from "@/components/ui/separator"

import { clientOnly } from "vike-react/clientOnly"
import { CardDescription } from "@/components/ui/card"
import BusinessBrandingLogoUpload from "@/components/management/branding/BusinessBrandingLogoUpload"
import BusinessBrandingGalleryUpload from "@/components/management/branding/BusinessBrandingGalleryUpload"
import { usePageContext } from "vike-react/usePageContext"
import { useMyBusiness } from "@/features/business/useMyBusiness"
import { DownloadBusinessQrButton } from "@/components/qr/DownloadBusinessQrButton"
import { ExternalLink } from "lucide-react"
const BusinessBrandingVirtualViewer = clientOnly(() =>
    import("@/components/management/branding/BusinessBrandingVirtualViewer")
)
const QrDesignEditor = clientOnly(() => import("@/components/qr/QrDesignEditor"))


const BusinessBrandingPage = () => {
    const { t } = useTranslation("management");

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
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">{t("branding_page.title")}</h1>

            <Separator />

            <Accordion type="single" collapsible className="w-full space-y-2" onValueChange={(val) => {

            }} >
            {/* QR Code */}
            <AccordionItem value="qr-code" className="border rounded-lg px-3">
                <AccordionTrigger className="hover:cursor-pointer ">{t("branding_page.qr_code")}</AccordionTrigger>
                <AccordionContent className="space-y-4 py-2">
                    <div className="flex items-center justify-between gap-2">
                        {myBusinessFullDetails?.id && (
                            <a
                                href={`/business/${myBusinessFullDetails.slug || myBusinessFullDetails.id}/site`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-xs text-primary hover:underline"
                            >
                                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                                {t("branding_page.qr_code_points_to")}
                            </a>
                        )}
                        <DownloadBusinessQrButton businessId={routeParams.id} />
                    </div>
                    <QrDesignEditor businessId={routeParams.id} />
                </AccordionContent>
            </AccordionItem>

            {/* Logo */}
            <AccordionItem value="logo" className="border rounded-lg px-3  ">
                <AccordionTrigger className="hover:cursor-pointer ">{t("branding_page.logo")}</AccordionTrigger>

                <AccordionContent className="space-y-4 py-2">
                    <BusinessBrandingLogoUpload
                        onSave={(f) => {
                            updateBusinessLogo({
                                file: f
                            })
                        }}
                        currentLogoUrl={myBusinessFullDetails?.logo ? `${myBusinessFullDetails.logo}?v=${new Date(myBusinessFullDetails.updatedAt).getTime()}` : undefined}
                        loading={fetchingMyBusinessFullDetails || updatingBusinessLogo}

                    />
                </AccordionContent>
            </AccordionItem>

            {/* Gallery */}
            <AccordionItem value="gallery" className="border rounded-lg px-3" >
                <AccordionTrigger className="hover:cursor-pointer ">{t("branding_page.gallery")}</AccordionTrigger>
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
        </div>
    )
}

export default BusinessBrandingPage
