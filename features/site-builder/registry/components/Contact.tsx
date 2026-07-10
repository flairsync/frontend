import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, Mail, MapPin, Globe } from "lucide-react";

export interface ContactProps {
    title?: string;
    // Auto-bound business facts — never owner-editable text, see registry defaultBindings.
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
}

const Contact: React.FC<ContactProps> = ({ title = "Contact & Location", address, phone, email, website }) => {
    const hasAny = !!(address || phone || email || website);

    return (
        <section className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight text-center">{title}</h2>
            <Card className="max-w-2xl mx-auto rounded-[2rem] border-border/50">
                <CardContent className="p-6 space-y-4">
                    {address && (
                        <div className="flex items-center gap-3">
                            <MapPin size={18} className="text-primary shrink-0" />
                            <span>{address}</span>
                        </div>
                    )}
                    {phone && (
                        <div className="flex items-center gap-3">
                            <Phone size={18} className="text-primary shrink-0" />
                            <a href={`tel:${phone}`} className="hover:underline">{phone}</a>
                        </div>
                    )}
                    {email && (
                        <div className="flex items-center gap-3">
                            <Mail size={18} className="text-primary shrink-0" />
                            <a href={`mailto:${email}`} className="hover:underline">{email}</a>
                        </div>
                    )}
                    {website && (
                        <div className="flex items-center gap-3">
                            <Globe size={18} className="text-primary shrink-0" />
                            <a
                                href={website.startsWith("http") ? website : `https://${website}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline"
                            >
                                {website}
                            </a>
                        </div>
                    )}
                    {!hasAny && (
                        <p className="text-muted-foreground text-sm">No contact information available yet.</p>
                    )}
                </CardContent>
            </Card>
        </section>
    );
};

export default Contact;
