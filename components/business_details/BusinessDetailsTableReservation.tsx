"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, Table as TableIcon } from "lucide-react";
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
];

const BusinessDetailsTableReservation: React.FC = () => {
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedTime, setSelectedTime] = useState("");
    const [selectedTable, setSelectedTable] = useState<Table | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        guests: 1,
        notes: "",
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleConfirm = () => {
        console.log("Reservation confirmed:", {
            table: selectedTable,
            date: selectedDate,
            time: selectedTime,
            ...formData,
        });
        alert(`Table ${selectedTable?.number} reserved!`);
        setSelectedTable(null);
        setFormData({ name: "", email: "", phone: "", guests: 1, notes: "" });
    };

    const canShowTables = selectedDate && selectedTime;

    return (
        <div className="space-y-8">
            <BusinessDetailsReserveTableModal
                onClose={() => {
                    setSelectedTable(null);
                }}
                onSubmit={() => { }}
                isOpen={selectedTable != null}
            />
            {/* Date & Time Selection */}
            <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="flex-1 relative w-full">
                    <Label htmlFor="date">Select Date</Label>
                    <Input
                        type="date"
                        id="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                    />
                    <Calendar className="absolute right-3 top-9 w-5 h-5 text-gray-400" />
                </div>

                <div className="flex-1 relative w-full">
                    <Label htmlFor="time">Select Time</Label>
                    <Input
                        type="time"
                        id="time"
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                    />
                    <Clock className="absolute right-3 top-9 w-5 h-5 text-gray-400" />
                </div>
            </div>

            {/* Tables Grid - Only show when date & time selected */}
            <AnimatePresence>
                {canShowTables ? (
                    <motion.div
                        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.3 }}
                    >
                        {tablesData.map((table) => (

                            <button
                                disabled={!table.available}
                                className={`border p-4 rounded-xl flex flex-col items-center justify-center gap-1 transition-all shadow-sm ${table.available
                                    ? "hover:bg-primary/10 cursor-pointer"
                                    : "bg-gray-200 cursor-not-allowed"
                                    }`}
                                onClick={() => {
                                    setSelectedTable(table)
                                }}
                            >
                                <TableIcon className="w-8 h-8 text-gray-700" />
                                <span className="font-semibold">Table {table.number}</span>
                                <span className="text-sm text-gray-500">
                                    {table.seats} seats
                                </span>
                            </button>
                        ))}
                    </motion.div>
                ) : (
                    <motion.p
                        className="text-center text-gray-500 italic"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4 }}
                    >
                        Please select a date and time to view available tables.
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BusinessDetailsTableReservation;
