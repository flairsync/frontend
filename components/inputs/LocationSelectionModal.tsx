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
import { Label } from '@radix-ui/react-dropdown-menu'
import { Switch } from '../ui/switch'
import { Slider } from '../ui/slider'


type Props = {
    isOpen: boolean,
    onOpenChange: () => void
}

const LocationSelectionModal = (props: Props) => {
    const [locationEnabled, setLocationEnabled] = useState(false);
    const [currentLocation, setCurrentLocation] = useState<GeolocationCoordinates>();
    const [customLocation, setCustomLocation] = useState<LatLng>();
    const [useCustomLocation, setUseCustomLocation] = useState(false);
    const [searchRadius, setSearchRadius] = useState(10);

    const mapRef = useRef<Map | null>(null);

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
                    !locationEnabled && <Alert variant="destructive">
                        <AlertTitle>Location error</AlertTitle>
                        <AlertDescription>
                            Location is not enabled, please check your permission settings.
                        </AlertDescription>
                    </Alert>
                }

                <div className="flex items-center space-x-2">
                    <Switch id="use_custom_location" checked={useCustomLocation} onCheckedChange={setUseCustomLocation} />
                    <Label >Use custom location ?</Label>
                </div>
                <Label >Search area radius (in KM) : {searchRadius}</Label>
                <Slider value={[searchRadius]}
                    onValueChange={(val) => {
                        setSearchRadius(val[0]);

                    }}
                    min={5} max={60} step={5} />
                <div
                    className='w-96 h-96'
                >
                    <MapContainer
                        ref={mapRef}
                        className='w-full h-full'

                        center={getCurrentLocationInLeafletFormat()} zoom={13} scrollWheelZoom={false}>
                        <TileLayer

                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {
                            currentLocation && <Marker position={getCurrentLocationInLeafletFormat()}>
                                <Popup>
                                    Your location
                                </Popup>
                            </Marker>
                        }
                        {
                            !currentLocation && customLocation && useCustomLocation && <>
                                <Marker position={customLocation}>
                                    <Popup>
                                        Custom location
                                    </Popup>
                                </Marker>
                                <Circle
                                    center={customLocation}
                                    radius={searchRadius * 1000}
                                />
                            </>
                        }
                        {
                            useCustomLocation &&
                            <ClickLocationFinder
                                onLocationClick={(latlng) => {
                                    setCustomLocation(latlng);
                                }}
                            />

                        }


                    </MapContainer>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit">Save changes</Button>
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