import { useState } from "react";
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
            toast.success("Tax rate deleted");
        },
    });

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="font-semibold">Tax Rates</h3>
                    <p className="text-sm text-muted-foreground">
                        Active rates are applied automatically to all new orders.
                    </p>
                </div>
                <Button size="sm" onClick={() => setShowForm(true)} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Rate
                </Button>
            </div>

            <div className="rounded-lg border divide-y">
                {isLoading ? (
                    <p className="p-4 text-sm text-muted-foreground">Loading...</p>
                ) : taxes.length === 0 ? (
                    <div className="p-6 text-center text-muted-foreground text-sm">
                        <Percent className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        No tax rates configured. Orders will have $0 tax.
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
                        <DialogTitle>Add Tax Rate</DialogTitle>
                    </DialogHeader>
                    <TaxRateForm
                        businessId={businessId}
                        onSaved={() => {
                            qc.invalidateQueries({ queryKey: ["taxes", businessId] });
                            setShowForm(false);
                            toast.success("Tax rate created");
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
                        {tax.rate}% · {tax.isInclusive ? "Inclusive" : "Exclusive"}
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => toggleMutation.mutate()}
                    disabled={toggleMutation.isPending}
                >
                    <Badge variant={tax.isActive ? "default" : "secondary"}>
                        {tax.isActive ? "Active" : "Inactive"}
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
            setError(e.response?.data?.message ?? "Failed to create tax rate");
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
                <Label>Name</Label>
                <Input
                    placeholder="e.g. VAT, Sales Tax"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
            </div>
            <div className="space-y-1">
                <Label>Rate (%)</Label>
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
                <span>Inclusive (tax already included in item price)</span>
            </label>
            <p className="text-xs text-muted-foreground bg-muted rounded-md p-3">
                {isInclusive
                    ? "Inclusive: $10.00 item at 20% → tax = $1.67, customer pays $10.00"
                    : "Exclusive: $10.00 item at 20% → tax = $2.00, customer pays $12.00"}
            </p>
            {error && <p className="text-destructive text-sm">{error}</p>}
            <div className="flex gap-2 justify-end pt-2">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                    {loading ? "Creating..." : "Create"}
                </Button>
            </div>
        </form>
    );
}
