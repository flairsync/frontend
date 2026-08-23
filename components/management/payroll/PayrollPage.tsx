import React, { useState, useMemo } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle } from "lucide-react";
import { usePayroll, usePayrollPreview, usePayrollEntries, minutesToHoursLabel } from "@/features/payroll/usePayroll";
import { useMyBusiness } from "@/features/business/useMyBusiness";
import { PayrollSummaryEntry, PayrollEntry, PayPeriodType, UnvalidatedAttendanceWarning } from "@/models/business/shift/PayrollEntry";
import dayjs from "@/utils/date-utils";
import { getCurrencySymbol } from "@/utils/currency";
import AbsenceLogPanel from "./AbsenceLogPanel";

function getDefaultPeriod(payPeriodType: PayPeriodType = 'WEEKLY'): { start: string; end: string } {
    const today = dayjs();
    if (payPeriodType === 'WEEKLY') {
        return {
            start: today.startOf('week').add(1, 'day').format('YYYY-MM-DD'), // Mon
            end: today.startOf('week').add(7, 'day').format('YYYY-MM-DD'),   // Sun
        };
    }
    if (payPeriodType === 'BIWEEKLY') {
        return {
            start: today.subtract(13, 'day').format('YYYY-MM-DD'),
            end: today.format('YYYY-MM-DD'),
        };
    }
    // MONTHLY
    return {
        start: today.startOf('month').format('YYYY-MM-DD'),
        end: today.endOf('month').format('YYYY-MM-DD'),
    };
}

function formatCurrency(amount: number | string, currency = 'USD'): string {
    return `${getCurrencySymbol(currency)}${Number(amount).toFixed(2)}`;
}

const PreviewTable = ({ entries, currency }: { entries: PayrollSummaryEntry[]; currency: string }) => {
    const { t } = useTranslation("management");
    return (
    <Table>
        <TableHeader>
            <TableRow>
                <TableHead>{t("payroll_page.table.employee")}</TableHead>
                <TableHead className="text-right">{t("payroll_page.table.regular_hrs")}</TableHead>
                <TableHead className="text-right">{t("payroll_page.table.ot_hrs")}</TableHead>
                <TableHead className="text-right">{t("payroll_page.table.total_hrs")}</TableHead>
                <TableHead className="text-right">{t("payroll_page.table.regular_pay")}</TableHead>
                <TableHead className="text-right">{t("payroll_page.table.ot_pay")}</TableHead>
                <TableHead className="text-right">{t("payroll_page.table.paid_leave")}</TableHead>
                <TableHead className="text-right">{t("payroll_page.table.total_pay")}</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {entries.map((e) => (
                <TableRow key={e.employmentId}>
                    <TableCell className="font-medium">{e.employeeName}</TableCell>
                    <TableCell className="text-right">{e.regularHours.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{e.overtimeHours.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{e.totalHours.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                        {e.hourlyRate === 0 ? <span className="text-muted-foreground text-xs">{t("payroll_page.table.set_hourly_rate")}</span> : formatCurrency(e.regularPay, currency)}
                    </TableCell>
                    <TableCell className="text-right">
                        {e.hourlyRate === 0 ? '—' : formatCurrency(e.overtimePay, currency)}
                    </TableCell>
                    <TableCell className="text-right">
                        {e.hourlyRate === 0 ? '—' : formatCurrency(e.paidLeavePay, currency)}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                        {e.hourlyRate === 0 ? '—' : formatCurrency(e.totalPay, currency)}
                    </TableCell>
                </TableRow>
            ))}
        </TableBody>
    </Table>
    );
};

const UnvalidatedWarningBanner = ({ warnings }: { warnings: UnvalidatedAttendanceWarning[] }) => {
    const { t } = useTranslation("management");
    return (
    <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 space-y-2">
        <div className="flex items-center gap-2 font-medium">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            {t("payroll_page.warning_banner.message", { count: warnings.length })}
        </div>
        <ul className="space-y-1 pl-6 list-disc">
            {warnings.map((w) => (
                <li key={w.employmentId}>
                    {t("payroll_page.warning_banner.record_line", { name: w.employeeName, count: w.unvalidatedCount })}
                    {w.openCount > 0 ? t("payroll_page.warning_banner.still_clocked_in", { count: w.openCount }) : ''}
                </li>
            ))}
        </ul>
    </div>
    );
};

const GeneratedTable = ({ entries }: { entries: PayrollEntry[] }) => {
    const { t } = useTranslation("management");
    return (
    <Table>
        <TableHeader>
            <TableRow>
                <TableHead>{t("payroll_page.table.employee")}</TableHead>
                <TableHead className="text-right">{t("payroll_page.table.regular_hrs")}</TableHead>
                <TableHead className="text-right">{t("payroll_page.table.ot_hrs")}</TableHead>
                <TableHead className="text-right">{t("payroll_page.table.total_hrs")}</TableHead>
                <TableHead className="text-right">{t("payroll_page.table.regular_pay")}</TableHead>
                <TableHead className="text-right">{t("payroll_page.table.ot_pay")}</TableHead>
                <TableHead className="text-right">{t("payroll_page.table.paid_leave")}</TableHead>
                <TableHead className="text-right">{t("payroll_page.table.total_pay")}</TableHead>
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
                    <TableCell className="text-right">{(e.regularMinutes / 60).toFixed(2)}</TableCell>
                    <TableCell className="text-right">{(e.overtimeMinutes / 60).toFixed(2)}</TableCell>
                    <TableCell className="text-right">{(e.totalWorkedMinutes / 60).toFixed(2)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(e.regularPay, e.currency)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(e.overtimePay, e.currency)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(e.paidLeavePay, e.currency)}</TableCell>
                    <TableCell className="text-right font-semibold">{formatCurrency(e.totalPay, e.currency)}</TableCell>
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

interface Props {
    businessId: string;
}

const PayrollPage = ({ businessId }: Props) => {
    const { t } = useTranslation("management");
    const { myBusinessFullDetails } = useMyBusiness(businessId);
    const payPeriodType = myBusinessFullDetails?.payPeriodType ?? 'WEEKLY';
    const defaultPeriod = useMemo(() => getDefaultPeriod(payPeriodType), [payPeriodType]);

    const [startDate, setStartDate] = useState(defaultPeriod.start);
    const [endDate, setEndDate] = useState(defaultPeriod.end);
    const [showFinalizeDialog, setShowFinalizeDialog] = useState(false);

    const { preview, fetchingPreview } = usePayrollPreview(businessId, startDate, endDate);
    const { entries: draftEntries, fetchingEntries } = usePayrollEntries(businessId, startDate, endDate, 'DRAFT');
    const { entries: finalizedEntries, fetchingEntries: fetchingFinalized } = usePayrollEntries(businessId, startDate, endDate, 'FINALIZED');

    const { generatePayroll, isGenerating, finalizePayroll, isFinalizing, exportPayroll } = usePayroll(businessId);

    const currency = preview?.currency ?? myBusinessFullDetails?.currency ?? 'USD';
    const hasDraft = draftEntries.length > 0;
    const canExport = startDate && endDate;

    const handleGenerate = () => {
        generatePayroll({ businessId, startDate, endDate });
    };

    const handleFinalize = () => {
        finalizePayroll({ businessId, startDate, endDate }, {
            onSuccess: () => setShowFinalizeDialog(false),
        });
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-xl sm:text-2xl font-bold">{t("payroll_page.header.title")}</h1>
                <p className="text-muted-foreground text-sm mt-1">{t("payroll_page.header.subtitle")}</p>
            </div>
            <Separator />

            <Tabs defaultValue="payroll">
                <TabsList>
                    <TabsTrigger value="payroll">{t("payroll_page.header.title")}</TabsTrigger>
                    <TabsTrigger value="absences">{t("payroll_page.tabs.absences")}</TabsTrigger>
                </TabsList>

                <TabsContent value="payroll" className="space-y-6 pt-4">
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
                                {isGenerating ? t("payroll_page.period_picker.generating") : t("payroll_page.period_picker.generate_payroll")}
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
                            <Button
                                variant="ghost"
                                onClick={() => exportPayroll(startDate, endDate, 'csv')}
                                disabled={!canExport}
                            >
                                {t("payroll_page.period_picker.export_csv")}
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => exportPayroll(startDate, endDate, 'pdf')}
                                disabled={!canExport}
                            >
                                {t("payroll_page.period_picker.export_pdf")}
                            </Button>
                        </div>
                    </div>

                    {/* Preview Panel */}
                    {preview && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold">{t("payroll_page.preview.title")}</h2>
                                <span className="text-xs text-muted-foreground">
                                    {preview.periodStart} → {preview.periodEnd} · {preview.payPeriodType}
                                </span>
                            </div>
                            {preview.unvalidatedWarnings && preview.unvalidatedWarnings.length > 0 && (
                                <UnvalidatedWarningBanner warnings={preview.unvalidatedWarnings} />
                            )}
                            {fetchingPreview ? (
                                <p className="text-sm text-muted-foreground">{t("payroll_page.preview.loading")}</p>
                            ) : preview.entries.length === 0 ? (
                                <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground text-sm">
                                    {t("payroll_page.preview.empty")}
                                </div>
                            ) : (
                                <>
                                    <PreviewTable entries={preview.entries} currency={currency} />
                                    <div className="flex justify-end gap-8 text-sm text-muted-foreground pt-2">
                                        <span>{t("payroll_page.preview.totals.total_hrs")} <strong className="text-foreground">{preview.totals.totalWorkedHours.toFixed(2)}</strong></span>
                                        <span>{t("payroll_page.preview.totals.ot_hrs")} <strong className="text-foreground">{preview.totals.totalOvertimeHours.toFixed(2)}</strong></span>
                                        <span>{t("payroll_page.preview.totals.regular_pay")} <strong className="text-foreground">{formatCurrency(preview.totals.totalRegularPay, currency)}</strong></span>
                                        <span>{t("payroll_page.preview.totals.ot_pay")} <strong className="text-foreground">{formatCurrency(preview.totals.totalOvertimePay, currency)}</strong></span>
                                        <span>{t("payroll_page.preview.totals.paid_leave")} <strong className="text-foreground">{formatCurrency(preview.totals.totalPaidLeavePay, currency)}</strong></span>
                                        <span>{t("payroll_page.preview.totals.total")} <strong className="text-foreground text-base">{formatCurrency(preview.totals.totalPay, currency)}</strong></span>
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
                </TabsContent>

                <TabsContent value="absences" className="pt-4">
                    <AbsenceLogPanel businessId={businessId} />
                </TabsContent>
            </Tabs>

            {/* Finalize confirmation dialog */}
            <Dialog open={showFinalizeDialog} onOpenChange={setShowFinalizeDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t("payroll_page.finalize_dialog.title")}</DialogTitle>
                        <DialogDescription>
                            {t("payroll_page.finalize_dialog.description", { startDate, endDate })}
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

export default PayrollPage;
