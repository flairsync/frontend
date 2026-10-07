import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { UtensilsCrossed, ClipboardList, ChefHat } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DinerOnboardingHintProps {
    open: boolean;
    onDismiss: () => void;
}

// A one-time, plain-language explainer for the self-order paradigm itself — shown once per
// device on first landing in Diner Mode. Not everyone who scans a table QR code has used an
// app like this before, and nothing elsewhere in the flow explains what to do first.
export default function DinerOnboardingHint({ open, onDismiss }: DinerOnboardingHintProps) {
    const { t } = useTranslation('diner');

    const steps = [
        { icon: UtensilsCrossed, text: t('onboarding.step_1') },
        { icon: ClipboardList, text: t('onboarding.step_2') },
        { icon: ChefHat, text: t('onboarding.step_3') },
    ];

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    key="diner-onboarding"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm px-6"
                >
                    <div className="bg-card border rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-5">
                        <h2 className="text-xl font-bold text-center">{t('onboarding.title')}</h2>

                        <div className="space-y-4">
                            {steps.map((step, i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <div className="w-11 h-11 shrink-0 bg-primary/10 rounded-full flex items-center justify-center">
                                        <step.icon className="w-5 h-5 text-primary" />
                                    </div>
                                    <p className="text-base leading-snug">{step.text}</p>
                                </div>
                            ))}
                        </div>

                        <Button
                            className="w-full rounded-full h-12 text-base font-semibold"
                            onClick={onDismiss}
                        >
                            {t('onboarding.got_it')}
                        </Button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
