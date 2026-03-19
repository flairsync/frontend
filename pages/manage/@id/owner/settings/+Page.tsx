import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { useTranslation } from "react-i18next"
import { usePageContext } from "vike-react/usePageContext"
import { useMyBusiness } from "@/features/business/useMyBusiness"
import { Textarea } from "@/components/ui/textarea"
import BusinessSettingsGeneralDetails from "@/components/management/settings/BusinessSettingsGeneralDetails"
import BusinessSettingsOpenPeriods from "@/components/management/settings/BusinessSettingsOpenPeriods"
import BusinessSettingsLocation from "@/components/management/settings/BusinessSettingsLocation"

const BusinessSettingsPage = () => {

    const {
        i18n
    } = useTranslation();
    const {
        routeParams
    } = usePageContext();


    const {
        myBusinessFullDetails,
        fetchingMyBusinessFullDetails,
        updatingMyBusiness,
        updateMyBusinessDetails,
        updateMyBusinessOpenHours,
        updatingMyBusinessOpenHours
    } = useMyBusiness(routeParams.id);

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

    const saveStaffManagement = () => alert("Staff management saved")
    const saveAutomation = () => alert("Automation settings saved")
    const savePayments = () => alert("Payments settings saved")

    return (
        <Accordion type="single" collapsible className="w-full space-y-2">
            {/* General Info */}
            <BusinessSettingsGeneralDetails
                businessDetails={myBusinessFullDetails}
                onSaveDetails={(data) => {
                    updateMyBusinessDetails(data);
                }}
                disabled={updatingMyBusiness}
            />

            {/* Location & Address */}
            <BusinessSettingsLocation
                businessDetails={myBusinessFullDetails}
                onSaveDetails={(data) => {
                    updateMyBusinessDetails(data);
                }}
                disabled={updatingMyBusiness}
            />

            {/* Business open periods */}
            <BusinessSettingsOpenPeriods
                businessDetails={myBusinessFullDetails}
                disabled={updatingMyBusinessOpenHours}
                onSaveDetails={(data) => {
                    updateMyBusinessOpenHours(data);
                }}
            />


            {/* Reservations & Orders */}
            <AccordionItem value="reservations" className="border rounded-lg px-3">
                <AccordionTrigger>Reservations & Orders</AccordionTrigger>
                <AccordionContent className="space-y-6 py-4">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Enable Table Reservations</Label>
                                <p className="text-xs text-muted-foreground">Allow guests to book tables online</p>
                            </div>
                            <Switch
                                checked={myBusinessFullDetails?.allowReservations}
                                onCheckedChange={(val) => updateMyBusinessDetails({ allowReservations: val })}
                                disabled={updatingMyBusiness}
                            />
                        </div>

                        {myBusinessFullDetails?.allowReservations && (
                            <>
                                <div className="flex items-center justify-between pl-6 border-l-2 border-muted">
                                    <div className="space-y-0.5">
                                        <Label>Require Reservation Confirmation</Label>
                                        <p className="text-xs text-muted-foreground">Reservations must be approved by staff</p>
                                    </div>
                                    <Switch
                                        checked={myBusinessFullDetails?.requireReservationConfirmation}
                                        onCheckedChange={(val) => updateMyBusinessDetails({ requireReservationConfirmation: val })}
                                        disabled={updatingMyBusiness}
                                    />
                                </div>
                                <div className="flex items-center justify-between pl-6 border-l-2 border-muted">
                                    <div className="space-y-0.5">
                                        <Label>Cancellation Window (Days)</Label>
                                        <p className="text-xs text-muted-foreground">Number of days before reservation allowed to cancel</p>
                                    </div>
                                    <Input
                                        type="number"
                                        className="w-20"
                                        defaultValue={myBusinessFullDetails?.reservationCancellationWindow}
                                        onBlur={(e) => updateMyBusinessDetails({ reservationCancellationWindow: parseInt(e.target.value) })}
                                        disabled={updatingMyBusiness}
                                    />
                                </div>
                                <div className="flex items-center justify-between pl-6 border-l-2 border-muted">
                                    <div className="space-y-0.5">
                                        <Label>Modification Limit (Minutes)</Label>
                                        <p className="text-xs text-muted-foreground">Minimum minutes before reservation can be modified</p>
                                    </div>
                                    <Input
                                        type="number"
                                        className="w-20"
                                        defaultValue={myBusinessFullDetails?.reservationModificationLimit}
                                        onBlur={(e) => updateMyBusinessDetails({ reservationModificationLimit: parseInt(e.target.value) })}
                                        disabled={updatingMyBusiness}
                                    />
                                </div>
                                <div className="flex items-center justify-between pl-6 border-l-2 border-muted">
                                    <div className="space-y-0.5">
                                        <Label>Pending Timeout (Minutes)</Label>
                                        <p className="text-xs text-muted-foreground">Minutes before an unconfirmed request expires</p>
                                    </div>
                                    <Input
                                        type="number"
                                        className="w-20"
                                        defaultValue={myBusinessFullDetails?.reservationTimeoutMinutes}
                                        onBlur={(e) => updateMyBusinessDetails({ reservationTimeoutMinutes: parseInt(e.target.value) })}
                                        disabled={updatingMyBusiness}
                                    />
                                </div>
                                <div className="flex items-center justify-between pl-6 border-l-2 border-muted">
                                    <div className="space-y-0.5">
                                        <Label>Default Duration (Minutes)</Label>
                                        <p className="text-xs text-muted-foreground">Default duration for new reservations</p>
                                    </div>
                                    <Input
                                        type="number"
                                        className="w-20"
                                        defaultValue={myBusinessFullDetails?.defaultReservationDurationMinutes ?? 120}
                                        onBlur={(e) => updateMyBusinessDetails({ defaultReservationDurationMinutes: parseInt(e.target.value) })}
                                        disabled={updatingMyBusiness}
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    <Separator />

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Enable Online Ordering</Label>
                                <p className="text-xs text-muted-foreground">Allow guests to place orders online</p>
                            </div>
                            <Switch
                                checked={myBusinessFullDetails?.allowOrders}
                                onCheckedChange={(val) => updateMyBusinessDetails({ allowOrders: val })}
                                disabled={updatingMyBusiness}
                            />
                        </div>

                        {myBusinessFullDetails?.allowOrders && (
                            <div className="space-y-4 pl-6 border-l-2 border-muted">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Require Order Confirmation</Label>
                                        <p className="text-xs text-muted-foreground">Orders must be approved by staff</p>
                                    </div>
                                    <Switch
                                        checked={myBusinessFullDetails?.requireOrderConfirmation}
                                        onCheckedChange={(val) => updateMyBusinessDetails({ requireOrderConfirmation: val })}
                                        disabled={updatingMyBusiness}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Allow Table Ordering</Label>
                                        <p className="text-xs text-muted-foreground">Enable "Dine-in" option for guests</p>
                                    </div>
                                    <Switch
                                        checked={myBusinessFullDetails?.allowTableOrdering}
                                        onCheckedChange={(val) => updateMyBusinessDetails({ allowTableOrdering: val })}
                                        disabled={updatingMyBusiness}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Allow Takeaway Ordering</Label>
                                        <p className="text-xs text-muted-foreground">Enable "Takeaway" option for guests</p>
                                    </div>
                                    <Switch
                                        checked={myBusinessFullDetails?.allowTakeawayOrdering}
                                        onCheckedChange={(val) => updateMyBusinessDetails({ allowTakeawayOrdering: val })}
                                        disabled={updatingMyBusiness}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
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
