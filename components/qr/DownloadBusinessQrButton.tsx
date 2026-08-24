import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { fetchQrPreviewBlob } from "@/features/qr/service";
import { downloadBlob } from "@/lib/downloadBlob";

interface DownloadBusinessQrButtonProps {
    businessId: string;
}

export function DownloadBusinessQrButton({ businessId }: DownloadBusinessQrButtonProps) {
    const { t } = useTranslation("management");
    const [downloading, setDownloading] = useState(false);

    const handleDownload = async (format: "png" | "svg") => {
        setDownloading(true);
        try {
            const blob = await fetchQrPreviewBlob(businessId, { type: "business" }, format);
            downloadBlob(blob, `qr-code.${format}`);
        } catch {
            toast.error(t("branding_page.qr_download.error"));
        } finally {
            setDownloading(false);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2" disabled={downloading}>
                    {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                    {t("branding_page.qr_download.button")}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleDownload("png")}>{t("branding_page.qr_download.png")}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDownload("svg")}>{t("branding_page.qr_download.svg")}</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
