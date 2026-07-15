import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Building2 } from "lucide-react";

export const OrganizationExplainer: React.FC = () => (
    <Card>
        <CardContent className="pt-6">
            <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                    <h2 className="text-sm font-semibold mb-1">What's an Organization?</h2>
                    <p className="text-sm text-muted-foreground max-w-2xl">
                        The top of your multi-location structure. It can hold branches directly, or hold
                        whole Regions — each grouping their own branches underneath. You own it, and every
                        link works in either direction: invite a branch or region in, or approve one that
                        asks to join. Nothing links without approval, and leaving works the same way in reverse.
                    </p>
                </div>
            </div>
        </CardContent>
    </Card>
);
