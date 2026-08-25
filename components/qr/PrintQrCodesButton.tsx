import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Printer, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { fetchQrTablesPdfBlob } from "@/features/qr/service";
import { downloadBlob } from "@/lib/downloadBlob";

const ALL_FLOORS = "__all__";

interface Floor {
    id: string;
    name: string;
}

interface PrintQrCodesButtonProps {
    businessId: string;
    floors: Floor[];
}

export function PrintQrCodesButton({ businessId, floors }: PrintQrCodesButtonProps) {
    const { t } = useTranslation("management");
    const [open, setOpen] = useState(false);
    const [floorId, setFloorId] = useState(ALL_FLOORS);
    const [downloading, setDownloading] = useState(false);

    const handlePrint = async () => {
        setDownloading(true);
        try {
            const blob = await fetchQrTablesPdfBlob(businessId, floorId === ALL_FLOORS ? undefined : floorId);
            downloadBlob(blob, "table-qr-codes.pdf");
            setOpen(false);
        } catch {
            toast.error(t("print_qr_codes_button.error"));
        } finally {
            setDownloading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <Button variant="outline" className="gap-2" onClick={() => setOpen(true)}>
                <Printer className="w-4 h-4" />
                {t("print_qr_codes_button.button")}
            </Button>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t("print_qr_codes_button.dialog_title")}</DialogTitle>
                </DialogHeader>
                <div className="space-y-2 py-4">
                    <Label>{t("print_qr_codes_button.floor_label")}</Label>
                    <Select value={floorId} onValueChange={setFloorId}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={ALL_FLOORS}>{t("print_qr_codes_button.all_floors")}</SelectItem>
                            {floors.map((floor) => (
                                <SelectItem key={floor.id} value={floor.id}>{floor.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>{t("print_qr_codes_button.cancel")}</Button>
                    <Button onClick={handlePrint} disabled={downloading} className="gap-2">
                        {downloading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {t("print_qr_codes_button.download_pdf")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
