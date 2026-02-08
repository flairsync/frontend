import React from "react";
import { useTranslation } from "react-i18next";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Check, ChevronsUpDown } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { InventoryItemSchema } from "@/misc/FormValidators";
import { cn } from "@/lib/utils";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList
} from "@/components/ui/command";
import { InventoryUnit } from "@/models/inventory/InventoryUnit";
import { InventoryGroup } from "@/models/inventory/InventoryGroup";

interface InventoryItemModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editingItem: any | null; // Todo: Define proper InventoryItem type
    onSave: (values: any) => Promise<void>;
    isSubmitting: boolean;
    inventoryUnits?: InventoryUnit[];
    inventoryGroups?: InventoryGroup[];
}

export const InventoryItemModal: React.FC<InventoryItemModalProps> = ({
    open,
    onOpenChange,
    editingItem,
    onSave,
    isSubmitting,
    inventoryUnits,
    inventoryGroups
}) => {
    const { t } = useTranslation();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className={cn("flex items-center gap-2", editingItem ? "text-primary" : "")}>
                        {editingItem ? <Pencil className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                        {editingItem ? `Editing ${editingItem.name}...` : t("inventory_management.add_item")}
                    </DialogTitle>
                </DialogHeader>

                <Formik
                    initialValues={{
                        name: editingItem?.name || "",
                        barcode: editingItem?.barcode || "",
                        description: editingItem?.description || "",
                        quantity: editingItem?.quantity || 0,
                        unitId: editingItem?.unitId || 11, // Default PIECE
                        lowStockThreshold: editingItem?.lowStockThreshold || 10,
                        groupId: editingItem?.group?.id || editingItem?.groupId || "",
                    }}
                    validationSchema={InventoryItemSchema}
                    onSubmit={onSave}
                    enableReinitialize
                >
                    {({ values, setFieldValue, errors, touched, isValid }) => (
                        <Form className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">{t("inventory_management.form.name")}</Label>
                                <Field as={Input} id="name" name="name" className={cn(errors.name && touched.name && "border-red-500")} />
                                <ErrorMessage name="name">{msg => <div className="text-red-500 text-xs">{t(msg)}</div>}</ErrorMessage>
                            </div>

                            {!editingItem && (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="barcode">{t("inventory_management.form.barcode") || "Barcode"}</Label>
                                        <Field as={Input} id="barcode" name="barcode" />
                                        <ErrorMessage name="barcode">{msg => <div className="text-red-500 text-xs">{t(msg)}</div>}</ErrorMessage>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="desc">{t("inventory_management.form.description")}</Label>
                                        <Field as={Textarea} id="desc" name="description" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="qty">{t("inventory_management.form.quantity")}</Label>
                                            <Field as={Input} type="number" id="qty" name="quantity" className={cn(errors.quantity && touched.quantity && "border-red-500")} />
                                            <ErrorMessage name="quantity">{msg => <div className="text-red-500 text-xs">{t(msg)}</div>}</ErrorMessage>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="unit">{t("inventory_management.form.unit")}</Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        className={cn("w-full justify-between font-normal", errors.unitId && touched.unitId && "border-red-500")}
                                                    >
                                                        {values.unitId
                                                            ? inventoryUnits?.find(u => u.id === values.unitId)?.name
                                                            : t("inventory_management.form.unit")}
                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-full p-0">
                                                    <Command>
                                                        <CommandInput placeholder={t("shared.actions.search")} />
                                                        <CommandEmpty>No unit found.</CommandEmpty>
                                                        <CommandList className="max-h-60 overflow-y-auto">
                                                            <CommandGroup>
                                                                {inventoryUnits?.map((unit) => (
                                                                    <CommandItem
                                                                        key={unit.id}
                                                                        value={unit.name}
                                                                        onSelect={() => setFieldValue("unitId", unit.id)}
                                                                    >
                                                                        <Check className={cn("mr-2 h-4 w-4", values.unitId === unit.id ? "opacity-100" : "opacity-0")} />
                                                                        {unit.name} ({unit.code})
                                                                    </CommandItem>
                                                                ))}
                                                            </CommandGroup>
                                                        </CommandList>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                            <ErrorMessage name="unitId">{msg => <div className="text-red-500 text-xs">{t(msg)}</div>}</ErrorMessage>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="threshold">{t("inventory_management.form.threshold")}</Label>
                                            <Field as={Input} type="number" id="threshold" name="lowStockThreshold" className={cn(errors.lowStockThreshold && touched.lowStockThreshold && "border-red-500")} />
                                            <ErrorMessage name="lowStockThreshold">{msg => <div className="text-red-500 text-xs">{t(msg)}</div>}</ErrorMessage>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="group">{t("inventory_management.form.group")}</Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        className="w-full justify-between font-normal"
                                                    >
                                                        {values.groupId
                                                            ? inventoryGroups?.find(g => g.id === values.groupId)?.name
                                                            : t("inventory_management.form.no_group")}
                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-full p-0">
                                                    <Command>
                                                        <CommandInput placeholder={t("shared.actions.search")} />
                                                        <CommandEmpty>No group found.</CommandEmpty>
                                                        <CommandList className="max-h-60 overflow-y-auto">
                                                            <CommandGroup>
                                                                <CommandItem
                                                                    value=""
                                                                    onSelect={() => setFieldValue("groupId", "")}
                                                                >
                                                                    <Check className={cn("mr-2 h-4 w-4", !values.groupId ? "opacity-100" : "opacity-0")} />
                                                                    {t("inventory_management.form.no_group")}
                                                                </CommandItem>
                                                                {inventoryGroups?.map((group) => (
                                                                    <CommandItem
                                                                        key={group.id}
                                                                        value={group.name}
                                                                        onSelect={() => setFieldValue("groupId", group.id)}
                                                                    >
                                                                        <Check className={cn("mr-2 h-4 w-4", values.groupId === group.id ? "opacity-100" : "opacity-0")} />
                                                                        {group.name}
                                                                    </CommandItem>
                                                                ))}
                                                            </CommandGroup>
                                                        </CommandList>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    </div>
                                </>
                            )}
                            <DialogFooter>
                                <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>{t("shared.actions.cancel")}</Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {editingItem ? t("shared.actions.save") : t("shared.actions.add")}
                                </Button>
                            </DialogFooter>
                        </Form>
                    )}
                </Formik>
            </DialogContent>
        </Dialog>
    );
};
