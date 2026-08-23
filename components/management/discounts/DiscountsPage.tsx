import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ConfirmAction } from "@/components/shared/ConfirmAction";
import { Plus, Pencil, Trash2, Tag } from "lucide-react";
import { useDiscounts } from "@/features/orders/useDiscounts";
import { Discount, DiscountType, CreateDiscountPayload } from "@/features/orders/discounts";

interface Props {
    businessId: string;
}

const emptyForm: CreateDiscountPayload = {
    name: "",
    code: "",
    type: "PERCENTAGE",
    value: 0,
    minOrderAmount: undefined,
    isActive: true,
    expiresAt: undefined,
};

function formatValue(discount: Discount): string {
    return discount.type === "PERCENTAGE" ? `${discount.value}%` : `$${Number(discount.value).toFixed(2)}`;
}

const DiscountsPage: React.FC<Props> = ({ businessId }) => {
    const { t } = useTranslation("management");
    const { discounts, fetchingDiscounts, createDiscount, isCreatingDiscount, updateDiscount, removeDiscount } = useDiscounts(businessId);

    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<Discount | null>(null);
    const [form, setForm] = useState<CreateDiscountPayload>(emptyForm);

    const openCreate = () => {
        setEditing(null);
        setForm(emptyForm);
        setModalOpen(true);
    };

    const openEdit = (discount: Discount) => {
        setEditing(discount);
        setForm({
            name: discount.name,
            code: discount.code ?? "",
            type: discount.type,
            value: discount.value,
            minOrderAmount: discount.minOrderAmount ?? undefined,
            isActive: discount.isActive,
            expiresAt: discount.expiresAt ?? undefined,
        });
        setModalOpen(true);
    };

    const handleSave = () => {
        if (!form.name.trim() || form.value <= 0) return;
        const payload: CreateDiscountPayload = {
            ...form,
            code: form.code?.trim() ? form.code.trim().toUpperCase() : null,
            minOrderAmount: form.minOrderAmount || undefined,
            expiresAt: form.expiresAt || undefined,
        };
        if (editing) {
            updateDiscount({ id: editing.id, payload });
        } else {
            createDiscount(payload);
        }
        setModalOpen(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{t("discounts_page.title")}</h1>
                    <p className="text-muted-foreground text-sm mt-1">{t("discounts_page.subtitle")}</p>
                </div>
                <Button onClick={openCreate} className="gap-2">
                    <Plus className="w-4 h-4" /> {t("discounts_page.new_discount")}
                </Button>
            </div>

            <Separator />

            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Tag className="w-4 h-4" /> {t("discounts_page.all_discounts")}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t("discounts_page.col_name")}</TableHead>
                                <TableHead>{t("discounts_page.col_code")}</TableHead>
                                <TableHead>{t("discounts_page.col_value")}</TableHead>
                                <TableHead>{t("discounts_page.col_min_order")}</TableHead>
                                <TableHead>{t("discounts_page.col_expires")}</TableHead>
                                <TableHead>{t("discounts_page.col_status")}</TableHead>
                                <TableHead className="text-right">{t("discounts_page.col_actions")}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {fetchingDiscounts ? (
                                <TableRow><TableCell colSpan={7} className="text-center">{t("discounts_page.loading")}</TableCell></TableRow>
                            ) : discounts.length === 0 ? (
                                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">{t("discounts_page.empty")}</TableCell></TableRow>
                            ) : (
                                discounts.map((discount) => (
                                    <TableRow key={discount.id}>
                                        <TableCell className="font-medium">{discount.name}</TableCell>
                                        <TableCell>
                                            {discount.code
                                                ? <span className="font-mono text-xs bg-muted px-2 py-1 rounded">{discount.code}</span>
                                                : <span className="text-muted-foreground text-xs">—</span>}
                                        </TableCell>
                                        <TableCell>{formatValue(discount)}</TableCell>
                                        <TableCell>{discount.minOrderAmount ? `$${Number(discount.minOrderAmount).toFixed(2)}` : "—"}</TableCell>
                                        <TableCell>{discount.expiresAt ? new Date(discount.expiresAt).toLocaleDateString() : "—"}</TableCell>
                                        <TableCell>
                                            <Badge variant={discount.isActive ? "default" : "secondary"}>
                                                {discount.isActive ? t("discounts_page.active") : t("discounts_page.inactive")}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button size="icon" variant="ghost" onClick={() => openEdit(discount)}>
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                                <ConfirmAction onConfirm={() => removeDiscount(discount.id)}>
                                                    <Button size="icon" variant="ghost" className="text-destructive">
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </ConfirmAction>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editing ? t("discounts_page.form.edit_title") : t("discounts_page.form.new_title")}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-1">
                            <Label className="text-xs">{t("discounts_page.form.name_label")} <span className="text-destructive">*</span></Label>
                            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={t("discounts_page.form.name_placeholder")} />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">{t("discounts_page.form.code_label")}</Label>
                            <Input
                                value={form.code ?? ""}
                                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                                placeholder="SUMMER10"
                                className="font-mono tracking-widest uppercase"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label className="text-xs">{t("discounts_page.form.type_label")}</Label>
                                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as DiscountType })}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PERCENTAGE">{t("discounts_page.form.percentage_option")}</SelectItem>
                                        <SelectItem value="FIXED">{t("discounts_page.form.fixed_option")}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">{t("discounts_page.form.value_label")} <span className="text-destructive">*</span></Label>
                                <Input
                                    type="number"
                                    min={0}
                                    step={0.01}
                                    value={form.value || ""}
                                    onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label className="text-xs">{t("discounts_page.form.min_order_label")}</Label>
                                <Input
                                    type="number"
                                    min={0}
                                    step={0.01}
                                    value={form.minOrderAmount ?? ""}
                                    onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value ? Number(e.target.value) : undefined })}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">{t("discounts_page.form.expires_label")}</Label>
                                <Input
                                    type="date"
                                    value={form.expiresAt ? form.expiresAt.substring(0, 10) : ""}
                                    onChange={(e) => setForm({ ...form, expiresAt: e.target.value || undefined })}
                                />
                            </div>
                        </div>
                        <div className="flex items-center justify-between py-2">
                            <Label className="text-xs">{t("discounts_page.active")}</Label>
                            <Switch checked={form.isActive ?? true} onCheckedChange={(v) => setForm({ ...form, isActive: v })} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setModalOpen(false)}>{t("discounts_page.form.cancel")}</Button>
                        <Button disabled={isCreatingDiscount || !form.name.trim() || form.value <= 0} onClick={handleSave}>
                            {editing ? t("discounts_page.form.save") : t("discounts_page.form.create")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default DiscountsPage;
