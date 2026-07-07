import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { usePageContext } from "vike-react/usePageContext";
import { toast } from "sonner";
import dayjs from "dayjs";
import { Users, UsersRound, User, Send, Trash2, Megaphone, MessageSquare } from "lucide-react";

import { Separator } from "@/components/ui/separator";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ConfirmationPopup } from "@/components/shared/ConfirmationPopup";

import { useBusinessAnnouncements } from "@/features/business/announcements/useBusinessAnnouncements";
import { useBusinessEmployees } from "@/features/business/employment/useBusinessEmployees";
import { useBusinessTeams } from "@/features/business/team/useBusinessTeams";
import { AnnouncementKind, AnnouncementAudienceType } from "@/models/business/Announcement";
import { cn } from "@/lib/utils";

const TITLE_MAX = 150;
const CONTENT_MAX = 2000;

type ExpiryPreset = "NEVER" | "1_DAY" | "3_DAYS" | "1_WEEK";

const EXPIRY_PRESET_TO_DATE: Record<Exclude<ExpiryPreset, "NEVER">, () => Date> = {
    "1_DAY": () => dayjs().add(1, "day").toDate(),
    "3_DAYS": () => dayjs().add(3, "day").toDate(),
    "1_WEEK": () => dayjs().add(1, "week").toDate(),
};

const AnnouncementsPage = () => {
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
    const [expiryPreset, setExpiryPreset] = useState<ExpiryPreset>("NEVER");
    const [deleteId, setDeleteId] = useState<string>();

    const resetForm = () => {
        setKind("ANNOUNCEMENT");
        setTitle("");
        setContent("");
        setAudienceType("ALL_STAFF");
        setTeamId(undefined);
        setSelectedStaffIds(new Set());
        setExpiryPreset("NEVER");
    };

    const handleToggleStaff = (id: string, checked: boolean) => {
        setSelectedStaffIds((prev) => {
            const next = new Set(prev);
            if (checked) next.add(id);
            else next.delete(id);
            return next;
        });
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
                expiresAt:
                    expiryPreset === "NEVER"
                        ? undefined
                        : EXPIRY_PRESET_TO_DATE[expiryPreset]().toISOString(),
            });
            toast.success(t("staff_messages_compose.send_success"));
            setComposeOpen(false);
            resetForm();
        } catch {
            // Global interceptor handles the error toast
        }
    };

    const audienceOptions: { value: AnnouncementAudienceType; icon: React.ReactNode; label: string }[] = [
        { value: "ALL_STAFF", icon: <Users className="h-4 w-4" />, label: t("staff_messages_compose.audience_all_staff") },
        { value: "TEAM", icon: <UsersRound className="h-4 w-4" />, label: t("staff_messages_compose.audience_team") },
        { value: "STAFF", icon: <User className="h-4 w-4" />, label: t("staff_messages_compose.audience_specific_staff") },
    ];

    const expiryOptions: { value: ExpiryPreset; label: string }[] = [
        { value: "NEVER", label: t("staff_messages_compose.expires_never") },
        { value: "1_DAY", label: t("staff_messages_compose.expires_1_day") },
        { value: "3_DAYS", label: t("staff_messages_compose.expires_3_days") },
        { value: "1_WEEK", label: t("staff_messages_compose.expires_1_week") },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">{t("staff_messages_compose.heading")}</h1>

            <Separator />

            <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-2">
                    <CardTitle>{t("staff_messages_compose.history_title")}</CardTitle>

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

                        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>{t("staff_messages_compose.dialog_title")}</DialogTitle>
                            </DialogHeader>

                            <div className="space-y-5 pt-1">
                                {/* Kind toggle */}
                                <div className="grid grid-cols-2 gap-2">
                                    {(["ANNOUNCEMENT", "MESSAGE"] as AnnouncementKind[]).map((k) => (
                                        <button
                                            key={k}
                                            type="button"
                                            onClick={() => setKind(k)}
                                            className={cn(
                                                "flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors",
                                                kind === k
                                                    ? "border-primary bg-primary text-primary-foreground"
                                                    : "border-border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                            )}
                                        >
                                            {k === "ANNOUNCEMENT" ? (
                                                <Megaphone className="h-4 w-4 shrink-0" />
                                            ) : (
                                                <MessageSquare className="h-4 w-4 shrink-0" />
                                            )}
                                            {k === "ANNOUNCEMENT"
                                                ? t("staff_messages.announcements_tab")
                                                : t("staff_messages.messages_tab")}
                                        </button>
                                    ))}
                                </div>

                                {/* Title */}
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="announcement-title">
                                            {t("staff_messages_compose.title_label")}
                                        </Label>
                                        <span className="text-xs text-muted-foreground">
                                            {title.length}/{TITLE_MAX}
                                        </span>
                                    </div>
                                    <Input
                                        id="announcement-title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        maxLength={TITLE_MAX}
                                        placeholder={t("staff_messages_compose.title_label")}
                                    />
                                </div>

                                {/* Content */}
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="announcement-content">
                                            {t("staff_messages_compose.content_label")}
                                        </Label>
                                        <span className="text-xs text-muted-foreground">
                                            {content.length}/{CONTENT_MAX}
                                        </span>
                                    </div>
                                    <Textarea
                                        id="announcement-content"
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        maxLength={CONTENT_MAX}
                                        rows={4}
                                        placeholder={t("staff_messages_compose.content_label")}
                                    />
                                </div>

                                {/* Audience */}
                                <div className="space-y-2">
                                    <Label>{t("staff_messages_compose.audience_label")}</Label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {audienceOptions.map(({ value, icon, label }) => (
                                            <button
                                                key={value}
                                                type="button"
                                                onClick={() => setAudienceType(value)}
                                                className={cn(
                                                    "flex flex-col items-center gap-1.5 rounded-lg border px-2 py-3 text-xs font-medium transition-colors",
                                                    audienceType === value
                                                        ? "border-primary bg-primary/10 text-primary"
                                                        : "border-border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                                )}
                                            >
                                                {icon}
                                                <span className="text-center leading-tight">{label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Team picker */}
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

                                {/* Staff picker — plain div avoids Radix ScrollArea pointer-event capture inside Dialog */}
                                {audienceType === "STAFF" && (
                                    <div className="space-y-1.5">
                                        {selectedStaffIds.size > 0 && (
                                            <p className="text-xs text-muted-foreground">
                                                {selectedStaffIds.size} selected
                                            </p>
                                        )}
                                        <div className="max-h-48 overflow-y-auto rounded-md border divide-y">
                                            {employees.map((employee) => {
                                                const name =
                                                    employee.professionalProfile?.displayName ??
                                                    t("staff_messages_compose.unknown_staff");
                                                const initials =
                                                    employee.professionalProfile?.getInitials() ?? "?";
                                                const isChecked = selectedStaffIds.has(employee.id);
                                                return (
                                                    <label
                                                        key={employee.id}
                                                        htmlFor={`staff-${employee.id}`}
                                                        className={cn(
                                                            "flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-accent transition-colors",
                                                            isChecked && "bg-primary/5"
                                                        )}
                                                    >
                                                        <Checkbox
                                                            id={`staff-${employee.id}`}
                                                            checked={isChecked}
                                                            onCheckedChange={(checked) =>
                                                                handleToggleStaff(employee.id, checked === true)
                                                            }
                                                        />
                                                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                                                            {initials}
                                                        </div>
                                                        <span className="text-sm">{name}</span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Expiry */}
                                <div className="space-y-1.5">
                                    <Label>{t("staff_messages_compose.expires_label")}</Label>
                                    <Select value={expiryPreset} onValueChange={(v) => setExpiryPreset(v as ExpiryPreset)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {expiryOptions.map((opt) => (
                                                <SelectItem key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground">
                                        {t("staff_messages_compose.expires_help")}
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t mt-2">
                                <Button variant="outline" onClick={() => setComposeOpen(false)}>
                                    {t("staff_messages_compose.cancel")}
                                </Button>
                                <Button onClick={handleSubmit} disabled={!canSubmit || creatingAnnouncement}>
                                    {creatingAnnouncement ? (
                                        t("staff_messages_compose.sending")
                                    ) : (
                                        <>
                                            <Send className="h-4 w-4 mr-1.5" />
                                            {t("staff_messages_compose.send")}
                                        </>
                                    )}
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
                            <TabsTrigger value="ANNOUNCEMENT" className="flex items-center gap-1.5">
                                <Megaphone className="h-3.5 w-3.5" />
                                {t("staff_messages.announcements_tab")}
                            </TabsTrigger>
                            <TabsTrigger value="MESSAGE" className="flex items-center gap-1.5">
                                <MessageSquare className="h-3.5 w-3.5" />
                                {t("staff_messages.messages_tab")}
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <Table className="mt-4">
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t("staff_messages_compose.history_title")}</TableHead>
                                <TableHead>{t("staff_messages_compose.history_audience")}</TableHead>
                                <TableHead>{t("staff_messages_compose.history_read")}</TableHead>
                                <TableHead>{t("staff_messages_compose.history_sent_at")}</TableHead>
                                <TableHead>{t("staff_messages_compose.history_expires")}</TableHead>
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
                                        <Badge variant="outline" className="whitespace-nowrap">
                                            {a.audienceType === "ALL_STAFF" && (
                                                <><Users className="h-3 w-3 mr-1" />{t("staff_messages_compose.audience_all_staff")}</>
                                            )}
                                            {a.audienceType === "TEAM" && (
                                                <><UsersRound className="h-3 w-3 mr-1" />{a.teamName ?? t("staff_messages_compose.audience_team")}</>
                                            )}
                                            {a.audienceType === "STAFF" && (
                                                <><User className="h-3 w-3 mr-1" />{t("staff_messages_compose.audience_specific_staff")}</>
                                            )}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <span className={cn(
                                            "text-sm font-medium",
                                            a.readCount === a.recipientCount && a.recipientCount > 0
                                                ? "text-green-600 dark:text-green-400"
                                                : "text-muted-foreground"
                                        )}>
                                            {a.readCount} / {a.recipientCount}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                                        {dayjs(a.createdAt).format("MMM D, YYYY h:mm A")}
                                    </TableCell>
                                    <TableCell className="text-sm whitespace-nowrap">
                                        {a.expiresAt ? (
                                            <Badge variant={a.isExpired ? "secondary" : "outline"}>
                                                {a.isExpired
                                                    ? t("staff_messages_compose.expired_badge")
                                                    : dayjs(a.expiresAt).format("MMM D, h:mm A")}
                                            </Badge>
                                        ) : (
                                            <span className="text-muted-foreground">{t("staff_messages_compose.expires_never")}</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(a.id)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {!loadingAnnouncements && announcements.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                                        {t("staff_messages_compose.no_history")}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    {totalPages > 1 && (
                        <div className="flex justify-end mt-4 gap-2">
                            <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)}>
                                {t("staff_messages_compose.previous")}
                            </Button>
                            <span className="px-3 py-1 border rounded text-sm flex items-center">
                                {currentPage} / {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={currentPage >= totalPages}
                                onClick={() => setPage(currentPage + 1)}
                            >
                                {t("staff_messages_compose.next")}
                            </Button>
                        </div>
                    )}
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

export default AnnouncementsPage;
