import React, { useState } from 'react';
import { UtensilsCrossed, ChevronDown } from 'lucide-react';
import { useAllSeatedReservations } from '@/features/diner-mode/useDinerMode';
import { usePageContext } from 'vike-react/usePageContext';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export default function DinerModeWatcher() {
    const pageContext = usePageContext();
    const isLoggedIn = !!pageContext.user;
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
    const alreadyInDinerMode = currentPath.startsWith('/diner/');

    const { data: seatedReservations } = useAllSeatedReservations();

    if (!isLoggedIn || alreadyInDinerMode) return null;
    if (!seatedReservations || seatedReservations.length === 0) return null;

    const single = seatedReservations.length === 1 ? seatedReservations[0] : null;

    if (single) {
        return (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none flex justify-center">
                <Button
                    className="pointer-events-auto rounded-full shadow-2xl gap-2 px-5 py-3 h-auto font-semibold text-sm animate-bounce"
                    onClick={() => { window.location.href = `/diner/${single.businessId}`; }}
                >
                    <UtensilsCrossed className="w-4 h-4" />
                    You&apos;re seated — Open Diner Mode
                </Button>
            </div>
        );
    }

    // Multiple seated reservations: show a dropdown to pick
    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button className="rounded-full shadow-2xl gap-2 px-5 py-3 h-auto font-semibold text-sm">
                        <UtensilsCrossed className="w-4 h-4" />
                        You&apos;re seated ({seatedReservations.length})
                        <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="mb-2">
                    {seatedReservations.map((r) => (
                        <DropdownMenuItem
                            key={r.id}
                            onClick={() => { window.location.href = `/diner/${r.businessId}`; }}
                        >
                            Open diner — {r.businessId}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
