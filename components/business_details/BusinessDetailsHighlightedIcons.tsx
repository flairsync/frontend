import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Star } from "lucide-react";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"

export default function BusinessDetailsHighlightedIcons() {
    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8">
            {/* Header Section */}
            <div className="space-y-4">

                <Carousel orientation="horizontal"
                    plugins={[
                        Autoplay({
                            delay: 2000,
                        }),
                    ]}

                >
                    <CarouselContent>
                        <CarouselItem><img
                            src="https://images.pexels.com/photos/33899554/pexels-photo-33899554.jpeg"
                            alt="Restaurant"
                            className="w-full h-80 object-cover rounded-2xl shadow-md"
                        /></CarouselItem>
                        <CarouselItem><img
                            src="https://images.pexels.com/photos/33899554/pexels-photo-33899554.jpeg"
                            alt="Restaurant"
                            className="w-full h-80 object-cover rounded-2xl shadow-md"
                        /></CarouselItem>
                        <CarouselItem><img
                            src="https://images.pexels.com/photos/33899554/pexels-photo-33899554.jpeg"
                            alt="Restaurant"
                            className="w-full h-80 object-cover rounded-2xl shadow-md"
                        /></CarouselItem>
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                </Carousel>


                <div className="flex justify-between items-center flex-wrap gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Cafe Montserrat</h1>
                        <p className="text-muted-foreground">
                            Cozy place with a great atmosphere, perfect for coffee and
                            pastries.
                        </p>
                    </div>
                    <Button>Reserve a Table</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Halal</Badge>
                    <Badge variant="secondary">Vegan Options</Badge>
                    <Badge variant="secondary">Family Friendly</Badge>
                </div>
            </div>

            <Separator />

            {/* Info Cards */}
            <div className="grid md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Rating</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                        <span className="font-medium">4.5 / 5 (128 reviews)</span>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <span className="text-green-600 font-medium">Open Now</span>
                        <p className="text-sm text-muted-foreground">
                            Closes at 11:00 PM
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Location</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>Carrer Major 12, Andorra la Vella, Andorra</p>
                        <Button className="mt-2" variant="outline">
                            View on Map
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <Separator />

            {/* Menu Section */}
            <section className="space-y-4">
                <h2 className="text-2xl font-semibold">Menu</h2>
                <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Coffee & Drinks</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex justify-between">
                                <span>Espresso</span>
                                <span>€2.50</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Cappuccino</span>
                                <span>€3.50</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Fresh Juice</span>
                                <span>€4.00</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Food</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex justify-between">
                                <span>Croissant</span>
                                <span>€2.00</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Sandwich</span>
                                <span>€5.50</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Salad</span>
                                <span>€6.00</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>

            <Separator />

            {/* Timing Section */}
            <section className="space-y-4">
                <h2 className="text-2xl font-semibold">Opening Hours</h2>
                <Card>
                    <CardContent className="space-y-2 pt-6">
                        <p>Monday - Friday: 8:00 AM - 11:00 PM</p>
                        <p>Saturday: 9:00 AM - 12:00 AM</p>
                        <p>Sunday: 9:00 AM - 10:00 PM</p>
                    </CardContent>
                </Card>
            </section>

            <Separator />

            {/* Reviews Section */}
            <section className="space-y-4">
                <h2 className="text-2xl font-semibold">Reviews</h2>

                <Card>
                    <CardContent className="space-y-2 pt-6">
                        <div className="flex items-center gap-2">
                            <img
                                src="https://i.pravatar.cc/40?img=1"
                                alt="User"
                                className="w-10 h-10 rounded-full"
                            />
                            <div>
                                <p className="font-medium">John Doe</p>
                                <span className="text-sm text-muted-foreground">
                                    ⭐⭐⭐⭐☆
                                </span>
                            </div>
                        </div>
                        <p>Great coffee and really friendly staff!</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="space-y-2 pt-6">
                        <div className="flex items-center gap-2">
                            <img
                                src="https://i.pravatar.cc/40?img=2"
                                alt="User"
                                className="w-10 h-10 rounded-full"
                            />
                            <div>
                                <p className="font-medium">Sarah Smith</p>
                                <span className="text-sm text-muted-foreground">
                                    ⭐⭐⭐⭐⭐
                                </span>
                            </div>
                        </div>
                        <p>
                            Loved the atmosphere, and the cappuccino was perfect. Will
                            definitely come again.
                        </p>
                    </CardContent>
                </Card>
            </section>

            <Separator />

            {/* Contact Section */}
            <section className="space-y-4">
                <h2 className="text-2xl font-semibold">Contact & Socials</h2>
                <Card>
                    <CardContent className="space-y-2 pt-6">
                        <p>📞 +376 123 456</p>
                        <p>📧 info@cafemontserrat.ad</p>
                        <div className="flex flex-wrap gap-3 pt-2">
                            <Button variant="outline">Instagram</Button>
                            <Button variant="outline">Facebook</Button>
                            <Button variant="outline">Website</Button>
                        </div>
                    </CardContent>
                </Card>
            </section>
        </div>
    );
}
