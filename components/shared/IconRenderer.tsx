// components/IconRenderer.tsx
import React from "react";
import { Coffee, Moon, Sun, ForkKnife, IceCream, Beer, Pizza } from "lucide-react";

const allIcons = { Coffee, Moon, Sun, ForkKnife, IceCream, Beer, Pizza };

type IconRendererProps = {
    icon?: string | null;
    className?: string;
};

export const IconRenderer: React.FC<IconRendererProps> = ({ icon, className }) => {
    if (icon && allIcons[icon as keyof typeof allIcons]) {
        const IconComponent = allIcons[icon as keyof typeof allIcons];
        return <IconComponent className={className} />;
    }
    // fallback icon
    return <Coffee className={className} />;
};
