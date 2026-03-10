"use client";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import {
    Coffee,
    Sandwich,
    Salad,
    GlassWater,
    Pizza,
    CupSoda,
    ChevronRight,
    Search,
    Utensils,
    Info
} from "lucide-react";
import { Input } from "../ui/input";
import { BusinessMenu } from "@/models/business/menu/BusinessMenu";
import { Badge } from "../ui/badge";

import { BusinessMenuItem } from "@/models/business/menu/BusinessMenuItem";
import { DiscoveryBusinessProfile } from "@/models/discovery/DiscoveryBusinessProfile";
import { BusinessDetailsOrderModal } from "./BusinessDetailsOrderModal";

interface BusinessDetailsMenuProps {
    menu: BusinessMenu;
    business: DiscoveryBusinessProfile;
}

// Map category names to icons since we don't have an icon prop in the model
const getCategoryIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('coffee') || lowerName.includes('drink')) return <Coffee size={20} />;
    if (lowerName.includes('sandwich') || lowerName.includes('breakfast')) return <Sandwich size={20} />;
    if (lowerName.includes('salad')) return <Salad size={20} />;
    if (lowerName.includes('juice')) return <GlassWater size={20} />;
    if (lowerName.includes('pizza')) return <Pizza size={20} />;
    if (lowerName.includes('soda')) return <CupSoda size={20} />;
    return <Utensils size={20} />;
};

const BusinessDetailsMenu: React.FC<BusinessDetailsMenuProps> = ({ menu, business }) => {
    const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedItem, setSelectedItem] = useState<BusinessMenuItem | null>(null);
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

    const allowOrders = business.allowOrders;
    const categories = menu.getOrderedCategories();

    const filteredCategories = categories.map(cat => {
        const items = cat.items || [];
        return {
            ...cat,
            filteredItems: items.filter(item =>
                item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
            )
        }
    }).filter(cat => cat.filteredItems.length > 0);

    return (
        <section className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold tracking-tight">
                        {t("business_page.menu.section_title", "Discover Menu")}
                    </h2>
                    <p className="text-muted-foreground">{menu.description || t("business_page.menu.subtitle", "Handcrafted selections for every taste.")}</p>
                </div>

                <div className="relative max-w-xs w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <Input
                        placeholder={t("shared.actions.search_placeholder", "Search...")}
                        className="pl-10 h-11 rounded-xl bg-card border-border/50 focus:ring-primary/20"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {filteredCategories.length > 0 ? (
                <Card className="border-border/50 shadow-2xl shadow-primary/5 rounded-[2rem] overflow-hidden">
                    <CardContent className="p-0">
                        <Accordion type="multiple" defaultValue={[categories[0]?.id]} className="divide-y divide-border/50">
                            {filteredCategories.map((category) => (
                                <AccordionItem key={category.id} value={category.id} className="border-none">
                                    <AccordionTrigger className="flex items-center gap-4 px-8 py-6 hover:cursor-pointer hover:bg-muted/50 transition-all">
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className="p-3 bg-muted rounded-2xl text-muted-foreground transition-all duration-300">
                                                {getCategoryIcon(category.name)}
                                            </div>
                                            <div className="text-left">
                                                <span className="text-lg font-bold block">
                                                    {category.name}
                                                </span>
                                                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                                                    {category.filteredItems.length} {t("business_page.menu.items_count", "Items Available")}
                                                </span>
                                            </div>
                                        </div>
                                    </AccordionTrigger>

                                    <AccordionContent className="p-0">
                                        <div className="px-8 py-4 grid gap-4 border-t border-border/10">
                                            {category.filteredItems.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="group flex justify-between items-center p-4 rounded-2xl hover:bg-card hover:shadow-xl hover:shadow-primary/5 border border-transparent hover:border-border/50 transition-all cursor-pointer"
                                                    onClick={() => {
                                                        if (allowOrders) {
                                                            setSelectedItem(item);
                                                            setIsOrderModalOpen(true);
                                                        }
                                                    }}
                                                >
                                                    <div className="space-y-1 flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold text-foreground block">{item.name}</span>
                                                            {item.allergies && item.allergies.length > 0 && (
                                                                <Badge variant="outline" className="h-5 px-1.5 border-amber-200 bg-amber-50 text-amber-700 text-[10px]">
                                                                    <Info size={10} className="mr-1" />
                                                                    {t("business_page.menu.allergy_badge", "Allergy Info")}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        {item.description && (
                                                            <span className="text-sm text-muted-foreground line-clamp-1">{item.description}</span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-4 ml-4">
                                                        <span className="font-black text-primary bg-primary/5 px-3 py-1 rounded-lg">
                                                            €{item.price}
                                                        </span>
                                                        {allowOrders && (
                                                            <ChevronRight size={16} className="text-muted-foreground opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </CardContent>
                </Card>
            ) : (
                <div className="py-20 text-center bg-card border border-dashed border-border rounded-[2rem]">
                    <p className="text-muted-foreground">{t("shared.messages.no_results_found", "No items found matching your search.")}</p>
                </div>
            )}

            <BusinessDetailsOrderModal
                open={isOrderModalOpen}
                onClose={() => setIsOrderModalOpen(false)}
                item={selectedItem}
                business={business}
            />
        </section>
    );
};

export default BusinessDetailsMenu;

