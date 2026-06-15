import React, { useState, useEffect, useCallback } from 'react';
import { BellRing, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { callWaiterApiCall } from '@/features/discovery/discovery.api';

const COOLDOWN_SECONDS = 60;

interface DinerCallWaiterButtonProps {
    businessId: string;
    tableId?: string;
    reservationId?: string;
}

export default function DinerCallWaiterButton({
    businessId,
    tableId,
    reservationId,
}: DinerCallWaiterButtonProps) {
    const [cooldown, setCooldown] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (cooldown <= 0) return;
        const interval = setInterval(() => {
            setCooldown((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [cooldown]);

    const handleCall = useCallback(async () => {
        if (cooldown > 0 || isLoading) return;

        setIsLoading(true);
        try {
            await callWaiterApiCall(businessId, { tableId, reservationId });
            toast.success('Your waiter has been notified', {
                description: 'Someone will be with you shortly.',
                duration: 3000,
            });
            setCooldown(COOLDOWN_SECONDS);
        } catch {
            toast.error('Could not reach staff', {
                description: 'Please try again or ask for assistance directly.',
            });
        } finally {
            setIsLoading(false);
        }
    }, [cooldown, isLoading, businessId, tableId, reservationId]);

    const isDisabled = cooldown > 0 || isLoading;

    return (
        <Button
            onClick={handleCall}
            disabled={isDisabled}
            variant="default"
            className={cn(
                'rounded-full shadow-lg gap-2 transition-all',
                isDisabled && 'opacity-70'
            )}
        >
            {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <BellRing className="w-4 h-4" />
            )}
            {isLoading ? (
                <span>Calling…</span>
            ) : cooldown > 0 ? (
                <span>Waiter notified ({cooldown}s)</span>
            ) : (
                <span>Call Waiter</span>
            )}
        </Button>
    );
}
