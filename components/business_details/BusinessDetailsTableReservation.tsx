"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarIcon, Clock, Users, CheckCircle2, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import BusinessDetailsReserveTableModal from "./BusinessDetailsReserveTableModal";

type Table = {
    id: number;
    number: number;
    seats: number;
    available: boolean;
};

const tablesData: Table[] = [
    { id: 1, number: 1, seats: 2, available: true },
    { id: 2, number: 2, seats: 4, available: true },
    { id: 3, number: 3, seats: 4, available: false },
    { id: 4, number: 4, seats: 2, available: true },
    { id: 5, number: 5, seats: 6, available: true },
    { id: 6, number: 6, seats: 2, available: false },
    { id: 7, number: 7, seats: 4, available: true },
    { id: 8, number: 8, seats: 8, available: true },
];

const BusinessDetailsTableReservation: React.FC = () => {
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedTime, setSelectedTime] = useState("");
    const [selectedTable, setSelectedTable] = useState<Table | null>(null);

    const canShowTables = selectedDate && selectedTime;

    return (
        <section className="space-y-12">
            <BusinessDetailsReserveTableModal
                onClose={() => setSelectedTable(null)}
                onSubmit={() => setSelectedTable(null)}
                isOpen={selectedTable != null}
            />

            <div className="space-y-2 text-center max-w-2xl mx-auto">
                <h2 className="text-3xl font-bold tracking-tight">Reserve a Table</h2>
                <p className="text-muted-foreground leading-relaxed">
                    Select your preferred date and time to see available tables. We'll make sure everything is ready for your arrival.
                </p>
            </div>

            {/* Selection Controls */}
            <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-8 bg-card border border-border/50 rounded-[2.5rem] shadow-2xl shadow-primary/5">
                <div className="space-y-3">
                    <Label htmlFor="date" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Date</Label>
                    <div className="relative group">
                        <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-primary group-hover:scale-110 transition-transform" size={18} />
                        <Input
                            type="date"
                            id="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="pl-12 h-14 rounded-2xl bg-muted/50 border-none focus:ring-2 focus:ring-primary/20 text-md font-bold"
                        />
                    </div>
                </div>

                <div className="space-y-3">
                    <Label htmlFor="time" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Time</Label>
                    <div className="relative group">
                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-primary group-hover:scale-110 transition-transform" size={18} />
                        <Input
                            type="time"
                            id="time"
                            value={selectedTime}
                            onChange={(e) => setSelectedTime(e.target.value)}
                            className="pl-12 h-14 rounded-2xl bg-muted/50 border-none focus:ring-2 focus:ring-primary/20 text-md font-bold"
                        />
                    </div>
                </div>

                <div className="space-y-3 sm:col-span-2 lg:col-span-1">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Guests</Label>
                    <div className="relative group">
                        <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-primary group-hover:scale-110 transition-transform" size={18} />
                        <select className="flex h-14 w-full rounded-2xl bg-muted/50 px-12 py-2 text-md font-bold ring-offset-background border-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 appearance-none">
                            <option>1 Guest</option>
                            <option>2 Guests</option>
                            <option>4 Guests</option>
                            <option>6 Guests</option>
                            <option>8+ Guests</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Tables Grid */}
            <div className="min-h-[300px] flex items-center justify-center">
                <AnimatePresence mode="wait">
                    {canShowTables ? (
                        <motion.div
                            key="grid"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 w-full"
                        >
                            {tablesData.map((table) => (
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
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
};

export default BusinessDetailsTableReservation;

