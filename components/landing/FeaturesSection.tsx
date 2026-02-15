import React, { useLayoutEffect, useRef } from "react";
import { animate, createScope, onScroll, Scope, utils } from "animejs";
import { useTranslation } from "react-i18next";

const FeaturesSection = () => {
    const { t } = useTranslation();
    const scope = useRef<Scope>(null);

    useLayoutEffect(() => {
        scope.current = createScope().add((self) => {
            utils.$("#header_feature_section").forEach(($square) => {
                animate($square, {
                    opacity: [0, 1],
                    x: ["-10rem", "0rem"],
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
            <div className="flex w-full py-16 md:py-24 bg-zinc-50/50">
                <div
                    id={"header_feature_section"}
                    className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col md:flex-row items-center gap-12 lg:gap-24"
                >
                    {/* Image Section */}
                    <div className="flex-1 w-full gap-4 flex lg:flex-row flex-col items-center justify-center">
                        <div className="relative w-full max-w-md lg:max-w-none flex gap-4 items-center justify-center">
                            <img
                                src="https://images.pexels.com/photos/2612334/pexels-photo-2612334.jpeg"
                                alt="Restaurant ambiance"
                                className="w-[45%] aspect-[3/4] object-cover rounded-2xl shadow-xl mt-12"
                            />
                            <img
                                src="https://images.pexels.com/photos/240223/pexels-photo-240223.jpeg"
                                alt="Customer dining"
                                className="w-[55%] aspect-[3/4] object-cover rounded-2xl shadow-2xl"
                            />
                        </div>
                    </div>

                    {/* Text Section */}
                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-[1.2] mb-6">
                            {t("landing_page.features.globalTitle")}
                        </h1>
                        <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
                            {t("landing_page.features.globalSubtitle")}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FeaturesSection;
