import { useState } from "react";
import { Button } from "@/components/ui/button";
import { QrCode, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { fetchWifiQrBlob } from "@/features/qr/service";
import { downloadBlob } from "@/lib/downloadBlob";

interface DownloadWifiQrButtonProps {
    businessId: string;
    wifiNetworkId: string;
    label: string;
}

export function DownloadWifiQrButton({ businessId, wifiNetworkId, label }: DownloadWifiQrButtonProps) {
    const [downloading, setDownloading] = useState(false);

    const handleDownload = async () => {
        setDownloading(true);
        try {
            const blob = await fetchWifiQrBlob(businessId, wifiNetworkId, "png");
            downloadBlob(blob, `wifi-qr-${label || wifiNetworkId}.png`);
        } catch {
            toast.error("Failed to download WiFi QR code");
        } finally {
            setDownloading(false);
        }
    };

    return (
        <Button size="icon" variant="ghost" onClick={handleDownload} disabled={downloading} title="Download WiFi QR code">
            {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <QrCode className="w-4 h-4" />}
        </Button>
    );
}
