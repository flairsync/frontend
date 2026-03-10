import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { BusinessMenuItem } from "@/models/business/menu/BusinessMenuItem";
import { DiscoveryBusinessProfile } from "@/models/discovery/DiscoveryBusinessProfile";
import { useSubmitOrder } from "@/features/discovery/useDiscovery";
import { Loader2, MapPin, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Props {
    open: boolean;
    onClose: () => void;
    item: BusinessMenuItem | null;
    business: DiscoveryBusinessProfile | null;
}

export const BusinessDetailsOrderModal: React.FC<Props> = ({ open, onClose, item, business }) => {
    const { t } = useTranslation();
    const [orderType, setOrderType] = useState<"dine_in" | "takeaway">("dine_in");
    const [quantity, setQuantity] = useState(1);
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [isLocating, setIsLocating] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const submitOrder = useSubmitOrder(business?.id || "");

    useEffect(() => {
        if (open) {
            setIsSuccess(false);
            setQuantity(1);
            if (business?.allowTableOrdering) setOrderType("dine_in");
            else if (business?.allowTakeawayOrdering) setOrderType("takeaway");
        }
    }, [open, business]);

    const handleLocate = () => {
        setIsLocating(true);
        setLocationError(null);

        if (!navigator.geolocation) {
            setLocationError("Geolocation is not supported by your browser");
            setIsLocating(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
                setIsLocating(false);
            },
            (error) => {
                console.error("Geolocation error:", error);
                setLocationError("Could not determine your location. Please enable location permissions.");
                setIsLocating(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    const handleSubmit = async () => {
        if (!item || !business) return;

        if (business.allowOnlyNearbyOrders && !location) {
            handleLocate();
            return;
        }

        try {
            await submitOrder.mutateAsync({
                type: orderType,
                items: [
                    {
                        menuItemId: item.id,
                        quantity: quantity,
                    },
                ],
                lat: location?.lat,
                lng: location?.lng,
            });
            setIsSuccess(true);
        } catch (error) {
            console.error("Order submission error:", error);
        }
    };

    const canSubmit = !submitOrder.isPending && (business?.allowOnlyNearbyOrders ? !!location : true);

    if (isSuccess) {
        return (
            <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
                <DialogContent className="sm:max-w-[425px] text-center py-10">
                    <div className="flex flex-col items-center gap-4">
                        <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                            <CheckCircle2 size={40} />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold">Order Received!</h2>
                            <p className="text-muted-foreground">
                                {business?.requireOrderConfirmation
                                    ? "Your order is pending confirmation from the staff."
                                    : "Your order has been placed successfully."}
                            </p>
                        </div>
                        <Button onClick={onClose} className="mt-4">
                            Close
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Place Order: {item?.name}</DialogTitle>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    <div className="space-y-3">
                        <Label>Order Type</Label>
                        <RadioGroup
                            value={orderType}
                            onValueChange={(val: any) => setOrderType(val)}
                            className="flex gap-4"
                        >
                            {business?.allowTableOrdering && (
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="dine_in" id="dine_in" />
                                    <Label htmlFor="dine_in" className="cursor-pointer">Dine-in</Label>
                                </div>
                            )}
                            {business?.allowTakeawayOrdering && (
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="takeaway" id="takeaway" />
                                    <Label htmlFor="takeaway" className="cursor-pointer">Takeaway</Label>
                                </div>
                            )}
                        </RadioGroup>
                    </div>

                    <div className="flex items-center justify-between">
                        <Label>Quantity</Label>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            >
                                -
                            </Button>
                            <span className="w-8 text-center font-bold">{quantity}</span>
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setQuantity(quantity + 1)}
                            >
                                +
                            </Button>
                        </div>
                    </div>

                    {business?.allowOnlyNearbyOrders && (
                        <div className="space-y-3 p-4 bg-muted rounded-lg border border-border">
                            <div className="flex items-start gap-3">
                                <MapPin className="text-primary mt-1 shrink-0" size={18} />
                                <div className="space-y-1">
                                    <p className="text-sm font-bold">Location Required</p>
                                    <p className="text-xs text-muted-foreground">
                                        This business only allows orders from nearby guests (within 500m).
                                    </p>
                                </div>
                            </div>

                            {!location ? (
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    className="w-full mt-2"
                                    onClick={handleLocate}
                                    disabled={isLocating}
                                >
                                    {isLocating ? <Loader2 className="animate-spin mr-2" size={14} /> : null}
                                    Verify My Location
                                </Button>
                            ) : (
                                <div className="flex items-center gap-2 text-xs text-green-600 font-medium bg-green-50 px-3 py-2 rounded-md border border-green-100">
                                    <CheckCircle2 size={14} />
                                    Location verified
                                </div>
                            )}

                            {locationError && (
                                <p className="text-xs text-destructive mt-1">{locationError}</p>
                            )}
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={!canSubmit}>
                        {submitOrder.isPending && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
                        Confirm Order - ${(item?.price || 0) * quantity}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
