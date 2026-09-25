import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import React, { useState } from 'react'
import { Plus, Edit, Info } from 'lucide-react'
import { usePageContext } from 'vike-react/usePageContext'
import { useShiftTemplates } from '@/features/shifts/useShiftTemplates'
import { ShiftTemplateModal } from './ShiftTemplateModal'
import { asPresetList, toTimeInputValue } from './ShiftPresetPicker'
import { ShiftTemplate } from '@/models/business/shift/ShiftTemplate'
import { TableEmptyState } from '@/components/shared/EmptyState'
import { useTranslation } from 'react-i18next'

/** "08:00:00" + "16:30:00" → "8h 30m". Makes a preset's actual length obvious at a glance. */
const formatPresetDuration = (startTime: string, endTime: string) => {
    const [sh, sm] = toTimeInputValue(startTime).split(':').map(Number);
    const [eh, em] = toTimeInputValue(endTime).split(':').map(Number);
    if ([sh, sm, eh, em].some(n => Number.isNaN(n))) return null;
    // An end time earlier than the start means the preset runs past midnight.
    const minutes = ((eh * 60 + em) - (sh * 60 + sm) + 24 * 60) % (24 * 60);
    return { hours: Math.floor(minutes / 60), minutes: minutes % 60, overnight: eh * 60 + em < sh * 60 + sm };
};

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

    const presets = asPresetList(templates);

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
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <CardTitle>{t("schedule_shifts_tab.heading")}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{t("schedule_shifts_tab.subheading")}</p>
                </div>
                <Button onClick={handleCreate} size="sm" className="shrink-0">
                    <Plus className="w-4 h-4 mr-2" />
                    {t("schedule_shifts_tab.new_template")}
                </Button>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* A preset is only a pair of saved times, which is the single most confusing
                    thing in this module — so where they apply (and that they schedule nobody
                    on their own) is spelled out rather than left to be inferred. */}
                <div className="rounded-md border border-dashed bg-muted/20 p-3 text-xs text-muted-foreground space-y-1.5">
                    <p className="flex items-start gap-2 font-medium text-foreground">
                        <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                        {t("schedule_shifts_tab.where_used_title")}
                    </p>
                    <ul className="list-disc pl-8 space-y-0.5">
                        <li>{t("schedule_shifts_tab.where_used_single")}</li>
                        <li>{t("schedule_shifts_tab.where_used_bulk")}</li>
                        <li>{t("schedule_shifts_tab.where_used_rule")}</li>
                    </ul>
                    <p className="pl-8">{t("schedule_shifts_tab.where_used_caveat")}</p>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]">{t("schedule_shifts_tab.col_color")}</TableHead>
                            <TableHead>{t("schedule_shifts_tab.col_shift_name")}</TableHead>
                            <TableHead>{t("schedule_shifts_tab.col_start_time")}</TableHead>
                            <TableHead>{t("schedule_shifts_tab.col_end_time")}</TableHead>
                            <TableHead>{t("schedule_shifts_tab.col_length")}</TableHead>
                            <TableHead className="text-right">{t("schedule_shifts_tab.col_actions")}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {fetchingTemplates && presets.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-4">{t("schedule_shifts_tab.loading")}</TableCell>
                            </TableRow>
                        ) : presets.length === 0 ? (
                            <TableEmptyState
                                colSpan={6}
                                title={t("schedule_shifts_tab.empty_title")}
                                description={t("schedule_shifts_tab.empty_description")}
                                action={{ label: t("schedule_shifts_tab.new_template"), onClick: handleCreate, icon: Plus }}
                            />
                        ) : (
                            presets.map((template) => {
                                const duration = formatPresetDuration(template.startTime, template.endTime);
                                return (
                                    <TableRow key={template.id}>
                                        <TableCell>
                                            <div
                                                className="w-6 h-6 rounded-full border shadow-sm"
                                                style={{ backgroundColor: template.colorCode || '#ccc' }}
                                            />
                                        </TableCell>
                                        <TableCell className="font-medium">{template.name}</TableCell>
                                        <TableCell>{toTimeInputValue(template.startTime)}</TableCell>
                                        <TableCell>
                                            {toTimeInputValue(template.endTime)}
                                            {duration?.overnight && (
                                                <span className="ml-1.5 text-[10px] text-muted-foreground">{t("schedule_shifts_tab.next_day")}</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {duration ? t("schedule_shifts_tab.duration", { hours: duration.hours, minutes: duration.minutes }) : '—'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="outline" size="sm" onClick={() => handleEdit(template)}>
                                                <Edit className="w-4 h-4 mr-2" />
                                                {t("schedule_shifts_tab.edit")}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
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
