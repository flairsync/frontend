import React, { useEffect, useRef, useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet'
import { useMap, useMapEvents } from 'react-leaflet/hooks'
import { Alert, AlertDescription, AlertTitle } from '../ui/alert'
import { LatLng, Map } from 'leaflet'
import { DialogClose } from '@radix-ui/react-dialog'
import { Button } from '../ui/button'
import { Label } from '../ui/label'
import { Switch } from '../ui/switch'
import { Slider } from '../ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { usePlatformCountries } from '@/features/shared/usePlatformCountries'

export type LocationFilterState = {
    useCustomLocation: boolean;
    lat?: number;
    lng?: number;
    radius?: number;
    countryId?: number;
};

type Props = {
    isOpen: boolean,
    onOpenChange: (open: boolean) => void,
    onSave?: (state: LocationFilterState) => void,
    defaultState?: LocationFilterState,
    reason?: 'denied' | 'error' | 'unsupported' | string
}

const LocationSelectionModal = (props: Props) => {
    const [locationEnabled, setLocationEnabled] = useState(false);
    const [currentLocation, setCurrentLocation] = useState<GeolocationCoordinates>();

    // UI state
    const [useCustomLocation, setUseCustomLocation] = useState(props.defaultState?.useCustomLocation || false);
    const [customLocation, setCustomLocation] = useState<LatLng | undefined>(
        props.defaultState?.lat && props.defaultState?.lng
            ? new LatLng(props.defaultState.lat, props.defaultState.lng)
            : undefined
    );
    const [searchRadius, setSearchRadius] = useState(
        props.defaultState?.radius ? props.defaultState.radius / 1000 : 50
    );

    // Country state
    const [useCountryFilter, setUseCountryFilter] = useState(!!props.defaultState?.countryId);
    const [selectedCountryId, setSelectedCountryId] = useState<number | undefined>(props.defaultState?.countryId);

    const { platformCountries: countries, isCountriesLoading } = usePlatformCountries();

    const mapRef = useRef<Map | null>(null);

    // Apply parent defaults when it opens
    useEffect(() => {
        if (props.isOpen) {
            setUseCustomLocation(props.defaultState?.useCustomLocation || false);
            if (props.defaultState?.lat && props.defaultState?.lng) {
                setCustomLocation(new LatLng(props.defaultState.lat, props.defaultState.lng));
            }
            setSearchRadius(props.defaultState?.radius ? props.defaultState.radius / 1000 : 50);
            setUseCountryFilter(!!props.defaultState?.countryId);
            setSelectedCountryId(props.defaultState?.countryId);
        }
    }, [props.isOpen, props.defaultState]);

    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    // Success callback: position object contains coordinates
                    setCurrentLocation(position.coords);
                    setLocationEnabled(true);
                    const { latitude, longitude } = position.coords;
                    console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
                    // Update React state with location data
                },
                (error) => {
                    setLocationEnabled(false);
                    // Error callback: handle permission denial or other issues
                    console.error("Error getting geolocation:", error);
                },
                {
                    // Optional: options object for accuracy, timeout, etc.
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0,
                }
            );


            // Geolocation is available
        } else {
            // Geolocation is not available
            console.error("Geolocation is not supported by this browser.");
        }
    }, []);

    const getCurrentLocationInLeafletFormat = () => {
        if (currentLocation) {

            return {
                lat: currentLocation.latitude,
                lng: currentLocation.longitude
            }
        } else {
            return {
                lat: 42.5063,
                lng: 1.5218
            }
        }
    }

    useEffect(() => {


        if (mapRef.current) {
            if (customLocation) {

                mapRef.current.flyTo(customLocation, radiusToZoom(searchRadius))

            }
        }
    }, [searchRadius, customLocation]);


    function radiusToZoom(radiusKm: number) {
        const earthCircumferenceKm = 40075; // around the equator
        const diameterKm = radiusKm * 2;

        // zoom = log2(worldWidth / diameter)
        let zoom = Math.log2(earthCircumferenceKm / diameterKm);

        // clamp zoom into Leaflet’s usual range (0–20)
        zoom = Math.max(0, Math.min(20, zoom));

        // round to an integer, since Leaflet usually uses whole zooms
        return Math.round(zoom);
    }

    const handleSave = () => {
        if (props.onSave) {
            props.onSave({
                useCustomLocation,
                lat: useCustomLocation ? customLocation?.lat : currentLocation?.latitude,
                lng: useCustomLocation ? customLocation?.lng : currentLocation?.longitude,
                radius: searchRadius * 1000, // convert KM to meters
                countryId: useCountryFilter ? selectedCountryId : undefined
            });
        }
        props.onOpenChange(false);
    };

    return (
        <Dialog
            modal={true}
            open={props.isOpen}
            onOpenChange={props.onOpenChange}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Search location settings</DialogTitle>
                    <DialogDescription>
                    </DialogDescription>
                </DialogHeader>


                {
                    props.reason === 'denied' && (
                        <Alert variant="destructive" className="bg-destructive/10 border-destructive/20">
                            <AlertTitle className="text-destructive font-bold">Location Access Denied</AlertTitle>
                            <AlertDescription className="text-destructive/80">
                                Geolocation is disabled or blocked. Please select a <b>Country</b> or click the map to set a <b>Custom Location</b> to see nearby results.
                            </AlertDescription>
                        </Alert>
                    )
                }

                {
                    (props.reason === 'error' || props.reason === 'unsupported') && (
                        <Alert variant="default" className="bg-yellow-500/10 border-yellow-500/20">
                            <AlertTitle className="text-yellow-600 dark:text-yellow-400 font-bold">Location Unavailable</AlertTitle>
                            <AlertDescription className="text-yellow-600/80 dark:text-yellow-400/80">
                                We couldn't detect your location automatically. Please choose a country or a spot on the map to continue.
                            </AlertDescription>
                        </Alert>
                    )
                }

                {
                    !locationEnabled && !props.reason && <Alert variant="destructive">
                        <AlertTitle>Location error</AlertTitle>
                        <AlertDescription>
                            Location is not enabled, please check your permission settings.
                        </AlertDescription>
                    </Alert>
                }

                <div className="space-y-4">
                    {/* Country Override */}
                    <div className="flex items-center space-x-2 bg-muted/30 p-3 rounded-lg border border-border/50">
                        <Switch id="use_country_filter" checked={useCountryFilter} onCheckedChange={setUseCountryFilter} />
                        <div className="space-y-0.5">
                            <Label htmlFor="use_country_filter" className="font-semibold text-sm">Filter by Entire Country</Label>
                            <p className="text-xs text-muted-foreground">This ignores standard precise coordinates.</p>
                        </div>
                    </div>

                    {useCountryFilter && (
                        <div className="w-full">
                            <Label className="text-sm font-medium mb-1 block">Select Country (Optional)</Label>
                            <Select
                                value={selectedCountryId ? selectedCountryId.toString() : undefined}
                                onValueChange={(val) => setSelectedCountryId(parseInt(val))}
                                disabled={isCountriesLoading}
                            >
                                <SelectTrigger className="w-full h-10 rounded-xl border-border/50 shadow-sm">
                                    <SelectValue placeholder={isCountriesLoading ? "Loading countries..." : "Any Country"} />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl max-h-60">
                                    {countries?.map((c) => (
                                        <SelectItem key={c.id} value={c.id.toString()} className="rounded-lg">
                                            {c.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {!useCountryFilter && (
                        <>
                            <div className="flex items-center space-x-2 bg-muted/30 p-3 rounded-lg border border-border/50 mt-2">
                                <Switch id="use_custom_location" checked={useCustomLocation} onCheckedChange={setUseCustomLocation} />
                                <div className="space-y-0.5">
                                    <Label htmlFor="use_custom_location" className="font-semibold text-sm">Use custom coordinate location?</Label>
                                    <p className="text-xs text-muted-foreground">Click the map to change the origin point.</p>
                                </div>
                            </div>

                            <div className="px-1 mt-4">
                                <Label className="text-sm font-medium">Search area radius: <span className="text-primary font-bold">{searchRadius} km</span></Label>
                                <Slider
                                    className="mt-2"
                                    value={[searchRadius]}
                                    onValueChange={(val) => setSearchRadius(val[0])}
                                    min={5} max={100} step={5}
                                />
                            </div>
                        </>
                    )}
                </div>

                {!useCountryFilter && (
                    <div className='w-full aspect-square md:h-80 md:aspect-auto rounded-xl overflow-hidden border border-border shadow-sm'>
                        <MapContainer
                            ref={mapRef}
                            className='w-full h-full'
                            center={getCurrentLocationInLeafletFormat()}
                            zoom={13}
                            scrollWheelZoom={false}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            {currentLocation && !useCustomLocation && (
                                <Marker position={getCurrentLocationInLeafletFormat()}>
                                    <Popup>Your device location</Popup>
                                </Marker>
                            )}
                            {useCustomLocation && customLocation && (
                                <>
                                    <Marker position={customLocation}>
                                        <Popup>Custom override location</Popup>
                                    </Marker>
                                    <Circle
                                        center={customLocation}
                                        radius={searchRadius * 1000} // meters
                                        pathOptions={{ fillColor: 'hsl(var(--primary))', color: 'hsl(var(--primary))' }}
                                    />
                                </>
                            )}
                            {useCustomLocation && (
                                <ClickLocationFinder onLocationClick={(latlng) => setCustomLocation(latlng)} />
                            )}
                        </MapContainer>
                    </div>
                )}
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="button" onClick={handleSave} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-md">Apply Filters</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

const ClickLocationFinder = (props: {
    onLocationClick: (latlng: LatLng) => void
}) => {
    const map = useMapEvents({
        click(e) {
            props.onLocationClick(e.latlng);
        },
    });
    return null;
};


export default LocationSelectionModal