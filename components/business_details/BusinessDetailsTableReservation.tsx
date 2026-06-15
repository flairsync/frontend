"use client";
import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarIcon, Clock, Users, CheckCircle2, XCircle, Loader2, LayoutGrid, Map } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import BusinessDetailsReserveTableModal from "./BusinessDetailsReserveTableModal";
import { useDiscoveryTableAvailability, useDiscoveryProfile, useDiscoveryFloors } from "@/features/discovery/useDiscovery";
import { parseInTimezone } from "@/lib/dateUtils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { OpeningHours } from "@/models/business/MyBusinessFullDetails";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import FloorPlanPublicView from "./FloorPlanPublicView";

const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

function getOpeningHoursForDate(date: Date, openingHours: OpeningHours[]): OpeningHours | undefined {
    const dayName = DAY_NAMES[date.getDay()];
    return openingHours.find(oh => oh.day.toLowerCase() === dayName);
}

function isDateAvailable(date: Date, openingHours: OpeningHours[]): boolean {
    const oh = getOpeningHoursForDate(date, openingHours);
    return !!oh && !oh.isClosed && oh.periods.length > 0;
}

function generateTimeSlots(oh: OpeningHours, selectedDate: Date): string[] {
    const slots: string[] = [];
    const isToday = new Date().toDateString() === selectedDate.toDateString();
    const nowMinutes = isToday ? new Date().getHours() * 60 + new Date().getMinutes() : -1;

    for (const period of oh.periods) {
        const [openH, openM] = period.open.split(':').map(Number);
        const [closeH, closeM] = period.close.split(':').map(Number);
        let current = openH * 60 + openM;
        const closeMinutes = closeH * 60 + closeM;
        while (current < closeMinutes) {
            if (current > nowMinutes) {
                const h = Math.floor(current / 60).toString().padStart(2, '0');
                const m = (current % 60).toString().padStart(2, '0');
                slots.push(`${h}:${m}`);
            }
            current += 30;
        }
    }
    return slots;
}

function formatTimeSlot(slot: string): string {
    const [h, m] = slot.split(':').map(Number);
    const period = h < 12 ? 'AM' : 'PM';
    const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${displayH}:${m.toString().padStart(2, '0')} ${period}`;
}

type SelectedTable = { id: string; number: string; seats: number };

interface BusinessDetailsTableReservationProps {
    businessId: string;
    tables?: any; // kept for backward compat, data now fetched internally
}

const BusinessDetailsTableReservation: React.FC<BusinessDetailsTableReservationProps> = ({ businessId }) => {
    const [selectedDateObj, setSelectedDateObj] = useState<Date | undefined>(undefined);
    const [calendarOpen, setCalendarOpen] = useState(false);
    const [selectedTime, setSelectedTime] = useState("");
    const [selectedGuests, setSelectedGuests] = useState(1);
    const [selectedTable, setSelectedTable] = useState<SelectedTable | null>(null);
    const [viewMode, setViewMode] = useState<'map' | 'grid'>('grid');

    const { data: profile } = useDiscoveryProfile(businessId);
    const { data: floors = [], isLoading: isFloorsLoading } = useDiscoveryFloors(businessId);

    const today = useMemo(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    }, []);

    const bookingWindowEnd = useMemo(() => {
        const d = new Date(today);
        d.setDate(d.getDate() + (profile?.reservationBookingWindowDays ?? 60));
        return d;
    }, [today, profile?.reservationBookingWindowDays]);

    const disabledDays = useMemo(() => [
        { before: today },
        { after: bookingWindowEnd },
        (date: Date) => {
            if (!profile?.openingHours?.length) return false;
            return !isDateAvailable(date, profile.openingHours);
        },
    ], [today, bookingWindowEnd, profile?.openingHours]);

    const selectedDate = selectedDateObj ? format(selectedDateObj, 'yyyy-MM-dd') : '';

    const openingHoursForSelectedDate = useMemo(() => {
        if (!selectedDateObj || !profile?.openingHours?.length) return undefined;
        return getOpeningHoursForDate(selectedDateObj, profile.openingHours);
    }, [selectedDateObj, profile?.openingHours]);

    const timeSlots = useMemo(() => {
        if (!selectedDateObj || !openingHoursForSelectedDate || openingHoursForSelectedDate.isClosed) return [];
        return generateTimeSlots(openingHoursForSelectedDate, selectedDateObj);
    }, [selectedDateObj, openingHoursForSelectedDate]);

    const guestOptions = useMemo(() => {
        const max = Math.min(profile?.maxPartySize ?? 20, 20);
        return Array.from({ length: max }, (_, i) => i + 1);
    }, [profile?.maxPartySize]);

    const canShowTables = Boolean(selectedDate && selectedTime);

    const reservationTime = useMemo(() => {
        if (!canShowTables) return null;
        return parseInTimezone(`${selectedDate}T${selectedTime}:00`, profile?.timezone);
    }, [selectedDate, selectedTime, canShowTables, profile?.timezone]);

    const { data: availableTablesResponse, isLoading: isAvailabilityLoading } = useDiscoveryTableAvailability(
        businessId,
        { date: reservationTime || "", guestCount: selectedGuests },
        canShowTables && !!reservationTime
    );

    const availableTableIds: string[] = useMemo(
        () => (availableTablesResponse?.map((t: any) => t.id) || []),
        [availableTablesResponse]
    );

    // Flat list of all tables across all floors for the grid view
    const allTables = useMemo(() => {
        const availSet = new Set(availableTableIds);
        return floors.flatMap(f =>
            (f.tables ?? []).map(t => ({
                id: t.id,
                number: t.name || String(t.number),
                seats: t.capacity ?? 2,
                available: canShowTables ? availSet.has(t.id) : true,
                floorName: f.name,
            }))
        );
    }, [floors, availableTableIds, canShowTables]);

    const hasFloorPlan = floors.some(f => (f.tables?.length ?? 0) > 0);

    return (
        <section className="space-y-12" id="reservation-section">
            <BusinessDetailsReserveTableModal
                onClose={() => setSelectedTable(null)}
                isOpen={selectedTable != null}
                businessId={businessId}
                date={selectedDate}
                time={selectedTime}
                guests={selectedGuests}
                tableId={selectedTable?.id || ""}
                tableName={selectedTable?.number || ""}
            />

            {/* Section header */}
            <div className="space-y-2 text-center max-w-2xl mx-auto">
                <h2 className="text-3xl font-bold tracking-tight">Reserve a Table</h2>
                <p className="text-muted-foreground leading-relaxed">
                    Select your preferred date and time to see available tables. We'll make sure everything is ready for your arrival.
                </p>
            </div>

            {/* Date / Time / Guests pickers */}
            <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-8 bg-card border border-border/50 rounded-[2.5rem] shadow-2xl shadow-primary/5">
                {/* Date */}
                <div className="space-y-3">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Date</Label>
                    <div className="relative group">
                        <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-primary z-10 pointer-events-none group-hover:scale-110 transition-transform" size={18} />
                        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="pl-12 h-14 w-full rounded-2xl bg-muted/50 border-none text-md font-bold justify-start hover:bg-muted/70 focus-visible:ring-2 focus-visible:ring-primary/20"
                                >
                                    {selectedDateObj
                                        ? format(selectedDateObj, 'MMM d, yyyy')
                                        : <span className="font-normal text-muted-foreground">Select date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={selectedDateObj}
                                    onSelect={(date) => {
                                        setSelectedDateObj(date);
                                        setSelectedTime('');
                                        setSelectedTable(null);
                                        setCalendarOpen(false);
                                    }}
                                    disabled={disabledDays}
                                    startMonth={today}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>

                {/* Time */}
                <div className="space-y-3">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Time</Label>
                    <div className="relative group">
                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-primary z-10 pointer-events-none group-hover:scale-110 transition-transform" size={18} />
                        <select
                            className="flex h-14 w-full rounded-2xl bg-muted/50 px-12 py-2 text-md font-bold ring-offset-background border-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                            value={selectedTime}
                            onChange={(e) => { setSelectedTime(e.target.value); setSelectedTable(null); }}
                            disabled={!selectedDateObj || timeSlots.length === 0}
                        >
                            <option value="">
                                {!selectedDateObj ? 'Select date first' : timeSlots.length === 0 ? 'No slots available' : 'Select time'}
                            </option>
                            {timeSlots.map(slot => (
                                <option key={slot} value={slot}>{formatTimeSlot(slot)}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Guests */}
                <div className="space-y-3 sm:col-span-2 lg:col-span-1">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Guests</Label>
                    <div className="relative group">
                        <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-primary group-hover:scale-110 transition-transform" size={18} />
                        <select
                            className="flex h-14 w-full rounded-2xl bg-muted/50 px-12 py-2 text-md font-bold ring-offset-background border-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 appearance-none"
                            value={selectedGuests}
                            onChange={(e) => { setSelectedGuests(parseInt(e.target.value)); setSelectedTable(null); }}
                        >
                            {guestOptions.map(n => (
                                <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* View toggle (only show when there is floor data) */}
            {hasFloorPlan && (
                <div className="flex justify-center">
                    <div className="flex bg-muted/50 rounded-2xl p-1 gap-1 border border-border/40">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={cn(
                                "flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all",
                                viewMode === 'grid'
                                    ? "bg-white shadow-sm text-foreground"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <LayoutGrid size={15} />
                            Table List
                        </button>
                        <button
                            onClick={() => setViewMode('map')}
                            className={cn(
                                "flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all",
                                viewMode === 'map'
                                    ? "bg-white shadow-sm text-foreground"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <Map size={15} />
                            Floor Plan
                            <span className="text-[9px] bg-amber-100 text-amber-600 border border-amber-200 rounded px-1 py-0.5 font-black uppercase leading-none">
                                BETA
                            </span>
                        </button>
                    </div>
                </div>
            )}

            {/* Content area */}
            <div className="min-h-[320px]">
                <AnimatePresence mode="wait">

                    {/* Loading: availability query in-flight, or date/time selected but timezone not yet loaded */}
                    {canShowTables && (isAvailabilityLoading || !reservationTime) ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center py-16 gap-4"
                        >
                            <Loader2 className="w-10 h-10 text-primary animate-spin" />
                            <p className="text-muted-foreground font-medium">Checking availability…</p>
                        </motion.div>
                    ) : isFloorsLoading ? (
                        <motion.div
                            key="floors-loading"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center py-16 gap-4"
                        >
                            <Loader2 className="w-10 h-10 text-primary animate-spin" />
                        </motion.div>

                    ) : /* No available tables at all for this time */ canShowTables && availableTablesResponse?.length === 0 ? (
                        <motion.div
                            key="no-availability"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="text-center space-y-4 py-12"
                        >
                            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto text-rose-500">
                                <XCircle size={32} />
                            </div>
                            <p className="text-rose-600 font-semibold">
                                No tables available for {selectedGuests} {selectedGuests === 1 ? 'guest' : 'guests'} at {formatTimeSlot(selectedTime)}.
                            </p>
                            <p className="text-muted-foreground text-sm">Try a different time or party size.</p>
                        </motion.div>

                    ) : canShowTables && viewMode === 'map' && hasFloorPlan ? (
                        /* ── Floor plan view ── */
                        <motion.div
                            key="map"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                        >
                            <FloorPlanPublicView
                                floors={floors}
                                availableTableIds={availableTableIds}
                                canFilter={canShowTables}
                                selectedTableId={selectedTable?.id}
                                onSelectTable={(t) => setSelectedTable({ id: t.id, number: t.number, seats: t.seats })}
                            />
                        </motion.div>

                    ) : allTables.length > 0 ? (
                        /* ── Grid view ── */
                        <motion.div
                            key="grid"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6"
                        >
                            {allTables.map(table => (
                                <motion.button
                                    key={table.id}
                                    whileHover={table.available ? { y: -4, scale: 1.02 } : {}}
                                    whileTap={table.available ? { scale: 0.98 } : {}}
                                    disabled={!table.available}
                                    className={cn(
                                        "relative p-6 rounded-[2rem] border transition-all flex flex-col items-center gap-4",
                                        table.available
                                            ? "bg-card border-border/50 hover:border-primary hover:shadow-2xl hover:shadow-primary/10 cursor-pointer"
                                            : "bg-muted/30 border-transparent opacity-60 cursor-not-allowed"
                                    )}
                                    onClick={() => setSelectedTable({ id: table.id, number: table.number, seats: table.seats })}
                                >
                                    <div className={cn("p-4 rounded-2xl", table.available ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>
                                        <Users size={32} />
                                    </div>
                                    <div className="text-center space-y-1">
                                        <span className="text-lg font-black block">Table {table.number}</span>
                                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{table.seats} Seats</span>
                                        {floors.length > 1 && (
                                            <span className="text-[10px] text-muted-foreground block">{table.floorName}</span>
                                        )}
                                    </div>
                                    <div className="absolute top-4 right-4">
                                        {table.available
                                            ? <CheckCircle2 size={18} className="text-emerald-500" />
                                            : <XCircle size={18} className="text-muted-foreground" />}
                                    </div>
                                </motion.button>
                            ))}
                        </motion.div>

                    ) : !canShowTables ? (
                        /* ── Placeholder before date/time selection ── */
                        <motion.div
                            key="placeholder"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="text-center space-y-4 py-12"
                        >
                            {viewMode === 'map' && hasFloorPlan ? (
                                <FloorPlanPublicView
                                    floors={floors}
                                    availableTableIds={[]}
                                    canFilter={false}
                                    onSelectTable={() => {}}
                                />
                            ) : (
                                <>
                                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto text-muted-foreground">
                                        <CalendarIcon size={32} />
                                    </div>
                                    <p className="text-muted-foreground font-medium italic">
                                        Please select a date and time to view available tables.
                                    </p>
                                </>
                            )}
                        </motion.div>

                    ) : (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="text-center space-y-4 py-12"
                        >
                            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                                <XCircle size={32} className="text-muted-foreground opacity-40" />
                            </div>
                            <p className="text-muted-foreground font-medium italic">No tables configured for this venue yet.</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
};

export default BusinessDetailsTableReservation;
