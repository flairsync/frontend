import React, { useState } from 'react';
import { usePageContext } from 'vike-react/usePageContext';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Loader2, CheckCircle2 } from 'lucide-react';
import {
    fetchDiscoveryProfileApiCall,
    fetchSingleOrderApiCall,
    submitOrderFeedbackApiCall,
    SubmitOrderFeedbackPayload,
} from '@/features/discovery/discovery.api';
import FeedbackForm from '@/components/diner-mode/FeedbackForm';

// Landing page for the feedback-request email link (/feedback/{businessId}/{orderId}).
// No login required — same "the order id is the bearer credential" trust model
// already used by the guest /my-orders/:orderId endpoint this page reads from.
export default function FeedbackLandingPage() {
    const pageContext = usePageContext();
    const businessId = pageContext.routeParams?.businessId as string;
    const orderId = pageContext.routeParams?.orderId as string;
    const { t } = useTranslation('diner');

    const { data: business } = useQuery({
        queryKey: ['feedback_business_profile', businessId],
        queryFn: () => fetchDiscoveryProfileApiCall(businessId),
        enabled: !!businessId,
    });

    const { data: order, isLoading, isError } = useQuery({
        queryKey: ['feedback_order_preview', businessId, orderId],
        queryFn: () => fetchSingleOrderApiCall(businessId, orderId),
        enabled: !!businessId && !!orderId,
        retry: false,
    });

    const [submitted, setSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (payload: SubmitOrderFeedbackPayload) => {
        setIsSubmitting(true);
        try {
            await submitOrderFeedbackApiCall(businessId, orderId, payload);
            setSubmitted(true);
        } catch (err: any) {
            toast.error(err.response?.data?.message ?? 'Failed to submit feedback. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-muted-foreground" size={28} />
            </div>
        );
    }

    if (isError || !order?.id) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center gap-2">
                <h1 className="text-lg font-semibold">{t('feedback.not_found_title')}</h1>
                <p className="text-sm text-muted-foreground">{t('feedback.not_found_description')}</p>
            </div>
        );
    }

    if (submitted || order.feedbackSubmitted) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center gap-3">
                <CheckCircle2 className="text-primary" size={40} />
                <h1 className="text-lg font-semibold">{t('feedback.success')}</h1>
            </div>
        );
    }

    return (
        <div className="min-h-screen px-4 py-10 sm:py-16">
            <div className="max-w-md mx-auto space-y-6">
                <div className="text-center space-y-1">
                    <h1 className="text-xl font-bold">
                        {t('feedback.page_title', { businessName: business?.name ?? '' })}
                    </h1>
                    <p className="text-sm text-muted-foreground">{t('feedback.page_description')}</p>
                </div>
                <FeedbackForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
            </div>
        </div>
    );
}
