import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import React, { useState } from 'react'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { usePageContext } from 'vike-react/usePageContext'
import { useRecurringRules } from '@/features/shifts/useRecurringRules'
import { useBusinessEmployees } from '@/features/business/employment/useBusinessEmployees'
import { RecurringShiftRule } from '@/models/business/shift/RecurringShiftRule'
import { Badge } from '@/components/ui/badge'
import { RecurringRuleModal } from './RecurringRuleModal'
import { useTranslation } from 'react-i18next'

const ManagerScheduleRecurringRulesTab = () => {
    const { t } = useTranslation("management");
    const { routeParams } = usePageContext();
    const businessId = routeParams.id;
    const { 
        rules, 
        fetchingRules, 
        deleteRule, 
    } = useRecurringRules(businessId as string);

    const { employees } = useBusinessEmployees(businessId as string, { limit: 100 });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRule, setSelectedRule] = useState<RecurringShiftRule | null>(null);

    const handleAdd = () => {
        setSelectedRule(null);
        setIsModalOpen(true);
    };

    const handleEdit = (rule: RecurringShiftRule) => {
        setSelectedRule(rule);
        setIsModalOpen(true);
    };

    const getEmployeeName = (id: string) => {
        const emp = employees?.find(e => e.id === id);
        return emp?.professionalProfile?.displayName || emp?.professionalProfile?.firstName || t("schedule_recurring_rules_tab.unknown_staff");
    };

    const DAYS = [
        t("schedule_recurring_rules_tab.days.sunday"),
        t("schedule_recurring_rules_tab.days.monday"),
        t("schedule_recurring_rules_tab.days.tuesday"),
        t("schedule_recurring_rules_tab.days.wednesday"),
        t("schedule_recurring_rules_tab.days.thursday"),
        t("schedule_recurring_rules_tab.days.friday"),
        t("schedule_recurring_rules_tab.days.saturday"),
    ];

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>{t("schedule_recurring_rules_tab.heading")}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{t("schedule_recurring_rules_tab.subheading")}</p>
                </div>
                <Button size="sm" onClick={handleAdd}>
                    <Plus className="w-4 h-4 mr-2" />
                    {t("schedule_recurring_rules_tab.new_rule")}
                </Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t("schedule_recurring_rules_tab.col_staff_member")}</TableHead>
                            <TableHead>{t("schedule_recurring_rules_tab.col_day_of_week")}</TableHead>
                            <TableHead>{t("schedule_recurring_rules_tab.col_start_time")}</TableHead>
                            <TableHead>{t("schedule_recurring_rules_tab.col_end_time")}</TableHead>
                            <TableHead>{t("schedule_recurring_rules_tab.col_start_date")}</TableHead>
                            <TableHead>{t("schedule_recurring_rules_tab.col_status")}</TableHead>
                            <TableHead className="text-right">{t("schedule_recurring_rules_tab.col_actions")}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {fetchingRules && (!rules || rules.length === 0) ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-4">{t("schedule_recurring_rules_tab.loading")}</TableCell>
                            </TableRow>
                        ) : !rules || rules.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">{t("schedule_recurring_rules_tab.no_rules")}</TableCell>
                            </TableRow>
                        ) : (
                            rules.map((rule) => (
                                <TableRow key={rule.id}>
                                    <TableCell className="font-medium">{getEmployeeName(rule.employmentId)}</TableCell>
                                    <TableCell>{DAYS[rule.dayOfWeek]}</TableCell>
                                    <TableCell>{rule.startTime}</TableCell>
                                    <TableCell>{rule.endTime}</TableCell>
                                    <TableCell>{rule.startDate}</TableCell>
                                    <TableCell>
                                        <Badge variant={rule.isActive ? "default" : "secondary"}>
                                            {rule.isActive ? t("schedule_recurring_rules_tab.status_active") : t("schedule_recurring_rules_tab.status_inactive")}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="outline" size="icon" onClick={() => handleEdit(rule)}>
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button variant="outline" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => deleteRule(rule.id)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>

            <RecurringRuleModal 
                open={isModalOpen} 
                onOpenChange={setIsModalOpen} 
                rule={selectedRule} 
            />
        </Card>
    )
}

export default ManagerScheduleRecurringRulesTab
