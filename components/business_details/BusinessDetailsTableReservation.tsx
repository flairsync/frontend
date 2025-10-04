"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, Table as TableIcon } from "lucide-react";

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
    // ... more tables
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleConfirm = () => {
        console.log("Reservation confirmed:", { table: selectedTable, date: selectedDate, time: selectedTime, ...formData });
        alert(`Table ${selectedTable?.number} reserved!`);
        setSelectedTable(null);
        setFormData({ name: "", email: "", phone: "", guests: 1, notes: "" });
    };

    return (
        <div className="space-y-6">
            {/* Date & Time Selection */}
            <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="flex-1 relative">
                    <Label htmlFor="date">Select Date</Label>
                    <Input type="date" id="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
                    <Calendar className="absolute right-3 top-9 w-5 h-5 text-gray-400" />
                </div>
                <div className="flex-1 relative">
                    <Label htmlFor="time">Select Time</Label>
                    <Input type="time" id="time" value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)} />
                    <Clock className="absolute right-3 top-9 w-5 h-5 text-gray-400" />
                </div>
            </div>

            {/* Tables Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {tablesData.map((table) => (
                    <Dialog key={table.id} open={selectedTable?.id === table.id} onOpenChange={() => setSelectedTable(null)}>
                        <DialogTrigger asChild>
                            <button
                                disabled={!table.available}
                                className={`border p-4 rounded-lg flex flex-col items-center justify-center gap-1 transition-all ${table.available ? "hover:bg-primary/10 cursor-pointer" : "bg-gray-200 cursor-not-allowed"
                                    }`}
                                onClick={() => table.available && setSelectedTable(table)}
                            >
                                <TableIcon className="w-8 h-8 text-gray-700" />
                                <span className="font-semibold">Table {table.number}</span>
                                <span className="text-sm text-gray-500">{table.seats} seats</span>
                            </button>
                        </DialogTrigger>

                        {/* Modal for reservation details */}
                        <DialogContent className="sm:max-w-lg">
                            <DialogHeader>
                                <DialogTitle>Reserve Table {table.number}</DialogTitle>
                            </DialogHeader>

                            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleConfirm(); }}>
                                <div className="flex flex-col">
                                    <Label htmlFor="name">Name</Label>
                                    <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
                                </div>
                                <div className="flex flex-col">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
                                </div>
                                <div className="flex flex-col">
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} required />
                                </div>
                                <div className="flex flex-col">
                                    <Label htmlFor="guests">Guests</Label>
                                    <Input id="guests" name="guests" type="number" min={1} value={formData.guests} onChange={handleChange} required />
                                </div>
                                <div className="flex flex-col">
                                    <Label htmlFor="notes">Special Requests</Label>
                                    <Textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} rows={3} />
                                </div>

                                <div className="flex justify-end mt-2">
                                    <DialogClose asChild>
                                        <Button type="submit">Confirm Reservation</Button>
                                    </DialogClose>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                ))}
            </div>
        </div>
    );
};

export default BusinessDetailsTableReservation;
