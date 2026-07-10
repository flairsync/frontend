import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, Mail, MapPin, Globe } from "lucide-react";

export interface ContactCardProps {
    title?: string;
    // Auto-bound business facts — never owner-editable text, see registry defaultBindings.
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
}

const ContactCard: React.FC<ContactCardProps> = ({ title = "Contact & Location", address, phone, email, website }) => {
    const hasAny = !!(address || phone || email || website);

    return (
        <section className="space-y-8">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-center">{title}</h2>
            <Card className="max-w-2xl mx-auto rounded-[2rem] border-border/50 shadow-lg">
                <CardContent className="p-8 space-y-5">
                    {address && (
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-primary/10 text-primary shrink-0">
                                <MapPin size={20} />
                            </div>
                            <a
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium hover:text-primary transition-colors"
                            >
                                {address}
                            </a>
                        </div>
                    )}
                    {phone && (
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 shrink-0">
                                <Phone size={20} />
                            </div>
                            <a href={`tel:${phone}`} className="font-medium hover:text-primary transition-colors">{phone}</a>
                        </div>
                    )}
                    {email && (
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-600 shrink-0">
                                <Mail size={20} />
                            </div>
                            <a href={`mailto:${email}`} className="font-medium hover:text-primary transition-colors">{email}</a>
                        </div>
                    )}
                    {website && (
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-violet-500/10 text-violet-600 shrink-0">
                                <Globe size={20} />
                            </div>
                            <a
                                href={website.startsWith("http") ? website : `https://${website}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium hover:text-primary transition-colors"
                            >
                                {website}
                            </a>
                        </div>
                    )}
                    {!hasAny && (
                        <p className="text-muted-foreground text-sm text-center py-4">No contact information available yet.</p>
                    )}
                </CardContent>
            </Card>
        </section>
    );
};

export default ContactCard;
