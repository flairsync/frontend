import React from "react";

export interface MenuListElegantCategory {
    id: string;
    name: string;
    items?: { id: string; name: string; price: number; description?: string }[];
}

export interface MenuListElegantProps {
    title?: string;
    description?: string;
    items?: MenuListElegantCategory[];
    currency?: string;
}

const MenuListElegant: React.FC<MenuListElegantProps> = ({ title = "Our Menu", description, items = [], currency = "$" }) => {
    const categories = Array.isArray(items) ? items : [];

    return (
        <section className="space-y-14 max-w-3xl mx-auto">
            <div className="text-center space-y-2">
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{title}</h2>
                {description && <p className="text-muted-foreground text-lg leading-relaxed">{description}</p>}
            </div>

            {categories.length > 0 ? (
                <div className="space-y-14">
                    {categories.map((cat) => (
                        <div key={cat.id} className="space-y-6">
                            <div className="text-center space-y-2">
                                <h3 className="text-sm font-bold uppercase tracking-[0.25em] text-primary">{cat.name}</h3>
                                <div className="w-12 h-px bg-border mx-auto" />
                            </div>
                            <div className="space-y-5">
                                {(cat.items || []).map((item) => (
                                    <div key={item.id}>
                                        <div className="flex items-baseline gap-3">
                                            <span className="font-bold text-lg shrink-0">{item.name}</span>
                                            <span className="flex-1 border-b border-dotted border-border translate-y-[-5px]" />
                                            <span className="font-bold text-lg text-primary shrink-0">
                                                {currency}{item.price}
                                            </span>
                                        </div>
                                        {item.description && (
                                            <p className="text-sm text-muted-foreground italic mt-1 leading-relaxed">
                                                {item.description}
                                            </p>
                                        )}
                                    </div>
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

export default MenuListElegant;
