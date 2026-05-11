import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { MyBusinessFullDetails } from "@/models/business/MyBusinessFullDetails"

type Props = {
    businessDetails?: MyBusinessFullDetails
    onSaveDetails?: (data: { taxRate: number; taxName: string; taxIncluded: boolean }) => void
    disabled?: boolean
}

export default function BusinessSettingsTax({ businessDetails, onSaveDetails, disabled }: Props) {
    const [taxRate, setTaxRate] = useState(0)
    const [taxName, setTaxName] = useState("")
    const [taxIncluded, setTaxIncluded] = useState(true)

    useEffect(() => {
        if (businessDetails) {
            setTaxRate(businessDetails.taxRate ?? 0)
            setTaxName(businessDetails.taxName ?? "")
            setTaxIncluded(businessDetails.taxIncluded ?? true)
        }
    }, [businessDetails])

    function handleSave() {
        onSaveDetails?.({ taxRate, taxName, taxIncluded })
    }

    return (
        <AccordionItem value="tax" className="border rounded-lg px-3">
            <AccordionTrigger>Tax Configuration</AccordionTrigger>
            <AccordionContent className="space-y-4 py-2">
                <p className="text-xs text-muted-foreground">
                    Tax is snapshotted at order creation time. Changing the rate here does not affect existing orders.
                </p>

                <div className="divide-y divide-border">
                    <div className="flex items-center justify-between py-3">
                        <div className="space-y-0.5">
                            <Label>Tax Rate (%)</Label>
                            <p className="text-xs text-muted-foreground">Set to 0 to disable tax</p>
                        </div>
                        <Input
                            type="number"
                            min={0}
                            max={100}
                            step={0.01}
                            className="w-24 text-right"
                            value={taxRate}
                            onChange={(e) => setTaxRate(Number(e.target.value))}
                            disabled={disabled}
                        />
                    </div>

                    <div className="flex items-center justify-between py-3">
                        <div className="space-y-0.5">
                            <Label>Tax Label</Label>
                            <p className="text-xs text-muted-foreground">Shown on receipts (e.g. IGI, VAT, IVA, GST)</p>
                        </div>
                        <Input
                            type="text"
                            maxLength={30}
                            placeholder="e.g. VAT"
                            className="w-28 text-right"
                            value={taxName}
                            onChange={(e) => setTaxName(e.target.value)}
                            disabled={disabled}
                        />
                    </div>

                    <div className="flex items-center justify-between py-3">
                        <div className="space-y-0.5">
                            <Label>Pricing Model</Label>
                            <p className="text-xs text-muted-foreground">
                                {taxIncluded
                                    ? "Prices already include tax — shown as informational line"
                                    : "Tax is added on top of the subtotal"}
                            </p>
                        </div>
                        <Select
                            value={taxIncluded ? "included" : "excluded"}
                            onValueChange={(v) => setTaxIncluded(v === "included")}
                            disabled={disabled}
                        >
                            <SelectTrigger className="w-44">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="included">Tax included (EU)</SelectItem>
                                <SelectItem value="excluded">Tax added on top (US)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <Button disabled={disabled} onClick={handleSave}>
                    Save tax settings
                </Button>
            </AccordionContent>
        </AccordionItem>
    )
}
