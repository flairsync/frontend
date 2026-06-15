import React, { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { PhoneInput } from "@/components/ui/phone-input";
import { useAvailability, useReservations, useUserLookup } from "@/features/reservations/useReservations";
import { useMyBusiness } from "@/features/business/useMyBusiness";
import { parseInTimezone } from "@/lib/dateUtils";
import { useBusinessMenus } from "@/features/business/menu/useBusinessMenus";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { CalendarIcon, Users, Clock, Check, ChevronRight, ChevronLeft, ShoppingCart, Loader2 } from "lucide-react";
import { isValidPhoneNumber } from "react-phone-number-input";

interface BookingFlowModalProps {
    businessId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

type Step = "SEARCH" | "TABLE_SELECTION" | "PRE_ORDER" | "CUSTOMER_INFO";

const STEP_ORDER: Step[] = ["SEARCH", "TABLE_SELECTION", "PRE_ORDER", "CUSTOMER_INFO"];

const STEPS = [
    { key: "SEARCH" as Step,         label: "Date & Time",  description: "When & how many" },
    { key: "TABLE_SELECTION" as Step, label: "Table",        description: "Pick a table" },
    { key: "PRE_ORDER" as Step,       label: "Pre-Order",    description: "Optional items" },
    { key: "CUSTOMER_INFO" as Step,   label: "Customer",     description: "Contact details" },
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const defaultBookingData = () => ({
    date: format(new Date(), "yyyy-MM-dd"),
    time: "19:00",
    guestCount: 2,
    tableId: undefined as string | undefined,
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    notes: "",
    reservationSource: "PHONE",
    durationMinutes: 120,
    orderItems: [] as any[]
});

export const BookingFlowModal: React.FC<BookingFlowModalProps> = ({
    businessId,
    open,
    onOpenChange
}) => {
    const [step, setStep] = useState<Step>("SEARCH");
    const [maxStepReached, setMaxStepReached] = useState(0);
    const [bookingData, setBookingData] = useState(defaultBookingData());
    const [emailError, setEmailError] = useState<string | null>(null);
    const [phoneError, setPhoneError] = useState<string | null>(null);

    const { mutate: checkAvailability, isPending: checkingAvailability } = useAvailability(businessId);
    const { createReservation, isCreatingReservation } = useReservations(businessId);
    const { businessAllItems: menuItems } = useBusinessMenus(businessId);

    const { myBusinessFullDetails } = useMyBusiness(businessId);
    const businessTimezone = myBusinessFullDetails?.timezone;

    const [availableTables, setAvailableTables] = useState<any[]>([]);

    const [debouncedEmail, setDebouncedEmail] = useState("");
    const [debouncedPhone, setDebouncedPhone] = useState("");
    const [linkedUserId, setLinkedUserId] = useState<string | undefined>();
    const [declinedLink, setDeclinedLink] = useState(false);

    useEffect(() => {
        if (open) resetForm();
    }, [open]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedEmail(bookingData.customerEmail);
            setDebouncedPhone(bookingData.customerPhone);
        }, 500);
        return () => clearTimeout(timer);
    }, [bookingData.customerEmail, bookingData.customerPhone]);

    useEffect(() => {
        setDeclinedLink(false);
        setLinkedUserId(undefined);
    }, [debouncedEmail, debouncedPhone]);

    // If search criteria change after tables were already fetched, invalidate forward progress
    const handleSearchFieldChange = (updates: Partial<typeof bookingData>) => {
        setBookingData(prev => ({ ...prev, ...updates }));
        if (maxStepReached >= 1) {
            setMaxStepReached(0);
            setAvailableTables([]);
            setStep("SEARCH");
        }
    };

    const { data: foundUser } = useUserLookup(debouncedEmail, debouncedPhone);

    const validateEmail = (email: string) => {
        if (!email) return null;
        return EMAIL_REGEX.test(email) ? null : "Please enter a valid email address";
    };

    const validatePhone = (phone: string) => {
        if (!phone) return "Phone number is required";
        return isValidPhoneNumber(phone) ? null : "Please enter a valid phone number for the selected country";
    };

    const currentStepIndex = STEP_ORDER.indexOf(step);

    const handleStepClick = (targetStep: Step) => {
        const targetIndex = STEP_ORDER.indexOf(targetStep);
        if (targetIndex <= maxStepReached) setStep(targetStep);
    };

    const handleNext = () => {
        if (step === "SEARCH") {
            const timestamp = `${bookingData.date}T${bookingData.time}`;
            const reservationDate = parseInTimezone(timestamp, businessTimezone);
            if (reservationDate <= new Date()) {
                toast.error("Reservation time must be in the future.");
                return;
            }
            checkAvailability(
                { date: reservationDate, guestCount: bookingData.guestCount },
                {
                    onSuccess: (data) => {
                        setAvailableTables(data);
                        setStep("TABLE_SELECTION");
                        setMaxStepReached(prev => Math.max(prev, 1));
                    }
                }
            );
        } else if (step === "TABLE_SELECTION") {
            setStep("PRE_ORDER");
            setMaxStepReached(prev => Math.max(prev, 2));
        } else if (step === "PRE_ORDER") {
            setStep("CUSTOMER_INFO");
            setMaxStepReached(prev => Math.max(prev, 3));
        }
    };

    const handleBack = () => {
        if (step === "TABLE_SELECTION") setStep("SEARCH");
        else if (step === "PRE_ORDER") setStep("TABLE_SELECTION");
        else if (step === "CUSTOMER_INFO") setStep("PRE_ORDER");
    };

    const handleBooking = () => {
        const pErr = validatePhone(bookingData.customerPhone);
        if (pErr) { setPhoneError(pErr); return; }

        const eErr = validateEmail(bookingData.customerEmail);
        if (eErr) { setEmailError(eErr); return; }

        const timestamp = `${bookingData.date}T${bookingData.time}`;
        const payload: any = {
            customerName: bookingData.customerName,
            customerEmail: bookingData.customerEmail,
            customerPhone: bookingData.customerPhone,
            reservationTime: parseInTimezone(timestamp, businessTimezone),
            guestCount: bookingData.guestCount,
            notes: bookingData.notes,
            tableId: bookingData.tableId,
            reservationSource: bookingData.reservationSource,
            durationMinutes: bookingData.durationMinutes,
            ...(linkedUserId ? { userId: linkedUserId } : {})
        };

        if (bookingData.orderItems.length > 0) {
            payload.preOrderItems = bookingData.orderItems.map((item: any) => ({
                menuItemId: item.id,
                quantity: item.quantity,
                ...(item.notes ? { notes: item.notes } : {})
            }));
        }

        createReservation(payload, {
            onSuccess: () => onOpenChange(false)
        });
    };

    const resetForm = () => {
        setStep("SEARCH");
        setMaxStepReached(0);
        setBookingData(defaultBookingData());
        setEmailError(null);
        setPhoneError(null);
        setAvailableTables([]);
        setDebouncedEmail("");
        setDebouncedPhone("");
        setLinkedUserId(undefined);
        setDeclinedLink(false);
    };

    const addToOrder = (item: any) => {
        setBookingData(prev => {
            const existing = prev.orderItems.find(i => i.id === item.id);
            if (existing) {
                return { ...prev, orderItems: prev.orderItems.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i) };
            }
            return { ...prev, orderItems: [...prev.orderItems, { ...item, quantity: 1 }] };
        });
    };

    const removeFromOrder = (itemId: string) => {
        setBookingData(prev => ({
            ...prev,
            orderItems: prev.orderItems.filter(i => i.id !== itemId)
        }));
    };

    const selectedDate = bookingData.date ? parseISO(bookingData.date + "T00:00:00") : undefined;
    const isToday = bookingData.date === format(new Date(), "yyyy-MM-dd");
    const minTime = isToday ? format(new Date(), "HH:mm") : undefined;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl p-0 flex flex-col max-h-[90vh] overflow-hidden gap-0">

                {/* ── Fixed header ── */}
                <div className="flex-shrink-0 px-6 pt-6 pb-4 border-b">
                    <DialogTitle className="text-lg font-semibold mb-4">New Reservation</DialogTitle>

                    {/* Step indicator */}
                    <div className="flex items-center">
                        {STEPS.map((s, idx) => {
                            const isCompleted = idx < currentStepIndex;
                            const isActive = idx === currentStepIndex;
                            const isClickable = idx <= maxStepReached && !isActive;
                            return (
                                <React.Fragment key={s.key}>
                                    <button
                                        type="button"
                                        disabled={!isClickable}
                                        onClick={() => handleStepClick(s.key)}
                                        className={cn(
                                            "flex flex-col items-center gap-1 min-w-[60px]",
                                            isClickable ? "cursor-pointer group" : "cursor-default"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all",
                                            isCompleted && "bg-primary border-primary text-primary-foreground group-hover:opacity-80",
                                            isActive && "bg-primary border-primary text-primary-foreground ring-4 ring-primary/20",
                                            !isCompleted && !isActive && "bg-background border-muted-foreground/30 text-muted-foreground"
                                        )}>
                                            {isCompleted ? <Check className="w-4 h-4" /> : <span>{idx + 1}</span>}
                                        </div>
                                        <span className={cn(
                                            "text-[10px] font-medium text-center leading-tight hidden sm:block",
                                            isActive ? "text-primary" : isCompleted ? "text-foreground" : "text-muted-foreground"
                                        )}>
                                            {s.label}
                                        </span>
                                    </button>
                                    {idx < STEPS.length - 1 && (
                                        <div className={cn(
                                            "flex-1 h-0.5 mx-1 transition-all",
                                            idx < maxStepReached ? "bg-primary" : idx < currentStepIndex ? "bg-primary/60" : "bg-muted-foreground/20"
                                        )} />
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>

                {/* ── Scrollable content ── */}
                <div className="flex-1 overflow-y-auto px-6 py-5">

                    {step === "SEARCH" && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Date</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    "w-full justify-start text-left font-normal",
                                                    !selectedDate && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {selectedDate ? format(selectedDate, "MMM d, yyyy") : "Pick a date"}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={selectedDate}
                                                onSelect={(date) => {
                                                    if (date) handleSearchFieldChange({ date: format(date, "yyyy-MM-dd") });
                                                }}
                                                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="space-y-2">
                                    <Label>Time</Label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type="time"
                                            className="pl-9"
                                            value={bookingData.time}
                                            min={minTime}
                                            onChange={e => handleSearchFieldChange({ time: e.target.value })}
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
                                        onChange={e => handleSearchFieldChange({ guestCount: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === "TABLE_SELECTION" && (
                        <div className="space-y-3">
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
                        <div className="flex gap-4 h-full">
                            <div className="flex-1 space-y-3 min-w-0">
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
                            <div className="w-56 flex-shrink-0 border-l pl-4 space-y-3">
                                <div className="flex items-center gap-2 font-semibold text-sm">
                                    <ShoppingCart className="h-4 w-4" />
                                    Order ({bookingData.orderItems.length})
                                </div>
                                <div className="space-y-2">
                                    {bookingData.orderItems.map(item => (
                                        <div key={item.id} className="text-sm flex justify-between items-center group">
                                            <span>{item.quantity}x {item.name}</span>
                                            <button onClick={() => removeFromOrder(item.id)} className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity text-xs">Remove</button>
                                        </div>
                                    ))}
                                    {bookingData.orderItems.length === 0 && <p className="text-xs text-muted-foreground">No items added yet.</p>}
                                </div>
                                <div className="pt-2 border-t text-sm font-bold">
                                    Total: ${bookingData.orderItems.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0).toFixed(2)}
                                </div>
                            </div>
                        </div>
                    )}

                    {step === "CUSTOMER_INFO" && (
                        <div className="space-y-4">
                            {foundUser && !linkedUserId && !declinedLink && (
                                <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                            {foundUser.firstName?.[0]}{foundUser.lastName?.[0]}
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">Found user: {foundUser.firstName} {foundUser.lastName}</p>
                                            <p className="text-xs text-muted-foreground">Do you want to link this reservation?</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="outline" onClick={() => setDeclinedLink(true)}>No</Button>
                                        <Button size="sm" onClick={() => setLinkedUserId(foundUser.id)}>Yes, Link</Button>
                                    </div>
                                </div>
                            )}
                            {linkedUserId && foundUser && (
                                <div className="p-3 bg-secondary border border-secondary/50 rounded-lg flex items-center gap-2 text-secondary-foreground text-sm">
                                    <Check className="w-4 h-4 text-green-500" />
                                    Linked to {foundUser.firstName} {foundUser.lastName}'s account
                                </div>
                            )}

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
                                    <PhoneInput
                                        value={bookingData.customerPhone}
                                        onChange={(val) => {
                                            setBookingData({ ...bookingData, customerPhone: val ?? "" });
                                            if (phoneError) setPhoneError(validatePhone(val ?? ""));
                                        }}
                                        onBlur={() => setPhoneError(validatePhone(bookingData.customerPhone))}
                                        placeholder="Enter phone number"
                                    />
                                    {phoneError && (
                                        <p className="text-[10px] text-destructive font-bold uppercase">{phoneError}</p>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Email Address</Label>
                                <Input
                                    type="email"
                                    placeholder="john@example.com"
                                    value={bookingData.customerEmail}
                                    onChange={e => {
                                        setBookingData({ ...bookingData, customerEmail: e.target.value });
                                        if (emailError) setEmailError(validateEmail(e.target.value));
                                    }}
                                    onBlur={() => setEmailError(validateEmail(bookingData.customerEmail))}
                                    className={emailError ? "border-destructive focus-visible:ring-destructive" : ""}
                                />
                                {emailError && (
                                    <p className="text-[10px] text-destructive font-bold uppercase">{emailError}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label>Special Notes</Label>
                                <Input
                                    placeholder="Birthday celebration, allergy info, etc."
                                    value={bookingData.notes}
                                    onChange={e => setBookingData({ ...bookingData, notes: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Source</Label>
                                    <Select value={bookingData.reservationSource} onValueChange={(val) => setBookingData({ ...bookingData, reservationSource: val })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="APP">App</SelectItem>
                                            <SelectItem value="WEB">Web</SelectItem>
                                            <SelectItem value="PHONE">Phone</SelectItem>
                                            <SelectItem value="WALK_IN">Walk-in</SelectItem>
                                            <SelectItem value="INSTAGRAM">Instagram</SelectItem>
                                            <SelectItem value="GOOGLE">Google</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Duration (Minutes)</Label>
                                    <Input
                                        type="number"
                                        min={15}
                                        step={15}
                                        value={bookingData.durationMinutes}
                                        onChange={e => setBookingData({ ...bookingData, durationMinutes: parseInt(e.target.value) || 120 })}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Fixed footer ── */}
                <div className="flex-shrink-0 border-t bg-muted/30 px-6 py-4 flex justify-between items-center">
                    <div>
                        {step !== "SEARCH" ? (
                            <Button variant="ghost" onClick={handleBack} className="gap-1.5">
                                <ChevronLeft className="h-4 w-4" />
                                Back
                            </Button>
                        ) : (
                            <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-muted-foreground">
                                Cancel
                            </Button>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {step !== "SEARCH" && (
                            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        )}
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
                </div>

            </DialogContent>
        </Dialog>
    );
};
