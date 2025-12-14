
import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents, GeoJSON } from "react-leaflet";
import L, { LatLngBoundsExpression } from "leaflet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { LocateFixed } from "lucide-react";
import { toast } from "sonner";
import { LocationPlaceholderCard } from "./LocationPlaceholderCard";
import { AddressAutocomplete } from "@/components/inputs/AddressAutocomplete";
import { usePlatformCountries } from "@/features/shared/usePlatformCountries";
import { PlatformCountry } from "@/models/shared/PlatformCountry";
import andorraCities from '@/data/andorra.cities.json';



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
}

const defaultCenter = { lat: 41.3851, lng: 2.1734 }; // Barcelona fallback

// Fix for default Leaflet marker icons
L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});



const checkPositionValue = (position: any) => {
    if (position.lat && position.lng) return true;

    return false;
}

// Component for clickable marker

const LocationMarker = ({
    position,
    onSelect,
}: {
    position?: L.LatLngExpression;
    onSelect: (val: LocationValue) => void;
}) => {

    useMapEvents({
        click(e) {
            onSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
        },
    });
    return position && checkPositionValue(position) ? <Marker position={position} /> : null;
};

// Component to smoothly pan the map to a location
const MapPanTo: React.FC<{ position: LocationValue }> = ({ position }) => {
    const map = useMap();
    useEffect(() => {
        if (position && checkPositionValue(position)) {
            map.flyTo([position.lat, position.lng], 13, { duration: 1.5 });
        }
    }, [position]);
    return null;
};

const LocationPicker: React.FC<LocationPickerProps> = ({ value, onChange }) => {

    const {
        platformCountries
    } = usePlatformCountries();

    const [position, setPosition] = useState<LocationValue>(defaultCenter);
    const [country, setCountry] = useState<PlatformCountry>();
    const [city, setCity] = useState(value?.city || "");
    const [address, setAddress] = useState(value?.address || "");

    const handleSelectLocation = (val: LocationValue) => {
        if (val) {
            setPosition(val);
        }
        onChange({
            ...val,
            country: country,
            address: address,
            city: city,
        });
    };

    const handleCitySelection = (city: string) => {
        setCity(city);
        onChange({
            ...position,
            country: country,
            address: address,
            city: city,
        });
    }



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
                //  onChange({ ...coords, country, city, address });
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



    const getCitiesList = () => {
        console.log(country);
        switch (country?.code.toLowerCase()) {
            case "ad":
                return andorraCities;
                break;

            default:
                return []
                break;
        }
    }

    return (
        <div className="space-y-4">
            <Label className="font-medium text-sm text-gray-700">Location search</Label>

            {/* Search input */}
            <div className="flex gap-2">

                <AddressAutocomplete
                    onSelect={(adr) => {
                        console.log(adr);
                        setAddress(adr.formattedAddress);
                        if (adr.city) {
                            setCity(adr.city.toLowerCase())
                        }
                    }}
                    country={country}
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


            <div className="">

                <Label className="text-sm">Address</Label>

                <Input
                    value={address}
                    maxLength={50}
                    onChange={(e) => {
                        setAddress(e.currentTarget.value);
                    }}
                />
            </div>

            {/* Country & city dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 z-50">
                <div>
                    <Label className="text-sm">Country</Label>
                    <Select
                        value={country?.code}
                        onValueChange={(val) => {
                            setCountry(platformCountries?.find(count => count.code == val));
                            setCity("");
                            //  onChange({ ...position, country: val, city: "", address });
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

                <div>
                    <Label className="text-sm">City</Label>
                    <Select
                        value={city}
                        onValueChange={(val) => {
                            handleCitySelection(val)
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select City" />
                        </SelectTrigger>
                        <SelectContent>
                            {
                                getCitiesList().map(val => {
                                    return <SelectItem key={val.city} value={val.city}>
                                        {val.city}
                                    </SelectItem>
                                })
                            }

                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Map */}
            <div className="h-80 w-full rounded-md overflow-hidden border border-gray-200 z-0">
                {
                    country ? <>

                        <MapContainer
                            center={[country.centerLat, country.centerLng]}
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
                            <MapPanTo
                                position={position}
                            />

                        </MapContainer>
                    </> : <><LocationPlaceholderCard /></>
                }

            </div>
        </div>
    );
};

export default LocationPicker;



/*



{!checkPositionValue() ? (
                    <MapContainer
                        // center={[position.lat, position.lng]}
                        zoom={13}
                        scrollWheelZoom
                        style={{ height: "100%", width: "100%", zIndex: 0 }}
                    >
                        <TileLayer
                            attribution='© <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                       
                    </MapContainer>
                ) : (
                    <LocationPlaceholderCard />
                )}
*/