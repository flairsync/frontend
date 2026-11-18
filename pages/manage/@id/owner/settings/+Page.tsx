import { useState, useEffect, useRef, useCallback } from "react"
import { useTranslation } from "react-i18next"
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
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import { TriangleAlert } from "lucide-react"
import { usePageContext } from "vike-react/usePageContext"
import { useMyBusiness } from "@/features/business/useMyBusiness"
import { useAlerts } from "@/features/alerts/useAlerts"
import { useJoinRequests } from "@/features/join-requests/useJoinRequests"
import BusinessSettingsGeneralDetails from "@/components/management/settings/BusinessSettingsGeneralDetails"
import BusinessSettingsOpenPeriods from "@/components/management/settings/BusinessSettingsOpenPeriods"
import BusinessSettingsLocation from "@/components/management/settings/BusinessSettingsLocation"
import BusinessSettingsLabor from "@/components/management/settings/BusinessSettingsLabor"
import BusinessSettingsTax from "@/components/management/settings/BusinessSettingsTax"
import { AuditLogHint } from "@/components/audit/AuditLogHint"
import { usePageTour } from "@/features/tour/usePageTour"
import type { TourStep } from "@/features/tour/types"
import { useParamFromAction } from "@/features/navigation/actionBus";
import { FISCAL_ID_REQUIRED_COUNTRIES } from "@/utils/taxId";

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
    const { t } = useTranslation("management");
    usePageTour(SETTINGS_TOUR_STEPS)

    const {
        routeParams
    } = usePageContext();


    const {
        myBusinessFullDetails,
        updatingMyBusiness,
        updateMyBusinessDetails,
        updateMyBusinessOpenHours,
        updatingMyBusinessOpenHours,
        updateMyBusinessStatus,
        updatingMyBusinessStatus,
    } = useMyBusiness(routeParams.id);

    const { requestLeave, isRequestingLeave, outgoing } = useJoinRequests();
    const businessId = routeParams.id as string;
    const pendingLeaveRequest = outgoing.find(
        (r) => r.childType === "BUSINESS" && r.childId === businessId && r.action === "UNLINK" && r.status === "PENDING",
    );

    // B4 (QA Test Report, 2026-11-18): a business could go Live with no public URL slug, no
    // contact email/phone, an inactive menu and no published floor — no warning anywhere.
    // `alerts` already computes the menu/floor-plan gaps server-side (same data the Alerts
    // page and dashboard badge use); slug/email/phone aren't alerts, so they're checked here.
    const { alerts } = useAlerts(businessId);
    const [publishWarning, setPublishWarning] = useState<string[] | null>(null)

    // N4 (QA Retest, 2026-11-18): slug/email/phone live as draft state inside
    // BusinessSettingsGeneralDetails, not here — checking myBusinessFullDetails alone meant a
    // value typed but not yet saved (e.g. a slug) was reported as missing even though it was
    // right there on screen. The Publish switch now passes its current draft values through
    // `draft`, which take priority over the last-saved business record; falling back to the
    // saved values keeps this working for callers that don't have a draft to pass (none do
    // today, but this is also where it'd be invoked from a toggle elsewhere in the page).
    const getPrePublishWarnings = useCallback((draft?: { slug?: string, email?: string, phone?: string }): string[] => {
        if (!myBusinessFullDetails) return []
        const missing: string[] = []
        const slug = draft?.slug ?? myBusinessFullDetails.slug
        const email = draft?.email ?? myBusinessFullDetails.email
        const phone = draft?.phone ?? myBusinessFullDetails.phone
        if (!slug) missing.push(t("settings_page.publish_warning.items.slug"))
        if (!email) missing.push(t("settings_page.publish_warning.items.email"))
        if (!phone) missing.push(t("settings_page.publish_warning.items.phone"))
        // N3 (QA Retest, 2026-11-18): the one item that actually blocks orders (AndorraFiscalAdapter
        // throws without it) was the one item missing from this list.
        if (
            myBusinessFullDetails.country?.code
            && FISCAL_ID_REQUIRED_COUNTRIES.has(myBusinessFullDetails.country.code)
            && !myBusinessFullDetails.taxIdNumber
        ) {
            missing.push(t("settings_page.publish_warning.items.tax_id"))
        }
        for (const alert of alerts) {
            if (alert.key === "menu.no_items" || alert.key === "menu.no_active_items") {
                missing.push(t("settings_page.publish_warning.items.menu"))
            }
            if (alert.key === "floor_plan.no_floors" || alert.key === "floor_plan.no_published_floor") {
                missing.push(t("settings_page.publish_warning.items.floor_plan"))
            }
        }
        return missing
    }, [myBusinessFullDetails, alerts, t])

    const handleTogglePublished = (val: boolean, draft?: { slug?: string, email?: string, phone?: string }) => {
        if (val && !myBusinessFullDetails?.isPublished) {
            const missing = getPrePublishWarnings(draft)
            if (missing.length > 0) {
                setPublishWarning(missing)
                return
            }
        }
        updateMyBusinessDetails({ isPublished: val })
    }

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

    // Shared by the cold-load URL reader and the Easy View action bar, which
    // publishes the section in place rather than navigating.
    const openSection = useCallback((section: string) => {
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

    useEffect(() => {
        const section = new URLSearchParams(window.location.search).get("section")
        if (!section) return
        openSection(section)
    }, [openSection])

    useParamFromAction("section", openSection)

    return (
        <div className="space-y-6">
        <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{t("settings_page.title")}</h1>
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
                    onTogglePublished={handleTogglePublished}
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
                    savingStatus={updatingMyBusinessStatus}
                    onSaveDetails={(data) => {
                        updateMyBusinessOpenHours(data);
                    }}
                    onSaveStatus={(status) => {
                        updateMyBusinessStatus(status);
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
                <AccordionTrigger>{t("settings_page.reservations_orders.trigger")}</AccordionTrigger>
                <AccordionContent className="py-2">
                    <div className="divide-y divide-border">
                        <div className="flex items-center justify-between py-3 rounded-sm transition-colors hover:bg-muted/50">
                            <div className="space-y-0.5">
                                <Label>{t("settings_page.reservations_orders.enable_reservations.label")}</Label>
                                <p className="text-xs text-muted-foreground">{t("settings_page.reservations_orders.enable_reservations.desc")}</p>
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
                                        <Label>{t("settings_page.reservations_orders.require_confirmation.label")}</Label>
                                        <p className="text-xs text-muted-foreground">{t("settings_page.reservations_orders.require_confirmation.desc")}</p>
                                    </div>
                                    <Switch
                                        checked={resSettings.requireReservationConfirmation}
                                        onCheckedChange={(val) => setRes("requireReservationConfirmation", val)}
                                        disabled={updatingMyBusiness}
                                    />
                                </div>
                                <div className="flex items-center justify-between py-2.5 rounded-sm transition-colors hover:bg-muted/50">
                                    <div className="space-y-0.5">
                                        <Label>{t("settings_page.reservations_orders.cancellation_window.label")}</Label>
                                        <p className="text-xs text-muted-foreground">{t("settings_page.reservations_orders.cancellation_window.desc")}</p>
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
                                        <Label>{t("settings_page.reservations_orders.modification_limit.label")}</Label>
                                        <p className="text-xs text-muted-foreground">{t("settings_page.reservations_orders.modification_limit.desc")}</p>
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
                                        <Label>{t("settings_page.reservations_orders.pending_timeout.label")}</Label>
                                        <p className="text-xs text-muted-foreground">{t("settings_page.reservations_orders.pending_timeout.desc")}</p>
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
                                        <Label>{t("settings_page.reservations_orders.default_duration.label")}</Label>
                                        <p className="text-xs text-muted-foreground">{t("settings_page.reservations_orders.default_duration.desc")}</p>
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
                                        <Label>{t("settings_page.reservations_orders.max_party_size.label")}</Label>
                                        <p className="text-xs text-muted-foreground">{t("settings_page.reservations_orders.max_party_size.desc")}</p>
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
                                        <Label>{t("settings_page.reservations_orders.booking_window.label")}</Label>
                                        <p className="text-xs text-muted-foreground">{t("settings_page.reservations_orders.booking_window.desc")}</p>
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
                                        <Label>{t("settings_page.reservations_orders.buffer.label")}</Label>
                                        <p className="text-xs text-muted-foreground">{t("settings_page.reservations_orders.buffer.desc")}</p>
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
                                        <Label>{t("settings_page.reservations_orders.auto_no_show.label")}</Label>
                                        <p className="text-xs text-muted-foreground">{t("settings_page.reservations_orders.auto_no_show.desc")}</p>
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
                                            <Label>{t("settings_page.reservations_orders.grace_period.label")}</Label>
                                            <p className="text-xs text-muted-foreground">{t("settings_page.reservations_orders.grace_period.desc")}</p>
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
                                <Label>{t("settings_page.reservations_orders.enable_ordering.label")}</Label>
                                <p className="text-xs text-muted-foreground">{t("settings_page.reservations_orders.enable_ordering.desc")}</p>
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
                                        <Label>{t("settings_page.reservations_orders.require_order_confirmation.label")}</Label>
                                        <p className="text-xs text-muted-foreground">{t("settings_page.reservations_orders.require_order_confirmation.desc")}</p>
                                    </div>
                                    <Switch
                                        checked={resSettings.requireOrderConfirmation}
                                        onCheckedChange={(val) => setRes("requireOrderConfirmation", val)}
                                        disabled={updatingMyBusiness}
                                    />
                                </div>
                                <div className="flex items-center justify-between py-2.5 rounded-sm transition-colors hover:bg-muted/50">
                                    <div className="space-y-0.5">
                                        <Label>{t("settings_page.reservations_orders.allow_table_ordering.label")}</Label>
                                        <p className="text-xs text-muted-foreground">{t("settings_page.reservations_orders.allow_table_ordering.desc")}</p>
                                    </div>
                                    <Switch
                                        checked={resSettings.allowTableOrdering}
                                        onCheckedChange={(val) => setRes("allowTableOrdering", val)}
                                        disabled={updatingMyBusiness}
                                    />
                                </div>
                                <div className="flex items-center justify-between py-2.5 rounded-sm transition-colors hover:bg-muted/50">
                                    <div className="space-y-0.5">
                                        <Label>{t("settings_page.reservations_orders.allow_takeaway_ordering.label")}</Label>
                                        <p className="text-xs text-muted-foreground">{t("settings_page.reservations_orders.allow_takeaway_ordering.desc")}</p>
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
                            {t("settings_page.reservations_orders.save")}
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
                <AccordionTrigger>{t("settings_page.floor_plan.trigger")}</AccordionTrigger>
                <AccordionContent className="py-2">
                    <div className="divide-y divide-border">
                        <div className="flex items-center justify-between py-3 rounded-sm transition-colors hover:bg-muted/50">
                            <div className="space-y-0.5">
                                <Label>{t("settings_page.floor_plan.enable_layout.label")}</Label>
                                <p className="text-xs text-muted-foreground">{t("settings_page.floor_plan.enable_layout.desc")}</p>
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

            {/* Organization & Region */}
            <AccordionItem value="organization" className="border rounded-lg px-3">
                <AccordionTrigger>{t("settings_page.organization_region.trigger")}</AccordionTrigger>
                <AccordionContent className="py-2">
                    {myBusinessFullDetails?.organizationId || myBusinessFullDetails?.regionId ? (
                        <div className="flex items-center justify-between border border-border rounded-lg p-3">
                            <div className="flex items-center gap-2">
                                <Badge>{t("settings_page.organization_region.linked")}</Badge>
                                <span className="text-sm text-muted-foreground">
                                    {myBusinessFullDetails.regionName ?? myBusinessFullDetails.organizationName ?? "—"}
                                </span>
                            </div>
                            {pendingLeaveRequest ? (
                                <Badge variant="outline" className="text-muted-foreground">
                                    {t("settings_page.organization_region.leave_pending")}
                                </Badge>
                            ) : (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-muted-foreground hover:text-destructive"
                                    disabled={isRequestingLeave}
                                    onClick={() =>
                                        requestLeave({
                                            childType: "BUSINESS",
                                            childId: businessId,
                                        })
                                    }
                                >
                                    {t("settings_page.organization_region.request_to_leave")}
                                </Button>
                            )}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground py-2">
                            {t("settings_page.organization_region.not_linked")}
                        </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-3">
                        {t("settings_page.organization_region.leave_note")}
                    </p>
                </AccordionContent>
            </AccordionItem>

        </Accordion>

        <Dialog open={!!publishWarning} onOpenChange={(open) => { if (!open) setPublishWarning(null) }}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <TriangleAlert className="w-5 h-5 text-amber-600 shrink-0" />
                        {t("settings_page.publish_warning.title")}
                    </DialogTitle>
                    <DialogDescription>
                        {t("settings_page.publish_warning.description")}
                    </DialogDescription>
                </DialogHeader>
                <ul className="list-disc pl-5 space-y-1 text-sm text-foreground">
                    {publishWarning?.map((item) => (
                        <li key={item}>{item}</li>
                    ))}
                </ul>
                <DialogFooter className="mt-4 gap-2">
                    <Button variant="outline" onClick={() => setPublishWarning(null)}>
                        {t("settings_page.publish_warning.cancel")}
                    </Button>
                    <Button
                        variant="default"
                        onClick={() => {
                            setPublishWarning(null)
                            updateMyBusinessDetails({ isPublished: true })
                        }}
                    >
                        {t("settings_page.publish_warning.publish_anyway")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        </div>
    )
}

export default BusinessSettingsPage
