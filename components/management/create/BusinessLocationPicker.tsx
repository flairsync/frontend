
import React, { useEffect, useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { LocateFixed, MapPin, Navigation, Search } from "lucide-react";
import { toast } from "sonner";
import { LocationPlaceholderCard } from "./LocationPlaceholderCard";
import { AddressAutocomplete } from "@/components/inputs/AddressAutocomplete";
import { usePlatformCountries } from "@/features/shared/usePlatformCountries";
import { PlatformCountry } from "@/models/shared/PlatformCountry";
import andorraCities from '@/data/andorra.cities.json';
import Radar from 'radar-sdk-js';



interface LocationValue {
    lat: number;
    lng: number;
    country?: PlatformCountry;
    city?: string;
    address?: string;
}

interface LocationPickerProps {
    value?: LocationValue;
    onChange: (value: LocationValue) => void;
    showRadius?: boolean;
    radiusMeters?: number;
}

interface CityData {
    city: string;
    zipcode: string;
    lat: number;
    lng: number;
}

const defaultCenter = { lat: 41.3851, lng: 2.1734 }; // Barcelona fallback

// Custom Marker Icon SVG to avoid missing image issues
const customMarkerIcon = new L.DivIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-8 h-8 text-red-500 drop-shadow-md"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`,
    className: "custom-leaflet-marker",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
});



const checkPositionValue = (position: any) => {
    if (position.lat && position.lng) return true;

    return false;
}

// Component for clickable marker

const LocationMarker = ({
    position,
    onSelect,
    allowedCountries,
    selectedCountryCode
}: {
    position?: L.LatLngExpression;
    onSelect: (val: LocationValue) => void;
    allowedCountries: PlatformCountry[] | undefined;
    selectedCountryCode: string | undefined;
}) => {

    useMapEvents({
        async click(e) {
            const lat = e.latlng.lat;
            const lng = e.latlng.lng;

            try {
                // Reverse geocode to check if clicked location is in an allowed country
                const res = await Radar.reverseGeocode({
                    latitude: lat,
                    longitude: lng,
                    layers: ['country']
                });

                if (res.addresses && res.addresses.length > 0) {
                    const countryCode = res.addresses[0].countryCode;

                    // Is the clicked country the same as the selected dropdown country?
                    // Or if no country selected, is it in the platform countries list?
                    const isAllowed = selectedCountryCode
                        ? (countryCode === selectedCountryCode)
                        : (allowedCountries?.some(c => c.code === countryCode));

                    if (isAllowed) {
                        onSelect({ lat, lng });
                    } else {
                        toast.error("Location not allowed", {
                            description: "Please select a location within the allowed country.",
                        });
                    }
                } else {
                    onSelect({ lat, lng }); // Fallback if Radar can't find country
                }
            } catch (error) {
                console.error('Radar reverse geocode error:', error);
                onSelect({ lat, lng }); // Fallback on error
            }
        },
    });
    return position && checkPositionValue(position) ? <Marker icon={customMarkerIcon} position={[(position as any).lat, (position as any).lng]} /> : null;
};

// Component to smoothly pan the map to a location
const MapPanTo: React.FC<{ position: LocationValue; zoom?: number }> = ({ position, zoom }) => {
    const map = useMap();
    useEffect(() => {
        if (position && checkPositionValue(position)) {
            map.flyTo([position.lat, position.lng], zoom ?? map.getZoom(), { duration: 1.2 });
        }
    }, [position.lat, position.lng, zoom]);
    return null;
};

const LocationPicker: React.FC<LocationPickerProps> = ({ value, onChange, showRadius, radiusMeters }) => {

    const {
        platformCountries
    } = usePlatformCountries();

    const [position, setPosition] = useState<LocationValue>(defaultCenter);
    const [country, setCountry] = useState<PlatformCountry>();
    const [city, setCity] = useState(value?.city || "");
    const [address, setAddress] = useState(value?.address || "");
    const [mapZoom, setMapZoom] = useState<number | undefined>(undefined);
    const [isGeolocating, setIsGeolocating] = useState(false);

    // Capitalize city name for display
    const capitalizeCity = (name: string) => {
        return name
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    // Propagate all state changes to the parent
    const emitChange = useCallback((overrides: Partial<LocationValue> = {}) => {
        const merged: LocationValue = {
            lat: overrides.lat ?? position.lat,
            lng: overrides.lng ?? position.lng,
            country: overrides.country !== undefined ? overrides.country : country,
            city: overrides.city !== undefined ? overrides.city : city,
            address: overrides.address !== undefined ? overrides.address : address,
        };
        onChange(merged);
    }, [position, country, city, address, onChange]);

    const handleSelectLocation = (val: LocationValue) => {
        if (val) {
            setPosition(val);
        }

        // Reverse geocode to try to fill in the address
        Radar.reverseGeocode({
            latitude: val.lat,
            longitude: val.lng,
            layers: ['address', 'place']
        }).then(res => {
            if (res.addresses && res.addresses.length > 0) {
                const addr = res.addresses[0];
                const newAddress = addr.formattedAddress || address;
                const newCity = addr.city ? addr.city.toLowerCase() : city;
                setAddress(newAddress);
                setCity(newCity);
                onChange({
                    lat: val.lat,
                    lng: val.lng,
                    country: country,
                    address: newAddress,
                    city: newCity,
                });
            } else {
                onChange({
                    ...val,
                    country: country,
                    address: address,
                    city: city,
                });
            }
        }).catch(() => {
            onChange({
                ...val,
                country: country,
                address: address,
                city: city,
            });
        });
    };

    const handleCitySelection = (selectedCity: string) => {
        setCity(selectedCity);

        // Look up city coords and pan map there
        const citiesList = getCitiesList();
        const cityData = citiesList.find(c => c.city === selectedCity);
        if (cityData) {
            const newPos = { lat: cityData.lat, lng: cityData.lng };
            setPosition(newPos);
            setMapZoom(14); // Zoom in closer for city-level
            onChange({
                lat: newPos.lat,
                lng: newPos.lng,
                country: country,
                address: address,
                city: selectedCity,
            });
        } else {
            onChange({
                ...position,
                country: country,
                address: address,
                city: selectedCity,
            });
        }
    };

    const handleAddressSelect = (adr: any) => {
        const newAddress = adr.formattedAddress;
        setAddress(newAddress);

        let newCity = city;
        if (adr.city) {
            newCity = adr.city.toLowerCase();
            setCity(newCity);
        }

        // Move map + marker to the address coordinates
        if (adr.latitude && adr.longitude) {
            const newPos = { lat: adr.latitude, lng: adr.longitude };
            setPosition(newPos);
            setMapZoom(17); // Street-level zoom for address
            onChange({
                lat: newPos.lat,
                lng: newPos.lng,
                country: country,
                address: newAddress,
                city: newCity,
            });
        } else {
            onChange({
                ...position,
                country: country,
                address: newAddress,
                city: newCity,
            });
        }
    };

    const handleGeolocate = () => {
        if (!navigator.geolocation) {
            toast("Geolocation not supported", {
                description: "Your browser does not support geolocation.",
            });
            return;
        }

        setIsGeolocating(true);

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const coords = {
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                };
                setPosition(coords);
                setMapZoom(16);

                // Reverse geocode the user's location to fill in fields
                try {
                    const res = await Radar.reverseGeocode({
                        latitude: coords.lat,
                        longitude: coords.lng,
                        layers: ['address', 'place']
                    });

                    if (res.addresses && res.addresses.length > 0) {
                        const addr = res.addresses[0];
                        const newAddress = addr.formattedAddress || "";
                        const newCity = addr.city ? addr.city.toLowerCase() : "";
                        setAddress(newAddress);
                        if (newCity) setCity(newCity);

                        // Try to match the country
                        if (addr.countryCode && platformCountries) {
                            const matchedCountry = platformCountries.find(
                                c => c.code === addr.countryCode
                            );
                            if (matchedCountry) {
                                setCountry(matchedCountry);
                            }
                        }

                        onChange({
                            lat: coords.lat,
                            lng: coords.lng,
                            country: country,
                            address: newAddress,
                            city: newCity,
                        });

                        toast.success("Location detected", {
                            description: newAddress || "Your location has been set.",
                        });
                    } else {
                        onChange({ ...coords, country, city, address });
                    }
                } catch {
                    onChange({ ...coords, country, city, address });
                } finally {
                    setIsGeolocating(false);
                }
            },
            () => {
                setIsGeolocating(false);
                toast("Location permission denied", {
                    description: "Please enable location permission or select manually",
                });
            }
        );
    };

    // Sync prop changes
    useEffect(() => {
        if (value) {
            setPosition(value);
            if (value.address) setAddress(value.address);
            if (value.city) setCity(value.city);
        }
    }, [value]);

    useEffect(() => {
        if (platformCountries && value?.country && !country) {
            const match = platformCountries.find(c =>
                c.id === value.country?.id || c.name === value.country?.name
            );
            if (match) setCountry(match);
        }
    }, [platformCountries, value]);



    const getCitiesList = (): CityData[] => {
        switch (country?.code.toLowerCase()) {
            case "ad":
                return andorraCities;

            default:
                return []
        }
    }

    const citiesList = getCitiesList();
    const hasCities = citiesList.length > 0;

    return (
        <div className="space-y-4">

            {/* Country & city dropdowns — selecting these first enables the map and scopes the search */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" />
                        Country
                    </Label>
                    <Select
                        value={country?.code}
                        onValueChange={(val) => {
                            const newCountry = platformCountries?.find(count => count.code == val);
                            setCountry(newCountry);
                            setCity("");
                            if (newCountry) {
                                setPosition({ lat: newCountry.centerLat, lng: newCountry.centerLng })
                                setMapZoom(10); // Country-level zoom
                            }
                            onChange({
                                lat: newCountry ? newCountry.centerLat : position.lat,
                                lng: newCountry ? newCountry.centerLng : position.lng,
                                country: newCountry, city: "", address
                            });
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select Country" />
                        </SelectTrigger>
                        <SelectContent>
                            {platformCountries?.map((c) => (
                                <SelectItem key={c.id} value={c.code}>
                                    {c.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                        <Navigation className="h-3.5 w-3.5" />
                        City
                    </Label>
                    {hasCities ? (
                        <Select
                            value={city}
                            onValueChange={handleCitySelection}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select City" />
                            </SelectTrigger>
                            <SelectContent>
                                {citiesList.map(val => (
                                    <SelectItem key={val.city} value={val.city}>
                                        {capitalizeCity(val.city)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    ) : (
                        <Input
                            value={city}
                            placeholder={country ? "Type city name" : "Select a country first"}
                            disabled={!country}
                            onChange={(e) => {
                                const newCity = e.target.value;
                                setCity(newCity);
                                emitChange({ city: newCity });
                            }}
                        />
                    )}
                </div>
            </div>

            {/* Search + geolocate row */}
            <div className="space-y-1.5">
                <Label className="font-medium text-sm text-gray-700 flex items-center gap-1.5">
                    <Search className="h-3.5 w-3.5" />
                    Search address
                </Label>
                <div className="flex gap-2">
                    <AddressAutocomplete
                        onSelect={handleAddressSelect}
                        country={country}
                    />

                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={handleGeolocate}
                        title="Use my location"
                        disabled={isGeolocating}
                        className="shrink-0"
                    >
                        <LocateFixed className={`h-4 w-4 ${isGeolocating ? 'animate-pulse' : ''}`} />
                    </Button>
                </div>
            </div>

            {/* Editable address field */}
            <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">Address</Label>
                <Input
                    value={address}
                    maxLength={80}
                    placeholder="Street address (auto-filled or type manually)"
                    onChange={(e) => {
                        const newAddress = e.target.value;
                        setAddress(newAddress);
                        emitChange({ address: newAddress });
                    }}
                />
            </div>

            {/* Map */}
            <div className="h-80 w-full rounded-lg overflow-hidden border border-gray-200 z-0 shadow-sm">
                {
                    country ? (
                        <MapContainer
                            key={country.code} /* Only remount when country changes */
                            center={[
                                position.lat || country.centerLat,
                                position.lng || country.centerLng
                            ]}
                            zoom={mapZoom ?? 13}
                            scrollWheelZoom
                            maxBounds={[
                                [country.centerLat - 2, country.centerLng - 2], // South West
                                [country.centerLat + 2, country.centerLng + 2]  // North East
                            ]}
                            maxBoundsViscosity={1.0}
                            minZoom={6}
                            style={{ height: "100%", width: "100%", zIndex: 0 }}
                        >
                            <TileLayer
                                attribution='© <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <LocationMarker
                                position={position as any}
                                onSelect={handleSelectLocation}
                                allowedCountries={platformCountries}
                                selectedCountryCode={country.code}
                            />
                            {showRadius && radiusMeters ? (
                                <Circle
                                    center={[position.lat, position.lng]}
                                    radius={radiusMeters}
                                    pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.2 }}
                                />
                            ) : null}
                            <MapPanTo
                                position={position}
                                zoom={mapZoom}
                            />
                        </MapContainer>
                    ) : (
                        <LocationPlaceholderCard />
                    )
                }

            </div>

            {/* Hint text */}
            {country && (
                <p className="text-xs text-muted-foreground text-center">
                    Click anywhere on the map to drop a pin, or use the search bar above
                </p>
            )}
        </div>
    );
};

export default LocationPicker;