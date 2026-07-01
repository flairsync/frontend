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
import { Calendar, CheckCircle2, Users, Mail, Phone, User, MessageSquare, Clock, Loader2, Plus, Minus, UtensilsCrossed } from "lucide-react";
import { Formik, Form, Field } from "formik";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";


import { useSubmitReservation, useDiscoveryProfile, useDiscoveryMenu } from "@/features/discovery/useDiscovery";
import { Badge } from "@/components/ui/badge";
import { parseInTimezone } from "@/lib/dateUtils";
import { usePageContext } from "vike-react/usePageContext";
import { useProfile } from "@/features/profile/useProfile";

import { PhoneInput } from "@/components/ui/phone-input";
import { isValidPhoneNumber, type Country as PhoneCountry } from "react-phone-number-input";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";

interface Props {
    onClose: () => void;
    isOpen: boolean;
    businessId: string;
    date: string;
    time: string;
    guests: number;
    tableId: string;
    tableName: string;
}

const BusinessDetailsReserveTableModal: React.FC<Props> = (props) => {
    const { t } = useTranslation("feed");
    const [isSuccess, setIsSuccess] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [preOrders, setPreOrders] = useState<Record<string, number>>({});
    const { userProfile } = useProfile();

    const validationSchema = React.useMemo(() => Yup.object().shape({
        name: Yup.string().required(t("business_page.reserve_modal.name_required", "Name is required")),
        email: Yup.string().email(t("business_page.reserve_modal.email_invalid", "Invalid email")).required(t("business_page.reserve_modal.email_required", "Email is required")),
        phone: Yup.string()
            .required(t("business_page.reserve_modal.phone_required", "Phone number is required"))
            .test("is-valid-phone", t("business_page.reserve_modal.phone_invalid", "Invalid phone number"), (value) => {
                if (!value) return false;
                return isValidPhoneNumber(value);
            }),
        guests: Yup.number().min(1, t("business_page.reserve_modal.min_guests", "Minimum 1 guest")).required(t("business_page.reserve_modal.field_required", "Required")),
    }), [t]);
    const submitReservation = useSubmitReservation(props.businessId);
    const { data: businessProfile } = useDiscoveryProfile(props.businessId);
    const { data: menu } = useDiscoveryMenu(props.businessId);

    const handleQuantityChange = (itemId: string, delta: number) => {
        setPreOrders(prev => {
            const newQty = (prev[itemId] || 0) + delta;
            if (newQty <= 0) {
                const copy = { ...prev };
                delete copy[itemId];
                return copy;
            }
            return { ...prev, [itemId]: newQty };
        });
    };

    const handleSubmit = async (values: any) => {
        try {
            setSubmitError(null);
            const reservationTime = parseInTimezone(`${props.date}T${props.time}:00`, businessProfile?.timezone);

            const preOrderItems = Object.entries(preOrders).map(([menuItemId, quantity]) => ({
                menuItemId,
                quantity
            }));

            await submitReservation.mutateAsync({
                customerName: values.name,
                customerEmail: values.email,
                customerPhone: values.phone,
                reservationTime: reservationTime,
                guestCount: values.guests,
                notes: values.notes,
                tableId: props.tableId,
                userId: userProfile?.id,
                preOrderItems: preOrderItems.length > 0 ? preOrderItems : undefined,
            });
            setIsSuccess(true);
        } catch (error: any) {
            const message = error?.response?.data?.message || t("business_page.reserve_modal.generic_error", "Something went wrong. Please try again.");
            setSubmitError(message);
        }
    };

    if (isSuccess) {
        return (
            <Dialog open={props.isOpen} onOpenChange={(open) => !open && props.onClose()}>
                <DialogContent className="sm:max-w-[425px]">
                    <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
                        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                            <CheckCircle2 size={40} />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold">{t("business_page.reserve_modal.received_title", "Reservation Received!")}</h2>
                            <p className="text-muted-foreground">
                                {t("business_page.reserve_modal.received_message_prefix", { tableName: props.tableName, date: props.date, time: props.time })} <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200 uppercase font-black px-2 ml-1">{t("business_page.reserve_modal.pending_badge", "PENDING")}</Badge> {t("business_page.reserve_modal.received_message_suffix", "confirmation.")}
                            </p>
                            <p className="text-sm text-muted-foreground/80 mt-4">
                                {t("business_page.reserve_modal.keep_eye", "Keep an eye on your email/phone for the confirmation notice.")}
                            </p>
                        </div>
                        <Button onClick={props.onClose} className="w-full mt-6">{t("business_page.reserve_modal.back_to_business", "Back to Business")}</Button>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    const initialName = userProfile ? `${userProfile.firstName || ""} ${userProfile.lastName || ""}`.trim() : "";
    const initialEmail = userProfile?.email || "";
    const initialPhone = userProfile?.phoneNumber || "";
    const phoneDefaultCountry: PhoneCountry = (businessProfile?.country?.code?.toUpperCase() as PhoneCountry) || "TN";

    return (
        <Dialog open={props.isOpen} onOpenChange={(open) => !open && props.onClose()}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-y-auto max-h-[90vh] border-none rounded-[2rem]">
                <div className="bg-primary p-8 text-primary-foreground relative overflow-hidden">
                    <div className="relative z-10 space-y-1">
                        <h2 className="text-2xl font-bold italic tracking-tight">{t("business_page.reserve_modal.complete_title", "Complete Your Reservation")}</h2>
                        <p className="text-primary-foreground/80 font-medium">{t("business_page.reserve_modal.table_summary", { tableName: props.tableName, date: props.date, time: props.time })}</p>
                    </div>
                    <Calendar className="absolute -right-4 -bottom-4 text-white/10 w-32 h-32 rotate-12" />
                </div>

                <div className="p-8">
                    <Formik
                        initialValues={{
                            name: initialName,
                            email: initialEmail,
                            phone: initialPhone,
                            guests: props.guests,
                            notes: "",
                        }}
                        validationSchema={validationSchema}
                        enableReinitialize={true}
                        onSubmit={handleSubmit}
                    >
                        {({ errors, touched, handleChange, setFieldValue, values }) => (
                            <Form className="space-y-4 mt-2">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-1.5">
                                        <Label htmlFor="name">{t("business_page.reserve_modal.name_label", "Name")}</Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            type="text"
                                            value={values.name}
                                            onChange={handleChange}
                                            required
                                        />
                                        {errors.name && touched.name && <span className="text-[10px] text-destructive font-bold uppercase">{errors.name}</span>}
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <Label htmlFor="email">{t("business_page.reserve_modal.email_label", "Email")}</Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={values.email}
                                            onChange={handleChange}
                                            required
                                        />
                                        {errors.email && touched.email && <span className="text-[10px] text-destructive font-bold uppercase">{errors.email}</span>}
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <Label htmlFor="guests">{t("business_page.reserve_modal.guests_label", "Guests")}</Label>
                                        <Input
                                            id="guests"
                                            name="guests"
                                            type="number"
                                            min={1}
                                            value={values.guests}
                                            onChange={handleChange}
                                            required
                                        />
                                        {errors.guests && touched.guests && <span className="text-[10px] text-destructive font-bold uppercase">{errors.guests}</span>}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="phone">{t("business_page.reserve_modal.phone_label", "Phone Number")}</Label>
                                    <PhoneInput
                                        id="phone"
                                        name="phone"
                                        value={values.phone}
                                        onChange={(val) => setFieldValue("phone", val)}
                                        placeholder={t("business_page.reserve_modal.phone_placeholder", "Enter phone number")}
                                        defaultCountry={phoneDefaultCountry}
                                        required
                                    />
                                    {errors.phone && touched.phone && <span className="text-[10px] text-destructive font-bold uppercase">{errors.phone}</span>}
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="notes">{t("business_page.reserve_modal.notes_label", "Special Requests / Notes")}</Label>
                                    <Textarea
                                        id="notes"
                                        name="notes"
                                        value={values.notes}
                                        onChange={handleChange}
                                        placeholder={t("business_page.reserve_modal.notes_placeholder", "Any special requests?")}
                                        rows={3}
                                    />
                                </div>

                                {menu && menu.categories && menu.categories.length > 0 && (
                                    <div className="flex flex-col gap-1.5 mt-4">
                                        <Label className="flex items-center gap-2">
                                            <UtensilsCrossed size={16} className="text-primary" />
                                            {t("business_page.reserve_modal.preorder_label", "Pre-order Items (Optional)")}
                                        </Label>
                                        <div className="rounded-xl border border-border/50 bg-card/50 overflow-hidden">
                                            <Accordion type="single" collapsible className="w-full">
                                                {menu.getOrderedCategories().map((category) => (
                                                    <AccordionItem key={category.id} value={category.id} className="border-b border-border/50 last:border-0">
                                                        <AccordionTrigger className="px-4 py-3 hover:bg-muted/50 hover:no-underline text-sm font-semibold">
                                                            {category.name} ({category.items?.length || 0})
                                                        </AccordionTrigger>
                                                        <AccordionContent className="px-4 pb-4 pt-1 space-y-3">
                                                            {category.items?.map((item) => (
                                                                <div key={item.id} className="flex items-center justify-between gap-4">
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="font-medium text-sm truncate">{item.name}</div>
                                                                        <div className="text-xs text-muted-foreground">{businessProfile?.currency || "$"}{item.price}</div>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <Button
                                                                            type="button"
                                                                            variant="outline"
                                                                            size="icon"
                                                                            className="h-7 w-7 rounded-sm"
                                                                            onClick={() => handleQuantityChange(item.id, -1)}
                                                                            disabled={!preOrders[item.id]}
                                                                        >
                                                                            <Minus size={12} />
                                                                        </Button>
                                                                        <span className="w-4 text-center text-sm font-medium">
                                                                            {preOrders[item.id] || 0}
                                                                        </span>
                                                                        <Button
                                                                            type="button"
                                                                            variant="outline"
                                                                            size="icon"
                                                                            className="h-7 w-7 rounded-sm"
                                                                            onClick={() => handleQuantityChange(item.id, 1)}
                                                                        >
                                                                            <Plus size={12} />
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </AccordionContent>
                                                    </AccordionItem>
                                                ))}
                                            </Accordion>
                                        </div>
                                        {Object.keys(preOrders).length > 0 && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {t("business_page.reserve_modal.preorder_selected", { count: Object.values(preOrders).reduce((a, b) => a + b, 0) })}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {submitError && (
                                    <p className="text-sm text-destructive font-medium rounded-lg bg-destructive/10 px-3 py-2">
                                        {submitError}
                                    </p>
                                )}

                                <div className="flex justify-end gap-3 mt-4">
                                    <Button type="button" variant="outline" onClick={props.onClose}>
                                        {t("business_page.reserve_modal.cancel_button", "Cancel")}
                                    </Button>
                                    <Button type="submit" disabled={submitReservation.isPending}>
                                        {submitReservation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        {t("business_page.reserve_modal.book_now_button", "Book Now")}
                                    </Button>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default BusinessDetailsReserveTableModal;
