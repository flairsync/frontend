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
                        leave: "center top",
                    }),
                });
            });
        });

        return () => scope.current?.revert();
    }, []);

    return (
        <div>
            <div className="flex w-full">
                <div
                    id={"header_feature_section"}
                    className="w-full p-8 flex flex-col md:flex-row items-center gap-8"
                >
                    {/* Image Section */}
                    <div className="flex-1 gap-4 flex lg:flex-row flex-col items-center justify-center space-y-4">
                        <img
                            src="https://images.pexels.com/photos/2612334/pexels-photo-2612334.jpeg"
                            alt="A person holding a phone and a book on a table"
                            className="w-[40%] h-auto object-contain rounded-2xl"
                        />
                        <img
                            src="https://images.pexels.com/photos/240223/pexels-photo-240223.jpeg"
                            alt="A person holding a phone and a book on a table"
                            className="w-[50%] h-auto object-cover rounded-2xl"
                        />
                    </div>

                    {/* Text Section */}
                    <div className="flex-1 text-center md:text-left px-4">
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight">
                            {t("landing_page.features.globalTitle")}
                        </h1>
                        <p className="mt-6 text-base sm:text-lg text-gray-600 leading-relaxed">
                            {t("landing_page.features.globalSubtitle")}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FeaturesSection;
