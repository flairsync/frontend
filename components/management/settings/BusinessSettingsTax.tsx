import { useState } from "react"
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
import { Loader2, Plus, Pencil, Trash2, Star } from "lucide-react"
import { toast } from "sonner"
import { MyBusinessFullDetails } from "@/models/business/MyBusinessFullDetails"
import { businessTaxApi, BusinessTax, BusinessTaxGroup } from "@/features/business/taxes/service"

type Props = {
    businessDetails?: MyBusinessFullDetails
    onSaveDetails?: (data: { taxIncluded: boolean }) => void
    disabled?: boolean
}

export default function BusinessSettingsTax({ businessDetails, onSaveDetails, disabled }: Props) {
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
            <AccordionTrigger>Tax Configuration</AccordionTrigger>
            <AccordionContent className="space-y-6 py-2">
                {loading ? (
                    <div className="flex items-center gap-2 text-muted-foreground text-sm py-4">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading tax configuration…
                    </div>
                ) : (
                    <>
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
    const [value, setValue] = useState<"included" | "excluded">(taxIncluded ? "included" : "excluded")

    return (
        <div className="space-y-3 pb-4 border-b">
            <Label className="text-sm font-medium">Pricing Model</Label>
            <RadioGroup
                value={value}
                onValueChange={(v) => setValue(v as "included" | "excluded")}
                disabled={disabled}
                className="space-y-2"
            >
                <div className="flex items-center gap-2">
                    <RadioGroupItem value="included" id="tax-included" />
                    <Label htmlFor="tax-included" className="font-normal cursor-pointer">
                        Tax included in price
                        <span className="text-xs text-muted-foreground ml-1">(EU style — tax is baked into displayed prices)</span>
                    </Label>
                </div>
                <div className="flex items-center gap-2">
                    <RadioGroupItem value="excluded" id="tax-excluded" />
                    <Label htmlFor="tax-excluded" className="font-normal cursor-pointer">
                        Tax added on top
                        <span className="text-xs text-muted-foreground ml-1">(US style — tax is shown as a separate line at checkout)</span>
                    </Label>
                </div>
            </RadioGroup>
            <Button
                size="sm"
                disabled={disabled}
                onClick={() => onSave(value === "included")}
            >
                Save pricing model
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
    const [editTax, setEditTax] = useState<BusinessTax | null>(null)
    const [showAdd, setShowAdd] = useState(false)

    const invalidate = () => qc.invalidateQueries({ queryKey: ["business-taxes", businessId] })

    const deleteMutation = useMutation({
        mutationFn: (taxId: string) => businessTaxApi.deleteTax(businessId, taxId),
        onSuccess: () => { invalidate(); toast.success("Tax deleted") },
        onError: () => toast.error("Failed to delete tax"),
    })

    const setDefaultMutation = useMutation({
        mutationFn: (taxId: string) => businessTaxApi.setDefault(businessId, taxId),
        onSuccess: () => { invalidate(); toast.success("Default tax updated") },
        onError: () => toast.error("Failed to update default tax"),
    })

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium">Tax Library</p>
                    <p className="text-xs text-muted-foreground">Individual tax rates applied to orders</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => setShowAdd(true)} className="gap-1.5">
                    <Plus className="w-3.5 h-3.5" />
                    Add Tax
                </Button>
            </div>

            {taxes.length === 0 ? (
                <div className="rounded-lg border border-dashed p-6 text-center space-y-2">
                    <p className="text-sm text-muted-foreground">No taxes configured yet.</p>
                    <p className="text-xs text-muted-foreground">Add your first tax to apply it to all orders by default.</p>
                    <Button size="sm" variant="outline" onClick={() => setShowAdd(true)} className="gap-1.5 mt-1">
                        <Plus className="w-3.5 h-3.5" />
                        Add Tax
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
                                        Default
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
                                        Set default
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
                                                Set another tax as default before deleting this one.
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
        if (!name.trim()) { setError("Tax name is required."); return }
        if (isNaN(rateNum) || rateNum < 0 || rateNum > 100) { setError("Tax rate cannot exceed 100%."); return }
        setLoading(true)
        setError("")
        try {
            if (isEdit) {
                await businessTaxApi.updateTax(businessId, initialValues!.id, { name: name.trim(), rate: rateNum, isDefault })
                toast.success("Tax updated")
            } else {
                await businessTaxApi.createTax(businessId, { name: name.trim(), rate: rateNum, isDefault })
                toast.success("Tax created")
            }
            onSaved()
        } catch {
            setError("Failed to save tax. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isEdit ? "Edit Tax" : "Add Tax"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label>Name</Label>
                        <Input
                            placeholder="e.g. VAT, State Tax"
                            value={name}
                            maxLength={30}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                        <p className="text-xs text-muted-foreground">{name.length}/30</p>
                    </div>
                    <div className="space-y-1.5">
                        <Label>Rate (%)</Label>
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
                            Set as default tax
                        </Label>
                    </div>
                    {error && <p className="text-destructive text-sm">{error}</p>}
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : isEdit ? "Save changes" : "Create"}
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
    const [editGroup, setEditGroup] = useState<BusinessTaxGroup | null>(null)
    const [showAdd, setShowAdd] = useState(false)
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

    const invalidate = () => qc.invalidateQueries({ queryKey: ["business-tax-groups", businessId] })

    const deleteMutation = useMutation({
        mutationFn: (groupId: string) => businessTaxApi.deleteGroup(businessId, groupId),
        onSuccess: () => { invalidate(); setConfirmDeleteId(null); toast.success("Tax group deleted") },
        onError: () => toast.error("Failed to delete tax group"),
    })

    const noTaxes = taxes.length === 0

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium">Tax Groups</p>
                    <p className="text-xs text-muted-foreground">Bundle multiple taxes for specific items (e.g. Merch, Alcohol)</p>
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
                                    Add Group
                                </Button>
                            </span>
                        </TooltipTrigger>
                        {noTaxes && (
                            <TooltipContent>
                                Add taxes to the library above before creating groups.
                            </TooltipContent>
                        )}
                    </Tooltip>
                </TooltipProvider>
            </div>

            {noTaxes ? (
                <div className="rounded-lg border border-dashed p-4 text-center">
                    <p className="text-sm text-muted-foreground">Add taxes to the library above before creating groups.</p>
                </div>
            ) : groups.length === 0 ? (
                <div className="rounded-lg border border-dashed p-6 text-center space-y-2">
                    <p className="text-sm text-muted-foreground">No tax groups yet.</p>
                    <p className="text-xs text-muted-foreground">Groups let you stack multiple taxes for specific items (e.g. Merch, Alcohol).</p>
                    <Button size="sm" variant="outline" onClick={() => setShowAdd(true)} className="gap-1.5 mt-1">
                        <Plus className="w-3.5 h-3.5" />
                        Add Group
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
                                        {group.taxes.map((t) => t.name).join(" + ") || "No taxes"}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <span className="text-sm text-muted-foreground w-20 text-right">
                                        {total.toFixed(2)}% total
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
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete tax group?</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirmDeleteId(null)}>Cancel</Button>
                        <Button
                            variant="destructive"
                            onClick={() => confirmDeleteId && deleteMutation.mutate(confirmDeleteId)}
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
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
    const isEdit = !!initialValues
    const [name, setName] = useState(initialValues?.name ?? "")
    const [selectedIds, setSelectedIds] = useState<string[]>(
        initialValues?.taxes.map((t) => t.id) ?? []
    )
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const handleOpenChange = (val: boolean) => {
        if (val) {
            setName(initialValues?.name ?? "")
            setSelectedIds(initialValues?.taxes.map((t) => t.id) ?? [])
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
        if (!name.trim()) { setError("Group name is required."); return }
        if (selectedIds.length === 0) { setError("Select at least one tax for this group."); return }
        setLoading(true)
        setError("")
        try {
            if (isEdit) {
                await businessTaxApi.updateGroup(businessId, initialValues!.id, { name: name.trim(), taxIds: selectedIds })
                toast.success("Tax group updated")
            } else {
                await businessTaxApi.createGroup(businessId, { name: name.trim(), taxIds: selectedIds })
                toast.success("Tax group created")
            }
            onSaved()
        } catch {
            setError("Failed to save tax group. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    const combinedRate = taxes
        .filter((t) => selectedIds.includes(t.id))
        .reduce((sum, t) => sum + t.rate, 0)

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isEdit ? "Edit Tax Group" : "Add Tax Group"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label>Group name</Label>
                        <Input
                            placeholder="e.g. Alcohol, Merch"
                            value={name}
                            maxLength={50}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                        <p className="text-xs text-muted-foreground">{name.length}/50</p>
                    </div>
                    <div className="space-y-2">
                        <Label>Taxes</Label>
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
                                Combined rate: <span className="font-medium text-foreground">{combinedRate.toFixed(2)}%</span>
                            </p>
                        )}
                    </div>
                    {error && <p className="text-destructive text-sm">{error}</p>}
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : isEdit ? "Save changes" : "Create"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
