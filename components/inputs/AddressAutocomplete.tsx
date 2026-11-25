'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Command, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import Radar from 'radar-sdk-js';
import 'radar-sdk-js/dist/radar.css';
import { PlatformCountry } from '@/models/shared/PlatformCountry';

interface AddressDetails {
    formattedAddress: string;
    latitude: number;
    longitude: number;
    country?: string;
    region?: string;
    city?: string;
    postalCode?: string;
}

interface AddressAutocompleteProps {
    onSelect: (address: AddressDetails) => void;
    placeholder?: string;
    // P1-12 (QA round 6, 2026-11-20): this component had no i18n of its own and no way for
    // a caller to supply translated copy for its "no country selected yet" fallback — the
    // caller already has the right translated string (BusinessLocationPicker does), it just
    // wasn't being passed in.
    noCountryMessage?: string;
    country?: PlatformCountry
    // KAN-90: biases results toward this point (typically the selected city's center) so a
    // query like "10 Rue de Rivoli" in Paris doesn't match a same-named street in a different
    // town across the country.
    near?: { lat: number; lng: number }
}

function useDebouncedValue<T>(value: T, delayMs: number): T {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delayMs);
        return () => clearTimeout(t);
    }, [value, delayMs]);
    return debounced;
}

export const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
    onSelect,
    placeholder = 'Search address...',
    noCountryMessage = 'Please select a country first',
    country,
    near
}) => {
    const [query, setQuery] = useState('');
    // Closed right after a selection so the dropdown doesn't flash back open
    // once `query` is set to the selected address text; cleared on the next keystroke.
    const [suppressDropdown, setSuppressDropdown] = useState(false);
    const debouncedQuery = useDebouncedValue(query, 300);
    const searchReady = !!country && debouncedQuery.length >= 3 && !suppressDropdown;

    const { data: suggestions = [], isFetching: loading, error } = useQuery({
        queryKey: ['address_autocomplete', debouncedQuery, country?.code, near?.lat, near?.lng],
        queryFn: async () => {
            const res = await Radar.autocomplete({
                query: debouncedQuery,
                limit: 5,
                layers: ['address', 'place'],
                countryCode: country?.code,
                near: near ? { latitude: near.lat, longitude: near.lng } : undefined,
            });
            if (!res.addresses) return [];
            return res.addresses.map((a: any) => ({
                formattedAddress: a.formattedAddress || a.label || a.address, // fallback fields
                latitude: a.latitude,
                longitude: a.longitude,
                country: a.country,
                region: a.region,
                city: a.city,
                postalCode: a.postalCode,
            }));
        },
        enabled: searchReady,
        staleTime: 30_000,
    });

    useEffect(() => {
        if (error) console.error('Radar autocomplete error:', error);
    }, [error]);

    const showDropdown = !!country && query.length >= 3 && !suppressDropdown;

    const handleSelect = (addr: any) => {
        const details: AddressDetails = {
            formattedAddress: addr.formattedAddress,
            latitude: addr.latitude,
            longitude: addr.longitude,
            country: addr.country,
            region: addr.region,
            city: addr.city,
            postalCode: addr.postalCode,
        };
        onSelect(details);
        setQuery(addr.formattedAddress);
        setSuppressDropdown(true);
    };

    if (!country) return <>
        {noCountryMessage}
    </>
    return (
        <div className="relative w-full">
            <Input
                placeholder={placeholder}
                value={query}
                onChange={(e) => {
                    setQuery(e.target.value);
                    setSuppressDropdown(false);
                }}
                className="w-full"
            />

            {showDropdown && (
                <Command className="absolute z-50 mt-1 w-full bg-popover shadow-lg rounded-md  overflow-y-auto">
                    {loading && <CommandEmpty>Loading...</CommandEmpty>}
                    {!loading && suggestions.length === 0 && query && <CommandEmpty>No addresses found</CommandEmpty>}
                    <CommandGroup>
                        {suggestions.map((addr) => (
                            <CommandItem key={addr.formattedAddress} onSelect={() => handleSelect(addr)}>
                                {addr.formattedAddress}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </Command>
            )}
        </div>
    );
};
