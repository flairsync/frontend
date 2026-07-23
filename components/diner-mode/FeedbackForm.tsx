import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { SubmitOrderFeedbackPayload } from '@/features/discovery/discovery.api';

// Only overallRating is required — every other question is skippable to keep
// completion rates high (see backend SubmitFeedbackDto for the same contract).
const IMPROVEMENT_TAGS = [
    'FOOD_TEMPERATURE',
    'ORDER_ACCURACY',
    'WAIT_TIME',
    'STAFF_FRIENDLINESS',
    'CLEANLINESS',
    'NOISE_LEVEL',
    'PRICE',
    'PORTION_SIZE',
] as const;

function StarRating({ value, onChange, size = 26 }: { value: number; onChange: (v: number) => void; size?: number }) {
    const [hover, setHover] = useState<number | null>(null);
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => {
                const active = (hover ?? value) >= star;
                return (
                    <button
                        key={star}
                        type="button"
                        aria-label={`${star} star${star !== 1 ? 's' : ''}`}
                        onClick={() => onChange(star === value ? 0 : star)}
                        onMouseEnter={() => setHover(star)}
                        onMouseLeave={() => setHover(null)}
                        className="p-0.5"
                    >
                        <Star size={size} className={active ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/25"} />
                    </button>
                );
            })}
        </div>
    );
}

interface FeedbackFormProps {
    onSubmit: (payload: SubmitOrderFeedbackPayload) => void;
    isSubmitting: boolean;
}

export default function FeedbackForm({ onSubmit, isSubmitting }: FeedbackFormProps) {
    const { t } = useTranslation('diner');
    const [overallRating, setOverallRating] = useState(0);
    const [foodRating, setFoodRating] = useState(0);
    const [serviceRating, setServiceRating] = useState(0);
    const [ambianceRating, setAmbianceRating] = useState(0);
    const [valueRating, setValueRating] = useState(0);
    const [npsScore, setNpsScore] = useState(5);
    const [npsTouched, setNpsTouched] = useState(false);
    const [tags, setTags] = useState<string[]>([]);
    const [comment, setComment] = useState('');
    const [error, setError] = useState<string | null>(null);

    const toggleTag = (tag: string) => {
        setTags((prev) => (prev.includes(tag) ? prev.filter((x) => x !== tag) : [...prev, tag]));
    };

    const handleSubmit = () => {
        if (overallRating < 1) {
            setError(t('feedback.required_rating'));
            return;
        }
        setError(null);
        onSubmit({
            overallRating,
            foodRating: foodRating || undefined,
            serviceRating: serviceRating || undefined,
            ambianceRating: ambianceRating || undefined,
            valueRating: valueRating || undefined,
            npsScore: npsTouched ? npsScore : undefined,
            improvementTags: tags.length ? (tags as SubmitOrderFeedbackPayload['improvementTags']) : undefined,
            comment: comment.trim() || undefined,
        });
    };

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <p className="text-sm font-medium">{t('feedback.questions.overall')}</p>
                <StarRating value={overallRating} onChange={setOverallRating} />
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-5">
                <div className="space-y-2">
                    <p className="text-sm font-medium">{t('feedback.questions.food')}</p>
                    <StarRating value={foodRating} onChange={setFoodRating} size={20} />
                </div>
                <div className="space-y-2">
                    <p className="text-sm font-medium">{t('feedback.questions.service')}</p>
                    <StarRating value={serviceRating} onChange={setServiceRating} size={20} />
                </div>
                <div className="space-y-2">
                    <p className="text-sm font-medium">{t('feedback.questions.ambiance')}</p>
                    <StarRating value={ambianceRating} onChange={setAmbianceRating} size={20} />
                </div>
                <div className="space-y-2">
                    <p className="text-sm font-medium">{t('feedback.questions.value')}</p>
                    <StarRating value={valueRating} onChange={setValueRating} size={20} />
                </div>
            </div>

            <div className="space-y-3">
                <p className="text-sm font-medium">{t('feedback.questions.nps')}</p>
                <Slider
                    min={0}
                    max={10}
                    step={1}
                    value={[npsScore]}
                    onValueChange={([v]) => {
                        setNpsScore(v);
                        setNpsTouched(true);
                    }}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{t('feedback.nps_not_likely')}</span>
                    <span className="font-semibold text-foreground">{npsTouched ? npsScore : '—'}</span>
                    <span>{t('feedback.nps_very_likely')}</span>
                </div>
            </div>

            <div className="space-y-2">
                <p className="text-sm font-medium">{t('feedback.questions.improve')}</p>
                <div className="flex flex-wrap gap-2">
                    {IMPROVEMENT_TAGS.map((tag) => (
                        <Badge
                            key={tag}
                            variant={tags.includes(tag) ? 'default' : 'outline'}
                            className="cursor-pointer select-none font-normal"
                            onClick={() => toggleTag(tag)}
                        >
                            {t(`feedback.tags.${tag}`)}
                        </Badge>
                    ))}
                </div>
            </div>

            <div className="space-y-2">
                <p className="text-sm font-medium">{t('feedback.questions.comment')}</p>
                <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={t('feedback.comment_placeholder')}
                    rows={3}
                />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full">
                {t('feedback.submit')}
            </Button>
        </div>
    );
}
