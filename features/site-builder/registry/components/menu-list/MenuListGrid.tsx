import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export interface MenuListGridCategory {
    id: string;
    name: string;
    items?: { id: string; name: string; price: number; description?: string }[];
}

export interface MenuListGridProps {
    title?: string;
    description?: string;
    items?: MenuListGridCategory[];
    currency?: string;
}

const MenuListGrid: React.FC<MenuListGridProps> = ({ title = "Our Menu", description, items = [], currency = "$" }) => {
    const categories = Array.isArray(items) ? items : [];

    return (
        <section className="space-y-10">
            <div className="text-center space-y-1">
                <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
                {description && <p className="text-muted-foreground">{description}</p>}
            </div>

            {categories.length > 0 ? (
                <div className="space-y-10">
                    {categories.map((cat) => (
                        <div key={cat.id} className="space-y-4">
                            <h3 className="text-xl font-semibold">{cat.name}</h3>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {(cat.items || []).map((item) => (
                                    <Card key={item.id} className="rounded-2xl border-border/50">
                                        <CardContent className="p-5 space-y-1.5">
                                            <div className="flex justify-between items-start gap-2">
                                                <p className="font-semibold">{item.name}</p>
                                                <span className="font-bold text-primary shrink-0">
                                                    {currency}{item.price}
                                                </span>
                                            </div>
                                            {item.description && (
                                                <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="py-16 text-center border border-dashed border-border rounded-[2rem] text-muted-foreground">
                    No menu items to display yet.
                </div>
            )}
        </section>
    );
};

export default MenuListGrid;
