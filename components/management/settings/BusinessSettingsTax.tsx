import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { Loader2, Plus, Pencil, Trash2, Star, Wand2 } from "lucide-react"
import { toast } from "sonner"
import { MyBusinessFullDetails } from "@/models/business/MyBusinessFullDetails"
import { businessTaxApi, BusinessTax, BusinessTaxGroup } from "@/features/business/taxes/service"

type Props = {
    businessDetails?: MyBusinessFullDetails
    onSaveDetails?: (data: { taxIncluded?: boolean; taxIdNumber?: string }) => void
    disabled?: boolean
}

export default function BusinessSettingsTax({ businessDetails, onSaveDetails, disabled }: Props) {
    const { t } = useTranslation("management")
    const businessId = businessDetails?.id
    const qc = useQueryClient()

    const { data: taxes = [], isLoading: loadingTaxes } = useQuery({
        queryKey: ["business-taxes", businessId],
        queryFn: () => businessTaxApi.listTaxes(businessId!),
        enabled: !!businessId,
    })

    const { data: groups = [], isLoading: loadingGroups } = useQuery({
        queryKey: ["business-tax-groups", businessId],
        queryFn: () => businessTaxApi.listGroups(businessId!),
        enabled: !!businessId,
    })

    const loading = loadingTaxes || loadingGroups

    return (
        <AccordionItem value="tax" className="border rounded-lg px-3">
            <AccordionTrigger>{t("settings_page.tax.trigger")}</AccordionTrigger>
            <AccordionContent className="space-y-6 py-2">
                {loading ? (
                    <div className="flex items-center gap-2 text-muted-foreground text-sm py-4">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {t("settings_page.tax.loading")}
                    </div>
                ) : (
                    <>
                        {(businessDetails?.country?.code === "ES" || businessDetails?.country?.code === "AD") && (
                            <FiscalIdField
                                countryCode={businessDetails.country!.code as "ES" | "AD"}
                                taxIdNumber={businessDetails?.taxIdNumber ?? null}
                                onSave={(val) => onSaveDetails?.({ taxIdNumber: val })}
                                disabled={disabled}
                            />
                        )}

                        <PricingModelToggle
                            taxIncluded={businessDetails?.taxIncluded ?? true}
                            onSave={(val) => onSaveDetails?.({ taxIncluded: val })}
                            disabled={disabled}
                        />

                        <TaxLibrary businessId={businessId!} taxes={taxes} qc={qc} />

                        <TaxGroupsSection businessId={businessId!} groups={groups} taxes={taxes} qc={qc} />
                    </>
                )}
            </AccordionContent>
        </AccordionItem>
    )
}

// ─── Fiscal ID (Spain: NIF/CIF, Andorra: NRT) ──────────────────────────────────
// Required by SpainFiscalAdapter / AndorraFiscalAdapter before any order can be
// completed — without it, completing an order for this business throws a 400
// server-side (AndorraFiscalAdapter live as of AD-01/04/05/06/07, 2026-08-08).

// Spain's fiscal adapter is fully built but not yet routed live (FiscalAdapterFactory
// still sends every ES business to the generic adapter) — so unlike Andorra below,
// this does NOT currently block completing an order. Don't claim otherwise until that
// changes.
function FiscalIdField({
    countryCode,
    taxIdNumber,
    onSave,
    disabled,
}: {
    countryCode: "ES" | "AD"
    taxIdNumber: string | null
    onSave: (val: string) => void
    disabled?: boolean
}) {
    const { t } = useTranslation("management")
    const [value, setValue] = useState(taxIdNumber ?? "")
    const isDirty = value.trim() !== (taxIdNumber ?? "")
    const copy = t(`settings_page.tax.fiscal_id.${countryCode}`, { returnObjects: true }) as {
        label: string; placeholder: string; helper: string; notSetWarning: string
    }

    return (
        <div className="space-y-2 pb-4 border-b">
            <Label htmlFor="fiscal-tax-id" className="text-sm font-medium">{copy.label}</Label>
            <p className="text-xs text-muted-foreground">{copy.helper}</p>
            <div className="flex items-center gap-2 max-w-sm">
                <Input
                    id="fiscal-tax-id"
                    placeholder={copy.placeholder}
                    value={value}
                    maxLength={20}
                    onChange={(e) => setValue(e.target.value)}
                    disabled={disabled}
                />
                <Button
                    size="sm"
                    disabled={disabled || !isDirty || !value.trim()}
                    onClick={() => onSave(value.trim())}
                >
                    {t("settings_page.tax.save")}
                </Button>
            </div>
            {!taxIdNumber && (
                <p className="text-xs text-amber-600 font-medium">{copy.notSetWarning}</p>
            )}
        </div>
    )
}

// ─── Pricing Model ────────────────────────────────────────────────────────────

function PricingModelToggle({
    taxIncluded,
    onSave,
    disabled,
}: {
    taxIncluded: boolean
    onSave: (val: boolean) => void
    disabled?: boolean
}) {
    const { t } = useTranslation("management")
    const [value, setValue] = useState<"included" | "excluded">(taxIncluded ? "included" : "excluded")

    return (
        <div className="space-y-3 pb-4 border-b">
            <Label className="text-sm font-medium">{t("settings_page.tax.pricing_model.label")}</Label>
            <RadioGroup
                value={value}
                onValueChange={(v) => setValue(v as "included" | "excluded")}
                disabled={disabled}
                className="space-y-2"
            >
                <div className="flex items-center gap-2">
                    <RadioGroupItem value="included" id="tax-included" />
                    <Label htmlFor="tax-included" className="font-normal cursor-pointer">
                        {t("settings_page.tax.pricing_model.included_label")}
                        <span className="text-xs text-muted-foreground ml-1">{t("settings_page.tax.pricing_model.included_hint")}</span>
                    </Label>
                </div>
                <div className="flex items-center gap-2">
                    <RadioGroupItem value="excluded" id="tax-excluded" />
                    <Label htmlFor="tax-excluded" className="font-normal cursor-pointer">
                        {t("settings_page.tax.pricing_model.excluded_label")}
                        <span className="text-xs text-muted-foreground ml-1">{t("settings_page.tax.pricing_model.excluded_hint")}</span>
                    </Label>
                </div>
            </RadioGroup>
            <Button
                size="sm"
                disabled={disabled}
                onClick={() => onSave(value === "included")}
            >
                {t("settings_page.tax.pricing_model.save")}
            </Button>
        </div>
    )
}

// ─── Tax Library ──────────────────────────────────────────────────────────────

function TaxLibrary({
    businessId,
    taxes,
    qc,
}: {
    businessId: string
    taxes: BusinessTax[]
    qc: ReturnType<typeof useQueryClient>
}) {
    const { t } = useTranslation("management")
    const [editTax, setEditTax] = useState<BusinessTax | null>(null)
    const [showAdd, setShowAdd] = useState(false)

    const invalidate = () => qc.invalidateQueries({ queryKey: ["business-taxes", businessId] })

    const deleteMutation = useMutation({
        mutationFn: (taxId: string) => businessTaxApi.deleteTax(businessId, taxId),
        onSuccess: () => { invalidate(); toast.success(t("settings_page.tax.library.toasts.deleted")) },
        onError: () => toast.error(t("settings_page.tax.library.toasts.delete_failed")),
    })

    const setDefaultMutation = useMutation({
        mutationFn: (taxId: string) => businessTaxApi.setDefault(businessId, taxId),
        onSuccess: () => { invalidate(); toast.success(t("settings_page.tax.library.toasts.default_updated")) },
        onError: () => toast.error(t("settings_page.tax.library.toasts.default_update_failed")),
    })

    const autofillMutation = useMutation({
        mutationFn: () => businessTaxApi.autofillTaxes(businessId),
        onSuccess: (result) => {
            if (result.unsupportedCountry) {
                toast.info(t("settings_page.tax.library.toasts.unsupported_country"))
                return
            }
            invalidate()
            if (result.created.length > 0) {
                toast.success(t("settings_page.tax.library.toasts.autofill_added", { list: result.created.map((tx) => `${tx.name} (${tx.rate}%)`).join(", ") }))
            } else {
                toast.info(t("settings_page.tax.library.toasts.autofill_up_to_date"))
            }
        },
        onError: () => toast.error(t("settings_page.tax.library.toasts.autofill_failed")),
    })

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium">{t("settings_page.tax.library.title")}</p>
                    <p className="text-xs text-muted-foreground">{t("settings_page.tax.library.subtitle")}</p>
                </div>
                <div className="flex items-center gap-2">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => autofillMutation.mutate()}
                                        disabled={autofillMutation.isPending}
                                        className="gap-1.5"
                                    >
                                        {autofillMutation.isPending ? (
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        ) : (
                                            <Wand2 className="w-3.5 h-3.5" />
                                        )}
                                        {t("settings_page.tax.library.autofill")}
                                    </Button>
                                </span>
                            </TooltipTrigger>
                            <TooltipContent>
                                {t("settings_page.tax.library.autofill_tooltip")}
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <Button size="sm" variant="outline" onClick={() => setShowAdd(true)} className="gap-1.5">
                        <Plus className="w-3.5 h-3.5" />
                        {t("settings_page.tax.library.add_tax")}
                    </Button>
                </div>
            </div>

            {taxes.length === 0 ? (
                <div className="rounded-lg border border-dashed p-6 text-center space-y-2">
                    <p className="text-sm text-muted-foreground">{t("settings_page.tax.library.empty_title")}</p>
                    <p className="text-xs text-muted-foreground">{t("settings_page.tax.library.empty_desc")}</p>
                    <Button size="sm" variant="outline" onClick={() => setShowAdd(true)} className="gap-1.5 mt-1">
                        <Plus className="w-3.5 h-3.5" />
                        {t("settings_page.tax.library.add_tax")}
                    </Button>
                </div>
            ) : (
                <div className="rounded-lg border divide-y">
                    {taxes.map((tax) => (
                        <div key={tax.id} className="flex items-center justify-between px-4 py-3 gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                                <span className="text-sm font-medium truncate">{tax.name}</span>
                                {tax.isDefault && (
                                    <Badge variant="secondary" className="shrink-0 gap-1">
                                        <Star className="w-3 h-3" />
                                        {t("settings_page.tax.library.default_badge")}
                                    </Badge>
                                )}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <span className="text-sm text-muted-foreground w-14 text-right">
                                    {tax.rate.toFixed(2)}%
                                </span>
                                {!tax.isDefault && (
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-7 px-2 text-xs"
                                        onClick={() => setDefaultMutation.mutate(tax.id)}
                                        disabled={setDefaultMutation.isPending}
                                    >
                                        {t("settings_page.tax.library.set_default")}
                                    </Button>
                                )}
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7"
                                    onClick={() => setEditTax(tax)}
                                >
                                    <Pencil className="w-3.5 h-3.5" />
                                </Button>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <span>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                    onClick={() => deleteMutation.mutate(tax.id)}
                                                    disabled={tax.isDefault || deleteMutation.isPending}
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            </span>
                                        </TooltipTrigger>
                                        {tax.isDefault && (
                                            <TooltipContent>
                                                {t("settings_page.tax.library.delete_default_tooltip")}
                                            </TooltipContent>
                                        )}
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <TaxFormDialog
                businessId={businessId}
                open={showAdd}
                onOpenChange={setShowAdd}
                onSaved={() => { invalidate(); setShowAdd(false) }}
            />
            <TaxFormDialog
                businessId={businessId}
                open={!!editTax}
                onOpenChange={(open) => { if (!open) setEditTax(null) }}
                initialValues={editTax ?? undefined}
                onSaved={() => { invalidate(); setEditTax(null) }}
            />
        </div>
    )
}

function TaxFormDialog({
    businessId,
    open,
    onOpenChange,
    initialValues,
    onSaved,
}: {
    businessId: string
    open: boolean
    onOpenChange: (open: boolean) => void
    initialValues?: BusinessTax
    onSaved: () => void
}) {
    const { t } = useTranslation("management")
    const isEdit = !!initialValues
    const [name, setName] = useState(initialValues?.name ?? "")
    const [rate, setRate] = useState(initialValues?.rate?.toString() ?? "")
    const [isDefault, setIsDefault] = useState(initialValues?.isDefault ?? false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    // Reset form when dialog opens
    const handleOpenChange = (val: boolean) => {
        if (val) {
            setName(initialValues?.name ?? "")
            setRate(initialValues?.rate?.toString() ?? "")
            setIsDefault(initialValues?.isDefault ?? false)
            setError("")
        }
        onOpenChange(val)
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        const rateNum = parseFloat(rate)
        if (!name.trim()) { setError(t("settings_page.tax.form_dialog.errors.name_required")); return }
        if (isNaN(rateNum) || rateNum < 0 || rateNum > 100) { setError(t("settings_page.tax.form_dialog.errors.rate_invalid")); return }
        setLoading(true)
        setError("")
        try {
            if (isEdit) {
                await businessTaxApi.updateTax(businessId, initialValues!.id, { name: name.trim(), rate: rateNum, isDefault })
                toast.success(t("settings_page.tax.form_dialog.toasts.updated"))
            } else {
                await businessTaxApi.createTax(businessId, { name: name.trim(), rate: rateNum, isDefault })
                toast.success(t("settings_page.tax.form_dialog.toasts.created"))
            }
            onSaved()
        } catch {
            setError(t("settings_page.tax.form_dialog.errors.save_failed"))
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEdit ? t("settings_page.tax.form_dialog.edit_title") : t("settings_page.tax.form_dialog.add_title")}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label>{t("settings_page.tax.form_dialog.name_label")}</Label>
                        <Input
                            placeholder={t("settings_page.tax.form_dialog.name_placeholder")}
                            value={name}
                            maxLength={30}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                        <p className="text-xs text-muted-foreground">{name.length}/30</p>
                    </div>
                    <div className="space-y-1.5">
                        <Label>{t("settings_page.tax.form_dialog.rate_label")}</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                type="number"
                                placeholder="0.00"
                                value={rate}
                                onChange={(e) => setRate(e.target.value)}
                                min={0}
                                max={100}
                                step={0.01}
                                required
                            />
                            <span className="text-muted-foreground text-sm">%</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="tax-is-default"
                            checked={isDefault}
                            onCheckedChange={(checked) => setIsDefault(!!checked)}
                        />
                        <Label htmlFor="tax-is-default" className="font-normal cursor-pointer">
                            {t("settings_page.tax.form_dialog.set_default_checkbox")}
                        </Label>
                    </div>
                    {error && <p className="text-destructive text-sm">{error}</p>}
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            {t("settings_page.tax.form_dialog.cancel")}
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : isEdit ? t("settings_page.tax.form_dialog.save_changes") : t("settings_page.tax.form_dialog.create")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

// ─── Tax Groups ───────────────────────────────────────────────────────────────

function TaxGroupsSection({
    businessId,
    groups,
    taxes,
    qc,
}: {
    businessId: string
    groups: BusinessTaxGroup[]
    taxes: BusinessTax[]
    qc: ReturnType<typeof useQueryClient>
}) {
    const { t } = useTranslation("management")
    const [editGroup, setEditGroup] = useState<BusinessTaxGroup | null>(null)
    const [showAdd, setShowAdd] = useState(false)
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

    const invalidate = () => qc.invalidateQueries({ queryKey: ["business-tax-groups", businessId] })

    const deleteMutation = useMutation({
        mutationFn: (groupId: string) => businessTaxApi.deleteGroup(businessId, groupId),
        onSuccess: () => { invalidate(); setConfirmDeleteId(null); toast.success(t("settings_page.tax.groups.toasts.deleted")) },
        onError: () => toast.error(t("settings_page.tax.groups.toasts.delete_failed")),
    })

    const noTaxes = taxes.length === 0

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium">{t("settings_page.tax.groups.title")}</p>
                    <p className="text-xs text-muted-foreground">{t("settings_page.tax.groups.subtitle")}</p>
                </div>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setShowAdd(true)}
                                    disabled={noTaxes}
                                    className="gap-1.5"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    {t("settings_page.tax.groups.add_group")}
                                </Button>
                            </span>
                        </TooltipTrigger>
                        {noTaxes && (
                            <TooltipContent>
                                {t("settings_page.tax.groups.add_taxes_first_tooltip")}
                            </TooltipContent>
                        )}
                    </Tooltip>
                </TooltipProvider>
            </div>

            {noTaxes ? (
                <div className="rounded-lg border border-dashed p-4 text-center">
                    <p className="text-sm text-muted-foreground">{t("settings_page.tax.groups.empty_no_taxes")}</p>
                </div>
            ) : groups.length === 0 ? (
                <div className="rounded-lg border border-dashed p-6 text-center space-y-2">
                    <p className="text-sm text-muted-foreground">{t("settings_page.tax.groups.empty_title")}</p>
                    <p className="text-xs text-muted-foreground">{t("settings_page.tax.groups.empty_desc")}</p>
                    <Button size="sm" variant="outline" onClick={() => setShowAdd(true)} className="gap-1.5 mt-1">
                        <Plus className="w-3.5 h-3.5" />
                        {t("settings_page.tax.groups.add_group")}
                    </Button>
                </div>
            ) : (
                <div className="rounded-lg border divide-y">
                    {groups.map((group) => {
                        const total = group.taxes.reduce((sum, t) => sum + t.rate, 0)
                        return (
                            <div key={group.id} className="flex items-center justify-between px-4 py-3 gap-3">
                                <div className="min-w-0">
                                    <p className="text-sm font-medium">{group.name}</p>
                                    <p className="text-xs text-muted-foreground truncate">
                                        {group.taxes.map((gt) => gt.name).join(" + ") || t("settings_page.tax.groups.no_taxes_label")}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <span className="text-sm text-muted-foreground w-20 text-right">
                                        {t("settings_page.tax.groups.total_suffix", { rate: total.toFixed(2) })}
                                    </span>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-7 w-7"
                                        onClick={() => setEditGroup(group)}
                                    >
                                        <Pencil className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                                        onClick={() => setConfirmDeleteId(group.id)}
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            <TaxGroupFormDialog
                businessId={businessId}
                taxes={taxes}
                open={showAdd}
                onOpenChange={setShowAdd}
                onSaved={() => { invalidate(); setShowAdd(false) }}
            />
            <TaxGroupFormDialog
                businessId={businessId}
                taxes={taxes}
                open={!!editGroup}
                onOpenChange={(open) => { if (!open) setEditGroup(null) }}
                initialValues={editGroup ?? undefined}
                onSaved={() => { invalidate(); setEditGroup(null) }}
            />

            {/* Delete confirmation */}
            <Dialog open={!!confirmDeleteId} onOpenChange={(open) => { if (!open) setConfirmDeleteId(null) }}>
                <DialogContent className="max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{t("settings_page.tax.groups.delete_confirm_title")}</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">{t("settings_page.tax.groups.delete_confirm_desc")}</p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirmDeleteId(null)}>{t("settings_page.tax.form_dialog.cancel")}</Button>
                        <Button
                            variant="destructive"
                            onClick={() => confirmDeleteId && deleteMutation.mutate(confirmDeleteId)}
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : t("settings_page.tax.groups.delete")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

function TaxGroupFormDialog({
    businessId,
    taxes,
    open,
    onOpenChange,
    initialValues,
    onSaved,
}: {
    businessId: string
    taxes: BusinessTax[]
    open: boolean
    onOpenChange: (open: boolean) => void
    initialValues?: BusinessTaxGroup
    onSaved: () => void
}) {
    const { t } = useTranslation("management")
    const isEdit = !!initialValues
    const [name, setName] = useState(initialValues?.name ?? "")
    const [selectedIds, setSelectedIds] = useState<string[]>(
        initialValues?.taxes.map((tx) => tx.id) ?? []
    )
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const handleOpenChange = (val: boolean) => {
        if (val) {
            setName(initialValues?.name ?? "")
            setSelectedIds(initialValues?.taxes.map((tx) => tx.id) ?? [])
            setError("")
        }
        onOpenChange(val)
    }

    function toggleTax(taxId: string) {
        setSelectedIds((prev) =>
            prev.includes(taxId) ? prev.filter((id) => id !== taxId) : [...prev, taxId]
        )
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!name.trim()) { setError(t("settings_page.tax.group_form_dialog.errors.name_required")); return }
        if (selectedIds.length === 0) { setError(t("settings_page.tax.group_form_dialog.errors.select_at_least_one")); return }
        setLoading(true)
        setError("")
        try {
            if (isEdit) {
                await businessTaxApi.updateGroup(businessId, initialValues!.id, { name: name.trim(), taxIds: selectedIds })
                toast.success(t("settings_page.tax.group_form_dialog.toasts.updated"))
            } else {
                await businessTaxApi.createGroup(businessId, { name: name.trim(), taxIds: selectedIds })
                toast.success(t("settings_page.tax.group_form_dialog.toasts.created"))
            }
            onSaved()
        } catch {
            setError(t("settings_page.tax.group_form_dialog.errors.save_failed"))
        } finally {
            setLoading(false)
        }
    }

    const combinedRate = taxes
        .filter((tx) => selectedIds.includes(tx.id))
        .reduce((sum, tx) => sum + tx.rate, 0)

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEdit ? t("settings_page.tax.group_form_dialog.edit_title") : t("settings_page.tax.group_form_dialog.add_title")}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label>{t("settings_page.tax.group_form_dialog.name_label")}</Label>
                        <Input
                            placeholder={t("settings_page.tax.group_form_dialog.name_placeholder")}
                            value={name}
                            maxLength={50}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                        <p className="text-xs text-muted-foreground">{name.length}/50</p>
                    </div>
                    <div className="space-y-2">
                        <Label>{t("settings_page.tax.group_form_dialog.taxes_label")}</Label>
                        <div className="rounded-lg border divide-y">
                            {taxes.map((tax) => (
                                <label
                                    key={tax.id}
                                    className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-muted/50"
                                >
                                    <Checkbox
                                        checked={selectedIds.includes(tax.id)}
                                        onCheckedChange={() => toggleTax(tax.id)}
                                    />
                                    <span className="flex-1 text-sm">{tax.name}</span>
                                    <span className="text-sm text-muted-foreground">{tax.rate.toFixed(2)}%</span>
                                </label>
                            ))}
                        </div>
                        {selectedIds.length > 0 && (
                            <p className="text-xs text-muted-foreground text-right">
                                {t("settings_page.tax.group_form_dialog.combined_rate")} <span className="font-medium text-foreground">{combinedRate.toFixed(2)}%</span>
                            </p>
                        )}
                    </div>
                    {error && <p className="text-destructive text-sm">{error}</p>}
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            {t("settings_page.tax.form_dialog.cancel")}
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : isEdit ? t("settings_page.tax.group_form_dialog.save_changes") : t("settings_page.tax.group_form_dialog.create")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
