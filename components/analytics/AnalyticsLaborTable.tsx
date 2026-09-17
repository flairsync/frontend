import React from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LaborSummary } from "@/models/analytics";

interface AnalyticsLaborTableProps {
    labor: LaborSummary;
    currency: string;
}

export const AnalyticsLaborTable: React.FC<AnalyticsLaborTableProps> = ({ labor, currency }) => {
    const { t } = useTranslation("management");
    const money = (val: number) => `${currency}${Number(val || 0).toFixed(2)}`;

    return (
        <Card className="shadow-sm">
            <CardHeader>
                <CardTitle>{t("analytics.labor_table.title")}</CardTitle>
                <CardDescription>{t("analytics.labor_table.description")}</CardDescription>
            </CardHeader>
            <CardContent>
                {labor.byEmployee.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground">
                        {t("analytics.labor_table.no_data")}
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-muted-foreground uppercase bg-muted">
                                    <tr>
                                        <th className="px-6 py-3 rounded-tl-lg">{t("analytics.labor_table.col_employee")}</th>
                                        <th className="px-6 py-3 text-right">{t("analytics.labor_table.col_hours")}</th>
                                        <th className="px-6 py-3 text-right">{t("analytics.labor_table.col_overtime_hours")}</th>
                                        <th className="px-6 py-3 text-right">{t("analytics.labor_table.col_cost")}</th>
                                        <th className="px-6 py-3 rounded-tr-lg text-right">{t("analytics.labor_table.col_share")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {labor.byEmployee.map((employee, index) => (
                                        <tr
                                            key={employee.employmentId || index}
                                            className="bg-card border-b border-border hover:bg-muted"
                                        >
                                            <td className="px-6 py-4 font-medium text-foreground whitespace-nowrap">
                                                {employee.employeeName}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {Number(employee.totalHours || 0).toFixed(2)}
                                            </td>
                                            <td className={`px-6 py-4 text-right ${employee.overtimeHours > 0 ? "font-medium text-amber-600" : "text-muted-foreground"}`}>
                                                {Number(employee.overtimeHours || 0).toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 text-right font-medium text-primary">
                                                {money(employee.totalPay)}
                                            </td>
                                            <td className="px-6 py-4 text-right font-medium">
                                                {Number(employee.shareOfLaborPercent || 0).toFixed(1)}%
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-muted font-semibold text-foreground">
                                        <td className="px-6 py-3 rounded-bl-lg">{t("analytics.labor_table.totals")}</td>
                                        <td className="px-6 py-3 text-right">{labor.workedHours.toFixed(2)}</td>
                                        <td className="px-6 py-3 text-right">{labor.overtimeHours.toFixed(2)}</td>
                                        <td className="px-6 py-3 text-right">{money(labor.totalLaborCost)}</td>
                                        <td className="px-6 py-3 rounded-br-lg text-right">100.0%</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        {/* Paid leave is part of the cost above but nobody was on the floor for
                            it, so it's excluded from the hours — called out rather than left to
                            be discovered when the columns don't reconcile. */}
                        {labor.paidLeaveHours > 0 && (
                            <p className="mt-3 text-xs text-muted-foreground">
                                {t("analytics.labor_table.paid_leave_note", {
                                    hours: labor.paidLeaveHours.toFixed(2),
                                    amount: money(labor.paidLeavePay),
                                })}
                            </p>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
};
