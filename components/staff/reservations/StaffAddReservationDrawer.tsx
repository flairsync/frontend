"use client"

import * as React from "react"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

interface AddReservationDrawerProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function StaffAddReservationDrawer({ open, onOpenChange }: AddReservationDrawerProps) {
    const [name, setName] = React.useState("")
    const [email, setEmail] = React.useState("")
    const [table, setTable] = React.useState("")
    const [date, setDate] = React.useState("")
    const [time, setTime] = React.useState("")
    const [guests, setGuests] = React.useState(1)

    const tables = ["Table 1", "Table 2", "Table 3", "Table 4", "Table 5"]

    const handleSubmit = () => {
        toast("Reservation Created", {
            description: `Customer: ${name}, Table: ${table}, Guests: ${guests}, ${date} at ${time}`,
        })

        setName("")
        setEmail("")
        setTable("")
        setDate("")
        setTime("")
        setGuests(1)
        onOpenChange(false)
    }

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent className="p-6 sm:ml-auto rounded-t-2xl sm:rounded-none border-l shadow-lg flex flex-col h-full">
                <DrawerHeader>
                    <DrawerTitle className="text-2xl font-bold">Add New Reservation</DrawerTitle>
                    <DrawerDescription>
                        Fill in the reservation details to quickly add a customer reservation.
                    </DrawerDescription>
                </DrawerHeader>

                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto space-y-6 py-4">
                    {/* Customer Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name">Customer Name</Label>
                        <Input
                            id="name"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <Label htmlFor="email">Email (optional)</Label>
                        <Input
                            id="email"
                            placeholder="customer@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            type="email"
                        />
                    </div>

                    {/* Table selection */}
                    <div className="space-y-2">
                        <Label htmlFor="table">Table</Label>
                        <Select value={table} onValueChange={setTable}>
                            <SelectTrigger id="table">
                                <SelectValue placeholder="Select a table" />
                            </SelectTrigger>
                            <SelectContent>
                                {tables.map((t) => (
                                    <SelectItem key={t} value={t}>{t}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Date & Time */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="date">Date</Label>
                            <Input
                                id="date"
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="time">Time</Label>
                            <Input
                                id="time"
                                type="time"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Guests */}
                    <div className="space-y-2">
                        <Label htmlFor="guests">Guests</Label>
                        <Input
                            id="guests"
                            type="number"
                            min={1}
                            value={guests}
                            onChange={(e) => setGuests(parseInt(e.target.value))}
                        />
                    </div>
                </div>

                {/* Footer */}
                <DrawerFooter className="flex justify-end space-x-3 pt-4 border-t">
                    <DrawerClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DrawerClose>
                    <Button
                        onClick={handleSubmit}
                        disabled={!name || !table || !date || !time || guests < 1}
                    >
                        Confirm Reservation
                    </Button>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}
