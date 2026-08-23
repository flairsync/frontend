import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { taxesApi, TaxRate, CreateTaxRatePayload } from "@/features/orders/taxes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Percent, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
    businessId: string;
}

export default function TaxSettings({ businessId }: Props) {
    const { t } = useTranslation("management");
    const qc = useQueryClient();
    const [showForm, setShowForm] = useState(false);

    const { data: taxes = [], isLoading } = useQuery({
        queryKey: ["taxes", businessId],
        queryFn: () => taxesApi.list(businessId),
    });

    const deleteMutation = useMutation({
        mutationFn: (taxId: string) => taxesApi.remove(businessId, taxId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["taxes", businessId] });
            toast.success(t("tax_settings.deleted_toast"));
        },
    });

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="font-semibold">{t("tax_settings.title")}</h3>
                    <p className="text-sm text-muted-foreground">
                        {t("tax_settings.subtitle")}
                    </p>
                </div>
                <Button size="sm" onClick={() => setShowForm(true)} className="gap-2">
                    <Plus className="w-4 h-4" />
                    {t("tax_settings.add_rate")}
                </Button>
            </div>

            <div className="rounded-lg border divide-y">
                {isLoading ? (
                    <p className="p-4 text-sm text-muted-foreground">{t("tax_settings.loading")}</p>
                ) : taxes.length === 0 ? (
                    <div className="p-6 text-center text-muted-foreground text-sm">
                        <Percent className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        {t("tax_settings.no_rates")}
                    </div>
                ) : (
                    taxes.map((tax) => (
                        <TaxRateRow
                            key={tax.id}
                            tax={tax}
                            businessId={businessId}
                            onDelete={() => deleteMutation.mutate(tax.id)}
                        />
                    ))
                )}
            </div>

            <Dialog open={showForm} onOpenChange={setShowForm}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t("tax_settings.add_tax_rate")}</DialogTitle>
                    </DialogHeader>
                    <TaxRateForm
                        businessId={businessId}
                        onSaved={() => {
                            qc.invalidateQueries({ queryKey: ["taxes", businessId] });
                            setShowForm(false);
                            toast.success(t("tax_settings.created_toast"));
                        }}
                        onCancel={() => setShowForm(false)}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}

function TaxRateRow({
    tax,
    businessId,
    onDelete,
}: {
    tax: TaxRate;
    businessId: string;
    onDelete: () => void;
}) {
    const { t } = useTranslation("management");
    const qc = useQueryClient();
    const toggleMutation = useMutation({
        mutationFn: () =>
            taxesApi.update(businessId, tax.id, { isActive: !tax.isActive }),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["taxes", businessId] }),
    });

    return (
        <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <Percent className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                    <p className="font-medium text-sm">{tax.name}</p>
                    <p className="text-xs text-muted-foreground">
                        {tax.rate}% · {tax.isInclusive ? t("tax_settings.inclusive") : t("tax_settings.exclusive")}
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => toggleMutation.mutate()}
                    disabled={toggleMutation.isPending}
                >
                    <Badge variant={tax.isActive ? "default" : "secondary"}>
                        {tax.isActive ? t("tax_settings.active") : t("tax_settings.inactive")}
                    </Badge>
                </button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onDelete}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                >
                    <Trash2 className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
}

function TaxRateForm({
    businessId,
    onSaved,
    onCancel,
}: {
    businessId: string;
    onSaved: () => void;
    onCancel: () => void;
}) {
    const { t } = useTranslation("management");
    const [name, setName] = useState("");
    const [rate, setRate] = useState("");
    const [isInclusive, setIsInclusive] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const rateNum = parseFloat(rate);
        if (!name.trim() || isNaN(rateNum) || rateNum < 0 || rateNum > 100) return;
        setLoading(true);
        setError("");
        try {
            await taxesApi.create(businessId, {
                name: name.trim(),
                rate: rateNum,
                isInclusive,
            });
            onSaved();
        } catch (e: any) {
            setError(e.response?.data?.message ?? t("tax_settings.create_failed"));
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
                <Label>{t("tax_settings.name")}</Label>
                <Input
                    placeholder={t("tax_settings.name_placeholder")}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
            </div>
            <div className="space-y-1">
                <Label>{t("tax_settings.rate_percent")}</Label>
                <div className="flex gap-2 items-center">
                    <Input
                        type="number"
                        placeholder="0.00"
                        value={rate}
                        onChange={(e) => setRate(e.target.value)}
                        min={0}
                        max={100}
                        step={0.01}
                        required
                    />
                    <span className="text-muted-foreground">%</span>
                </div>
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                    type="checkbox"
                    checked={isInclusive}
                    onChange={(e) => setIsInclusive(e.target.checked)}
                    className="rounded"
                />
                <span>{t("tax_settings.inclusive_checkbox_label")}</span>
            </label>
            <p className="text-xs text-muted-foreground bg-muted rounded-md p-3">
                {isInclusive
                    ? t("tax_settings.inclusive_example")
                    : t("tax_settings.exclusive_example")}
            </p>
            {error && <p className="text-destructive text-sm">{error}</p>}
            <div className="flex gap-2 justify-end pt-2">
                <Button type="button" variant="outline" onClick={onCancel}>
                    {t("tax_settings.cancel")}
                </Button>
                <Button type="submit" disabled={loading}>
                    {loading ? t("tax_settings.creating") : t("tax_settings.create")}
                </Button>
            </div>
        </form>
    );
}
