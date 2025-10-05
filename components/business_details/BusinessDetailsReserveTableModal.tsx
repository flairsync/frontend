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
import { Formik, Form } from 'formik';


type Props = {
    isOpen?: boolean
    onClose: () => void,
    onSubmit: () => void
}

const BusinessDetailsReserveTableModal = (props: Props) => {


    return (
        <Dialog
            open={props.isOpen}
            onOpenChange={props.onClose}
            modal
        >

            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Reserve a Table</DialogTitle>
                </DialogHeader>
                <Formik
                    initialValues={{ name: '', email: '', phone: "", guests: 1, notes: "", }}
                    //                                        validationSchema={SignupFormSchema}
                    onSubmit={values => {
                        alert(values)
                    }}
                >
                    {({ errors, touched, handleChange, values }) => (
                        <Form className="space-y-4 mt-2">

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex flex-col">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        type="text"
                                        value={values.name}
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
                                        value={values.email}
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
                                        value={values.phone}
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
                                        value={values.guests}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col">
                                <Label htmlFor="notes">Special Requests / Notes</Label>
                                <Textarea
                                    id="notes"
                                    name="notes"
                                    value={values.notes}
                                    onChange={handleChange}
                                    placeholder="Any special requests?"
                                    rows={3}
                                />
                            </div>

                            <div className="flex justify-end mt-2">
                                <DialogClose asChild>
                                    <Button type="button">Cancel</Button>
                                </DialogClose>
                                <Button type="submit">Book Now</Button>
                            </div>
                        </Form>)}
                </Formik>

            </DialogContent>
        </Dialog>
    );
};

export default BusinessDetailsReserveTableModal;
