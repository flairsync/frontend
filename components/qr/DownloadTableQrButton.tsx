import { useState } from "react";
import { Button } from "@/components/ui/button";
import { QrCode, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { fetchQrPreviewBlob } from "@/features/qr/service";
import { downloadBlob } from "@/lib/downloadBlob";

interface DownloadTableQrButtonProps {
    businessId: string;
    tableId: string;
    tableName: string;
}

export function DownloadTableQrButton({ businessId, tableId, tableName }: DownloadTableQrButtonProps) {
    const [downloading, setDownloading] = useState(false);

    const handleDownload = async () => {
        setDownloading(true);
        try {
            const blob = await fetchQrPreviewBlob(businessId, { type: "table", tableId }, "png");
            downloadBlob(blob, `qr-${tableName || tableId}.png`);
        } catch {
            toast.error("Failed to download QR code");
        } finally {
            setDownloading(false);
        }
    };

    return (
        <Button size="icon" variant="ghost" onClick={handleDownload} disabled={downloading} title="Download QR code">
            {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <QrCode className="w-4 h-4" />}
        </Button>
    );
}
