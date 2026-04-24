import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  category: string;
  color?: string;
}

interface ProductCardProps {
  product: Product;
  onClick: (product: Product) => void;
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  return (
    <Card 
      className="cursor-pointer hover:border-primary transition-colors overflow-hidden group h-full flex flex-col active:scale-95 duration-75"
      onClick={() => onClick(product)}
    >
      {product.image ? (
        <div className="aspect-square w-full overflow-hidden">
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
          />
        </div>
      ) : (
        <div 
          className="aspect-square w-full flex items-center justify-center text-4xl font-bold text-white/20"
          style={{ backgroundColor: product.color || '#333' }}
        >
          {product.name.charAt(0)}
        </div>
      )}
      <CardContent className="p-3 flex-1 flex flex-col justify-between">
        <h3 className="font-semibold text-sm line-clamp-2">{product.name}</h3>
        <div className="mt-2 flex items-center justify-between">
          <span className="font-bold text-primary">${product.price.toFixed(2)}</span>
          <Badge variant="secondary" className="text-[10px]">{product.category}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
