// components/product-details.tsx

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
    Star,
    Plus,
    Minus,
    Heart,
    GitCompare,
    Facebook,
    Twitter,
    Instagram,
    Youtube,
} from "lucide-react";

// Mock data for the product. In a real application, this would come from an API or a prop.
const product = {
    name: "Yummy Chicken Chup",
    price: 54.0,
    rating: 5.0,
    reviews: 22,
    description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque diam pellentesque bibendum non dui volutpat fringilla bibendum. Urna, vitae feugiat pretium donec id elementum. Ultrices mattis sed vitae mus risus. Lacus nisi, et ac dapibus eu velit in consequat.",
    images: [
        "/placeholder-main.jpg",
        "/placeholder-thumb1.jpg",
        "/placeholder-thumb2.jpg",
        "/placeholder-thumb3.jpg",
    ],
    category: "Pizza",
    tag: "Our Shop",
};

export function BusinessDetailsCard() {
    const [quantity, setQuantity] = useState(1);
    const [mainImage, setMainImage] = useState(product.images[0]);

    const handleQuantityChange = (type: "increment" | "decrement") => {
        if (type === "increment") {
            setQuantity(quantity + 1);
        } else if (type === "decrement" && quantity > 1) {
            setQuantity(quantity - 1);
        }
    };

    return (
        <div className="container mx-auto p-4 md:p-8 lg:p-12">
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Image Gallery Section */}
                <div className="flex-shrink-0 flex flex-col-reverse lg:flex-row gap-4 w-full lg:w-1/2">
                    {/* Thumbnails */}
                    <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible">
                        {product.images.map((imgSrc, index) => (
                            <div
                                key={index}
                                className={`w-24 h-24 relative cursor-pointer border-2 ${mainImage === imgSrc ? "border-primary" : "border-transparent"
                                    }`}
                                onClick={() => setMainImage(imgSrc)}
                            >
                                <img
                                    src={imgSrc}
                                    alt={`Thumbnail ${index + 1}`}
                                    className="rounded-md"
                                />
                            </div>
                        ))}
                    </div>

                    {/* Main Image */}
                    <div className="relative w-full aspect-[4/3] lg:aspect-[3/4]">
                        <img
                            src={mainImage}
                            alt={product.name}
                            className="rounded-md"
                        />
                        <div className="absolute top-4 left-4 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                            In stock
                        </div>
                    </div>
                </div>

                {/* Product Details Section */}
                <div className="flex-grow w-full lg:w-1/2 p-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold">{product.name}</h1>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span className="cursor-pointer">← Prev</span>
                            <Separator orientation="vertical" className="h-4" />
                            <span className="cursor-pointer">Next →</span>
                        </div>
                    </div>

                    <div className="text-4xl font-extrabold text-gray-900">
                        ${product.price.toFixed(2)}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="flex items-center">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                    key={i}
                                    className={`w-4 h-4 ${i < product.rating
                                            ? "text-yellow-400 fill-yellow-400"
                                            : "text-gray-300"
                                        }`}
                                />
                            ))}
                        </div>
                        <span>{product.rating.toFixed(1)} Rating</span>
                        <Separator orientation="vertical" className="h-4" />
                        <span>{product.reviews} Review</span>
                    </div>

                    <p className="text-gray-600 leading-relaxed">{product.description}</p>

                    <div className="flex items-center gap-4 py-4">
                        {/* Quantity Selector */}
                        <div className="flex items-center border rounded-md overflow-hidden">
                            <Button
                                variant="outline"
                                size="icon"
                                className="rounded-none"
                                onClick={() => handleQuantityChange("decrement")}
                            >
                                <Minus className="h-4 w-4" />
                            </Button>
                            <Input
                                type="number"
                                value={quantity}
                                onChange={(e) => setQuantity(Number(e.target.value))}
                                className="w-16 text-center border-x-0 focus:border-x-0 focus-visible:ring-0"
                                readOnly
                            />
                            <Button
                                variant="outline"
                                size="icon"
                                className="rounded-none"
                                onClick={() => handleQuantityChange("increment")}
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                        {/* Add to Cart Button */}
                        <Button className="bg-orange-500 hover:bg-orange-600 text-white text-lg px-8 py-6 rounded-md shadow-lg">
                            Add to cart
                        </Button>
                    </div>

                    <div className="flex items-center gap-4 text-gray-500 text-sm py-2">
                        <div className="flex items-center gap-2 cursor-pointer">
                            <Heart className="h-5 w-5" />
                            <span>Add to Wishlist</span>
                        </div>
                        <div className="flex items-center gap-2 cursor-pointer">
                            <GitCompare className="h-5 w-5" />
                            <span>Compare</span>
                        </div>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600 pt-4">
                        <p>
                            <span className="font-semibold">Category:</span> {product.category}
                        </p>
                        <p>
                            <span className="font-semibold">Tag:</span> {product.tag}
                        </p>
                    </div>

                    <div className="flex items-center gap-2 pt-4">
                        <span className="font-semibold text-gray-600">Share:</span>
                        <div className="flex gap-3 text-gray-500">
                            <Facebook className="h-5 w-5 cursor-pointer hover:text-blue-600 transition-colors" />
                            <Twitter className="h-5 w-5 cursor-pointer hover:text-blue-400 transition-colors" />
                            <Instagram className="h-5 w-5 cursor-pointer hover:text-pink-600 transition-colors" />
                            <Youtube className="h-5 w-5 cursor-pointer hover:text-red-600 transition-colors" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}