"use client";

import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { LocateFixed } from "lucide-react";
import { toast } from "sonner";
import { LocationPlaceholderCard } from "./LocationPlaceholderCard";

interface LocationValue {
    lat: number;
    lng: number;
    country?: string;
    city?: string;
    address?: string;
}

interface LocationPickerProps {
    value?: LocationValue;
    onChange: (value: LocationValue) => void;
}

const defaultCenter = { lat: 41.3851, lng: 2.1734 }; // Barcelona fallback

// Fix for default Leaflet marker icons
delete (L.Icon.Default as any).prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Component for clickable marker
const LocationMarker = ({
    position,
    onSelect,
}: {
    position: L.LatLngExpression;
    onSelect: (val: LocationValue) => void;
}) => {
    console.log("POSITION ", position);

    useMapEvents({
        click(e) {
            onSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
        },
    });
    return position ? <Marker position={position} /> : null;
};

// Component to smoothly pan the map to a location
const MapPanTo: React.FC<{ position: LocationValue }> = ({ position }) => {
    const map = useMap();
    useEffect(() => {
        if (position) {
            map.flyTo([position.lat, position.lng], 13, { duration: 1.5 });
        }
    }, [position]);
    return null;
};

const LocationPicker: React.FC<LocationPickerProps> = ({ value, onChange }) => {
    const [position, setPosition] = useState<LocationValue>(defaultCenter);
    const [country, setCountry] = useState(value?.country || "");
    const [city, setCity] = useState(value?.city || "");
    const [address, setAddress] = useState(value?.address || "");

    // Simulated country/city data
    const countries = ["Spain", "France", "Andorra"];
    const cities: Record<string, string[]> = {
        Spain: ["Barcelona", "Madrid", "Valencia"],
        France: ["Paris", "Lyon", "Marseille"],
        Andorra: ["Andorra la Vella", "Escaldes-Engordany"],
    };

    const handleSelectLocation = (val: LocationValue) => {
        setPosition(val);
        onChange({ ...val, country, city, address });
    };

    const handleGeolocate = () => {
        if (!navigator.geolocation) {
            toast("Geolocation not supported", {
                description: "Your browser does not support geolocation.",
            });
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const coords = {
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                };
                setPosition(coords);
                onChange({ ...coords, country, city, address });
            },
            (err) => {
                toast("Location permission denied", {
                    description: "Please enable location permission or select manually",
                });

            }
        );
    };

    // Sync prop changes
    useEffect(() => {
        if (value) setPosition(value);
    }, [value]);

    const checkPositionValue = () => {
        if (position.lat && position.lng) return true;

        return false;
    }

    return (
        <div className="space-y-4">
            <Label className="font-medium text-sm text-gray-700">Location</Label>

            {/* Search input */}
            <div className="flex gap-2">
                <Input
                    placeholder="Search address or place name..."
                    value={address}
                    onChange={(e) => {
                        setAddress(e.target.value);
                        onChange({ ...position, country, city, address: e.target.value });
                    }}
                    className="flex-1"
                />
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleGeolocate}
                    title="Use my location"
                >
                    <LocateFixed className="h-4 w-4" />
                </Button>
            </div>

            {/* Country & city dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 z-50">
                <div>
                    <Label className="text-sm">Country</Label>
                    <Select
                        value={country}
                        onValueChange={(val) => {
                            setCountry(val);
                            setCity("");
                            onChange({ ...position, country: val, city: "", address });
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select Country" />
                        </SelectTrigger>
                        <SelectContent>
                            {countries.map((c) => (
                                <SelectItem key={c} value={c}>
                                    {c}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <Label className="text-sm">City</Label>
                    <Select
                        value={city}
                        onValueChange={(val) => {
                            setCity(val);
                            onChange({ ...position, country, city: val, address });
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select City" />
                        </SelectTrigger>
                        <SelectContent>
                            {country && cities[country]
                                ? cities[country].map((c) => (
                                    <SelectItem key={c} value={c}>
                                        {c}
                                    </SelectItem>
                                ))
                                : null}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Map */}
            <div className="h-80 w-full rounded-md overflow-hidden border border-gray-200 z-0">
                {checkPositionValue() ? (
                    <MapContainer
                        center={[position.lat, position.lng]}
                        zoom={13}
                        scrollWheelZoom
                        style={{ height: "100%", width: "100%", zIndex: 0 }}
                    >
                        <TileLayer
                            attribution='© <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <LocationMarker
                            position={{ lat: position.lat, lng: position.lng }}
                            onSelect={handleSelectLocation}
                        />
                    </MapContainer>
                ) : (
                    <LocationPlaceholderCard />
                )}
            </div>
        </div>
    );
};

export default LocationPicker;
