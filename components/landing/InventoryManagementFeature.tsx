import { animate, createScope, onScroll, Scope, utils } from "animejs";
import React, { useLayoutEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

const InventoryManagementFeature = () => {
    const { t } = useTranslation();

    const scope = useRef<Scope>(null);

    useLayoutEffect(() => {
        scope.current = createScope().add((self) => {
            utils.$("#header_inventory_mgmt_section").forEach(($square) => {
                animate($square, {
                    opacity: [0, 1],
                    x: ["10rem", "0rem"],
                    duration: 3000,
                    alternate: true,
                    easing: "inOutQuad",
                    autoplay: onScroll({
                        sync: 1,
                        enter: "bottom center",
                        leave: "top top",
                    }),
                });
            });
        });

        return () => scope.current?.revert();
    }, []);

    return (
        <div>
            <div className="w-full py-16 md:py-24" id="header_inventory_mgmt_section">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col-reverse md:flex-row items-center gap-12 lg:gap-24">
                    {/* Text Section */}
                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-[1.2] mb-6">
                            {t("landing_page.features.inventoryManagement.title")}
                        </h1>
                        <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
                            {t("landing_page.features.inventoryManagement.subtitle")}
                        </p>
                    </div>

                    {/* Image Section */}
                    <div className="flex-1 w-full flex items-center justify-center">
                        <div className="relative w-full max-w-md lg:max-w-full aspect-video rounded-2xl overflow-hidden shadow-2xl">
                            <img
                                src="https://images.pexels.com/photos/6169634/pexels-photo-6169634.jpeg"
                                alt="Inventory management interface"
                                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InventoryManagementFeature;
