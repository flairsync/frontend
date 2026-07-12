import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useTipPooling, useTipPoolPreview, useTipDistributions } from "@/features/tipPooling/useTipPooling";
import { useMyBusiness } from "@/features/business/useMyBusiness";
import { TipDistributionEntry, TipPoolPreviewEntry, TIP_POOL_STRATEGY_LABELS } from "@/models/business/tipPooling/TipDistribution";
import dayjs from "@/utils/date-utils";
import { getCurrencySymbol } from "@/utils/currency";

function formatCurrency(amount: number | string, currency = 'USD'): string {
    return `${getCurrencySymbol(currency)}${Number(amount).toFixed(2)}`;
}

const PreviewTable = ({ entries, currency }: { entries: TipPoolPreviewEntry[]; currency: string }) => (
    <Table>
        <TableHeader>
            <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead className="text-right">Hours Worked</TableHead>
                <TableHead className="text-right">Share</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {entries.map((e) => (
                <TableRow key={e.employmentId}>
                    <TableCell className="font-medium">{e.employeeName}</TableCell>
                    <TableCell className="text-right">{e.hoursWorked.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-semibold">{formatCurrency(e.shareAmount, currency)}</TableCell>
                </TableRow>
            ))}
        </TableBody>
    </Table>
);

const GeneratedTable = ({ entries }: { entries: TipDistributionEntry[] }) => (
    <Table>
        <TableHeader>
            <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead className="text-right">Hours Worked</TableHead>
                <TableHead className="text-right">Share</TableHead>
                <TableHead>Status</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {entries.map((e) => (
                <TableRow key={e.id}>
                    <TableCell className="font-medium">
                        {e.employment
                            ? `${e.employment.professionalProfile.firstName} ${e.employment.professionalProfile.lastName}`
                            : e.employmentId}
                    </TableCell>
                    <TableCell className="text-right">{Number(e.hoursWorked).toFixed(2)}</TableCell>
                    <TableCell className="text-right font-semibold">{formatCurrency(e.shareAmount, e.currency)}</TableCell>
                    <TableCell>
                        <Badge variant={e.status === 'FINALIZED' ? 'default' : 'secondary'}>
                            {e.status}
                        </Badge>
                    </TableCell>
                </TableRow>
            ))}
        </TableBody>
    </Table>
);

interface Props {
    businessId: string;
}

const TipPoolingPage = ({ businessId }: Props) => {
    const { myBusinessFullDetails } = useMyBusiness(businessId);
    const today = dayjs().format('YYYY-MM-DD');

    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);
    const [showFinalizeDialog, setShowFinalizeDialog] = useState(false);

    const { preview, fetchingPreview } = useTipPoolPreview(businessId, startDate, endDate);
    const { entries: draftEntries, fetchingEntries } = useTipDistributions(businessId, startDate, endDate, 'DRAFT');
    const { entries: finalizedEntries, fetchingEntries: fetchingFinalized } = useTipDistributions(businessId, startDate, endDate, 'FINALIZED');

    const { generateTipDistribution, isGenerating, finalizeTipDistribution, isFinalizing } = useTipPooling(businessId);

    const currency = preview?.currency ?? myBusinessFullDetails?.currency ?? 'USD';
    const hasDraft = draftEntries.length > 0;
    const tipPoolEnabled = myBusinessFullDetails?.tipPoolEnabled ?? false;

    const handleGenerate = () => {
        generateTipDistribution({ businessId, startDate, endDate });
    };

    const handleFinalize = () => {
        finalizeTipDistribution({ businessId, startDate, endDate }, {
            onSuccess: () => setShowFinalizeDialog(false),
        });
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Tip Pooling</h1>
                <p className="text-muted-foreground text-sm mt-1">Preview, generate, and finalize tip distributions for any period.</p>
            </div>
            <Separator />

            {!tipPoolEnabled && (
                <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                    Tip pooling is currently disabled for this business. Enable it under Settings → Labor &amp; Compliance to start distributing pooled tips.
                </div>
            )}

            <div className="space-y-6">
                {/* Period Picker */}
                <div className="flex flex-wrap items-end gap-4">
                    <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Start Date</Label>
                        <Input
                            type="date"
                            className="w-40"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">End Date</Label>
                        <Input
                            type="date"
                            className="w-40"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button
                            onClick={handleGenerate}
                            disabled={isGenerating || !startDate || !endDate || startDate > endDate}
                        >
                            {isGenerating ? "Generating..." : "Generate Distribution"}
                        </Button>
                        {hasDraft && (
                            <Button
                                variant="outline"
                                onClick={() => setShowFinalizeDialog(true)}
                                disabled={isFinalizing}
                            >
                                Finalize
                            </Button>
                        )}
                    </div>
                </div>

                {/* Preview Panel */}
                {preview && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold">Preview</h2>
                            <span className="text-xs text-muted-foreground">
                                {preview.periodStart} → {preview.periodEnd} · {TIP_POOL_STRATEGY_LABELS[preview.strategy]}
                            </span>
                        </div>
                        {fetchingPreview ? (
                            <p className="text-sm text-muted-foreground">Loading preview…</p>
                        ) : preview.entries.length === 0 ? (
                            <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground text-sm">
                                No validated attendance or collected tips found for this period.
                            </div>
                        ) : (
                            <>
                                <PreviewTable entries={preview.entries} currency={currency} />
                                <div className="flex justify-end gap-8 text-sm text-muted-foreground pt-2">
                                    <span>Total Hours: <strong className="text-foreground">{preview.totalHours.toFixed(2)}</strong></span>
                                    <span>Total Pool: <strong className="text-foreground text-base">{formatCurrency(preview.totalPoolAmount, currency)}</strong></span>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Draft Entries */}
                {hasDraft && (
                    <div className="space-y-3">
                        <h2 className="text-lg font-semibold">Draft Entries</h2>
                        {fetchingEntries ? (
                            <p className="text-sm text-muted-foreground">Loading…</p>
                        ) : (
                            <GeneratedTable entries={draftEntries} />
                        )}
                    </div>
                )}

                {/* Finalized Entries */}
                {finalizedEntries.length > 0 && (
                    <div className="space-y-3">
                        <h2 className="text-lg font-semibold">Finalized</h2>
                        {fetchingFinalized ? (
                            <p className="text-sm text-muted-foreground">Loading…</p>
                        ) : (
                            <GeneratedTable entries={finalizedEntries} />
                        )}
                    </div>
                )}
            </div>

            {/* Finalize confirmation dialog */}
            <Dialog open={showFinalizeDialog} onOpenChange={setShowFinalizeDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Finalize Tip Distribution</DialogTitle>
                        <DialogDescription>
                            This will lock all draft entries for the period <strong>{startDate}</strong> to <strong>{endDate}</strong>.
                            Finalized entries cannot be overwritten. This action is irreversible.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowFinalizeDialog(false)}>Cancel</Button>
                        <Button onClick={handleFinalize} disabled={isFinalizing}>
                            {isFinalizing ? "Finalizing…" : "Finalize"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default TipPoolingPage;
