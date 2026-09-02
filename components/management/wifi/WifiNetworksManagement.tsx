import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmAction } from "@/components/shared/ConfirmAction";
import { Eye, EyeOff, Loader2, Pencil, Plus, Trash2, Wifi } from "lucide-react";

import { useWifiNetworks } from "@/features/wifi/useWifi";
import { useFloors } from "@/features/floor-plan/useFloorPlan";
import { WifiNetwork } from "@/features/wifi/service";

type WifiNetworksManagementProps = {
    businessId: string;
    canCreate: boolean;
    canUpdate: boolean;
    canDelete: boolean;
};

type WifiFormState = {
    label: string;
    ssid: string;
    password: string;
    businessWide: boolean;
    floorIds: string[];
};

const EMPTY_FORM: WifiFormState = {
    label: "",
    ssid: "",
    password: "",
    businessWide: true,
    floorIds: [],
};

export function WifiNetworksManagement({ businessId, canCreate, canUpdate, canDelete }: WifiNetworksManagementProps) {
    const { t } = useTranslation("management");
    const { wifiNetworks, fetchingWifiNetworks, createWifiNetwork, updateWifiNetwork, deleteWifiNetwork, isCreatingWifiNetwork, isUpdatingWifiNetwork } = useWifiNetworks(businessId);
    const { floors } = useFloors(businessId);

    const [modalOpen, setModalOpen] = useState(false);
    const [editingNetwork, setEditingNetwork] = useState<WifiNetwork | null>(null);
    const [form, setForm] = useState<WifiFormState>(EMPTY_FORM);
    const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());

    const hasActionsColumn = canUpdate || canDelete;

    const toggleReveal = (id: string) => {
        setRevealedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    const handleOpenCreate = () => {
        setEditingNetwork(null);
        setForm(EMPTY_FORM);
        setModalOpen(true);
    };

    const handleOpenEdit = (network: WifiNetwork) => {
        setEditingNetwork(network);
        setForm({
            label: network.label,
            ssid: network.ssid,
            password: network.password,
            businessWide: network.businessWide,
            floorIds: network.floors?.map((f) => f.id) ?? [],
        });
        setModalOpen(true);
    };

    const toggleFloor = (floorId: string, checked: boolean) => {
        setForm((prev) => ({
            ...prev,
            floorIds: checked ? [...prev.floorIds, floorId] : prev.floorIds.filter((id) => id !== floorId),
        }));
    };

    const handleSave = () => {
        const data = {
            label: form.label,
            ssid: form.ssid,
            password: form.password,
            businessWide: form.businessWide,
            floorIds: form.floorIds,
        };
        if (editingNetwork) {
            updateWifiNetwork({ id: editingNetwork.id, data });
        } else {
            createWifiNetwork(data);
        }
        setModalOpen(false);
    };

    const isSaving = isCreatingWifiNetwork || isUpdatingWifiNetwork;

    return (
        <div className="space-y-4">
            {canCreate && (
                <div className="flex justify-end">
                    <Button onClick={handleOpenCreate} className="gap-2">
                        <Plus className="h-4 w-4" /> {t("wifi_management.add_network")}
                    </Button>
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Wifi className="h-5 w-5" /> {t("wifi_management.title")}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border overflow-hidden">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-muted/30">
                                    <TableRow>
                                        <TableHead className="font-semibold">{t("wifi_management.table.label")}</TableHead>
                                        <TableHead className="font-semibold">{t("wifi_management.table.ssid")}</TableHead>
                                        <TableHead className="font-semibold">{t("wifi_management.table.visibility")}</TableHead>
                                        {hasActionsColumn && <TableHead className="text-right font-semibold">{t("wifi_management.table.actions")}</TableHead>}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {fetchingWifiNetworks && !wifiNetworks ? (
                                        <TableRow>
                                            <TableCell colSpan={hasActionsColumn ? 4 : 3} className="text-center py-10 text-muted-foreground animate-pulse">
                                                {t("wifi_management.loading")}
                                            </TableCell>
                                        </TableRow>
                                    ) : !wifiNetworks || wifiNetworks.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={hasActionsColumn ? 4 : 3} className="text-center py-10 text-muted-foreground">
                                                {t("wifi_management.empty")}
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        wifiNetworks.map((network) => {
                                            const floorCount = network.floors?.length ?? 0;
                                            const revealed = revealedIds.has(network.id);
                                            return (
                                                <TableRow key={network.id} className="hover:bg-muted/20 transition-colors">
                                                    <TableCell className="font-medium">{network.label}</TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-mono text-xs">{network.ssid}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                            <span className="font-mono">{revealed ? network.password : "••••••••"}</span>
                                                            <Button size="icon" variant="ghost" className="h-5 w-5" onClick={() => toggleReveal(network.id)}>
                                                                {revealed ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-wrap gap-1">
                                                            {network.businessWide && (
                                                                <Badge variant="default">{t("wifi_management.business_wide_badge")}</Badge>
                                                            )}
                                                            {floorCount > 0 && (
                                                                <Badge variant="secondary">
                                                                    {t("wifi_management.floor_count_badge", { count: floorCount })}
                                                                </Badge>
                                                            )}
                                                            {!network.businessWide && floorCount === 0 && (
                                                                <span className="text-xs text-muted-foreground">{t("wifi_management.not_shown")}</span>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    {hasActionsColumn && (
                                                        <TableCell className="text-right">
                                                            <div className="flex justify-end gap-2">
                                                                {canUpdate && (
                                                                    <Button size="icon" variant="ghost" onClick={() => handleOpenEdit(network)}>
                                                                        <Pencil className="w-4 h-4" />
                                                                    </Button>
                                                                )}
                                                                {canDelete && (
                                                                    <ConfirmAction
                                                                        onConfirm={() => deleteWifiNetwork(network.id)}
                                                                        title={t("wifi_management.delete_confirm_title")}
                                                                        description={t("wifi_management.delete_confirm_description")}
                                                                        confirmText={t("shared.actions.delete")}
                                                                        cancelText={t("shared.actions.cancel")}
                                                                    >
                                                                        <Button size="icon" variant="ghost" className="text-destructive">
                                                                            <Trash2 className="w-4 h-4" />
                                                                        </Button>
                                                                    </ConfirmAction>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                    )}
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingNetwork ? t("wifi_management.edit_network") : t("wifi_management.add_network")}</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>{t("wifi_management.form.label")}</Label>
                            <Input
                                value={form.label}
                                placeholder={t("wifi_management.form.label_placeholder")}
                                onChange={(e) => setForm({ ...form, label: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>{t("wifi_management.form.ssid")}</Label>
                            <Input value={form.ssid} onChange={(e) => setForm({ ...form, ssid: e.target.value })} />
                        </div>

                        <div className="space-y-2">
                            <Label>{t("wifi_management.form.password")}</Label>
                            <Input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                        </div>

                        <div className="flex items-center justify-between py-2">
                            <div className="space-y-0.5">
                                <Label>{t("wifi_management.form.business_wide")}</Label>
                                <p className="text-xs text-muted-foreground">{t("wifi_management.form.business_wide_hint")}</p>
                            </div>
                            <Switch
                                checked={form.businessWide}
                                onCheckedChange={(val) => setForm({ ...form, businessWide: val })}
                            />
                        </div>

                        {floors && floors.length > 0 && (
                            <div className="space-y-2">
                                <Label>{t("wifi_management.form.floors")}</Label>
                                <p className="text-xs text-muted-foreground">{t("wifi_management.form.floors_hint")}</p>
                                <div className="space-y-2 max-h-40 overflow-y-auto rounded-md border p-2">
                                    {floors.map((floor: any) => (
                                        <div key={floor.id} className="flex items-center gap-2">
                                            <Checkbox
                                                id={`floor-${floor.id}`}
                                                checked={form.floorIds.includes(floor.id)}
                                                onCheckedChange={(checked) => toggleFloor(floor.id, !!checked)}
                                            />
                                            <label htmlFor={`floor-${floor.id}`} className="text-sm cursor-pointer">
                                                {floor.name}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setModalOpen(false)}>{t("wifi_management.cancel")}</Button>
                        <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t("wifi_management.save")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
