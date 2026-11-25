import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { QrCode, Loader2, Copy, Check, ExternalLink, Download } from "lucide-react";
import { toast } from "sonner";
import { fetchQrPreviewBlob } from "@/features/qr/service";
import { downloadBlob } from "@/lib/downloadBlob";

interface DownloadTableQrButtonProps {
    businessId: string;
    tableId: string;
    tableName: string;
}

export function DownloadTableQrButton({ businessId, tableId, tableName }: DownloadTableQrButtonProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [downloading, setDownloading] = useState(false);
    const [copied, setCopied] = useState(false);

    const tableUrl = `${window.location.origin}/tbl/${businessId}/${tableId}`;

    const handleOpen = async () => {
        setOpen(true);
        if (previewUrl || loading) return;
        setLoading(true);
        try {
            const blob = await fetchQrPreviewBlob(businessId, { type: "table", tableId }, "png");
            setPreviewUrl(URL.createObjectURL(blob));
        } catch {
            toast.error("Failed to load QR code");
            setOpen(false);
        } finally {
            setLoading(false);
        }
    };

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

    const handleCopy = () => {
        navigator.clipboard.writeText(tableUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <>
            <Button size="icon" variant="ghost" onClick={handleOpen} title="View QR code">
                <QrCode className="w-4 h-4" />
            </Button>
            <Dialog
                open={open}
                onOpenChange={(next) => {
                    setOpen(next);
                    if (!next && previewUrl) {
                        URL.revokeObjectURL(previewUrl);
                        setPreviewUrl(null);
                    }
                }}
            >
                <DialogContent className="sm:max-w-sm flex flex-col items-center gap-4">
                    <DialogHeader>
                        <DialogTitle className="text-center">{tableName || "Table"} QR code</DialogTitle>
                    </DialogHeader>

                    {loading && <Loader2 className="w-8 h-8 animate-spin my-8" />}
                    {!loading && previewUrl && (
                        <img src={previewUrl} alt={`QR code for ${tableName || tableId}`} className="w-48 h-48 rounded-md border" />
                    )}

                    <div className="flex w-full items-center gap-2 rounded-md border bg-muted/30 px-2 py-1.5">
                        <span className="flex-1 truncate text-xs text-muted-foreground">{tableUrl}</span>
                        <Button size="icon" variant="ghost" className="h-6 w-6 shrink-0" onClick={handleCopy} title="Copy link">
                            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        </Button>
                    </div>

                    <div className="flex w-full gap-2">
                        <Button variant="outline" className="flex-1" asChild>
                            <a href={tableUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Open
                            </a>
                        </Button>
                        <Button className="flex-1" onClick={handleDownload} disabled={downloading}>
                            {downloading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                            Download
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
