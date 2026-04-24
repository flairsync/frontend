import React, { useState, Suspense } from "react";
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { MyBusinessFullDetails, UpdateBusinessDetailsDto } from "@/models/business/MyBusinessFullDetails";
import { PlatformCountry } from "@/models/shared/PlatformCountry";
import { ClientOnly } from "../../ClientOnly";
import { AuditLogHint } from "@/components/audit/AuditLogHint";

const LocationPicker = React.lazy(() => import("@/components/management/create/BusinessLocationPicker"));

type Props = {
    businessDetails?: MyBusinessFullDetails;
    onSaveDetails?: (data: UpdateBusinessDetailsDto) => void;
    disabled?: boolean;
};

export default function BusinessSettingsLocation({ businessDetails, onSaveDetails, disabled }: Props) {
    // Current timezone
    const [timezone, setTimezone] = useState(businessDetails?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone);
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

    const handleLocationChange = (val: any) => {
        setLocationValue(val);
        setAddress(val.address || "");
        setCity(val.city || "");
        if (val.country?.id) {
            setCountryId(val.country.id);
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
                strictGeofenceBlock
            });
        }
    };

    return (
        <AccordionItem value="location-address" className="border rounded-lg px-3">
            <AccordionTrigger className="flex items-center gap-2">
                <span>Location & Address</span>
                <AuditLogHint
                    entityType="business"
                    entityId={businessDetails?.id}
                    businessId={businessDetails?.id}
                />
            </AccordionTrigger>
            <AccordionContent className="space-y-6 py-4">

                {/* Timezone */}
                <div className="space-y-1.5 flex flex-col">
                    <Label className="text-sm font-medium">Business Timezone</Label>
                    <Select disabled={disabled} value={timezone} onValueChange={setTimezone}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a timezone" />
                        </SelectTrigger>
                        <SelectContent>
                            {timezones.map(tz => (
                                <SelectItem key={tz} value={tz}>
                                    {tz}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <Separator />

                <ClientOnly>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-sm">State / Province</Label>
                                <Input
                                    disabled={disabled}
                                    placeholder="State or Province"
                                    value={state}
                                    onChange={(e) => setState(e.target.value)}
                                />
                            </div>
                        </div>

                        <Suspense fallback={<div className="h-80 w-full rounded-md border border-gray-200 animate-pulse bg-slate-100 flex items-center justify-center">Loading Map...</div>}>
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

                <div className="space-y-4">
                    <Label className="text-base font-medium">Ordering Location Settings</Label>
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Allow Only Nearby Orders</Label>
                            <p className="text-xs text-muted-foreground">Guests must be within an allowed radius of your location</p>
                        </div>
                        <Switch
                            checked={allowOnlyNearbyOrders}
                            onCheckedChange={setAllowOnlyNearbyOrders}
                            disabled={disabled}
                        />
                    </div>

                    {allowOnlyNearbyOrders && (
                        <div className="flex items-center justify-between pl-6 border-l-2 border-muted mt-4">
                            <div className="space-y-0.5">
                                <Label>Maximum Distance (Meters)</Label>
                                <p className="text-xs text-muted-foreground">Maximum allowed distance for nearby orders (e.g. 5000 for 5km)</p>
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

                <Separator />

                <div className="space-y-4">
                    <Label className="text-base font-medium">Attendance & Geofencing Settings</Label>
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Require GPS for Attendance</Label>
                            <p className="text-xs text-muted-foreground">Staff must share their location to clock in or out</p>
                        </div>
                        <Switch
                            checked={requireGpsForAttendance}
                            onCheckedChange={setRequireGpsForAttendance}
                            disabled={disabled}
                        />
                    </div>

                    {requireGpsForAttendance && (
                        <>
                            <div className="flex items-center justify-between pl-6 border-l-2 border-muted mt-4">
                                <div className="space-y-0.5">
                                    <Label>Attendance Geofence Radius (Meters)</Label>
                                    <p className="text-xs text-muted-foreground">Maximum distance from business to allow clock in (e.g. 50)</p>
                                </div>
                                <Input
                                    type="number"
                                    className="w-24"
                                    value={attendanceGeofenceRadiusMeters}
                                    onChange={(e) => setAttendanceGeofenceRadiusMeters(parseInt(e.target.value) || 0)}
                                    disabled={disabled}
                                />
                            </div>
                            <div className="flex items-center justify-between pl-6 border-l-2 border-muted mt-4">
                                <div className="space-y-0.5">
                                    <Label>Strict Geofence Block</Label>
                                    <p className="text-xs text-muted-foreground">If enabled, prevents clock-in if staff is outside the radius. If disabled, allows clock-in but flags it for manager review.</p>
                                </div>
                                <Switch
                                    checked={strictGeofenceBlock}
                                    onCheckedChange={setStrictGeofenceBlock}
                                    disabled={disabled}
                                />
                            </div>
                        </>
                    )}
                </div>

                <div className="flex justify-end pt-2">
                    <Button disabled={disabled} onClick={handleSave}>Save</Button>
                </div>
            </AccordionContent>
        </AccordionItem>
    );
}
