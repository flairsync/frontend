import React from "react";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MapPin, Globe, Navigation } from "lucide-react";

export interface ContactSplitProps {
    title?: string;
    // Auto-bound business facts — never owner-editable text, see registry defaultBindings.
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
}

const ContactSplit: React.FC<ContactSplitProps> = ({ title = "Visit Us", address, phone, email, website }) => {
    const hasAny = !!(address || phone || email || website);
    const mapsUrl = address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}` : undefined;

    return (
        <section className="space-y-8">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-center">{title}</h2>
            <div className="grid sm:grid-cols-2 rounded-[2rem] overflow-hidden shadow-xl border border-border/50 min-h-[320px]">
                {/* Details */}
                <div className="p-8 sm:p-10 space-y-5 bg-card flex flex-col justify-center">
                    {phone && (
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 shrink-0"><Phone size={20} /></div>
                            <a href={`tel:${phone}`} className="font-medium hover:text-primary transition-colors">{phone}</a>
                        </div>
                    )}
                    {email && (
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-600 shrink-0"><Mail size={20} /></div>
                            <a href={`mailto:${email}`} className="font-medium hover:text-primary transition-colors">{email}</a>
                        </div>
                    )}
                    {website && (
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-violet-500/10 text-violet-600 shrink-0"><Globe size={20} /></div>
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
                    {!hasAny && <p className="text-muted-foreground text-sm">No contact information available yet.</p>}
                </div>

                {/* Stylized location panel */}
                <div className="relative flex flex-col items-center justify-center gap-4 p-8 text-center bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
                    <div className="p-4 rounded-full bg-white/15 backdrop-blur-sm">
                        <MapPin size={28} />
                    </div>
                    {address ? (
                        <>
                            <p className="font-semibold leading-relaxed max-w-[240px]">{address}</p>
                            <Button asChild variant="secondary" size="sm" className="rounded-full font-bold gap-1.5">
                                <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
                                    <Navigation size={14} /> Get Directions
                                </a>
                            </Button>
                        </>
                    ) : (
                        <p className="opacity-80 text-sm">Location not available yet.</p>
                    )}
                </div>
            </div>
        </section>
    );
};

export default ContactSplit;
