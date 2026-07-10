import React from "react";
import { motion } from "framer-motion";
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
        <section className="space-y-12">
            <div className="text-center space-y-2 max-w-xl mx-auto">
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{title}</h2>
                {description && <p className="text-muted-foreground text-lg leading-relaxed">{description}</p>}
            </div>

            {categories.length > 0 ? (
                <div className="space-y-12">
                    {categories.map((cat) => (
                        <div key={cat.id} className="space-y-5">
                            <div className="flex items-center gap-3">
                                <span className="h-6 w-1.5 rounded-full bg-primary shrink-0" />
                                <h3 className="text-xl font-bold tracking-tight">{cat.name}</h3>
                                <span className="text-xs font-semibold text-muted-foreground bg-muted rounded-full px-2.5 py-1">
                                    {(cat.items || []).length}
                                </span>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {(cat.items || []).map((item, i) => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, y: 12 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.4, delay: Math.min(i, 6) * 0.04 }}
                                    >
                                        <Card className="rounded-2xl border-border/50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 h-full">
                                            <CardContent className="p-5 space-y-2">
                                                <div className="flex justify-between items-start gap-3">
                                                    <p className="font-bold leading-snug">{item.name}</p>
                                                    <span className="font-bold text-primary bg-primary/10 rounded-full px-3 py-1 text-sm shrink-0">
                                                        {currency}{item.price}
                                                    </span>
                                                </div>
                                                {item.description && (
                                                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                                                        {item.description}
                                                    </p>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="py-20 text-center border border-dashed border-border rounded-[2rem] text-muted-foreground">
                    No menu items to display yet.
                </div>
            )}
        </section>
    );
};

export default MenuListGrid;
