"use client"

import * as React from "react"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import StaffAddOrderMenu from "./StaffAddOrderMenu"

interface AddOrderDrawerProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function StaffAddOrderDrawer({ open, onOpenChange }: AddOrderDrawerProps) {
    const [selectedTable, setSelectedTable] = React.useState<string>("")
    const [selectedItems, setSelectedItems] = React.useState<string[]>([])
    const [email, setEmail] = React.useState("")

    const tables = ["Table 1", "Table 2", "Table 3", "Table 4", "Table 5"]
    const menuItems = ["Margherita Pizza", "Pasta Alfredo", "Caesar Salad", "Lemonade", "Tiramisu"]

    const handleItemToggle = (item: string) => {
        setSelectedItems((prev) =>
            prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
        )
    }

    const handleSubmit = () => {
        toast("Order Created", {
            description: `Table: ${selectedTable}, ${selectedItems.length} items selected.`
        })

        setSelectedTable("")
        setSelectedItems([])
        setEmail("")
        onOpenChange(false)
    }

    return (
        <Drawer open={open} onOpenChange={onOpenChange}

        >
            <DrawerContent className="p-6  sm:ml-auto rounded-t-2xl sm:rounded-none border-l shadow-lg space-y-6 flex flex-col h-full">
                <DrawerHeader>
                    <DrawerTitle className="text-2xl font-bold">Add New Order</DrawerTitle>
                    <DrawerDescription>
                        Select a table, choose items, and optionally add an email for updates.
                    </DrawerDescription>
                </DrawerHeader>

                <div className="flex-1 overflow-y-auto space-y-6 py-4">
                    {/* Table Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="table">Select Table</Label>
                        <Select value={selectedTable} onValueChange={setSelectedTable}>
                            <SelectTrigger id="table">
                                <SelectValue placeholder="Choose a table" />
                            </SelectTrigger>
                            <SelectContent>
                                {tables.map((table) => (
                                    <SelectItem key={table} value={table}>
                                        {table}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Menu Selection */}
                    <StaffAddOrderMenu
                        onSelectItem={() => {

                        }}
                    />
                    {/*  <div className="space-y-3">
                        <Label>Select Menu Items</Label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {menuItems.map((item) => (
                                <label
                                    key={item}
                                    className="flex items-center gap-2 rounded-lg border p-2 cursor-pointer hover:bg-muted/40 transition"
                                >
                                    <Checkbox
                                        checked={selectedItems.includes(item)}
                                        onCheckedChange={() => handleItemToggle(item)}
                                    />
                                    <span>{item}</span>
                                </label>
                            ))}
                        </div>
                    </div> */}

                    {/* Email */}
                    <div className="space-y-2">
                        <Label htmlFor="email">Customer Email (optional)</Label>
                        <Input
                            id="email"
                            placeholder="customer@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            type="email"
                        />
                    </div>
                </div>

                <DrawerFooter className="flex justify-end space-x-3 pt-4">
                    <DrawerClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DrawerClose>
                    <Button
                        onClick={handleSubmit}
                        disabled={!selectedTable || selectedItems.length === 0}
                    >
                        Confirm Order
                    </Button>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}
