import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import React, { useState } from 'react'
import { Plus, Edit, Trash2, Info, Users } from 'lucide-react'
import { TableEmptyState } from '@/components/shared/EmptyState'
import { usePageContext } from 'vike-react/usePageContext'
import { useRecurringRules } from '@/features/shifts/useRecurringRules'
import { useBusinessEmployees } from '@/features/business/employment/useBusinessEmployees'
import { useBusinessTeams } from '@/features/business/team/useBusinessTeams'
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
    const { teams } = useBusinessTeams(businessId as string);

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

    const getTeamName = (id: string) => teams?.find(tm => tm.id === id)?.name ?? t("schedule_recurring_rules_tab.unknown_team");

    // Rotas read Monday-first; stored day numbers stay 0=Sunday to match Date.getDay().
    const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

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
            <CardContent className="space-y-4">
                {/* A rule is a pattern, not a schedule — nothing appears on the rota until
                    Generate materialises it. That gap is where people assume it's broken. */}
                <div className="rounded-md border border-dashed bg-muted/20 p-3 text-xs text-muted-foreground space-y-1">
                    <p className="flex items-start gap-2 font-medium text-foreground">
                        <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                        {t("schedule_recurring_rules_tab.how_it_works_title")}
                    </p>
                    <p className="pl-[22px]">{t("schedule_recurring_rules_tab.how_it_works_body")}</p>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t("schedule_recurring_rules_tab.col_who")}</TableHead>
                            <TableHead>{t("schedule_recurring_rules_tab.col_days")}</TableHead>
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
                            <TableEmptyState
                                colSpan={7}
                                title={t("schedule_recurring_rules_tab.no_rules")}
                                description={t("schedule_recurring_rules_tab.empty_description")}
                                action={{ label: t("schedule_recurring_rules_tab.new_rule"), onClick: handleAdd, icon: Plus }}
                            />
                        ) : (
                            rules.map((rule) => (
                                <TableRow key={rule.id}>
                                    <TableCell className="font-medium">
                                        {rule.teamId ? (
                                            <span className="flex items-center gap-1.5">
                                                <Users className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                                {getTeamName(rule.teamId)}
                                            </span>
                                        ) : rule.employmentIds?.length === 1 ? (
                                            getEmployeeName(rule.employmentIds[0])
                                        ) : rule.employmentIds?.length ? (
                                            /* Names in full past a couple of people would push every other
                                               column off screen, so the count leads and the names stay
                                               available on hover. */
                                            <span title={rule.employmentIds.map(getEmployeeName).join(", ")}>
                                                {t("schedule_recurring_rules_tab.staff_count", { count: rule.employmentIds.length })}
                                            </span>
                                        ) : (
                                            <span className="text-muted-foreground">{t("schedule_recurring_rules_tab.no_target")}</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {DAY_ORDER.filter(d => rule.daysOfWeek?.includes(d)).map(d => (
                                                <Badge key={d} variant="outline" className="px-1.5 py-0 text-[10px] font-normal">
                                                    {DAYS[d].slice(0, 3)}
                                                </Badge>
                                            ))}
                                        </div>
                                    </TableCell>
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
