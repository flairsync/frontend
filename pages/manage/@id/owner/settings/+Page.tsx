"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

const BusinessSettingsPage = () => {
    // General Info
    const [businessName, setBusinessName] = useState("")
    const [contactEmail, setContactEmail] = useState("")
    const [phone, setPhone] = useState("")
    const [address, setAddress] = useState("")
    const [openingHours, setOpeningHours] = useState("")

    // Reservations
    const [reservationsEnabled, setReservationsEnabled] = useState(true)
    const [maxReservations, setMaxReservations] = useState(10)

    // Staff Management
    const [staffAlerts, setStaffAlerts] = useState(true)
    const [autoAssignShifts, setAutoAssignShifts] = useState(false)
    const [roles, setRoles] = useState("Admin, Manager, Waiter")

    // Operations Automation
    const [autoOpen, setAutoOpen] = useState(false)
    const [notifications, setNotifications] = useState("")
    const [inventoryAlerts, setInventoryAlerts] = useState("")

    // Payments
    const [paymentMethods, setPaymentMethods] = useState("Cash, Card, Online Payment")
    const [receiptTemplate, setReceiptTemplate] = useState("")

    const saveGeneralInfo = () => alert("General info saved")
    const saveReservations = () => alert("Reservations settings saved")
    const saveStaffManagement = () => alert("Staff management saved")
    const saveAutomation = () => alert("Automation settings saved")
    const savePayments = () => alert("Payments settings saved")

    return (
        <Accordion type="single" collapsible className="w-full space-y-2">
            {/* General Info */}
            <AccordionItem value="general-info" className="border rounded-lg px-3">
                <AccordionTrigger>General Information</AccordionTrigger>
                <AccordionContent className="space-y-4 py-2">
                    <Input
                        placeholder="Business Name"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                    />
                    <Input
                        placeholder="Contact Email"
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                    />
                    <Input
                        placeholder="Phone Number"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                    />
                    <Input
                        placeholder="Address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                    />
                    <Input
                        placeholder="Opening Hours"
                        value={openingHours}
                        onChange={(e) => setOpeningHours(e.target.value)}
                    />
                    <Button onClick={saveGeneralInfo}>Save</Button>
                </AccordionContent>
            </AccordionItem>

            {/* Reservations */}
            <AccordionItem value="reservations" className="border rounded-lg px-3">
                <AccordionTrigger>Reservations & Orders</AccordionTrigger>
                <AccordionContent className="space-y-4 py-2">
                    <div className="flex items-center justify-between">
                        <Label>Enable Table Reservations</Label>
                        <Switch
                            checked={reservationsEnabled}
                            onCheckedChange={setReservationsEnabled}
                        />
                    </div>
                    {reservationsEnabled && (
                        <Input
                            type="number"
                            placeholder="Max Reservations per Slot"
                            value={maxReservations}
                            onChange={(e) => setMaxReservations(Number(e.target.value))}
                        />
                    )}
                    <Button onClick={saveReservations}>Save</Button>
                </AccordionContent>
            </AccordionItem>

            {/* Staff Management */}
            <AccordionItem value="staff-management" className="border rounded-lg px-3">
                <AccordionTrigger>Staff Alerts & Management</AccordionTrigger>
                <AccordionContent className="space-y-4 py-2">
                    <div className="flex items-center justify-between">
                        <Label>Notify Staff When Late</Label>
                        <Switch checked={staffAlerts} onCheckedChange={setStaffAlerts} />
                    </div>
                    <div className="flex items-center justify-between">
                        <Label>Auto-Assign Shifts</Label>
                        <Switch
                            checked={autoAssignShifts}
                            onCheckedChange={setAutoAssignShifts}
                        />
                    </div>
                    <Input
                        placeholder="Roles (Admin, Manager, Waiter...)"
                        value={roles}
                        onChange={(e) => setRoles(e.target.value)}
                    />
                    <Button onClick={saveStaffManagement}>Save</Button>
                </AccordionContent>
            </AccordionItem>

            {/* Operations Automation */}
            <AccordionItem value="automation" className="border rounded-lg px-3">
                <AccordionTrigger>Operations Automation</AccordionTrigger>
                <AccordionContent className="space-y-4 py-2">
                    <div className="flex items-center justify-between">
                        <Label>Auto-Open Business</Label>
                        <Switch checked={autoOpen} onCheckedChange={setAutoOpen} />
                    </div>
                    <Input
                        placeholder="Notifications (Order ready, Reservation confirmed...)"
                        value={notifications}
                        onChange={(e) => setNotifications(e.target.value)}
                    />
                    <Input
                        placeholder="Inventory Alerts"
                        value={inventoryAlerts}
                        onChange={(e) => setInventoryAlerts(e.target.value)}
                    />
                    <Button onClick={saveAutomation}>Save</Button>
                </AccordionContent>
            </AccordionItem>

            {/* Payments */}
            <AccordionItem value="payments" className="border rounded-lg px-3">
                <AccordionTrigger>Payments & Invoicing</AccordionTrigger>
                <AccordionContent className="space-y-4 py-2">
                    <Input
                        placeholder="Accepted Payment Methods"
                        value={paymentMethods}
                        onChange={(e) => setPaymentMethods(e.target.value)}
                    />
                    <Input
                        placeholder="Receipt Template URL / Editor"
                        value={receiptTemplate}
                        onChange={(e) => setReceiptTemplate(e.target.value)}
                    />
                    <Button onClick={savePayments}>Save</Button>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    )
}

export default BusinessSettingsPage
