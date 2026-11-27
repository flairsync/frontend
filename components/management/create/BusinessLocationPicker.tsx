
import React, { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from "@/components/ui/combobox";
import { Button } from "@/components/ui/button";
import { LocateFixed, MapPin, Navigation, Search } from "lucide-react";
import { toast } from "sonner";
import { LocationPlaceholderCard } from "./LocationPlaceholderCard";
import { AddressAutocomplete } from "@/components/inputs/AddressAutocomplete";
import { usePlatformCountries } from "@/features/shared/usePlatformCountries";
import { CountryStatus, PlatformCountry } from "@/models/shared/PlatformCountry";
import andorraCities from '@/data/andorra.cities.json';
import { capitalizeCity } from '@/utils/cityLabel';
import Radar from 'radar-sdk-js';
import 'radar-sdk-js/dist/radar.css';



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

const defaultCenter = { lat: 42.5063, lng: 1.5218 }; // Andorra center

const getMinZoom = (c: PlatformCountry) =>
    c.code.toLowerCase() === 'ad' ? 11 : 6;

// Custom Marker Icon SVG to avoid missing image issues
const customMarkerIcon = new L.DivIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-8 h-8 text-primary drop-shadow-md"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`,
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
    const { t } = useTranslation("management");

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
                        toast.error(t("create_business_page.step3.location_not_allowed_title"), {
                            description: t("create_business_page.step3.location_not_allowed_description"),
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

    const { t } = useTranslation("management");

    const {
        platformCountries
    } = usePlatformCountries();

    const [position, setPosition] = useState<LocationValue>(defaultCenter);
    const [country, setCountry] = useState<PlatformCountry>();
    const [city, setCity] = useState(value?.city || "");
    const [address, setAddress] = useState(value?.address || "");
    const [mapZoom, setMapZoom] = useState<number | undefined>(undefined);
    const [isGeolocating, setIsGeolocating] = useState(false);
    // KAN-90: geocoded center of the free-text city (Spain/France — Andorra's city dropdown
    // already carries its own lat/lng, see handleCitySelection). Biases the address
    // autocomplete toward the right city and centers the map once the city resolves, instead
    // of leaving the autocomplete to search the whole country and the map parked on the
    // country's center.
    const [cityCoords, setCityCoords] = useState<{ lat: number; lng: number } | undefined>(undefined);

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
                const newAddress = addr.formattedAddress || addr.addressLabel || addr.placeLabel || address;
                // N10 (QA Retest, 2026-11-18): was .toLowerCase()'d, so the stored city (shown
                // on its own on the guest page's info card) read e.g. "andorra la vella" —
                // Radar already returns it properly cased, same as the rest of the address.
                const newCity = addr.city || city;
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
        // P1-1 (QA round 4, 2026-11-19): the Select's controlled `value` (and the stored/
        // persisted city) is the capitalized display form, so the SelectItem `value`s must
        // match that same capitalized form too — otherwise Radix can't find a matching item
        // after selection (or on edit-load, since the saved city is also capitalized) and the
        // trigger falls back to the empty placeholder. `selectedCity` here is already
        // capitalized; look up the underlying raw city data by capitalizing each entry to
        // compare, not by equality against the raw lowercase JSON values.
        setCity(selectedCity);

        // Look up city coords and pan map there
        const citiesList = getCitiesList();
        const cityData = citiesList.find(c => capitalizeCity(c.city) === selectedCity);
        if (cityData) {
            const newPos = { lat: cityData.lat, lng: cityData.lng };
            setPosition(newPos);
            setCityCoords(newPos); // KAN-90: bias the address search toward this city too
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

    // KAN-90: for countries whose city field is free text (no bundled lat/lng, unlike
    // Andorra's dropdown), resolve the typed city to a point once the owner is done typing
    // so the map can center on it and the address search below can be biased toward it.
    const handleFreeTextCityBlur = async () => {
        const typedCity = city.trim();
        if (!typedCity || !country) {
            setCityCoords(undefined);
            return;
        }
        try {
            const res = await Radar.forwardGeocode({
                query: `${typedCity}, ${country.name}`,
                country: country.code,
                layers: ['locality', 'place'],
            });
            const match = res.addresses?.[0];
            if (match) {
                const newPos = { lat: match.latitude, lng: match.longitude };
                setCityCoords(newPos);
                setPosition(newPos);
                setMapZoom(12);
            }
        } catch (error) {
            console.error('Radar forward geocode (city) error:', error);
        }
    };

    const handleAddressSelect = (adr: any) => {
        const newAddress = adr.formattedAddress;
        setAddress(newAddress);

        let newCity = city;
        if (adr.city) {
            newCity = adr.city;
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
            toast(t("create_business_page.step3.geolocation_not_supported_title"), {
                description: t("create_business_page.step3.geolocation_not_supported_description"),
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
                        const newAddress = addr.formattedAddress || addr.addressLabel || addr.placeLabel || "";
                        const newCity = addr.city || "";
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

                        toast.success(t("create_business_page.step3.location_detected_title"), {
                            description: newAddress || t("create_business_page.step3.location_detected_description"),
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
                toast(t("create_business_page.step3.location_permission_denied_title"), {
                    description: t("create_business_page.step3.location_permission_denied_description"),
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
                        {t("create_business_page.step3.country_label")}
                    </Label>
                    {/* Usability audit (QA Test Report, 2026-11-18): plain Select had no search —
                        fine for 2 countries (AD/ES), already cramped now that Italy is active too,
                        and will only get worse as more markets go live. */}
                    <Combobox
                        items={platformCountries?.filter(c => c.status === CountryStatus.ACTIVE) ?? []}
                        value={country ?? null}
                        itemToStringLabel={(c: PlatformCountry) => t(`create_business_page.step3.countries.${c.code}`, c.name)}
                        onValueChange={(newCountry: PlatformCountry | null) => {
                            setCountry(newCountry ?? undefined);
                            setCity("");
                            setAddress("");
                            if (newCountry) {
                                setPosition({ lat: newCountry.centerLat, lng: newCountry.centerLng })
                                setMapZoom(10); // Country-level zoom
                            }
                            onChange({
                                lat: newCountry ? newCountry.centerLat : position.lat,
                                lng: newCountry ? newCountry.centerLng : position.lng,
                                country: newCountry ?? undefined, city: "", address: ""
                            });
                        }}
                    >
                        <ComboboxInput placeholder={t("create_business_page.step3.select_country_placeholder")} />
                        <ComboboxContent>
                            <ComboboxEmpty>{t("create_business_page.step3.no_countries_found")}</ComboboxEmpty>
                            <ComboboxList>
                                {(c: PlatformCountry) => (
                                    <ComboboxItem key={c.id} value={c}>
                                        {t(`create_business_page.step3.countries.${c.code}`, c.name)}
                                    </ComboboxItem>
                                )}
                            </ComboboxList>
                        </ComboboxContent>
                    </Combobox>
                </div>

                <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                        <Navigation className="h-3.5 w-3.5" />
                        {t("create_business_page.step3.city_label")}
                    </Label>
                    {hasCities ? (
                        <Select
                            value={city}
                            onValueChange={handleCitySelection}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={t("create_business_page.step3.select_city_placeholder")} />
                            </SelectTrigger>
                            <SelectContent>
                                {citiesList.map(val => (
                                    <SelectItem key={val.city} value={capitalizeCity(val.city)}>
                                        {capitalizeCity(val.city)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    ) : (
                        <Input
                            value={city}
                            placeholder={country ? t("create_business_page.step3.type_city_placeholder") : t("create_business_page.step3.select_country_first_placeholder")}
                            disabled={!country}
                            onChange={(e) => {
                                const newCity = e.target.value;
                                setCity(newCity);
                                setCityCoords(undefined);
                                emitChange({ city: newCity });
                            }}
                            onBlur={handleFreeTextCityBlur}
                        />
                    )}
                </div>
            </div>

            {/* Search + geolocate row */}
            <div className="space-y-1.5">
                <Label className="font-medium text-sm text-gray-700 flex items-center gap-1.5">
                    <Search className="h-3.5 w-3.5" />
                    {t("create_business_page.step3.search_address_label")}
                </Label>
                <div className="flex gap-2">
                    <AddressAutocomplete
                        key={country?.code} /* P1-7 (QA round 6, 2026-11-20): remount on country change so its
                           internal query text (otherwise unreset — it has no external value/reset prop)
                           doesn't carry over from the previous country. Same remount-on-country-change
                           pattern already used for the map below. */
                        onSelect={handleAddressSelect}
                        country={country}
                        near={cityCoords}
                        city={city}
                        placeholder={t("create_business_page.step3.search_address_placeholder")}
                        noCountryMessage={t("create_business_page.step3.select_country_first_placeholder")}
                    />

                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={handleGeolocate}
                        title={t("create_business_page.step3.use_my_location_title")}
                        disabled={isGeolocating}
                        className="shrink-0"
                    >
                        <LocateFixed className={`h-4 w-4 ${isGeolocating ? 'animate-pulse' : ''}`} />
                    </Button>
                </div>
            </div>

            {/* Editable address field */}
            <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">{t("create_business_page.step3.address_label")}</Label>
                <Input
                    value={address}
                    maxLength={80}
                    placeholder={t("create_business_page.step3.street_address_placeholder")}
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
                            minZoom={getMinZoom(country)}
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
                    {t("create_business_page.step3.map_hint")}
                </p>
            )}
        </div>
    );
};

export default LocationPicker;