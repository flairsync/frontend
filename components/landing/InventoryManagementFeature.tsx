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
                        leave: "center top",
                    }),
                });
            });
        });

        return () => scope.current?.revert();
    }, []);

    return (
        <div>
            <div className="flex w-full" id="header_inventory_mgmt_section">
                <div className="w-full p-8 flex flex-col md:flex-row items-center gap-8">
                    {/* Text Section */}
                    <div className="flex-1 text-center md:text-left px-4">
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight">
                            {t("landing_page.features.inventoryManagement.title")}
                        </h1>
                        <p className="mt-6 text-base sm:text-lg text-gray-600 leading-relaxed">
                            {t("landing_page.features.inventoryManagement.subtitle")}
                        </p>
                    </div>

                    {/* Image Section */}
                    <div className="flex-1 gap-4 flex lg:flex-row flex-col items-center justify-center space-y-4">
                        <img
                            src="https://images.pexels.com/photos/6169634/pexels-photo-6169634.jpeg"
                            alt="A person holding a phone and a book on a table"
                            className="w-[100%] h-[300px] object-cover rounded-full"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InventoryManagementFeature;
