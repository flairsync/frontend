import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import React, { useState } from 'react'
import { Plus, Edit } from 'lucide-react'
import { usePageContext } from 'vike-react/usePageContext'
import { useShiftTemplates } from '@/features/shifts/useShiftTemplates'
import { ShiftTemplateModal } from './ShiftTemplateModal'
import { ShiftTemplate } from '@/models/business/shift/ShiftTemplate'
import { useTranslation } from 'react-i18next'

const ManagerScheduleShiftsTab = () => {
    const { t } = useTranslation("management");
    const { routeParams } = usePageContext();
    const businessId = routeParams.id;
    const { 
        templates, 
        fetchingTemplates, 
        createTemplate, 
        updateTemplate, 
        deleteTemplate, 
        isCreatingTemplate, 
        isUpdatingTemplate 
    } = useShiftTemplates(businessId as string);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<ShiftTemplate | null>(null);

    const handleCreate = () => {
        setSelectedTemplate(null);
        setIsModalOpen(true);
    };

    const handleEdit = (template: ShiftTemplate) => {
        setSelectedTemplate(template);
        setIsModalOpen(true);
    };

    const handleSubmit = async (data: { name: string; startTime: string; endTime: string; colorCode?: string }) => {
        if (selectedTemplate) {
            updateTemplate({ templateId: selectedTemplate.id, data }, {
                onSuccess: () => setIsModalOpen(false)
            });
        } else {
            createTemplate(data, {
                onSuccess: () => setIsModalOpen(false)
            });
        }
    };

    const handleDelete = async (id: string) => {
        deleteTemplate(id, {
            onSuccess: () => setIsModalOpen(false)
        });
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{t("schedule_shifts_tab.heading")}</CardTitle>
                <Button onClick={handleCreate} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    {t("schedule_shifts_tab.new_template")}
                </Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]">{t("schedule_shifts_tab.col_color")}</TableHead>
                            <TableHead>{t("schedule_shifts_tab.col_shift_name")}</TableHead>
                            <TableHead>{t("schedule_shifts_tab.col_start_time")}</TableHead>
                            <TableHead>{t("schedule_shifts_tab.col_end_time")}</TableHead>
                            <TableHead className="text-right">{t("schedule_shifts_tab.col_actions")}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {fetchingTemplates && (!templates || templates.length === 0) ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-4">{t("schedule_shifts_tab.loading")}</TableCell>
                            </TableRow>
                        ) : !templates || templates.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">{t("schedule_shifts_tab.no_templates")}</TableCell>
                            </TableRow>
                        ) : (
                            templates.map((template) => (
                                <TableRow key={template.id}>
                                    <TableCell>
                                        <div 
                                            className="w-6 h-6 rounded-full border shadow-sm"
                                            style={{ backgroundColor: template.colorCode || '#ccc' }}
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium">{template.name}</TableCell>
                                    <TableCell>{template.startTime}</TableCell>
                                    <TableCell>{template.endTime}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="outline" size="sm" onClick={() => handleEdit(template)}>
                                            <Edit className="w-4 h-4 mr-2" />
                                            {t("schedule_shifts_tab.edit")}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>

            <ShiftTemplateModal 
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                template={selectedTemplate}
                onSubmit={handleSubmit}
                isLoading={isCreatingTemplate || isUpdatingTemplate}
                onDelete={handleDelete}
            />
        </Card>
    )
}

export default ManagerScheduleShiftsTab
