import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export interface MenuListCategory {
    id: string;
    name: string;
    items?: { id: string; name: string; price: number; description?: string }[];
}

export interface MenuListProps {
    title?: string;
    description?: string;
    items?: MenuListCategory[];
    currency?: string;
}

const MenuList: React.FC<MenuListProps> = ({ title = "Our Menu", description, items = [], currency = "$" }) => {
    const categories = Array.isArray(items) ? items : [];

    return (
        <section className="space-y-8">
            <div className="text-center space-y-1">
                <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
                {description && <p className="text-muted-foreground">{description}</p>}
            </div>

            {categories.length > 0 ? (
                <Card className="rounded-[2rem] overflow-hidden border-border/50">
                    <CardContent className="p-0">
                        <Accordion type="multiple" defaultValue={[categories[0].id]} className="divide-y divide-border/50">
                            {categories.map((cat) => (
                                <AccordionItem key={cat.id} value={cat.id} className="border-none">
                                    <AccordionTrigger className="px-6 py-4 font-semibold">{cat.name}</AccordionTrigger>
                                    <AccordionContent className="px-6 pb-4 space-y-3">
                                        {(cat.items || []).map((item) => (
                                            <div key={item.id} className="flex justify-between items-start gap-4">
                                                <div>
                                                    <p className="font-medium">{item.name}</p>
                                                    {item.description && (
                                                        <p className="text-sm text-muted-foreground">{item.description}</p>
                                                    )}
                                                </div>
                                                <span className="font-bold text-primary shrink-0">{currency}{item.price}</span>
                                            </div>
                                        ))}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </CardContent>
                </Card>
            ) : (
                <div className="py-16 text-center border border-dashed border-border rounded-[2rem] text-muted-foreground">
                    No menu items to display yet.
                </div>
            )}
        </section>
    );
};

export default MenuList;
