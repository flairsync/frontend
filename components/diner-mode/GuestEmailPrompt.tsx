import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSetGuestOrderEmail } from '@/features/diner-mode/useDinerMode';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface GuestEmailPromptProps {
    businessId: string;
    orderId: string;
    open: boolean;
    onClose: () => void;
}

export default function GuestEmailPrompt({ businessId, orderId, open, onClose }: GuestEmailPromptProps) {
    const { t } = useTranslation('diner');
    const [email, setEmail] = useState('');
    const setGuestOrderEmail = useSetGuestOrderEmail(businessId);

    const handleSubmit = () => {
        if (!EMAIL_REGEX.test(email)) {
            toast.error(t('guest_email_prompt.invalid'));
            return;
        }
        setGuestOrderEmail.mutate(
            { orderId, email },
            {
                onSuccess: () => {
                    toast.success(t('guest_email_prompt.success'));
                    onClose();
                },
            }
        );
    };

    return (
        <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>{t('guest_email_prompt.title')}</DialogTitle>
                    <DialogDescription>{t('guest_email_prompt.description')}</DialogDescription>
                </DialogHeader>
                <Input
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder={t('guest_email_prompt.placeholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                />
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="ghost" onClick={onClose} disabled={setGuestOrderEmail.isPending}>
                        {t('guest_email_prompt.skip')}
                    </Button>
                    <Button onClick={handleSubmit} disabled={setGuestOrderEmail.isPending}>
                        {t('guest_email_prompt.submit')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
