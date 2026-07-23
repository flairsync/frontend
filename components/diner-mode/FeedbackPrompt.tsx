import React from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import FeedbackForm from './FeedbackForm';
import { useSubmitFeedback } from '@/features/diner-mode/useDinerMode';
import { SubmitOrderFeedbackPayload } from '@/features/discovery/discovery.api';

interface FeedbackPromptProps {
    businessId: string;
    orderId: string;
    open: boolean;
    onClose: () => void;
}

export default function FeedbackPrompt({ businessId, orderId, open, onClose }: FeedbackPromptProps) {
    const { t } = useTranslation('diner');
    const submitFeedback = useSubmitFeedback(businessId, orderId);

    const handleSubmit = (payload: SubmitOrderFeedbackPayload) => {
        submitFeedback.mutate(payload, {
            onSuccess: () => {
                toast.success(t('feedback.success'));
                onClose();
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
            <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{t('feedback.prompt_title')}</DialogTitle>
                    <DialogDescription>{t('feedback.prompt_description')}</DialogDescription>
                </DialogHeader>
                <FeedbackForm onSubmit={handleSubmit} isSubmitting={submitFeedback.isPending} />
            </DialogContent>
        </Dialog>
    );
}
