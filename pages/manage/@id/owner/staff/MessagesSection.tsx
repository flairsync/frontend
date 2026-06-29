import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { usePageContext } from "vike-react/usePageContext";
import { toast } from "sonner";
import dayjs from "dayjs";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Trash2, Send } from "lucide-react";
import { ConfirmationPopup } from "@/components/shared/ConfirmationPopup";

import { useBusinessAnnouncements } from "@/features/business/announcements/useBusinessAnnouncements";
import { useBusinessEmployees } from "@/features/business/employment/useBusinessEmployees";
import { useBusinessTeams } from "@/features/business/team/useBusinessTeams";
import { AnnouncementKind, AnnouncementAudienceType } from "@/models/business/Announcement";

const MessagesSection = () => {
    const { t } = useTranslation("management");
    const { routeParams } = usePageContext();
    const businessId = routeParams.id;

    const [historyTab, setHistoryTab] = useState<AnnouncementKind>("ANNOUNCEMENT");
    const {
        announcements,
        currentPage,
        totalPages,
        setPage,
        loadingAnnouncements,
        createAnnouncement,
        creatingAnnouncement,
        deleteAnnouncement,
    } = useBusinessAnnouncements(businessId, historyTab);

    const { employees } = useBusinessEmployees(businessId, { limit: 200 });
    const { teams } = useBusinessTeams(businessId);

    const [composeOpen, setComposeOpen] = useState(false);
    const [kind, setKind] = useState<AnnouncementKind>("ANNOUNCEMENT");
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [audienceType, setAudienceType] = useState<AnnouncementAudienceType>("ALL_STAFF");
    const [teamId, setTeamId] = useState<string | undefined>(undefined);
    const [selectedStaffIds, setSelectedStaffIds] = useState<Set<string>>(new Set());
    const [deleteId, setDeleteId] = useState<string>();

    const resetForm = () => {
        setKind("ANNOUNCEMENT");
        setTitle("");
        setContent("");
        setAudienceType("ALL_STAFF");
        setTeamId(undefined);
        setSelectedStaffIds(new Set());
    };

    const handleToggleStaff = (id: string, checked: boolean) => {
        const next = new Set(selectedStaffIds);
        if (checked) next.add(id);
        else next.delete(id);
        setSelectedStaffIds(next);
    };

    const canSubmit =
        title.trim().length > 0 &&
        content.trim().length > 0 &&
        (audienceType !== "TEAM" || !!teamId) &&
        (audienceType !== "STAFF" || selectedStaffIds.size > 0);

    const handleSubmit = async () => {
        try {
            await createAnnouncement({
                kind,
                title: title.trim(),
                content: content.trim(),
                audienceType,
                teamId: audienceType === "TEAM" ? teamId : undefined,
                staffEmploymentIds:
                    audienceType === "STAFF" ? Array.from(selectedStaffIds) : undefined,
            });
            toast.success(t("staff_messages_compose.send_success"));
            setComposeOpen(false);
            resetForm();
        } catch {
            // Global interceptor handles the error toast
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-2">
                    <CardTitle>{t("staff_messages_compose.heading")}</CardTitle>

                    <Dialog
                        open={composeOpen}
                        onOpenChange={(v) => {
                            setComposeOpen(v);
                            if (!v) resetForm();
                        }}
                    >
                        <DialogTrigger asChild>
                            <Button className="flex items-center gap-2">
                                <Send className="h-4 w-4" /> {t("staff_messages_compose.compose_button")}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>{t("staff_messages_compose.dialog_title")}</DialogTitle>
                            </DialogHeader>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>{t("staff_messages_compose.kind_label")}</Label>
                                    <RadioGroup
                                        value={kind}
                                        onValueChange={(v) => setKind(v as AnnouncementKind)}
                                        className="flex gap-4"
                                    >
                                        <div className="flex items-center gap-2">
                                            <RadioGroupItem value="ANNOUNCEMENT" id="kind-announcement" />
                                            <Label htmlFor="kind-announcement" className="font-normal cursor-pointer">
                                                {t("staff_messages.announcements_tab")}
                                            </Label>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <RadioGroupItem value="MESSAGE" id="kind-message" />
                                            <Label htmlFor="kind-message" className="font-normal cursor-pointer">
                                                {t("staff_messages.messages_tab")}
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="announcement-title">
                                        {t("staff_messages_compose.title_label")}
                                    </Label>
                                    <Input
                                        id="announcement-title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        maxLength={150}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="announcement-content">
                                        {t("staff_messages_compose.content_label")}
                                    </Label>
                                    <Textarea
                                        id="announcement-content"
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        maxLength={2000}
                                        rows={4}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>{t("staff_messages_compose.audience_label")}</Label>
                                    <RadioGroup
                                        value={audienceType}
                                        onValueChange={(v) => setAudienceType(v as AnnouncementAudienceType)}
                                        className="space-y-2"
                                    >
                                        <div className="flex items-center gap-2">
                                            <RadioGroupItem value="ALL_STAFF" id="audience-all" />
                                            <Label htmlFor="audience-all" className="font-normal cursor-pointer">
                                                {t("staff_messages_compose.audience_all_staff")}
                                            </Label>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <RadioGroupItem value="TEAM" id="audience-team" />
                                            <Label htmlFor="audience-team" className="font-normal cursor-pointer">
                                                {t("staff_messages_compose.audience_team")}
                                            </Label>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <RadioGroupItem value="STAFF" id="audience-staff" />
                                            <Label htmlFor="audience-staff" className="font-normal cursor-pointer">
                                                {t("staff_messages_compose.audience_specific_staff")}
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                </div>

                                {audienceType === "TEAM" && (
                                    <Select value={teamId} onValueChange={setTeamId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t("staff_messages_compose.select_team_placeholder")} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {teams?.map((team) => (
                                                <SelectItem key={team.id} value={team.id}>
                                                    {team.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}

                                {audienceType === "STAFF" && (
                                    <ScrollArea className="h-48 border rounded-md p-2">
                                        <div className="space-y-2">
                                            {employees.map((employee) => (
                                                <div key={employee.id} className="flex items-center gap-3 p-1">
                                                    <Checkbox
                                                        id={`staff-${employee.id}`}
                                                        checked={selectedStaffIds.has(employee.id)}
                                                        onCheckedChange={(checked) =>
                                                            handleToggleStaff(employee.id, checked === true)
                                                        }
                                                    />
                                                    <Label
                                                        htmlFor={`staff-${employee.id}`}
                                                        className="cursor-pointer flex-1 font-normal"
                                                    >
                                                        {employee.professionalProfile?.displayName ??
                                                            t("staff_messages_compose.unknown_staff")}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                )}
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <Button variant="outline" onClick={() => setComposeOpen(false)}>
                                    {t("staff_messages_compose.cancel")}
                                </Button>
                                <Button onClick={handleSubmit} disabled={!canSubmit || creatingAnnouncement}>
                                    {creatingAnnouncement
                                        ? t("staff_messages_compose.sending")
                                        : t("staff_messages_compose.send")}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </CardHeader>

                <CardContent>
                    <Tabs
                        value={historyTab}
                        onValueChange={(v) => {
                            setHistoryTab(v as AnnouncementKind);
                            setPage(1);
                        }}
                    >
                        <TabsList>
                            <TabsTrigger value="ANNOUNCEMENT">{t("staff_messages.announcements_tab")}</TabsTrigger>
                            <TabsTrigger value="MESSAGE">{t("staff_messages.messages_tab")}</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <Table className="mt-4">
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t("staff_messages_compose.history_title")}</TableHead>
                                <TableHead>{t("staff_messages_compose.history_audience")}</TableHead>
                                <TableHead>{t("staff_messages_compose.history_read")}</TableHead>
                                <TableHead>{t("staff_messages_compose.history_sent_at")}</TableHead>
                                <TableHead />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {announcements.map((a) => (
                                <TableRow key={a.id}>
                                    <TableCell>
                                        <div className="font-medium">{a.title}</div>
                                        <div className="text-sm text-muted-foreground line-clamp-1">{a.content}</div>
                                    </TableCell>
                                    <TableCell>
                                        {a.audienceType === "ALL_STAFF" && t("staff_messages_compose.audience_all_staff")}
                                        {a.audienceType === "TEAM" &&
                                            (a.teamName ?? t("staff_messages_compose.audience_team"))}
                                        {a.audienceType === "STAFF" && t("staff_messages_compose.audience_specific_staff")}
                                    </TableCell>
                                    <TableCell>
                                        {a.readCount} / {a.recipientCount}
                                    </TableCell>
                                    <TableCell>{dayjs(a.createdAt).format("MMM D, YYYY h:mm A")}</TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(a.id)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {!loadingAnnouncements && announcements.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                        {t("staff_messages_compose.no_history")}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    <div className="flex justify-end mt-4 gap-2">
                        <Button variant="outline" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)}>
                            {t("staff_messages_compose.previous")}
                        </Button>
                        <span className="px-2 py-1 border rounded text-sm">
                            {currentPage} / {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            disabled={currentPage >= totalPages}
                            onClick={() => setPage(currentPage + 1)}
                        >
                            {t("staff_messages_compose.next")}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <ConfirmationPopup
                isOpen={!!deleteId}
                onCancel={() => setDeleteId(undefined)}
                onConfirm={async () => {
                    if (deleteId) {
                        await deleteAnnouncement(deleteId);
                        toast.success(t("staff_messages_compose.delete_success"));
                    }
                    setDeleteId(undefined);
                }}
                variant="danger"
            />
        </div>
    );
};

export default MessagesSection;
