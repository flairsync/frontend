import React, { useState } from 'react';
import { usePageContext } from 'vike-react/usePageContext';
import { MarketplaceLayout } from '@/components/marketplace/MarketplaceLayout';
import { useMarketplaceItemDetails } from '@/features/marketplace/useMarketplace';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useMyBusinesses } from '@/features/business/useMyBusinesses';
import { motion } from 'framer-motion';
import { ChevronLeft, ShoppingCart, Info, Truck, Loader2 } from 'lucide-react';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';

function formatPrice(price: number, currency: string) {
    try {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(price);
    } catch {
        return `${currency} ${price.toFixed(2)}`;
    }
}

export function Page() {
    const { routeParams } = usePageContext();
    const { id } = routeParams;
    const { myBusinesses, loadingMyBussinesses } = useMyBusinesses();
    const { data: item, isLoading } = useMarketplaceItemDetails(id);

    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [selectedBusiness, setSelectedBusiness] = useState<string>('');
    const [instructions, setInstructions] = useState('');
    const [shippingDetails, setShippingDetails] = useState({
        fullName: '',
        address: '',
        cityStateZip: '',
        phone: ''
    });

    if (isLoading) {
        return (
            <MarketplaceLayout activeType="saas" title="Shop" subtitle="Loading...">
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            </MarketplaceLayout>
        );
    }

    if (!item) {
        return (
            <MarketplaceLayout activeType="saas" title="Shop" subtitle="Item Not Found">
                <div className="flex flex-col items-center justify-center py-20">
                    <h2 className="text-xl font-bold">Product not found</h2>
                    <a href="/marketplace/saas" className="mt-4 text-primary hover:underline transition-all font-medium">Return to Gallery</a>
                </div>
            </MarketplaceLayout>
        );
    }

    const inStock = item.stock > 0;
    const isShippingValid =
        shippingDetails.fullName.trim() !== '' &&
        shippingDetails.address.trim() !== '' &&
        shippingDetails.cityStateZip.trim() !== '' &&
        shippingDetails.phone.trim() !== '';

    const handleOrder = () => {
        console.log('Order Initialized:', { item, quantity, selectedBusiness, instructions, shippingDetails });
        alert('Order initialized successfully!');
    };

    return (
        <MarketplaceLayout activeType="saas" title="SaaS Shop" subtitle={item.name}>
            <div className="max-w-7xl mx-auto px-6 py-4">
                <a
                    href="/marketplace/saas"
                    className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-10 group text-sm font-medium"
                >
                    <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    Back to Gallery
                </a>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
                    {/* LEFT: Image gallery */}
                    <div className="space-y-4">
                        <PhotoProvider>
                            <div className="rounded-2xl overflow-hidden bg-secondary/5 border border-white/5 shadow-xl">
                                {item.images.length > 0 ? (
                                    <PhotoView src={item.images[selectedImage]}>
                                        <img
                                            src={item.images[selectedImage]}
                                            alt={item.name}
                                            className="w-full aspect-[4/3] object-cover cursor-zoom-in hover:scale-[1.01] transition-transform duration-500"
                                        />
                                    </PhotoView>
                                ) : (
                                    <div className="w-full aspect-[4/3] bg-gradient-to-br from-primary/10 to-secondary/30 flex items-center justify-center">
                                        <span className="text-6xl opacity-30">📦</span>
                                    </div>
                                )}
                            </div>
                        </PhotoProvider>

                        {item.images.length > 1 && (
                            <div className="flex gap-3">
                                {item.images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage(idx)}
                                        className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${selectedImage === idx ? 'border-primary' : 'border-white/10 opacity-60 hover:opacity-100'}`}
                                    >
                                        <img src={img} alt={`Thumbnail ${idx + 1}`} loading="lazy" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* RIGHT: Details & form */}
                    <div className="space-y-8">
                        <div className="space-y-4 border-b border-white/5 pb-6">
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-bold tracking-tight text-foreground flex-1">{item.name}</h1>
                                <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${inStock ? 'bg-green-500/15 text-green-500' : 'bg-muted text-muted-foreground'}`}>
                                    {inStock ? `In stock (${item.stock})` : 'Out of stock'}
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-2xl font-bold text-primary">
                                    {formatPrice(item.price, item.currency || 'USD')}
                                </span>
                                {item.category && (
                                    <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
                                        {item.category}
                                    </span>
                                )}
                            </div>
                            {item.description && (
                                <p className="text-muted-foreground leading-relaxed text-sm max-w-xl">
                                    {item.description}
                                </p>
                            )}
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">Business</Label>
                                    <Select onValueChange={setSelectedBusiness} value={selectedBusiness}>
                                        <SelectTrigger className="h-10 bg-secondary/10 border-white/5 rounded-lg focus:ring-primary/30 text-xs">
                                            <SelectValue placeholder="Select Business..." />
                                        </SelectTrigger>
                                        <SelectContent className="bg-background border-white/10">
                                            {myBusinesses?.map((biz: any) => (
                                                <SelectItem key={biz.id} value={biz.id}>{biz.name}</SelectItem>
                                            ))}
                                            {loadingMyBussinesses && <SelectItem value="loading" disabled>Loading...</SelectItem>}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">Quantity</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        max={item.stock || undefined}
                                        value={quantity}
                                        onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                                        className="h-10 bg-secondary/10 border-white/5 rounded-lg px-4 text-sm font-medium"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-white/5">
                                <div className="flex items-center gap-2 text-primary">
                                    <Truck className="w-4 h-4" />
                                    <h3 className="text-xs font-bold uppercase tracking-wider">Shipping Details</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-medium text-muted-foreground/60">Full Name</Label>
                                        <Input
                                            placeholder="Recipient name"
                                            className="h-10 bg-secondary/5 border-white/5 text-xs"
                                            value={shippingDetails.fullName}
                                            onChange={(e) => setShippingDetails({ ...shippingDetails, fullName: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-medium text-muted-foreground/60">Contact Number</Label>
                                        <Input
                                            placeholder="+1 (555) 000-0000"
                                            className="h-10 bg-secondary/5 border-white/5 text-xs"
                                            value={shippingDetails.phone}
                                            onChange={(e) => setShippingDetails({ ...shippingDetails, phone: e.target.value })}
                                        />
                                    </div>
                                    <div className="md:col-span-2 space-y-1.5">
                                        <Label className="text-[10px] font-medium text-muted-foreground/60">Street Address</Label>
                                        <Input
                                            placeholder="123 business avenue, suite 100"
                                            className="h-10 bg-secondary/5 border-white/5 text-xs"
                                            value={shippingDetails.address}
                                            onChange={(e) => setShippingDetails({ ...shippingDetails, address: e.target.value })}
                                        />
                                    </div>
                                    <div className="md:col-span-2 space-y-1.5">
                                        <Label className="text-[10px] font-medium text-muted-foreground/60">City, State, Zip Code</Label>
                                        <Input
                                            placeholder="New York, NY 10001"
                                            className="h-10 bg-secondary/5 border-white/5 text-xs"
                                            value={shippingDetails.cityStateZip}
                                            onChange={(e) => setShippingDetails({ ...shippingDetails, cityStateZip: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 pt-4 border-t border-white/5">
                                <Label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">Customization Details (optional)</Label>
                                <Textarea
                                    placeholder="Enter specific numbers, letters, or branding instructions..."
                                    className="min-h-[80px] bg-secondary/5 border-white/5 rounded-lg p-4 text-xs resize-none focus:ring-primary/30"
                                    value={instructions}
                                    onChange={(e) => setInstructions(e.target.value)}
                                />
                                <p className="text-[10px] text-muted-foreground/50 flex items-center gap-2 font-medium">
                                    <Info className="w-3.5 h-3.5" />
                                    Include any specific details for your custom order.
                                </p>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-white/5 space-y-4">
                            <div className="flex justify-between items-end">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Total Estimated Cost</p>
                                    <p className="text-3xl font-bold text-primary">
                                        {formatPrice(item.price * quantity, item.currency || 'USD')}
                                    </p>
                                </div>
                            </div>

                            <Button
                                onClick={handleOrder}
                                disabled={!inStock || !selectedBusiness || !isShippingValid}
                                className="w-full h-12 rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-primary/10 transition-all"
                            >
                                <ShoppingCart className="w-4 h-4 mr-2" />
                                Initialize Order
                            </Button>

                            {(!selectedBusiness || !isShippingValid || !inStock) && (
                                <p className="text-[10px] text-center text-muted-foreground font-medium italic">
                                    {!inStock ? "This item is out of stock" : !selectedBusiness ? "Please select a business" : "Please fill in all shipping details"}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </MarketplaceLayout>
    );
}
