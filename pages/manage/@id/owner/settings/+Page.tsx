import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import BusinessHoursInput from "@/components/management/BusinessHoursInput";
import BusinessLogoInput from "@/components/management/BusinessLogoInput";

const BusinessSettingsPage: React.FC = () => {
    // Dummy state
    const [businessName, setBusinessName] = useState("Café Aroma");
    const [address, setAddress] = useState("123 Main St, Cityville");
    const [phone, setPhone] = useState("+1 234 567 890");
    const [openingHours, setOpeningHours] = useState(
        "Mon-Fri: 8am - 8pm\nSat-Sun: 9am - 6pm"
    );

    const handleSave = () => {
        alert("Business settings saved!");
    };

    return (
        <div className="min-h-screen  p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <h1 className="text-3xl font-bold text-zinc-800 dark:text-zinc-100">
                    Business Settings
                </h1>

                <Separator />

                {/* Business Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>Business Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-zinc-700 dark:text-zinc-200">Business Name</label>
                            <Input
                                value={businessName}
                                onChange={(e) => setBusinessName(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-zinc-700 dark:text-zinc-200">Address</label>
                            <Input value={address} onChange={(e) => setAddress(e.target.value)} />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-zinc-700 dark:text-zinc-200">Phone</label>
                            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
                        </div>
                    </CardContent>
                </Card>

                {/* Opening Hours */}
                <Card>
                    <CardHeader>
                        <CardTitle>Opening Hours</CardTitle>
                    </CardHeader>

                    <BusinessHoursInput />
                </Card>

                {/* Branding / Logo */}
                <BusinessLogoInput />

                {/* Save Button */}
                <div className="flex justify-end">
                    <Button onClick={handleSave}>Save Settings</Button>
                </div>
            </div>
        </div>
    );
};

export default BusinessSettingsPage;
