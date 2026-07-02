import { useState } from "react";
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
    const [downloading, setDownloading] = useState(false);

    const handleDownload = async (format: "png" | "svg") => {
        setDownloading(true);
        try {
            const blob = await fetchQrPreviewBlob(businessId, { type: "business" }, format);
            downloadBlob(blob, `qr-code.${format}`);
        } catch {
            toast.error("Failed to download QR code");
        } finally {
            setDownloading(false);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2" disabled={downloading}>
                    {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                    Download QR code
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleDownload("png")}>Download PNG</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDownload("svg")}>Download SVG</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
