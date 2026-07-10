import React from "react";
import { AlertTriangle } from "lucide-react";

export interface FallbackProps {
    unresolvedTypeKey?: string;
    editing?: boolean;
}

const Fallback: React.FC<FallbackProps> = ({ unresolvedTypeKey, editing }) => {
    if (!editing) return null;

    return (
        <div className="flex items-center gap-3 rounded-2xl border border-dashed border-destructive/40 bg-destructive/5 px-6 py-8 text-destructive">
            <AlertTriangle size={20} className="shrink-0" />
            <div className="space-y-0.5">
                <p className="font-semibold text-sm">This block is no longer supported</p>
                <p className="text-xs opacity-80">
                    {unresolvedTypeKey ? `Unknown type "${unresolvedTypeKey}".` : ""} Remove or replace it.
                </p>
            </div>
        </div>
    );
};

export default Fallback;
