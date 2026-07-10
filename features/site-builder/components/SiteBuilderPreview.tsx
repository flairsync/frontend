import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Monitor, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSiteBuilderPreview } from "../useSiteBuilder";
import SiteBuilderCanvas from "./SiteBuilderCanvas";
import { SitePageContent } from "../types";

interface SiteBuilderPreviewProps {
    open: boolean;
    onClose: () => void;
    businessId: string;
    content: SitePageContent;
    pageTitle?: string;
}

const SiteBuilderPreview: React.FC<SiteBuilderPreviewProps> = ({ open, onClose, businessId, content, pageTitle }) => {
    const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
    const { data: resolvedBindings, isFetching } = useSiteBuilderPreview(businessId, content, open);

    useEffect(() => {
        document.body.style.overflow = open ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [open]);

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[9999] flex flex-col bg-background"
                >
                    <div className="flex items-center justify-between gap-4 px-4 sm:px-6 h-16 border-b border-border shrink-0 bg-card">
                        <div className="flex items-center gap-2 min-w-0">
                            <span className="text-sm font-bold shrink-0">Preview</span>
                            {pageTitle && <span className="text-sm text-muted-foreground truncate">— {pageTitle}</span>}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <div className="flex items-center rounded-full bg-muted p-1">
                                <button
                                    onClick={() => setDevice("desktop")}
                                    className={`p-1.5 rounded-full transition-colors ${device === "desktop" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"
                                        }`}
                                    aria-label="Desktop preview"
                                >
                                    <Monitor size={16} />
                                </button>
                                <button
                                    onClick={() => setDevice("mobile")}
                                    className={`p-1.5 rounded-full transition-colors ${device === "mobile" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"
                                        }`}
                                    aria-label="Mobile preview"
                                >
                                    <Smartphone size={16} />
                                </button>
                            </div>
                            <Button variant="ghost" size="icon" onClick={onClose}>
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto bg-muted/40">
                        <div
                            className={`mx-auto transition-all duration-300 px-4 sm:px-6 py-10 ${device === "mobile" ? "max-w-[420px]" : "max-w-6xl"
                                }`}
                        >
                            {isFetching && !resolvedBindings ? (
                                <div className="space-y-8">
                                    <Skeleton className="h-[420px] w-full rounded-[2.5rem]" />
                                    <Skeleton className="h-[300px] w-full rounded-[2rem]" />
                                </div>
                            ) : content.sections?.length ? (
                                <SiteBuilderCanvas sections={content.sections} mode="public" resolvedBindings={resolvedBindings || {}} />
                            ) : (
                                <div className="py-24 text-center text-muted-foreground">
                                    Add some sections to preview your page.
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SiteBuilderPreview;
