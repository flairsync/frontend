import React from 'react';
import { X, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { DiscoveryBusinessProfile } from '@/models/discovery/DiscoveryBusinessProfile';

interface DinerModeHeaderProps {
    profile: DiscoveryBusinessProfile;
    tableLabel: string | null;
    onExit: () => void;
}

export default function DinerModeHeader({ profile, tableLabel, onExit }: DinerModeHeaderProps) {
    const { t } = useTranslation('diner');
    return (
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border/40">
            <div className="flex items-center justify-between px-4 h-14">
                <div className="flex items-center gap-3 min-w-0">
                    {profile.logo && (
                        <img
                            src={profile.logo}
                            alt={profile.name}
                            className="w-8 h-8 rounded-full object-cover shrink-0"
                        />
                    )}
                    <div className="min-w-0">
                        <p className="font-semibold text-sm truncate leading-tight">{profile.name}</p>
                        {tableLabel && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <MapPin className="w-3 h-3 shrink-0" />
                                <span className="truncate">{t('header.table_label', { table: tableLabel })}</span>
                            </p>
                        )}
                    </div>
                </div>

                <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full shrink-0"
                    onClick={onExit}
                    title={t('header.leave_diner_mode')}
                >
                    <X className="w-4 h-4" />
                </Button>
            </div>
        </header>
    );
}
