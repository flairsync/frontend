'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { motion } from 'framer-motion';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useProfile } from "@/features/profile/useProfile";
import { cn } from "@/lib/utils";
import WorkHoursSelector from '@/components/management/create/WorkHoursSelector';
import BusinessTypeSelect from '@/components/management/create/BusinessTypeSelect';
import BusinessTagsInput from '@/components/management/create/BusinessTagsInput';
import BusinessPricingSelector from '@/components/management/create/BusinessPricingSelector';
import BusinessSocialLinksInput from '@/components/management/create/BusinessSocialLinksInput';
import { OpeningHours, OpeningPeriod } from '@/models/business/MyBusinessFullDetails';
import { PlatformCountry } from "@/models/shared/PlatformCountry";
import { clientOnly } from 'vike-react/clientOnly';
import { useBusinessTypes } from '@/features/business/types/useBusinessTypes';
import { BusinessTag } from '@/models/business/BusinessTag';
import { useBusinessOps } from '@/features/business/useBusinessOps';
import { useSubscriptionStore } from '@/features/subscriptions/SubscriptionStore';

const LocationPicker = clientOnly(() =>
    import("@/components/management/create/BusinessLocationPicker")
)
interface BusinessFormValues {
    name: string;
    description: string;
    type: string;
    tableCount: number;
    hasKitchen: boolean;
    workTimes: OpeningHours[];
    pricing: string;
    tags: BusinessTag[];
    links: any;
    location: {
        address: string;
        city: string;
        country: PlatformCountry | undefined;
        lat: number;
        lng: number;
    };
    autoSetup: boolean;
}



const NO_KITCHEN_TYPES = ['coffee_shop', 'bakery', 'coffee_drinks'];

const DEFAULT_OPEN = '09:00';
const DEFAULT_CLOSE = '22:00';

const initialHours: OpeningHours[] = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
].map((day) => new OpeningHours('', day, false, [new OpeningPeriod('', DEFAULT_OPEN, DEFAULT_CLOSE)]));


// Validation schema with Yup
function getValidationSchema(t: (key: string) => string) {
    return [
        // Step 1: Info
        Yup.object({
            name: Yup.string().required(t('create_business_page.errors.name_required')),
            description: Yup.string().required(t('create_business_page.errors.description_required')),
            type: Yup.string().required(t('create_business_page.errors.type_required')),
            tableCount: Yup.number()
                .integer(t('create_business_page.errors.table_count_integer'))
                .min(1, t('create_business_page.errors.table_count_min'))
                .max(200, t('create_business_page.errors.table_count_max'))
                .required(t('create_business_page.errors.table_count_required')),
        }),
        // Step 2: Details
        Yup.object({
            workTimes: Yup.array().min(1, t('create_business_page.errors.work_times_required')).required(t('create_business_page.errors.work_times_required')),
            pricing: Yup.string().required(t('create_business_page.errors.pricing_required')),
            tags: Yup.array().min(1, t('create_business_page.errors.tags_required')).required(t('create_business_page.errors.tags_required')),
        }),
        // Step 3: Location
        Yup.object({
            location: Yup.object({
                address: Yup.string().required(t('create_business_page.errors.address_required')),
                city: Yup.string().required(t('create_business_page.errors.city_required')),
                country: Yup.object().nullable().required(t('create_business_page.errors.country_required')),
                lat: Yup.number().optional(),
                lng: Yup.number().optional(),
            }).required(t('create_business_page.errors.location_required')),
        }),
        // Step 4: Social
        Yup.object({
            links: Yup.object().nullable(),
        }),
    ];
}

export default function CreateNewBusiness() {
    const { t } = useTranslation("management");
    const validationSchema = getValidationSchema(t);
    const { businessTypes } = useBusinessTypes();

    const {
        createdNewBusiness,
    } = useBusinessOps();

    const { openUpgradeModal } = useSubscriptionStore();

    const [step, setStep] = useState(0);
    const totalSteps = 4;

    const initialValues: BusinessFormValues = {
        name: '',
        description: '',
        type: '',
        tableCount: 10,
        hasKitchen: true,
        workTimes: initialHours,
        pricing: '',
        tags: [],
        links: {},
        location: {
            address: '',
            city: '',
            country: undefined,
            lat: 0,
            lng: 0
        },
        autoSetup: true,
    };

    const handleSubmit = (values: BusinessFormValues) => {
        createdNewBusiness(values, {
            onSuccess: () => {
                window.location.href = "/manage";
            },
            onError: (err: any) => {
                if (err?.response?.status === 403) {
                    openUpgradeModal(t('create_business_page.upgrade_prompt'));
                }
            }
        });
    };

    const nextStep = () => setStep((s) => Math.min(s + 1, totalSteps - 1));
    const prevStep = () => setStep((s) => Math.max(s - 1, 0));

    if (!businessTypes) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p>{t('create_business_page.loading')}</p>
            </div>
        );
    }

    return (
        <div className="flex justify-center py-10 px-4">
            <Card className="w-full max-w-2xl shadow-xl rounded-2xl">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">
                        {t('create_business_page.title')}
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    <Progress value={((step) / totalSteps) * 100} className="mb-6" />

                    <Formik
                        initialValues={initialValues}
                        validationSchema={validationSchema[step]}
                        onSubmit={(values) => {
                            if (step === totalSteps - 1) {
                                handleSubmit(values);
                            } else {
                                nextStep();
                            }
                        }}
                    >
                        {({ setFieldValue, values, errors, touched }) => (
                            <Form>
                                <motion.div
                                    key={step}
                                    initial={{ opacity: 0, x: 30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -30 }}
                                    transition={{ duration: 0.3 }}
                                    className="space-y-4"
                                >
                                    {/* === Step 1 === */}
                                    {step === 0 && (
                                        <>
                                            <div>
                                                <label className="font-medium text-sm text-zinc-600">{t('create_business_page.step1.name_label')}</label>
                                                <Field
                                                    as={Input}
                                                    name="name"
                                                    placeholder={t('create_business_page.step1.name_placeholder')}
                                                    className="mt-1"
                                                />
                                                <ErrorMessage
                                                    name="name"
                                                    component="p"
                                                    className="text-red-500 text-xs mt-1"
                                                />
                                            </div>

                                            <div>
                                                <label className="font-medium text-sm text-zinc-600">{t('create_business_page.step1.description_label')}</label>
                                                <Field
                                                    as={Textarea}
                                                    name="description"
                                                    placeholder={t('create_business_page.step1.description_placeholder')}
                                                    className="mt-1"
                                                />
                                                <ErrorMessage
                                                    name="description"
                                                    component="p"
                                                    className="text-red-500 text-xs mt-1"
                                                />
                                            </div>

                                            <div>
                                                <label className="font-medium text-sm text-zinc-600 mb-1 block">{t('create_business_page.step1.type_label')}</label>
                                                <BusinessTypeSelect
                                                    types={businessTypes}
                                                    onChange={(newValue: string) => {
                                                        setFieldValue("type", newValue);
                                                        const typeName = businessTypes?.find(t => t.id === newValue)?.name ?? '';
                                                        if (NO_KITCHEN_TYPES.includes(typeName)) {
                                                            setFieldValue("hasKitchen", false);
                                                        }
                                                    }}
                                                    value={values.type}
                                                />
                                                <ErrorMessage
                                                    name="type"
                                                    component="p"
                                                    className="text-red-500 text-xs mt-1"
                                                />
                                            </div>

                                            <div className="flex gap-4">
                                                <div className="flex-1">
                                                    <label className="font-medium text-sm text-zinc-600">{t('create_business_page.step1.table_count_label')}</label>
                                                    <Field
                                                        as={Input}
                                                        name="tableCount"
                                                        type="number"
                                                        min={1}
                                                        max={200}
                                                        className="mt-1"
                                                    />
                                                    <ErrorMessage
                                                        name="tableCount"
                                                        component="p"
                                                        className="text-red-500 text-xs mt-1"
                                                    />
                                                </div>

                                                <div className="flex flex-col justify-center gap-1 pt-1">
                                                    <label className="font-medium text-sm text-zinc-600">{t('create_business_page.step1.has_kitchen_label')}</label>
                                                    <button
                                                        type="button"
                                                        onClick={() => setFieldValue("hasKitchen", !values.hasKitchen)}
                                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${values.hasKitchen ? 'bg-primary' : 'bg-zinc-300'}`}
                                                    >
                                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${values.hasKitchen ? 'translate-x-6' : 'translate-x-1'}`} />
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {/* === Step 2 === */}
                                    {step === 1 && (
                                        <>
                                            <div>
                                                <label className="font-medium text-sm text-zinc-600 mb-2 block">{t('create_business_page.step2.work_times_label')}</label>
                                                <WorkHoursSelector
                                                    value={values.workTimes}
                                                    onChange={(newValue: OpeningHours[]) => {
                                                        setFieldValue("workTimes", newValue);
                                                    }}
                                                />
                                                <ErrorMessage
                                                    name="workTimes"
                                                    component="p"
                                                    className="text-red-500 text-xs mt-1"
                                                />
                                            </div>

                                            <div className="pt-4">
                                                <label className="font-medium text-sm text-zinc-600 mb-2 block">{t('create_business_page.step2.pricing_label')}</label>
                                                <BusinessPricingSelector
                                                    onChange={(val: string) => {
                                                        setFieldValue("pricing", val);
                                                    }}
                                                    value={values.pricing}
                                                />
                                                <ErrorMessage
                                                    name="pricing"
                                                    component="p"
                                                    className="text-red-500 text-xs mt-1"
                                                />
                                            </div>

                                            <div className="pt-4">
                                                <label className="font-medium text-sm text-zinc-600 mb-2 block">{t('create_business_page.step2.tags_label')}</label>
                                                <BusinessTagsInput
                                                    onChange={(tags: BusinessTag[]) => {
                                                        setFieldValue("tags", tags);
                                                    }}
                                                    value={values.tags}
                                                />
                                                <ErrorMessage
                                                    name="tags"
                                                    component="p"
                                                    className="text-red-500 text-xs mt-1"
                                                />
                                            </div>
                                        </>
                                    )}

                                    {/* === Step 3 === */}
                                    {step === 2 && (
                                        <div className="space-y-4 pt-2">
                                            <label className="font-medium text-sm text-zinc-600">{t('create_business_page.step3.location_label')}</label>
                                            <LocationPicker
                                                value={values.location}
                                                onChange={(loc: any) => setFieldValue("location", loc)}
                                            />
                                            {touched.location && errors.location && (
                                                <p className="text-red-500 text-xs font-medium">
                                                    {typeof errors.location === 'string'
                                                        ? errors.location
                                                        : Object.values(errors.location || {}).flat()[0] as string}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* === Step 4 === */}
                                    {step === 3 && (
                                        <div className="space-y-4 pt-2">
                                            <label className="font-medium text-sm text-zinc-600">{t('create_business_page.step4.social_links_label')}</label>
                                            <BusinessSocialLinksInput
                                                onChange={(links: any) => {
                                                    setFieldValue("links", links)
                                                }}
                                                values={values.links}
                                            />

                                            <button
                                                type="button"
                                                onClick={() => setFieldValue("autoSetup", !values.autoSetup)}
                                                className={`w-full flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-colors ${values.autoSetup ? 'border-primary bg-primary/5' : 'border-zinc-200 hover:border-zinc-300'}`}
                                            >
                                                <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${values.autoSetup ? 'border-primary bg-primary' : 'border-zinc-300'}`}>
                                                    {values.autoSetup && (
                                                        <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none">
                                                            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm text-zinc-800 flex items-center gap-2">
                                                        {t('create_business_page.step4.auto_setup_title')}
                                                        <span className="text-[10px] font-semibold uppercase tracking-wide text-primary bg-primary/10 rounded-full px-2 py-0.5">{t('create_business_page.step4.recommended_badge')}</span>
                                                    </p>
                                                    <p className="text-xs text-zinc-500 mt-0.5">{t('create_business_page.step4.auto_setup_desc')}</p>
                                                </div>
                                            </button>
                                        </div>
                                    )}
                                </motion.div>

                                {/* === Buttons === */}
                                <div className="flex justify-between mt-8">
                                    {step > 0 ? (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={prevStep}
                                            className="w-32"
                                        >
                                            {t('create_business_page.back')}
                                        </Button>
                                    ) : (
                                        <div />
                                    )}

                                    <Button type="submit" className="w-32">
                                        {step === totalSteps - 1 ? t('create_business_page.create') : t('create_business_page.next')}
                                    </Button>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </CardContent>
            </Card>
        </div>
    );
}
