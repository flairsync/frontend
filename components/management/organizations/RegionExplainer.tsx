import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MapPinned } from "lucide-react";

export const RegionExplainer: React.FC = () => (
    <Card>
        <CardContent className="pt-6">
            <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <MapPinned className="h-5 w-5 text-primary" />
                </div>
                <div>
                    <h2 className="text-sm font-semibold mb-1">What's a Region?</h2>
                    <p className="text-sm text-muted-foreground max-w-2xl">
                        A cluster of branches under one regional manager. A region stands fully on its
                        own — it doesn't need an organization above it — but can link up to one later if
                        you want it rolled into a bigger group. Linking and leaving both require the other
                        side's approval, the same as everywhere else in this structure.
                    </p>
                </div>
            </div>
        </CardContent>
    </Card>
);
