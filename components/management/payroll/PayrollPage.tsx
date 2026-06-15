import React, { useState, useMemo } from "react";
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
import { usePayroll, usePayrollPreview, usePayrollEntries, minutesToHoursLabel } from "@/features/payroll/usePayroll";
import { useMyBusiness } from "@/features/business/useMyBusiness";
import { PayrollSummaryEntry, PayrollEntry, PayPeriodType } from "@/models/business/shift/PayrollEntry";
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

const PreviewTable = ({ entries, currency }: { entries: PayrollSummaryEntry[]; currency: string }) => (
    <Table>
        <TableHeader>
            <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead className="text-right">Regular Hrs</TableHead>
                <TableHead className="text-right">OT Hrs</TableHead>
                <TableHead className="text-right">Total Hrs</TableHead>
                <TableHead className="text-right">Regular Pay</TableHead>
                <TableHead className="text-right">OT Pay</TableHead>
                <TableHead className="text-right">Total Pay</TableHead>
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
                        {e.hourlyRate === 0 ? <span className="text-muted-foreground text-xs">Set hourly rate</span> : formatCurrency(e.regularPay, currency)}
                    </TableCell>
                    <TableCell className="text-right">
                        {e.hourlyRate === 0 ? '—' : formatCurrency(e.overtimePay, currency)}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                        {e.hourlyRate === 0 ? '—' : formatCurrency(e.totalPay, currency)}
                    </TableCell>
                </TableRow>
            ))}
        </TableBody>
    </Table>
);

const GeneratedTable = ({ entries }: { entries: PayrollEntry[] }) => (
    <Table>
        <TableHeader>
            <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead className="text-right">Regular Hrs</TableHead>
                <TableHead className="text-right">OT Hrs</TableHead>
                <TableHead className="text-right">Total Hrs</TableHead>
                <TableHead className="text-right">Regular Pay</TableHead>
                <TableHead className="text-right">OT Pay</TableHead>
                <TableHead className="text-right">Total Pay</TableHead>
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
                    <TableCell className="text-right">{(e.regularMinutes / 60).toFixed(2)}</TableCell>
                    <TableCell className="text-right">{(e.overtimeMinutes / 60).toFixed(2)}</TableCell>
                    <TableCell className="text-right">{(e.totalWorkedMinutes / 60).toFixed(2)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(e.regularPay, e.currency)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(e.overtimePay, e.currency)}</TableCell>
                    <TableCell className="text-right font-semibold">{formatCurrency(e.totalPay, e.currency)}</TableCell>
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

const PayrollPage = ({ businessId }: Props) => {
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
                <h1 className="text-3xl font-bold">Payroll</h1>
                <p className="text-muted-foreground text-sm mt-1">Preview, generate, and finalize payroll for any period.</p>
            </div>
            <Separator />

            <Tabs defaultValue="payroll">
                <TabsList>
                    <TabsTrigger value="payroll">Payroll</TabsTrigger>
                    <TabsTrigger value="absences">Absences</TabsTrigger>
                </TabsList>

                <TabsContent value="payroll" className="space-y-6 pt-4">
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
                                {isGenerating ? "Generating..." : "Generate Payroll"}
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
                            <Button
                                variant="ghost"
                                onClick={() => exportPayroll(startDate, endDate, 'csv')}
                                disabled={!canExport}
                            >
                                Export CSV
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => exportPayroll(startDate, endDate, 'pdf')}
                                disabled={!canExport}
                            >
                                Export PDF
                            </Button>
                        </div>
                    </div>

                    {/* Preview Panel */}
                    {preview && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold">Preview</h2>
                                <span className="text-xs text-muted-foreground">
                                    {preview.periodStart} → {preview.periodEnd} · {preview.payPeriodType}
                                </span>
                            </div>
                            {fetchingPreview ? (
                                <p className="text-sm text-muted-foreground">Loading preview…</p>
                            ) : preview.entries.length === 0 ? (
                                <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground text-sm">
                                    No validated attendance records found for this period.
                                </div>
                            ) : (
                                <>
                                    <PreviewTable entries={preview.entries} currency={currency} />
                                    <div className="flex justify-end gap-8 text-sm text-muted-foreground pt-2">
                                        <span>Total Hrs: <strong className="text-foreground">{preview.totals.totalWorkedHours.toFixed(2)}</strong></span>
                                        <span>OT Hrs: <strong className="text-foreground">{preview.totals.totalOvertimeHours.toFixed(2)}</strong></span>
                                        <span>Regular Pay: <strong className="text-foreground">{formatCurrency(preview.totals.totalRegularPay, currency)}</strong></span>
                                        <span>OT Pay: <strong className="text-foreground">{formatCurrency(preview.totals.totalOvertimePay, currency)}</strong></span>
                                        <span>Total: <strong className="text-foreground text-base">{formatCurrency(preview.totals.totalPay, currency)}</strong></span>
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
                </TabsContent>

                <TabsContent value="absences" className="pt-4">
                    <AbsenceLogPanel businessId={businessId} />
                </TabsContent>
            </Tabs>

            {/* Finalize confirmation dialog */}
            <Dialog open={showFinalizeDialog} onOpenChange={setShowFinalizeDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Finalize Payroll</DialogTitle>
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

export default PayrollPage;
