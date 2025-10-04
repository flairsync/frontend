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
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useTranslation } from 'react-i18next';
import BusinessDetailsReserveTableModal from "./BusinessDetailsReserveTableModal";

const BusinessDetailsHero = () => {
    const { t } = useTranslation();

    return (
        <div className="space-y-4">
            <Carousel
                orientation="horizontal"
                plugins={[Autoplay({ delay: 2000 })]}
            >
                <CarouselContent>
                    <CarouselItem>
                        <img
                            src="https://images.pexels.com/photos/33899554/pexels-photo-33899554.jpeg"
                            alt="Restaurant"
                            className="w-full h-80 object-cover rounded-2xl shadow-md"
                        />
                    </CarouselItem>
                    <CarouselItem>
                        <img
                            src="https://images.pexels.com/photos/33899554/pexels-photo-33899554.jpeg"
                            alt="Restaurant"
                            className="w-full h-80 object-cover rounded-2xl shadow-md"
                        />
                    </CarouselItem>
                    <CarouselItem>
                        <img
                            src="https://images.pexels.com/photos/33899554/pexels-photo-33899554.jpeg"
                            alt="Restaurant"
                            className="w-full h-80 object-cover rounded-2xl shadow-md"
                        />
                    </CarouselItem>
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
                {/* <Button>{t("business_page.header.reserve_table_button")}</Button> */}
                <BusinessDetailsReserveTableModal />
            </div>

            <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Halal</Badge>
                <Badge variant="secondary">Vegan Options</Badge>
                <Badge variant="secondary">Family Friendly</Badge>
            </div>
        </div>
    );
};

export default BusinessDetailsHero;
