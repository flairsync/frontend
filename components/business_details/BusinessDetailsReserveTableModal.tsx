"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock } from "lucide-react";

const BusinessDetailsReserveTableModal: React.FC = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        date: "",
        time: "",
        guests: 1,
        notes: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Reservation data:", formData);
        alert("Reservation submitted!");
        setFormData({
            name: "",
            email: "",
            phone: "",
            date: "",
            time: "",
            guests: 1,
            notes: "",
        });
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="default">Reserve a Table</Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Reserve a Table</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                name="name"
                                type="text"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="flex flex-col">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="flex flex-col">
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                                id="phone"
                                name="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="flex flex-col">
                            <Label htmlFor="guests">Guests</Label>
                            <Input
                                id="guests"
                                name="guests"
                                type="number"
                                min={1}
                                value={formData.guests}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col">
                            <Label htmlFor="date">Date</Label>
                            <div className="relative">
                                <Input
                                    id="date"
                                    name="date"
                                    type="date"
                                    value={formData.date}
                                    onChange={handleChange}
                                    required
                                />
                                <Calendar className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <Label htmlFor="time">Time</Label>
                            <div className="relative">
                                <Input
                                    id="time"
                                    name="time"
                                    type="time"
                                    value={formData.time}
                                    onChange={handleChange}
                                    required
                                />
                                <Clock className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col">
                        <Label htmlFor="notes">Special Requests / Notes</Label>
                        <Textarea
                            id="notes"
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            placeholder="Any special requests?"
                            rows={3}
                        />
                    </div>

                    <div className="flex justify-end mt-2">
                        <DialogClose asChild>
                            <Button type="submit">Book Now</Button>
                        </DialogClose>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default BusinessDetailsReserveTableModal;
