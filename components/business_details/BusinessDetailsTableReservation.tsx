"use client";
import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarIcon, Clock, Users, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import BusinessDetailsReserveTableModal from "./BusinessDetailsReserveTableModal";
import { FloorPlanLayout } from "@/features/floor-plan/components/types";
import { useDiscoveryTableAvailability, useDiscoveryProfile } from "@/features/discovery/useDiscovery";
import { parseInTimezone } from "@/lib/dateUtils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { OpeningHours } from "@/models/business/MyBusinessFullDetails";
import { format } from "date-fns";

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

type Table = {
    id: string;
    number: string;
    seats: number;
    available: boolean;
};

interface BusinessDetailsTableReservationProps {
    tables?: FloorPlanLayout[];
    businessId: string;
}

const BusinessDetailsTableReservation: React.FC<BusinessDetailsTableReservationProps> = ({ tables = [], businessId }) => {
    const [selectedDateObj, setSelectedDateObj] = useState<Date | undefined>(undefined);
    const [calendarOpen, setCalendarOpen] = useState(false);
    const [selectedTime, setSelectedTime] = useState("");
    const [selectedGuests, setSelectedGuests] = useState(1);
    const [selectedTable, setSelectedTable] = useState<Table | null>(null);

    const { data: profile } = useDiscoveryProfile(businessId);

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

    const extractedTables = useMemo(() => {
        const allTables: Table[] = [];
        const availableTableIds = new Set(availableTablesResponse?.map((t: any) => t.id) || []);

        if (Array.isArray(tables)) {
            tables.forEach(layout => {
                if (Array.isArray((layout as any).tables)) {
                    (layout as any).tables.forEach((t: any) => {
                        allTables.push({
                            id: t.id,
                            number: t.name || t.number?.toString() || 'T',
                            seats: t.capacity || 2,
                            available: canShowTables ? availableTableIds.has(t.id) : true
                        });
                    });
                } else {
                    layout.elements?.forEach(el => {
                        if (el.type === 'table') {
                            allTables.push({
                                id: el.id,
                                number: el.label || el.tableId || 'T',
                                seats: el.props?.seats || 2,
                                available: canShowTables ? availableTableIds.has(el.id) : true
                            });
                        }
                    });
                }
            });
        }
        return allTables;
    }, [tables, availableTablesResponse, canShowTables]);

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

            <div className="space-y-2 text-center max-w-2xl mx-auto">
                <h2 className="text-3xl font-bold tracking-tight">Reserve a Table</h2>
                <p className="text-muted-foreground leading-relaxed">
                    Select your preferred date and time to see available tables. We'll make sure everything is ready for your arrival.
                </p>
            </div>

            <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-8 bg-card border border-border/50 rounded-[2.5rem] shadow-2xl shadow-primary/5">
                {/* Date — calendar popover, only open days within booking window */}
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
                                        setCalendarOpen(false);
                                    }}
                                    disabled={disabledDays}
                                    startMonth={today}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>

                {/* Time — slots derived from the selected day's opening hours */}
                <div className="space-y-3">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Time</Label>
                    <div className="relative group">
                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-primary z-10 pointer-events-none group-hover:scale-110 transition-transform" size={18} />
                        <select
                            className="flex h-14 w-full rounded-2xl bg-muted/50 px-12 py-2 text-md font-bold ring-offset-background border-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 appearance-none bg-no-repeat disabled:opacity-50 disabled:cursor-not-allowed"
                            value={selectedTime}
                            onChange={(e) => setSelectedTime(e.target.value)}
                            disabled={!selectedDateObj || timeSlots.length === 0}
                        >
                            <option value="">
                                {!selectedDateObj
                                    ? 'Select date first'
                                    : timeSlots.length === 0
                                        ? 'No slots available'
                                        : 'Select time'}
                            </option>
                            {timeSlots.map(slot => (
                                <option key={slot} value={slot}>{formatTimeSlot(slot)}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Guests — capped at maxPartySize */}
                <div className="space-y-3 sm:col-span-2 lg:col-span-1">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Guests</Label>
                    <div className="relative group">
                        <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-primary group-hover:scale-110 transition-transform" size={18} />
                        <select
                            className="flex h-14 w-full rounded-2xl bg-muted/50 px-12 py-2 text-md font-bold ring-offset-background border-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 appearance-none bg-no-repeat"
                            value={selectedGuests}
                            onChange={(e) => setSelectedGuests(parseInt(e.target.value))}
                        >
                            {guestOptions.map(n => (
                                <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Tables grid */}
            <div className="min-h-[300px] flex items-center justify-center">
                <AnimatePresence mode="wait">
                    {!canShowTables ? (
                        <motion.div
                            key="placeholder"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center space-y-4"
                        >
                            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto text-muted-foreground">
                                <CalendarIcon size={32} />
                            </div>
                            <p className="text-muted-foreground font-medium italic">
                                Please select a date and time to view available tables.
                            </p>
                        </motion.div>
                    ) : isAvailabilityLoading ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center space-y-4 py-8"
                        >
                            <Loader2 className="w-12 h-12 text-primary animate-spin" />
                            <p className="text-muted-foreground font-medium italic">Checking availability...</p>
                        </motion.div>
                    ) : availableTablesResponse?.length === 0 ? (
                        <motion.div
                            key="no-availability"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center space-y-4"
                        >
                            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto text-rose-500">
                                <XCircle size={32} />
                            </div>
                            <p className="text-rose-600 font-medium">
                                No tables are available for {selectedGuests} {selectedGuests === 1 ? 'guest' : 'guests'} at {selectedTime}.
                            </p>
                            <p className="text-muted-foreground text-sm">
                                Please try selecting a different time or adjusting your party size.
                            </p>
                        </motion.div>
                    ) : extractedTables.length > 0 ? (
                        <motion.div
                            key="grid"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 w-full"
                        >
                            {extractedTables.map((table) => (
                                <motion.button
                                    key={table.id}
                                    whileHover={table.available ? { y: -4, scale: 1.02 } : {}}
                                    whileTap={table.available ? { scale: 0.98 } : {}}
                                    disabled={!table.available}
                                    className={`relative p-6 rounded-[2rem] border transition-all flex flex-col items-center gap-4 ${table.available
                                        ? "bg-card border-border/50 hover:border-primary hover:shadow-2xl hover:shadow-primary/10 cursor-pointer"
                                        : "bg-muted/30 border-transparent opacity-60 cursor-not-allowed"
                                        }`}
                                    onClick={() => setSelectedTable(table)}
                                >
                                    <div className={`p-4 rounded-2xl ${table.available ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                                        <Users size={32} />
                                    </div>
                                    <div className="text-center space-y-1">
                                        <span className="text-lg font-black block">Table {table.number}</span>
                                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{table.seats} Seats</span>
                                    </div>
                                    <div className="absolute top-4 right-4">
                                        {table.available ? (
                                            <CheckCircle2 size={18} className="text-emerald-500" />
                                        ) : (
                                            <XCircle size={18} className="text-muted-foreground" />
                                        )}
                                    </div>
                                </motion.button>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center space-y-4"
                        >
                            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto text-muted-foreground">
                                <XCircle size={32} />
                            </div>
                            <p className="text-muted-foreground font-medium italic">
                                No tables configured for this business yet.
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
};

export default BusinessDetailsTableReservation;
