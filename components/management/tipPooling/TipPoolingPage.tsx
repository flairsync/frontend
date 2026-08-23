import React, { useState } from "react";
import { useTranslation } from "react-i18next";
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
import { TipDistributionEntry, TipPoolPreviewEntry, TipPoolStrategy } from "@/models/business/tipPooling/TipDistribution";
import dayjs from "@/utils/date-utils";
import { getCurrencySymbol } from "@/utils/currency";

function formatCurrency(amount: number | string, currency = 'USD'): string {
    return `${getCurrencySymbol(currency)}${Number(amount).toFixed(2)}`;
}

const PreviewTable = ({ entries, currency }: { entries: TipPoolPreviewEntry[]; currency: string }) => {
    const { t } = useTranslation("management");
    return (
    <Table>
        <TableHeader>
            <TableRow>
                <TableHead>{t("payroll_page.table.employee")}</TableHead>
                <TableHead className="text-right">{t("tip_pooling_page.table.hours_worked")}</TableHead>
                <TableHead className="text-right">{t("tip_pooling_page.table.share")}</TableHead>
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
};

const GeneratedTable = ({ entries }: { entries: TipDistributionEntry[] }) => {
    const { t } = useTranslation("management");
    return (
    <Table>
        <TableHeader>
            <TableRow>
                <TableHead>{t("payroll_page.table.employee")}</TableHead>
                <TableHead className="text-right">{t("tip_pooling_page.table.hours_worked")}</TableHead>
                <TableHead className="text-right">{t("tip_pooling_page.table.share")}</TableHead>
                <TableHead>{t("payroll_page.table.status")}</TableHead>
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
                            {t(`payroll_page.table.status_labels.${e.status}`)}
                        </Badge>
                    </TableCell>
                </TableRow>
            ))}
        </TableBody>
    </Table>
    );
};

function getTipStrategyLabel(t: (key: string) => string, strategy: TipPoolStrategy): string {
    return strategy === 'EQUAL_SPLIT'
        ? t("settings_page.labor.split_strategy.equal_split")
        : t("settings_page.labor.split_strategy.hours_worked");
}

interface Props {
    businessId: string;
}

const TipPoolingPage = ({ businessId }: Props) => {
    const { t } = useTranslation("management");
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
                <h1 className="text-xl sm:text-2xl font-bold">{t("tip_pooling_page.title")}</h1>
                <p className="text-muted-foreground text-sm mt-1">{t("tip_pooling_page.subtitle")}</p>
            </div>
            <Separator />

            {!tipPoolEnabled && (
                <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                    {t("tip_pooling_page.disabled_notice")}
                </div>
            )}

            <div className="space-y-6">
                {/* Period Picker */}
                <div className="flex flex-wrap items-end gap-4">
                    <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">{t("payroll_page.period_picker.start_date")}</Label>
                        <Input
                            type="date"
                            className="w-40"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">{t("payroll_page.period_picker.end_date")}</Label>
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
                            {isGenerating ? t("payroll_page.period_picker.generating") : t("tip_pooling_page.generate_distribution")}
                        </Button>
                        {hasDraft && (
                            <Button
                                variant="outline"
                                onClick={() => setShowFinalizeDialog(true)}
                                disabled={isFinalizing}
                            >
                                {t("payroll_page.period_picker.finalize")}
                            </Button>
                        )}
                    </div>
                </div>

                {/* Preview Panel */}
                {preview && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold">{t("payroll_page.preview.title")}</h2>
                            <span className="text-xs text-muted-foreground">
                                {preview.periodStart} → {preview.periodEnd} · {getTipStrategyLabel(t, preview.strategy)}
                            </span>
                        </div>
                        {fetchingPreview ? (
                            <p className="text-sm text-muted-foreground">{t("payroll_page.preview.loading")}</p>
                        ) : preview.entries.length === 0 ? (
                            <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground text-sm">
                                {t("tip_pooling_page.empty_preview")}
                            </div>
                        ) : (
                            <>
                                <PreviewTable entries={preview.entries} currency={currency} />
                                <div className="flex justify-end gap-8 text-sm text-muted-foreground pt-2">
                                    <span>{t("tip_pooling_page.total_hours")} <strong className="text-foreground">{preview.totalHours.toFixed(2)}</strong></span>
                                    <span>{t("tip_pooling_page.total_pool")} <strong className="text-foreground text-base">{formatCurrency(preview.totalPoolAmount, currency)}</strong></span>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Draft Entries */}
                {hasDraft && (
                    <div className="space-y-3">
                        <h2 className="text-lg font-semibold">{t("payroll_page.draft_entries.title")}</h2>
                        {fetchingEntries ? (
                            <p className="text-sm text-muted-foreground">{t("payroll_page.draft_entries.loading")}</p>
                        ) : (
                            <GeneratedTable entries={draftEntries} />
                        )}
                    </div>
                )}

                {/* Finalized Entries */}
                {finalizedEntries.length > 0 && (
                    <div className="space-y-3">
                        <h2 className="text-lg font-semibold">{t("payroll_page.finalized_entries.title")}</h2>
                        {fetchingFinalized ? (
                            <p className="text-sm text-muted-foreground">{t("payroll_page.finalized_entries.loading")}</p>
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
                        <DialogTitle>{t("tip_pooling_page.finalize_dialog.title")}</DialogTitle>
                        <DialogDescription>
                            {t("tip_pooling_page.finalize_dialog.description", { startDate, endDate })}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowFinalizeDialog(false)}>{t("payroll_page.finalize_dialog.cancel")}</Button>
                        <Button onClick={handleFinalize} disabled={isFinalizing}>
                            {isFinalizing ? t("payroll_page.finalize_dialog.finalizing") : t("payroll_page.period_picker.finalize")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default TipPoolingPage;
