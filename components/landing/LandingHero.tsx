import React, { useEffect, useLayoutEffect, useRef } from 'react'
import { Button } from '../ui/button'
import { createTimeline, stagger, utils, text, Timeline, onScroll, animate, createScope, Scope } from 'animejs';
import { useTranslation } from 'react-i18next';



const LandingHero = () => {

    const { t } = useTranslation();
    const scope = useRef<Scope>(null);
    useLayoutEffect(() => {

        scope.current = createScope().add(self => {
            let { words, chars } = text.split('.title_text', {
                words: {
                    wrap: 'clip',
                },
                chars: true,
            });
            createTimeline({
                loop: false,
                defaults: { ease: 'inOut(3)', duration: 650 },
            })
                .add(words, {
                    y: [$el => +$el.dataset.line % 2 ? '120%' : '120%', '0%'],
                }, stagger(125))
                .init();

            let newD = text.split('.description_text', {
                words: {
                    wrap: 'clip',
                },
                chars: true,
            });

            createTimeline({
                loop: false,
                defaults: { ease: 'inOut(3)', duration: 650 }
            })
                .add(newD.words, {
                    y: [$el => +$el.dataset.line % 2 ? '120%' : '120%', '0%'],
                }, stagger(125))
                .init();


            // --- IMAGE animation (Option 1: Fade + Scale-in) ---
            createTimeline({
                loop: false,
                defaults: { duration: 1200, ease: 'inOut(3)' }
            })
                .add('.hero_image', {
                    opacity: [0, 1],
                    scale: [1.05, 1],
                })
                .init();

            animate("#hero_trial_bt", {
                autoplay: true,
                opacity: [0, 1],
                duration: 2000,
                delay: 500
            })

        })
        return () => scope.current?.revert()
    }, [])

    return (
        <section className="relative w-full pt-20 md:pt-24 " >
            <div className=" mx-auto  flex flex-col-reverse md:flex-row items-center md:items-start gap-12  h-[500px]">

                {/* Left section */}
                <div className="flex-1 text-center md:text-left md:pl-14  h-full ">
                    <h1 className="title_text leading-[1.3] text-4xl sm:text-4xl md:text-6xl font-extrabold text-foreground mb-4">
                        {t("landing_hero_title")}
                    </h1>
                    <p className="description_text text-lg sm:text-xl md:text-xl text-foreground mb-8">
                        {t("landing_hero_subtitle")}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start" id='hero_trial_bt'>
                        <Button
                            className="px-6 py-3 p-6 md:w-[200px]  rounded-md font-medium  transition hover:cursor-pointer">
                            {t("landing_hero_trial_bt")}
                        </Button>
                        <Button

                            className="px-6 py-3 p-6 md:w-[200px] rounded-md font-medium  transition hover:cursor-pointer">
                            {t("landing_hero_explain_bt")}
                        </Button>

                    </div>
                </div>

                {/* Right section */}
                <div className="hero_image flex-1 flex justify-center md:justify-end  w-full  ">
                    <img
                        src="./public/images/landing/hero.png"
                        alt="Hero Illustration"
                        className="w-full   rounded-lg shadow-lg h-[400px] object-cover rounded-l-full"
                    />
                </div>


            </div>

        </section>
    )
}

export default LandingHero