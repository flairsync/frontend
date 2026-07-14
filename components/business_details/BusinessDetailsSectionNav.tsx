import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useSectionObserver } from "@/hooks/useSectionObserver";

interface BusinessDetailsSectionNavProps {
    hasMenu: boolean;
    hasReservations: boolean;
}

const BusinessDetailsSectionNav: React.FC<BusinessDetailsSectionNavProps> = ({ hasMenu, hasReservations }) => {
    const { t } = useTranslation("feed");

    const items = useMemo(() => {
        const list = [{ id: "overview-section", label: t("business_page.nav.overview", "Overview") }];
        if (hasMenu) list.push({ id: "menu-section", label: t("business_page.nav.menu", "Menu") });
        if (hasReservations) list.push({ id: "reservation-section", label: t("business_page.nav.reserve", "Reserve") });
        list.push({ id: "reviews-section", label: t("business_page.nav.reviews", "Reviews") });
        list.push({ id: "contact-section", label: t("business_page.nav.contact", "Contact") });
        return list;
    }, [hasMenu, hasReservations, t]);

    const ids = useMemo(() => items.map((i) => i.id), [items]);
    const activeId = useSectionObserver(ids);

    const handleClick = (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    return (
        <nav
            className="sticky z-40 w-full bg-background/80 backdrop-blur-xl border-b border-border/50"
            style={{ top: "var(--public-header-height, 5rem)", marginTop: "var(--public-header-height, 5rem)" }}
        >
            <div className="max-w-6xl mx-auto px-6 py-3 overflow-x-auto">
                <div className="inline-flex bg-muted/50 rounded-2xl p-1 gap-1 border border-border/40 min-w-max">
                    {items.map((item) => (
                        <a
                            key={item.id}
                            href={`#${item.id}`}
                            onClick={(e) => handleClick(e, item.id)}
                            className={cn(
                                "px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all",
                                activeId === item.id
                                    ? "bg-background shadow-sm text-foreground"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {item.label}
                        </a>
                    ))}
                </div>
            </div>
        </nav>
    );
};

export default BusinessDetailsSectionNav;
