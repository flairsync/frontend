import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAvailability, useReservations } from "@/features/reservations/useReservations";
import { useBusinessMenus } from "@/features/business/menu/useBusinessMenus";
import { toast } from "sonner";
import { Calendar, Users, Clock, Check, ChevronRight, ChevronLeft, ShoppingCart, Loader2 } from "lucide-react";
import flairapi from "@/lib/flairapi";

interface BookingFlowModalProps {
    businessId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

type Step = "SEARCH" | "TABLE_SELECTION" | "PRE_ORDER" | "CUSTOMER_INFO";

export const BookingFlowModal: React.FC<BookingFlowModalProps> = ({
    businessId,
    open,
    onOpenChange
}) => {
    const [step, setStep] = useState<Step>("SEARCH");
    const [bookingData, setBookingData] = useState({
        date: format(new Date(), "yyyy-MM-dd"),
        time: "19:00",
        guestCount: 2,
        tableId: undefined as string | undefined,
        customerName: "",
        customerEmail: "",
        customerPhone: "",
        notes: "",
        orderItems: [] as any[]
    });

    const { mutate: checkAvailability, isPending: checkingAvailability } = useAvailability(businessId);
    const { createReservation, isCreatingReservation } = useReservations(businessId);
    const { businessAllItems: menuItems } = useBusinessMenus(businessId);
    const [availableTables, setAvailableTables] = useState<any[]>([]);

    const handleNext = () => {
        if (step === "SEARCH") {
            const timestamp = `${bookingData.date}T${bookingData.time}`;
            checkAvailability(
                { date: new Date(timestamp).toISOString(), guestCount: bookingData.guestCount },
                {
                    onSuccess: (data) => {
                        setAvailableTables(data);
                        setStep("TABLE_SELECTION");
                    }
                }
            );
        } else if (step === "TABLE_SELECTION") {
            setStep("PRE_ORDER");
        } else if (step === "PRE_ORDER") {
            setStep("CUSTOMER_INFO");
        }
    };

    const handleBack = () => {
        if (step === "TABLE_SELECTION") setStep("SEARCH");
        else if (step === "PRE_ORDER") setStep("TABLE_SELECTION");
        else if (step === "CUSTOMER_INFO") setStep("PRE_ORDER");
    };


    const handleBooking = () => {
        const timestamp = `${bookingData.date}T${bookingData.time}`;
        const payload: any = {
            customerName: bookingData.customerName,
            customerEmail: bookingData.customerEmail,
            customerPhone: bookingData.customerPhone,
            reservationTime: new Date(timestamp).toISOString(),
            guestCount: bookingData.guestCount,
            notes: bookingData.notes,
            tableId: bookingData.tableId
        };

        if (bookingData.orderItems.length > 0) {
            payload.order = {
                type: "dine_in",
                items: bookingData.orderItems.map(item => ({
                    menuItemId: item.id,
                    quantity: item.quantity
                }))
            };
        }

        createReservation(payload, {
            onSuccess: () => {
                onOpenChange(false);
                resetForm();
            }
        });
    };

    const resetForm = () => {
        setStep("SEARCH");
        setBookingData({
            date: format(new Date(), "yyyy-MM-dd"),
            time: "19:00",
            guestCount: 2,
            tableId: undefined,
            customerName: "",
            customerEmail: "",
            customerPhone: "",
            notes: "",
            orderItems: []
        });
    };

    const addToOrder = (item: any) => {
        setBookingData(prev => {
            const existing = prev.orderItems.find(i => i.id === item.id);
            if (existing) {
                return {
                    ...prev,
                    orderItems: prev.orderItems.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)
                };
            }
            return {
                ...prev,
                orderItems: [...prev.orderItems, { ...item, quantity: 1 }]
            };
        });
    };

    const removeFromOrder = (itemId: string) => {
        setBookingData(prev => ({
            ...prev,
            orderItems: prev.orderItems.filter(i => i.id !== itemId)
        }));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {step === "SEARCH" && "New Reservation"}
                        {step === "TABLE_SELECTION" && "Select a Table"}
                        {step === "PRE_ORDER" && "Pre-Order Items (Optional)"}
                        {step === "CUSTOMER_INFO" && "Customer Details"}
                    </DialogTitle>
                </DialogHeader>

                <div className="py-4">
                    {step === "SEARCH" && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Date</Label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type="date"
                                            className="pl-9"
                                            value={bookingData.date}
                                            onChange={e => setBookingData({ ...bookingData, date: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Time</Label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type="time"
                                            className="pl-9"
                                            value={bookingData.time}
                                            onChange={e => setBookingData({ ...bookingData, time: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Guest Count</Label>
                                <div className="relative">
                                    <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="number"
                                        className="pl-9"
                                        min={1}
                                        value={bookingData.guestCount}
                                        onChange={e => setBookingData({ ...bookingData, guestCount: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === "TABLE_SELECTION" && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <button
                                    onClick={() => setBookingData({ ...bookingData, tableId: undefined })}
                                    className={`p-4 border rounded-lg text-left transition-all ${bookingData.tableId === undefined ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:border-primary/50'}`}
                                >
                                    <h3 className="font-semibold">Waitlist</h3>
                                    <p className="text-sm text-muted-foreground">Add to waitlist if no preferred table is available.</p>
                                </button>
                                {availableTables.map(table => (
                                    <button
                                        key={table.id}
                                        onClick={() => setBookingData({ ...bookingData, tableId: table.id })}
                                        className={`p-4 border rounded-lg text-left transition-all ${bookingData.tableId === table.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:border-primary/50'}`}
                                    >
                                        <h3 className="font-semibold">{table.name || (table.number ? `Table ${table.number}` : `Table ${table.id.substring(0, 8)}`)}</h3>
                                        <p className="text-sm text-muted-foreground">Capacity: {table.capacity} guests</p>
                                    </button>
                                ))}
                            </div>
                            {availableTables.length === 0 && (
                                <p className="text-center text-muted-foreground py-4">No tables available for this time. You can still join the waitlist.</p>
                            )}
                        </div>
                    )}

                    {step === "PRE_ORDER" && (
                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <div className="flex-1 space-y-4 max-h-[400px] overflow-y-auto pr-2">
                                    {!menuItems ? (
                                        <div className="flex justify-center py-8"><Loader2 className="animate-spin" /></div>
                                    ) : menuItems.length === 0 ? (
                                        <p className="text-center text-muted-foreground py-8">No menu items found.</p>
                                    ) : (
                                        menuItems.map((item: any) => (
                                            <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                <div>
                                                    <h4 className="font-medium">{item.name}</h4>
                                                    <p className="text-sm text-muted-foreground">${item.price}</p>
                                                </div>
                                                <Button size="sm" variant="outline" onClick={() => addToOrder(item)}>Add</Button>
                                            </div>
                                        ))
                                    )}
                                </div>
                                <div className="w-64 border-l pl-4 space-y-4">
                                    <div className="flex items-center gap-2 font-semibold">
                                        <ShoppingCart className="h-4 w-4" />
                                        Selected Item ({bookingData.orderItems.length})
                                    </div>
                                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                        {bookingData.orderItems.map(item => (
                                            <div key={item.id} className="text-sm flex justify-between items-center group">
                                                <span>{item.quantity}x {item.name}</span>
                                                <button onClick={() => removeFromOrder(item.id)} className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity">Remove</button>
                                            </div>
                                        ))}
                                        {bookingData.orderItems.length === 0 && <p className="text-xs text-muted-foreground">No items added yet.</p>}
                                    </div>
                                    <div className="pt-2 border-t font-bold">
                                        Total: ${bookingData.orderItems.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0).toFixed(2)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === "CUSTOMER_INFO" && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Customer Name</Label>
                                    <Input
                                        placeholder="John Doe"
                                        value={bookingData.customerName}
                                        onChange={e => setBookingData({ ...bookingData, customerName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Phone Number</Label>
                                    <Input
                                        placeholder="+123456789"
                                        value={bookingData.customerPhone}
                                        onChange={e => setBookingData({ ...bookingData, customerPhone: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Email Address</Label>
                                <Input
                                    type="email"
                                    placeholder="john@example.com"
                                    value={bookingData.customerEmail}
                                    onChange={e => setBookingData({ ...bookingData, customerEmail: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Special Notes</Label>
                                <Input
                                    placeholder="Birthday celebration, allergy info, etc."
                                    value={bookingData.notes}
                                    onChange={e => setBookingData({ ...bookingData, notes: e.target.value })}
                                />
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="flex justify-between sm:justify-between items-center bg-muted/30 -mx-6 -mb-6 p-6 mt-4">
                    <div>
                        {step !== "SEARCH" && (
                            <Button variant="ghost" onClick={handleBack} className="gap-2">
                                <ChevronLeft className="h-4 w-4" />
                                Back
                            </Button>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        {step === "CUSTOMER_INFO" ? (
                            <Button onClick={handleBooking} disabled={isCreatingReservation || !bookingData.customerName || !bookingData.customerPhone}>
                                {isCreatingReservation && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Complete Booking
                            </Button>
                        ) : (
                            <Button onClick={handleNext} disabled={checkingAvailability}>
                                {checkingAvailability && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {step === "SEARCH" ? "Check Availability" : "Continue"}
                                <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
