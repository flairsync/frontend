import React, { useState, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { MyBusinessFullDetails, UpdateBusinessDetailsDto } from "@/models/business/MyBusinessFullDetails";
import { PlatformCountry } from "@/models/shared/PlatformCountry";
import { ClientOnly } from "../../ClientOnly";

const LocationPicker = React.lazy(() => import("@/components/management/create/BusinessLocationPicker"));

// Primary IANA timezone per country — covers the platform's active/coming-soon countries only
const COUNTRY_TIMEZONES: Record<string, string> = {
    ad: "Europe/Andorra",
    es: "Europe/Madrid",
    fr: "Europe/Paris",
};

type Props = {
    businessDetails?: MyBusinessFullDetails;
    onSaveDetails?: (data: UpdateBusinessDetailsDto) => void;
    disabled?: boolean;
};

export default function BusinessSettingsLocation({ businessDetails, onSaveDetails, disabled }: Props) {
    const { t } = useTranslation("management");
    // Current timezone
    const [timezone, setTimezone] = useState(businessDetails?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone);
    const [timezonePopoverOpen, setTimezonePopoverOpen] = useState(false);
    const timezones = Intl.supportedValuesOf('timeZone');

    // Location state
    const [address, setAddress] = useState(businessDetails?.address || "");
    const [city, setCity] = useState(businessDetails?.city || "");
    const [state, setState] = useState(businessDetails?.state || "");

    const [locationValue, setLocationValue] = useState({
        lat: businessDetails?.location?.coordinates?.[1] || 41.3851, // coordinates are [lon, lat]
        lng: businessDetails?.location?.coordinates?.[0] || 2.1734,
        country: businessDetails?.country ? { id: businessDetails.countryId, code: "", name: businessDetails.country.name, centerLat: 0, centerLng: 0 } as PlatformCountry : undefined,
        city: businessDetails?.city || "",
        address: businessDetails?.address || ""
    });

    const [countryId, setCountryId] = useState<number | undefined>(businessDetails?.countryId);

    // Orders
    const [allowOnlyNearbyOrders, setAllowOnlyNearbyOrders] = useState(!!businessDetails?.allowOnlyNearbyOrders);
    const [maxOrderDistanceMeters, setMaxOrderDistanceMeters] = useState(businessDetails?.maxOrderDistanceMeters || 5000);

    // Attendance Geofencing
    const [requireGpsForAttendance, setRequireGpsForAttendance] = useState(!!businessDetails?.requireGpsForAttendance);
    const [attendanceGeofenceRadiusMeters, setAttendanceGeofenceRadiusMeters] = useState(businessDetails?.attendanceGeofenceRadiusMeters || 50);
    const [strictGeofenceBlock, setStrictGeofenceBlock] = useState(!!businessDetails?.strictGeofenceBlock);
    const [requireQrForAttendance, setRequireQrForAttendance] = useState(!!businessDetails?.requireQrForAttendance);
    const [attendanceGraceMinutes, setAttendanceGraceMinutes] = useState(businessDetails?.attendanceGraceMinutes ?? 15);
    const [maxPaidBreakMinutes, setMaxPaidBreakMinutes] = useState(businessDetails?.maxPaidBreakMinutes ?? 30);
    const [requireClockInForPos, setRequireClockInForPos] = useState(!!businessDetails?.requireClockInForPos);

    const handleLocationChange = (val: any) => {
        setLocationValue(val);
        setAddress(val.address || "");
        setCity(val.city || "");
        if (val.country?.id) {
            setCountryId(val.country.id);
        }
        if (val.country?.code && val.country.id !== locationValue.country?.id) {
            const mappedTimezone = COUNTRY_TIMEZONES[val.country.code.toLowerCase()];
            if (mappedTimezone) {
                setTimezone(mappedTimezone);
            }
        }
    };

    const handleSave = () => {
        if (onSaveDetails) {
            onSaveDetails({
                timezone,
                address,
                city,
                state,
                countryId: countryId,
                location: {
                    type: "Point",
                    coordinates: [locationValue.lng, locationValue.lat]
                },
                allowOnlyNearbyOrders,
                maxOrderDistanceMeters,
                requireGpsForAttendance,
                attendanceGeofenceRadiusMeters,
                strictGeofenceBlock,
                requireQrForAttendance,
                attendanceGraceMinutes,
                maxPaidBreakMinutes,
                requireClockInForPos
            });
        }
    };

    return (
        <AccordionItem value="location-address" className="border rounded-lg px-3">
            <AccordionTrigger>{t("settings_page.location.trigger")}</AccordionTrigger>
            <AccordionContent className="space-y-6 py-4">

                {/* Timezone */}
                <div className="space-y-1.5 flex flex-col">
                    <Label className="text-sm font-medium">{t("settings_page.location.timezone.label")}</Label>
                    <Popover open={timezonePopoverOpen} onOpenChange={setTimezonePopoverOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={timezonePopoverOpen}
                                disabled={disabled}
                                className="w-full justify-between font-normal"
                            >
                                {timezone || t("settings_page.location.timezone.select_placeholder")}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                            <Command>
                                <CommandInput placeholder={t("settings_page.location.timezone.search_placeholder")} />
                                <CommandEmpty>{t("settings_page.location.timezone.no_results")}</CommandEmpty>
                                <CommandList>
                                    <CommandGroup>
                                        {timezones.map(tz => (
                                            <CommandItem
                                                key={tz}
                                                value={tz}
                                                onSelect={() => {
                                                    setTimezone(tz);
                                                    setTimezonePopoverOpen(false);
                                                }}
                                            >
                                                <Check className={cn("mr-2 h-4 w-4", timezone === tz ? "opacity-100" : "opacity-0")} />
                                                {tz}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                </div>

                <Separator />

                <ClientOnly>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-sm">{t("settings_page.location.state_province.label")}</Label>
                                <Input
                                    disabled={disabled}
                                    placeholder={t("settings_page.location.state_province.placeholder")}
                                    value={state}
                                    onChange={(e) => setState(e.target.value)}
                                />
                            </div>
                        </div>

                        <Suspense fallback={<div className="h-80 w-full rounded-md border border-gray-200 animate-pulse bg-slate-100 flex items-center justify-center">{t("settings_page.location.loading_map")}</div>}>
                            <LocationPicker
                                value={locationValue}
                                onChange={handleLocationChange}
                                showRadius={allowOnlyNearbyOrders}
                                radiusMeters={maxOrderDistanceMeters}
                            />
                        </Suspense>
                    </div>
                </ClientOnly>

                <Separator />

                <div>
                    <Label className="text-base font-medium">{t("settings_page.location.ordering.section_label")}</Label>
                    <div className="divide-y divide-border mt-3">
                        <div className="flex items-center justify-between py-3 rounded-sm transition-colors hover:bg-muted/50">
                            <div className="space-y-0.5">
                                <Label>{t("settings_page.location.ordering.allow_nearby_only.label")}</Label>
                                <p className="text-xs text-muted-foreground">{t("settings_page.location.ordering.allow_nearby_only.desc")}</p>
                            </div>
                            <Switch
                                checked={allowOnlyNearbyOrders}
                                onCheckedChange={setAllowOnlyNearbyOrders}
                                disabled={disabled}
                            />
                        </div>
                        {allowOnlyNearbyOrders && (
                            <div className="flex items-center justify-between pl-6 border-l-2 border-muted py-2.5">
                                <div className="space-y-0.5">
                                    <Label>{t("settings_page.location.ordering.max_distance.label")}</Label>
                                    <p className="text-xs text-muted-foreground">{t("settings_page.location.ordering.max_distance.desc")}</p>
                                </div>
                                <Input
                                    type="number"
                                    className="w-24"
                                    value={maxOrderDistanceMeters}
                                    onChange={(e) => setMaxOrderDistanceMeters(parseInt(e.target.value) || 0)}
                                    disabled={disabled}
                                />
                            </div>
                        )}
                    </div>
                </div>

                <Separator />

                <div>
                    <Label className="text-base font-medium">{t("settings_page.location.attendance.section_label")}</Label>
                    <div className="divide-y divide-border mt-3">
                        <div className="flex items-center justify-between py-3 rounded-sm transition-colors hover:bg-muted/50">
                            <div className="space-y-0.5">
                                <Label>{t("settings_page.location.attendance.require_gps.label")}</Label>
                                <p className="text-xs text-muted-foreground">{t("settings_page.location.attendance.require_gps.desc")}</p>
                            </div>
                            <Switch
                                checked={requireGpsForAttendance}
                                onCheckedChange={setRequireGpsForAttendance}
                                disabled={disabled}
                            />
                        </div>
                        <div className="flex items-center justify-between py-3 rounded-sm transition-colors hover:bg-muted/50">
                            <div className="space-y-0.5">
                                <Label>{t("settings_page.location.attendance.grace_period.label")}</Label>
                                <p className="text-xs text-muted-foreground">{t("settings_page.location.attendance.grace_period.desc")}</p>
                            </div>
                            <Input
                                type="number"
                                className="w-24"
                                value={attendanceGraceMinutes}
                                onChange={(e) => setAttendanceGraceMinutes(parseInt(e.target.value) || 0)}
                                disabled={disabled}
                            />
                        </div>
                        <div className="flex items-center justify-between py-3 rounded-sm transition-colors hover:bg-muted/50">
                            <div className="space-y-0.5">
                                <Label>{t("settings_page.location.attendance.max_paid_break.label")}</Label>
                                <p className="text-xs text-muted-foreground">{t("settings_page.location.attendance.max_paid_break.desc")}</p>
                            </div>
                            <Input
                                type="number"
                                className="w-24"
                                value={maxPaidBreakMinutes}
                                onChange={(e) => setMaxPaidBreakMinutes(parseInt(e.target.value) || 0)}
                                disabled={disabled}
                            />
                        </div>
                        <div className="flex items-center justify-between py-3 rounded-sm transition-colors hover:bg-muted/50">
                            <div className="space-y-0.5">
                                <Label>{t("settings_page.location.attendance.require_clock_in_pos.label")}</Label>
                                <p className="text-xs text-muted-foreground">{t("settings_page.location.attendance.require_clock_in_pos.desc")}</p>
                            </div>
                            <Switch
                                checked={requireClockInForPos}
                                onCheckedChange={setRequireClockInForPos}
                                disabled={disabled}
                            />
                        </div>
                        <div className="flex items-center justify-between py-3 rounded-sm transition-colors hover:bg-muted/50">
                            <div className="space-y-0.5">
                                <Label>{t("settings_page.location.attendance.require_qr.label")}</Label>
                                <p className="text-xs text-muted-foreground">{t("settings_page.location.attendance.require_qr.desc")}</p>
                            </div>
                            <Switch
                                checked={requireQrForAttendance}
                                onCheckedChange={setRequireQrForAttendance}
                                disabled={disabled}
                            />
                        </div>
                        {requireGpsForAttendance && (
                            <div className="divide-y divide-border/60 pl-6 border-l-2 border-muted">
                                <div className="flex items-center justify-between py-2.5 rounded-sm transition-colors hover:bg-muted/50">
                                    <div className="space-y-0.5">
                                        <Label>{t("settings_page.location.attendance.geofence_radius.label")}</Label>
                                        <p className="text-xs text-muted-foreground">{t("settings_page.location.attendance.geofence_radius.desc")}</p>
                                    </div>
                                    <Input
                                        type="number"
                                        className="w-24"
                                        value={attendanceGeofenceRadiusMeters}
                                        onChange={(e) => setAttendanceGeofenceRadiusMeters(parseInt(e.target.value) || 0)}
                                        disabled={disabled}
                                    />
                                </div>
                                <div className="flex items-center justify-between py-2.5 rounded-sm transition-colors hover:bg-muted/50">
                                    <div className="space-y-0.5">
                                        <Label>{t("settings_page.location.attendance.strict_block.label")}</Label>
                                        <p className="text-xs text-muted-foreground">{t("settings_page.location.attendance.strict_block.desc")}</p>
                                    </div>
                                    <Switch
                                        checked={strictGeofenceBlock}
                                        onCheckedChange={setStrictGeofenceBlock}
                                        disabled={disabled}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end pt-2">
                    <Button disabled={disabled} onClick={handleSave}>{t("settings_page.location.save")}</Button>
                </div>
            </AccordionContent>
        </AccordionItem>
    );
}
