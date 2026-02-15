import React, { useLayoutEffect, useRef } from "react";
import { Button } from "../ui/button";
import { useTranslation } from "react-i18next";
import { createScope, Scope, createTimeline, stagger, text, animate } from "animejs";

const LandingHero = () => {
    const { t } = useTranslation();
    const scope = useRef<Scope>(null);

    useLayoutEffect(() => {
        scope.current = createScope().add((self) => {
            let { words } = text.split(".title_text", { words: { wrap: "clip" }, chars: true });
            createTimeline({ loop: false, defaults: { ease: "inOut(3)", duration: 650 } })
                .add(words, { y: [$el => +$el.dataset.line % 2 ? "120%" : "120%", "0%"] }, stagger(125))
                .init();

            let newD = text.split(".description_text", { words: { wrap: "clip" }, chars: true });
            createTimeline({ loop: false, defaults: { ease: "inOut(3)", duration: 650 } })
                .add(newD.words, { y: [$el => +$el.dataset.line % 2 ? "120%" : "120%", "0%"] }, stagger(125))
                .init();

            createTimeline({ loop: false, defaults: { duration: 1200, ease: "inOut(3)" } })
                .add(".hero_image", { opacity: [0, 1], scale: [1.05, 1] })
                .init();

            animate("#hero_trial_bt", { autoplay: true, opacity: [0, 1], duration: 2000, delay: 500 });
        });

        return () => scope.current?.revert();
    }, []);

    return (
        <section className="relative w-full pt-20 md:pt-24 pb-12 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col-reverse md:flex-row items-center md:items-start gap-12 min-h-[500px]">
                {/* Left section */}
                <div className="flex-1 text-center md:text-left h-full flex flex-col justify-center">
                    <h1 className="title_text leading-[1.2] text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-foreground mb-6">
                        {t("landing_page.hero.title")}
                    </h1>
                    <p className="description_text text-lg sm:text-xl md:text-2xl text-foreground/80 mb-8 max-w-2xl mx-auto md:mx-0">
                        {t("landing_page.hero.subtitle")}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start" id="hero_trial_bt">
                        <Button className="px-8 py-6 text-lg md:w-auto w-full rounded-lg font-bold transition hover:scale-105 active:scale-95 shadow-lg shadow-primary/20">
                            {t("landing_page.hero.trialButton")}
                        </Button>
                        <Button variant="outline" className="px-8 py-6 text-lg md:w-auto w-full rounded-lg font-bold transition hover:scale-105 active:scale-95 border-2">
                            {t("landing_page.hero.explainButton")}
                        </Button>
                    </div>
                </div>

                {/* Right section */}
                <div className="hero_image flex-1 flex justify-center md:justify-end w-full relative">
                    <div className="relative w-full max-w-[600px] aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500 ease-out">
                        <img
                            src="./images/landing/hero.png"
                            alt="Hero Illustration"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-tr from-black/10 to-transparent pointer-events-none" />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default LandingHero;
