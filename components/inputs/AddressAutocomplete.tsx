'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Command, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import Radar from 'radar-sdk-js';

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
}

export const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
    onSelect,
    placeholder = 'Search address...',
}) => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const debounceRef = useRef<any>(null);

    // Fetch suggestions after 300ms of idle typing
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (!query) {
            setSuggestions([]);
            setShowDropdown(false);
            return;
        }

        debounceRef.current = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await Radar.autocomplete({
                    query,
                    limit: 5,
                    layers: ['address', 'place']
                });

                if (res.addresses) {
                    const addresses = res.addresses.map((a: any) => {
                        return {
                            formattedAddress: a.formattedAddress || a.label || a.address, // fallback fields
                            latitude: a.latitude,
                            longitude: a.longitude,
                            country: a.country,
                            region: a.region,
                            city: a.city,
                            postalCode: a.postalCode,
                        };
                    });
                    setSuggestions(addresses);
                    setShowDropdown(true);
                } else {
                    setSuggestions([]);
                    setShowDropdown(false);
                }
            } catch (error) {
                console.error('Radar autocomplete error:', error);
            } finally {
                setLoading(false);
            }
        }, 300);


        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [query]);

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
        setSuggestions([]);
        setShowDropdown(false);
    };

    return (
        <div className="relative w-full">
            <Input
                placeholder={placeholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full"
            />

            {showDropdown && (
                <Command className="absolute z-50 mt-1 w-full bg-white shadow-lg rounded-md  overflow-y-auto">
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
