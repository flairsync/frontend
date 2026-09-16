import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Loader2, Printer, QrCode } from "lucide-react";
import { toast } from "sonner";
import { fetchQrPreviewBlob, fetchLoyaltyFlyerPdfBlob } from "@/features/qr/service";
import { downloadBlob } from "@/lib/downloadBlob";

type LoyaltyQrCardProps = {
    businessId: string;
};

export function LoyaltyQrCard({ businessId }: LoyaltyQrCardProps) {
    const { t } = useTranslation("management");
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const [printing, setPrinting] = useState(false);

    useEffect(() => {
        let objectUrl: string | null = null;
        setLoading(true);
        fetchQrPreviewBlob(businessId, { type: "loyalty" }, "png")
            .then((blob) => {
                objectUrl = URL.createObjectURL(blob);
                setImageUrl(objectUrl);
            })
            .catch(() => toast.error(t("loyalty_management.qr.load_error")))
            .finally(() => setLoading(false));

        return () => {
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [businessId, t]);

    const handleDownload = async () => {
        setDownloading(true);
        try {
            const blob = await fetchQrPreviewBlob(businessId, { type: "loyalty" }, "png");
            downloadBlob(blob, "loyalty-qr-code.png");
        } catch {
            toast.error(t("loyalty_management.qr.download_error"));
        } finally {
            setDownloading(false);
        }
    };

    const handlePrintFlyer = async () => {
        setPrinting(true);
        try {
            const blob = await fetchLoyaltyFlyerPdfBlob(businessId);
            downloadBlob(blob, "loyalty-qr-codes.pdf");
        } catch {
            toast.error(t("loyalty_management.qr.flyer_error"));
        } finally {
            setPrinting(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <QrCode className="h-5 w-5 text-primary" />
                    <CardTitle>{t("loyalty_management.qr.title")}</CardTitle>
                </div>
                <CardDescription>{t("loyalty_management.qr.subtitle")}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
                <div className="flex h-48 w-48 items-center justify-center rounded-lg border bg-muted/30">
                    {loading ? (
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    ) : imageUrl ? (
                        <img src={imageUrl} alt={t("loyalty_management.qr.title")} className="h-full w-full object-contain p-2" />
                    ) : null}
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleDownload} disabled={downloading || loading} className="gap-2">
                        {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                        {t("loyalty_management.qr.download_button")}
                    </Button>
                    <Button variant="outline" onClick={handlePrintFlyer} disabled={printing || loading} className="gap-2">
                        {printing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />}
                        {t("loyalty_management.qr.flyer_button")}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
