import { useLayoutEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { BadgeCheck, Check } from 'lucide-react';
import React from 'react';
import { animate, createScope, onScroll, Scope, stagger, text, utils } from 'animejs';
import { useTranslation } from 'react-i18next';
import { useSubscriptions } from '@/features/subscriptions/useSubscriptions';
import { PricingType } from '@/models/SubscriptionPack';
import { usePageContext } from 'vike-react/usePageContext';
import { navigate } from 'vike/client/router';

const LandingPricingSection = () => {
    const { t } = useTranslation("landing");
    const { user } = usePageContext();
    const [isMonthly, setIsMonthly] = useState(true);
    const scope = useRef<Scope>(null);

    const { subscriptionPacks, fetchingPacks, currentUserSubscription, creatingCheckout } = useSubscriptions();

    const displayedPacks = subscriptionPacks?.filter(p => p.pricingType === (isMonthly ? PricingType.MONTHLY : PricingType.YEARLY)) || [];
    const freePack = displayedPacks.find(p => parseFloat(p.price.toString()) === 0);
    const paidPacks = displayedPacks.filter(p => parseFloat(p.price.toString()) > 0).slice(0, 3);

    const handleSubscribe = (pack: any) => {
        if (!user) {
            navigate(`/login?origin=${encodeURIComponent('/manage/plans')}&packId=${pack.id}`);
            return;
        }

        if (currentUserSubscription?.pack?.id === pack.id) return;

        navigate(`/manage/plans?packId=${pack.id}`);
    };

    useLayoutEffect(() => {
        scope.current = createScope().add(() => {
            utils.$(["#landing_pricing_cards_container", "#landing_pricing_free_container", "#landing_pricing_selector"]).forEach(($el) => {
                animate($el, {
                    opacity: [0, 1],
                    y: ["10rem", "0rem"],
                    duration: 900,
                    alternate: true,
                    easing: 'inOutQuad',
                    autoplay: onScroll({
                        sync: 'play',
                        enter: 'bottom top',
                        leave: 'center top',
                    }),
                });
            });

            const headerTxt = text.split('#landing_pricing_title', { chars: { wrap: 'clip' } });
            animate(headerTxt.chars, {
                y: [{ to: ['100%', '0%'] }],
                duration: 500,
                ease: 'out(3)',
                delay: stagger(30),
                loop: false,
                autoplay: onScroll({
                    sync: 'play',
                    enter: 'bottom top',
                    leave: 'center top',
                }),
            });
        });

        return () => scope.current?.revert();
    }, []);

    const PricingCard = ({ pack, isHighlighted }: { pack: any, isHighlighted: boolean }) => {
        const isFree = parseFloat(pack.price.toString()) === 0;
        const isCurrentPlan = !!user && currentUserSubscription?.pack?.id === pack.id;

        return (
            <Card
                className={cn(
                    "relative rounded-xl p-6 shadow-lg transform transition-all duration-300 hover:scale-[1.02] border-none flex flex-col h-full",
                    isHighlighted
                        ? 'bg-gradient-to-b from-[#8A89F9] to-[#6366F1] text-white ring-4 ring-[#8A89F9]/50 shadow-2xl z-10'
                        : 'bg-muted',
                    isCurrentPlan && 'ring-4 ring-emerald-500'
                )}
            >
                {isCurrentPlan && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white shadow-md z-20">
                        <BadgeCheck className="w-3.5 h-3.5" />
                        {t('subscriptions.current_plan_badge', 'Your Current Plan')}
                    </div>
                )}
                <CardHeader className="p-0 mb-6">
                    <CardTitle className={cn("text-2xl font-bold mb-4", !isHighlighted && 'text-foreground')}>
                        {pack.name}
                    </CardTitle>
                    <div className="flex items-baseline gap-1">
                        <h2 className={cn("text-5xl font-extrabold", isHighlighted ? 'text-white' : 'text-foreground')}>
                            {isFree ? "Free" : pack.getFormattedPrice()}
                        </h2>
                        {!isFree && (
                            <p className={cn("text-sm font-medium", isHighlighted ? "text-white/80" : "text-muted-foreground")}>
                                /mo
                            </p>
                        )}
                    </div>
                    <CardDescription className={cn("text-sm mt-4 min-h-[40px]", isHighlighted ? 'text-white/90' : 'text-muted-foreground')}>
                        {pack.description || pack.getShortDescription()}
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0 flex-1 flex flex-col">
                    <ul className="space-y-3 mb-8 flex-1">
                        <li className="flex items-center text-sm font-medium">
                            <Check className={cn("w-4 h-4 mr-3 shrink-0", isHighlighted ? 'text-white' : 'text-primary')} />
                            {t("subscriptions.limits.businesses", { count: pack.maxBusinesses })}
                        </li>
                        <li className="flex items-center text-sm font-medium">
                            <Check className={cn("w-4 h-4 mr-3 shrink-0", isHighlighted ? 'text-white' : 'text-primary')} />
                            {t("subscriptions.limits.employees", { count: pack.maxEmployees })}
                        </li>
                        <li className="flex items-center text-sm font-medium">
                            <Check className={cn("w-4 h-4 mr-3 shrink-0", isHighlighted ? 'text-white' : 'text-primary')} />
                            {t("subscriptions.limits.menus", { count: pack.maxMenus })}
                        </li>
                        <li className="flex items-center text-sm font-medium">
                            <Check className={cn("w-4 h-4 mr-3 shrink-0", isHighlighted ? 'text-white' : 'text-primary')} />
                            {t("subscriptions.limits.products", { count: pack.maxProducts })}
                        </li>
                        {pack.features.filter((f: string) => f !== 'api_access').map((feature: string, i: number) => (
                            <li key={i} className="flex items-center text-sm font-medium">
                                <Check className={cn("w-4 h-4 mr-3 shrink-0", isHighlighted ? 'text-white' : 'text-primary')} />
                                {t(`subscriptions.features.${feature}`, feature)}
                            </li>
                        ))}
                    </ul>
                    <div className="flex justify-center mt-auto pt-4">
                        <Button
                            className={cn("w-full py-6 font-semibold rounded-lg",
                                isHighlighted
                                    ? 'bg-[#98D26C] hover:bg-[#8ac263] text-zinc-900 shadow-md'
                                    : 'bg-background hover:bg-muted text-primary border border-primary'
                            )}
                            disabled={creatingCheckout || isCurrentPlan}
                            onClick={() => handleSubscribe(pack)}
                        >
                            {creatingCheckout ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                            ) : isCurrentPlan ? (
                                t('subscriptions.current_plan', 'Current Plan')
                            ) : isFree ? (
                                t('landing_page.hero.trialButton')
                            ) : (
                                t('landing_page.pricing.choose_plan_button')
                            )}
                        </Button>
                    </div>
                    {!isFree && (
                        <p className={cn("text-xs mt-3 text-center", isHighlighted ? 'text-white/70' : 'text-muted-foreground')}>
                            {t('landing_page.pricing.billed_note')}
                        </p>
                    )}
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="bg-muted/50 font-sans text-foreground flex flex-col items-center justify-center px-4 sm:px-8 py-16 sm:py-20">
            <div className="text-center mb-10">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-2" id='landing_pricing_title'>
                    {t('landing_page.pricing.title')}
                </h1>
            </div>

            {/* Toggle Buttons */}
            <div className="flex bg-muted p-1 rounded-full mb-16 relative gap-3" id='landing_pricing_selector'>
                <Button
                    onClick={() => setIsMonthly(true)}
                    className={cn(
                        "rounded-full px-6 py-2 transition-all duration-300 hover:cursor-pointer hover:scale-105",
                        isMonthly ? 'shadow-sm' : 'bg-transparent text-muted-foreground'
                    )}
                >
                    {t('landing_page.pricing.monthly_label')}
                </Button>
                <Button
                    onClick={() => setIsMonthly(false)}
                    className={cn(
                        "rounded-full px-6 py-2 transition-all duration-300 relative hover:cursor-pointer hover:scale-105",
                        !isMonthly ? 'shadow-sm' : 'bg-transparent text-muted-foreground'
                    )}
                >
                    {t('landing_page.pricing.yearly_label')}
                </Button>
            </div>

            {fetchingPacks && (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            )}

            {!fetchingPacks && (
                <div className="flex flex-col items-center w-full max-w-6xl mx-auto gap-16">
                    {/* Free Option - Top */}
                    {freePack && (
                        <div id='landing_pricing_free_container' className="w-full max-w-md">
                            <PricingCard pack={freePack} isHighlighted={false} />
                        </div>
                    )}

                    {/* Paid Options - Bottom Grid */}
                    {paidPacks.length > 0 && (
                        <div id='landing_pricing_cards_container' className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
                            {paidPacks.map((pack, index) => (
                                <PricingCard
                                    key={pack.id}
                                    pack={pack}
                                    isHighlighted={index === 1} // Highlight the middle paid plan
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default LandingPricingSection;
