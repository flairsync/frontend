import React from "react";
import { Plus, AlertCircle } from "lucide-react";
import type { MenuItem } from "@/features/pos/types";

interface ProductCardProps {
    product: MenuItem;
    onClick: (product: MenuItem) => void;
    quantity?: number;
}

export function ProductCard({ product, onClick, quantity }: ProductCardProps) {
    const hasVariants = product.variants.length > 0;
    const displayPrice = hasVariants
        ? `From $${Math.min(...product.variants.map((v) => v.price)).toFixed(2)}`
        : `$${product.basePrice.toFixed(2)}`;

    const thumbnail = product.images?.[0] ?? null;

    return (
        <button
            type="button"
            onClick={() => product.isAvailable && onClick(product)}
            disabled={!product.isAvailable}
            className={`group relative w-full text-left rounded-2xl overflow-hidden bg-card border border-border transition-all duration-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring flex flex-col ${
                product.isAvailable
                    ? "hover:border-primary/50 active:scale-95 cursor-pointer"
                    : "opacity-50 cursor-not-allowed"
            }`}
        >
            {/* Image / color area */}
            <div className="aspect-square w-full flex items-center justify-center relative overflow-hidden bg-muted">
                {thumbnail ? (
                    <img
                        src={thumbnail}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                ) : (
                    <span className="text-4xl font-black text-muted-foreground/20 select-none group-hover:scale-110 transition-transform duration-200">
                        {product.name.charAt(0)}
                    </span>
                )}

                {/* Quantity badge */}
                {quantity && quantity > 0 ? (
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-[10px] font-black flex items-center justify-center shadow-lg">
                        {quantity}
                    </div>
                ) : null}

                {/* Unavailable overlay */}
                {!product.isAvailable && (
                    <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                        <AlertCircle className="w-6 h-6 text-muted-foreground" />
                    </div>
                )}

                {/* Add overlay on hover */}
                {product.isAvailable && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-xl">
                            <Plus className="w-5 h-5 text-primary-foreground" />
                        </div>
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="p-3 flex flex-col gap-1">
                <h3 className="font-black text-xs uppercase tracking-tight line-clamp-1">
                    {product.name}
                </h3>
                <span className="text-sm font-black text-primary">{displayPrice}</span>
                {!product.isAvailable && (
                    <span className="text-[10px] text-muted-foreground font-bold uppercase">
                        Unavailable
                    </span>
                )}
            </div>
        </button>
    );
}
