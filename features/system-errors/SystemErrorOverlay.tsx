import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSystemErrorStore } from './SystemErrorStore';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, RefreshCw, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const SystemErrorOverlay: React.FC = () => {
    const { isLocked, errorType, unlock } = useSystemErrorStore();
    const { t } = useTranslation();

    React.useEffect(() => {
        if (isLocked) {
            document.body.style.overflow = 'hidden';
            // Disable any kind of keyboard interaction that might bypass (optional)
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isLocked]);

    const handleRetry = () => {
        // Attempt to unlock and reload or just let the app retry naturally
        unlock();
        window.location.reload();
    };

    if (!isLocked) return null;

    return (
        <AnimatePresence>
            {isLocked && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[99999] flex items-center justify-center bg-background/60 backdrop-blur-2xl"
                    onPointerDown={(e) => e.stopPropagation()}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="max-w-md w-full p-8 mx-4 text-center rounded-3xl border bg-card shadow-2xl space-y-6"
                    >
                        <div className="flex justify-center">
                            <div className="p-4 rounded-full bg-destructive/10 text-destructive">
                                {errorType === 'network' ? (
                                    <WifiOff size={48} />
                                ) : (
                                    <AlertTriangle size={48} />
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold tracking-tight">
                                {errorType === 'network'
                                    ? t('errors.technical.network_title', 'Connection Lost')
                                    : t('errors.technical.error_title', 'Service Unavailable')}
                            </h2>
                            <p className="text-muted-foreground">
                                {errorType === 'network'
                                    ? t('errors.technical.network_error_desc', 'We are unable to connect to our servers. Please check your internet connection.')
                                    : t('errors.technical.server_error_desc', 'We are experiencing technical difficulties. Please try again later.')}
                            </p>
                        </div>

                        <div className="pt-4">
                            <Button
                                onClick={handleRetry}
                                size="lg"
                                className="w-full flex items-center gap-2 rounded-xl h-12 text-base font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <RefreshCw size={18} className="animate-spin-slow" />
                                {t('shared.actions.retry', 'Retry Connection')}
                            </Button>
                        </div>

                        <p className="text-xs text-muted-foreground/60 italic">
                            {t('errors.technical.working_on_it', "We're aware of the issue and working to restore access.")}
                        </p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
