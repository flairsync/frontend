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
    country?: PlatformCountry
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
    country
}) => {
    const [query, setQuery] = useState('');
    // Closed right after a selection so the dropdown doesn't flash back open
    // once `query` is set to the selected address text; cleared on the next keystroke.
    const [suppressDropdown, setSuppressDropdown] = useState(false);
    const debouncedQuery = useDebouncedValue(query, 300);
    const searchReady = !!country && debouncedQuery.length >= 3 && !suppressDropdown;

    const { data: suggestions = [], isFetching: loading, error } = useQuery({
        queryKey: ['address_autocomplete', debouncedQuery, country?.code],
        queryFn: async () => {
            const res = await Radar.autocomplete({
                query: debouncedQuery,
                limit: 5,
                layers: ['address', 'place'],
                countryCode: country?.code,
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
        Please select a country first
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
