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

const ManagerScheduleRecurringRulesTab = () => {
    const { routeParams } = usePageContext();
    const businessId = routeParams.id;
    const { 
        rules, 
        fetchingRules, 
        deleteRule, 
    } = useRecurringRules(businessId as string);

    const { employees } = useBusinessEmployees(businessId as string);

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
        return emp?.professionalProfile?.displayName || emp?.professionalProfile?.firstName || 'Unknown Staff';
    };

    const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Recurring Shift Rules</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">Manage long-term shift patterns for your staff.</p>
                </div>
                <Button size="sm" onClick={handleAdd}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Rule
                </Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Staff Member</TableHead>
                            <TableHead>Day of Week</TableHead>
                            <TableHead>Start Time</TableHead>
                            <TableHead>End Time</TableHead>
                            <TableHead>Start Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {fetchingRules && (!rules || rules.length === 0) ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-4">Loading...</TableCell>
                            </TableRow>
                        ) : !rules || rules.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">No recurring rules found.</TableCell>
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
                                            {rule.isActive ? "Active" : "Inactive"}
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
