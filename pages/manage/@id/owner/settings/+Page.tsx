import { useState, useEffect, useRef } from "react"
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
import { usePageContext } from "vike-react/usePageContext"
import { useMyBusiness } from "@/features/business/useMyBusiness"
import BusinessSettingsGeneralDetails from "@/components/management/settings/BusinessSettingsGeneralDetails"
import BusinessSettingsOpenPeriods from "@/components/management/settings/BusinessSettingsOpenPeriods"
import BusinessSettingsLocation from "@/components/management/settings/BusinessSettingsLocation"
import BusinessSettingsLabor from "@/components/management/settings/BusinessSettingsLabor"
import BusinessSettingsTax from "@/components/management/settings/BusinessSettingsTax"
import { AuditLogHint } from "@/components/audit/AuditLogHint"
import { usePageTour } from "@/features/tour/usePageTour"
import type { TourStep } from "@/features/tour/types"

const SETTINGS_TOUR_STEPS: TourStep[] = [
    {
        target: '[data-tour="settings-general-info"]',
        title: 'General Information',
        description: 'Set your restaurant name, cuisine type, contact details, and control whether your listing is publicly visible to customers.',
        position: 'bottom',
    },
    {
        target: '[data-tour="settings-location"]',
        title: 'Location & Address',
        description: 'Configure your physical address. This is shown on your public page and used for map-based discovery.',
        position: 'bottom',
    },
    {
        target: '[data-tour="settings-open-periods"]',
        title: 'Open Periods',
        description: 'Define your weekly operating hours. The system uses these to show availability to customers and to enforce scheduling rules.',
        position: 'bottom',
    },
    {
        target: '[data-tour="settings-labor"]',
        title: 'Labor & Compliance',
        description: 'Set default working hour rules, break policies, and overtime thresholds to stay compliant with labor regulations.',
        position: 'bottom',
    },
    {
        target: '[data-tour="settings-tax"]',
        title: 'Tax Configuration',
        description: 'Define your tax rates. These are automatically applied to customer orders, receipts, and invoices.',
        position: 'bottom',
    },
    {
        target: '[data-tour="settings-reservations"]',
        title: 'Reservations & Orders',
        description: 'Control whether customers can book tables or order online, set confirmation rules, party size limits, and booking windows.',
        position: 'bottom',
    },
]

const BusinessSettingsPage = () => {
    usePageTour(SETTINGS_TOUR_STEPS)

    const {
        routeParams
    } = usePageContext();


    const {
        myBusinessFullDetails,
        updatingMyBusiness,
        updateMyBusinessDetails,
        updateMyBusinessOpenHours,
        updatingMyBusinessOpenHours
    } = useMyBusiness(routeParams.id);

    // Reservations & Orders local state
    const [resSettings, setResSettings] = useState({
        allowReservations: false,
        requireReservationConfirmation: false,
        reservationCancellationWindow: 0,
        reservationModificationLimit: 0,
        reservationTimeoutMinutes: 0,
        defaultReservationDurationMinutes: 120,
        maxPartySize: 20,
        reservationBookingWindowDays: 60,
        reservationBufferMinutes: 0,
        autoNoShow: false,
        gracePeriodMinutes: 30,
        allowOrders: false,
        requireOrderConfirmation: false,
        allowTableOrdering: false,
        allowTakeawayOrdering: false,
    })

    useEffect(() => {
        if (myBusinessFullDetails) {
            setResSettings({
                allowReservations: myBusinessFullDetails.allowReservations ?? false,
                requireReservationConfirmation: myBusinessFullDetails.requireReservationConfirmation ?? false,
                reservationCancellationWindow: myBusinessFullDetails.reservationCancellationWindow ?? 0,
                reservationModificationLimit: myBusinessFullDetails.reservationModificationLimit ?? 0,
                reservationTimeoutMinutes: myBusinessFullDetails.reservationTimeoutMinutes ?? 0,
                defaultReservationDurationMinutes: myBusinessFullDetails.defaultReservationDurationMinutes ?? 120,
                maxPartySize: myBusinessFullDetails.maxPartySize ?? 20,
                reservationBookingWindowDays: myBusinessFullDetails.reservationBookingWindowDays ?? 60,
                reservationBufferMinutes: myBusinessFullDetails.reservationBufferMinutes ?? 0,
                autoNoShow: myBusinessFullDetails.autoNoShow ?? false,
                gracePeriodMinutes: myBusinessFullDetails.gracePeriodMinutes ?? 30,
                allowOrders: myBusinessFullDetails.allowOrders ?? false,
                requireOrderConfirmation: myBusinessFullDetails.requireOrderConfirmation ?? false,
                allowTableOrdering: myBusinessFullDetails.allowTableOrdering ?? false,
                allowTakeawayOrdering: myBusinessFullDetails.allowTakeawayOrdering ?? false,
            })
        }
    }, [myBusinessFullDetails])

    const setRes = <K extends keyof typeof resSettings>(key: K, value: typeof resSettings[K]) =>
        setResSettings(prev => ({ ...prev, [key]: value }))

    const [accordionValue, setAccordionValue] = useState<string>("")
    const [highlightedSection, setHighlightedSection] = useState<string | null>(null)
    const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})

    useEffect(() => {
        const section = new URLSearchParams(window.location.search).get("section")
        if (!section) return
        setAccordionValue(section)
        const tryScroll = () => {
            const el = sectionRefs.current[section]
            if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "center" })
                setHighlightedSection(section)
                setTimeout(() => setHighlightedSection(null), 2500)
            }
        }
        setTimeout(tryScroll, 150)
    }, [])

    return (
        <div className="space-y-6">
        <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">Business Settings</h1>
            <AuditLogHint
                entityType="business"
                entityId={myBusinessFullDetails?.id}
                businessId={myBusinessFullDetails?.id}
                entityLabel={myBusinessFullDetails?.name}
            />
        </div>
        <Separator />
        <Accordion type="single" collapsible className="w-full space-y-2" value={accordionValue} onValueChange={setAccordionValue}>
            {/* General Info */}
            <div data-tour="settings-general-info">
                <BusinessSettingsGeneralDetails
                    businessDetails={myBusinessFullDetails}
                    onSaveDetails={(data) => {
                        updateMyBusinessDetails(data);
                    }}
                    onTogglePublished={(val) => updateMyBusinessDetails({ isPublished: val })}
                    onToggleAutoDisableOutOfStock={(val) => updateMyBusinessDetails({ autoDisableOutOfStock: val })}
                    disabled={updatingMyBusiness}
                    sectionRef={(el) => { sectionRefs.current["general-info"] = el }}
                    highlighted={highlightedSection === "general-info"}
                />
            </div>

            {/* Location & Address */}
            <div data-tour="settings-location">
                <BusinessSettingsLocation
                    businessDetails={myBusinessFullDetails}
                    onSaveDetails={(data) => {
                        updateMyBusinessDetails(data);
                    }}
                    disabled={updatingMyBusiness}
                />
            </div>

            {/* Business open periods */}
            <div data-tour="settings-open-periods">
                <BusinessSettingsOpenPeriods
                    businessDetails={myBusinessFullDetails}
                    disabled={updatingMyBusinessOpenHours}
                    onSaveDetails={(data) => {
                        updateMyBusinessOpenHours(data);
                    }}
                />
            </div>

            {/* Labor & Compliance */}
            <div data-tour="settings-labor">
                <BusinessSettingsLabor
                    businessDetails={myBusinessFullDetails}
                    disabled={updatingMyBusiness}
                    onSaveDetails={(data) => {
                        updateMyBusinessDetails(data);
                    }}
                />
            </div>

            {/* Tax Configuration */}
            <div data-tour="settings-tax">
                <BusinessSettingsTax
                    businessDetails={myBusinessFullDetails}
                    disabled={updatingMyBusiness}
                    onSaveDetails={(data) => {
                        updateMyBusinessDetails(data);
                    }}
                />
            </div>


            {/* Reservations & Orders */}
            <AccordionItem value="reservations" data-tour="settings-reservations" className="border rounded-lg px-3">
                <AccordionTrigger>Reservations & Orders</AccordionTrigger>
                <AccordionContent className="py-2">
                    <div className="divide-y divide-border">
                        <div className="flex items-center justify-between py-3 rounded-sm transition-colors hover:bg-muted/50">
                            <div className="space-y-0.5">
                                <Label>Enable Table Reservations</Label>
                                <p className="text-xs text-muted-foreground">Allow guests to book tables online</p>
                            </div>
                            <Switch
                                checked={resSettings.allowReservations}
                                onCheckedChange={(val) => setRes("allowReservations", val)}
                                disabled={updatingMyBusiness}
                            />
                        </div>
                        {resSettings.allowReservations && (
                            <div className="divide-y divide-border/60 pl-6 border-l-2 border-muted">
                                <div className="flex items-center justify-between py-2.5 rounded-sm transition-colors hover:bg-muted/50">
                                    <div className="space-y-0.5">
                                        <Label>Require Reservation Confirmation</Label>
                                        <p className="text-xs text-muted-foreground">Reservations must be approved by staff</p>
                                    </div>
                                    <Switch
                                        checked={resSettings.requireReservationConfirmation}
                                        onCheckedChange={(val) => setRes("requireReservationConfirmation", val)}
                                        disabled={updatingMyBusiness}
                                    />
                                </div>
                                <div className="flex items-center justify-between py-2.5 rounded-sm transition-colors hover:bg-muted/50">
                                    <div className="space-y-0.5">
                                        <Label>Cancellation Window (Days)</Label>
                                        <p className="text-xs text-muted-foreground">Number of days before reservation allowed to cancel</p>
                                    </div>
                                    <Input
                                        type="number"
                                        className="w-20"
                                        value={resSettings.reservationCancellationWindow}
                                        onChange={(e) => setRes("reservationCancellationWindow", parseInt(e.target.value))}
                                        disabled={updatingMyBusiness}
                                    />
                                </div>
                                <div className="flex items-center justify-between py-2.5 rounded-sm transition-colors hover:bg-muted/50">
                                    <div className="space-y-0.5">
                                        <Label>Modification Limit (Minutes)</Label>
                                        <p className="text-xs text-muted-foreground">Minimum minutes before reservation can be modified</p>
                                    </div>
                                    <Input
                                        type="number"
                                        className="w-20"
                                        value={resSettings.reservationModificationLimit}
                                        onChange={(e) => setRes("reservationModificationLimit", parseInt(e.target.value))}
                                        disabled={updatingMyBusiness}
                                    />
                                </div>
                                <div className="flex items-center justify-between py-2.5 rounded-sm transition-colors hover:bg-muted/50">
                                    <div className="space-y-0.5">
                                        <Label>Pending Timeout (Minutes)</Label>
                                        <p className="text-xs text-muted-foreground">Minutes before an unconfirmed request expires</p>
                                    </div>
                                    <Input
                                        type="number"
                                        className="w-20"
                                        value={resSettings.reservationTimeoutMinutes}
                                        onChange={(e) => setRes("reservationTimeoutMinutes", parseInt(e.target.value))}
                                        disabled={updatingMyBusiness}
                                    />
                                </div>
                                <div className="flex items-center justify-between py-2.5 rounded-sm transition-colors hover:bg-muted/50">
                                    <div className="space-y-0.5">
                                        <Label>Default Duration (Minutes)</Label>
                                        <p className="text-xs text-muted-foreground">Default duration for new reservations</p>
                                    </div>
                                    <Input
                                        type="number"
                                        className="w-20"
                                        value={resSettings.defaultReservationDurationMinutes}
                                        onChange={(e) => setRes("defaultReservationDurationMinutes", parseInt(e.target.value))}
                                        disabled={updatingMyBusiness}
                                    />
                                </div>
                                <div className="flex items-center justify-between py-2.5 rounded-sm transition-colors hover:bg-muted/50">
                                    <div className="space-y-0.5">
                                        <Label>Max Party Size</Label>
                                        <p className="text-xs text-muted-foreground">Maximum guests allowed per reservation</p>
                                    </div>
                                    <Input
                                        type="number"
                                        className="w-20"
                                        value={resSettings.maxPartySize}
                                        onChange={(e) => setRes("maxPartySize", parseInt(e.target.value))}
                                        disabled={updatingMyBusiness}
                                    />
                                </div>
                                <div className="flex items-center justify-between py-2.5 rounded-sm transition-colors hover:bg-muted/50">
                                    <div className="space-y-0.5">
                                        <Label>Booking Window (Days)</Label>
                                        <p className="text-xs text-muted-foreground">How far ahead customers can book</p>
                                    </div>
                                    <Input
                                        type="number"
                                        className="w-20"
                                        value={resSettings.reservationBookingWindowDays}
                                        onChange={(e) => setRes("reservationBookingWindowDays", parseInt(e.target.value))}
                                        disabled={updatingMyBusiness}
                                    />
                                </div>
                                <div className="flex items-center justify-between py-2.5 rounded-sm transition-colors hover:bg-muted/50">
                                    <div className="space-y-0.5">
                                        <Label>Buffer Between Reservations (min)</Label>
                                        <p className="text-xs text-muted-foreground">Gap added between back-to-back table slots</p>
                                    </div>
                                    <Input
                                        type="number"
                                        className="w-20"
                                        value={resSettings.reservationBufferMinutes}
                                        onChange={(e) => setRes("reservationBufferMinutes", parseInt(e.target.value))}
                                        disabled={updatingMyBusiness}
                                    />
                                </div>
                                <div className="flex items-center justify-between py-2.5 rounded-sm transition-colors hover:bg-muted/50">
                                    <div className="space-y-0.5">
                                        <Label>Auto No-Show</Label>
                                        <p className="text-xs text-muted-foreground">Automatically mark confirmed reservations as no-show after grace period</p>
                                    </div>
                                    <Switch
                                        checked={resSettings.autoNoShow}
                                        onCheckedChange={(val) => setRes("autoNoShow", val)}
                                        disabled={updatingMyBusiness}
                                    />
                                </div>
                                {resSettings.autoNoShow && (
                                    <div className="flex items-center justify-between pl-6 border-l-2 border-muted py-2.5">
                                        <div className="space-y-0.5">
                                            <Label>Grace Period (min)</Label>
                                            <p className="text-xs text-muted-foreground">Minutes past reservation time before auto no-show triggers</p>
                                        </div>
                                        <Input
                                            type="number"
                                            className="w-20"
                                            value={resSettings.gracePeriodMinutes}
                                            onChange={(e) => setRes("gracePeriodMinutes", parseInt(e.target.value))}
                                            disabled={updatingMyBusiness}
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <Separator className="my-4" />

                    <div className="divide-y divide-border">
                        <div className="flex items-center justify-between py-3 rounded-sm transition-colors hover:bg-muted/50">
                            <div className="space-y-0.5">
                                <Label>Enable Online Ordering</Label>
                                <p className="text-xs text-muted-foreground">Allow guests to place orders online</p>
                            </div>
                            <Switch
                                checked={resSettings.allowOrders}
                                onCheckedChange={(val) => setRes("allowOrders", val)}
                                disabled={updatingMyBusiness}
                            />
                        </div>
                        {resSettings.allowOrders && (
                            <div className="divide-y divide-border/60 pl-6 border-l-2 border-muted">
                                <div className="flex items-center justify-between py-2.5 rounded-sm transition-colors hover:bg-muted/50">
                                    <div className="space-y-0.5">
                                        <Label>Require Order Confirmation</Label>
                                        <p className="text-xs text-muted-foreground">Orders must be approved by staff</p>
                                    </div>
                                    <Switch
                                        checked={resSettings.requireOrderConfirmation}
                                        onCheckedChange={(val) => setRes("requireOrderConfirmation", val)}
                                        disabled={updatingMyBusiness}
                                    />
                                </div>
                                <div className="flex items-center justify-between py-2.5 rounded-sm transition-colors hover:bg-muted/50">
                                    <div className="space-y-0.5">
                                        <Label>Allow Table Ordering</Label>
                                        <p className="text-xs text-muted-foreground">Enable "Dine-in" option for guests</p>
                                    </div>
                                    <Switch
                                        checked={resSettings.allowTableOrdering}
                                        onCheckedChange={(val) => setRes("allowTableOrdering", val)}
                                        disabled={updatingMyBusiness}
                                    />
                                </div>
                                <div className="flex items-center justify-between py-2.5 rounded-sm transition-colors hover:bg-muted/50">
                                    <div className="space-y-0.5">
                                        <Label>Allow Takeaway Ordering</Label>
                                        <p className="text-xs text-muted-foreground">Enable "Takeaway" option for guests</p>
                                    </div>
                                    <Switch
                                        checked={resSettings.allowTakeawayOrdering}
                                        onCheckedChange={(val) => setRes("allowTakeawayOrdering", val)}
                                        disabled={updatingMyBusiness}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="pt-4">
                        <Button
                            disabled={updatingMyBusiness}
                            onClick={() => updateMyBusinessDetails(resSettings)}
                        >
                            Save
                        </Button>
                    </div>
                </AccordionContent>
            </AccordionItem>

            {/* Floor Plan */}
            <AccordionItem
                value="floor-plan"
                ref={(el) => { sectionRefs.current["floor-plan"] = el as HTMLDivElement | null }}
                className={`border rounded-lg px-3 transition-all duration-700 ${highlightedSection === "floor-plan" ? "ring-2 ring-primary ring-offset-2 shadow-md" : ""}`}
            >
                <AccordionTrigger>Floor Plan</AccordionTrigger>
                <AccordionContent className="py-2">
                    <div className="divide-y divide-border">
                        <div className="flex items-center justify-between py-3 rounded-sm transition-colors hover:bg-muted/50">
                            <div className="space-y-0.5">
                                <Label>Enable Floor Plan Layout View</Label>
                                <p className="text-xs text-muted-foreground">Show the visual table layout to staff for managing seating and to customers when booking a table</p>
                            </div>
                            <Switch
                                checked={myBusinessFullDetails?.enableFloorPlanView ?? false}
                                onCheckedChange={(val) => updateMyBusinessDetails({ enableFloorPlanView: val })}
                                disabled={updatingMyBusiness}
                            />
                        </div>
                    </div>
                </AccordionContent>
            </AccordionItem>

        </Accordion>
        </div>
    )
}

export default BusinessSettingsPage
