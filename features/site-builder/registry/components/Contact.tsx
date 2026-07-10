import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, Mail, MapPin, Globe } from "lucide-react";
import { DiscoveryBusinessProfile } from "@/models/discovery/DiscoveryBusinessProfile";

export interface ContactProps {
    title?: string;
    profile?: DiscoveryBusinessProfile | null;
}

const Contact: React.FC<ContactProps> = ({ title = "Contact & Location", profile }) => {
    const address = profile?.address || [profile?.city, profile?.country?.name].filter(Boolean).join(", ");

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
                    {profile?.phone && (
                        <div className="flex items-center gap-3">
                            <Phone size={18} className="text-primary shrink-0" />
                            <a href={`tel:${profile.phone}`} className="hover:underline">{profile.phone}</a>
                        </div>
                    )}
                    {profile?.email && (
                        <div className="flex items-center gap-3">
                            <Mail size={18} className="text-primary shrink-0" />
                            <a href={`mailto:${profile.email}`} className="hover:underline">{profile.email}</a>
                        </div>
                    )}
                    {profile?.website && (
                        <div className="flex items-center gap-3">
                            <Globe size={18} className="text-primary shrink-0" />
                            <a
                                href={profile.website.startsWith("http") ? profile.website : `https://${profile.website}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline"
                            >
                                {profile.website}
                            </a>
                        </div>
                    )}
                    {!address && !profile?.phone && !profile?.email && !profile?.website && (
                        <p className="text-muted-foreground text-sm">No contact information available yet.</p>
                    )}
                </CardContent>
            </Card>
        </section>
    );
};

export default Contact;
