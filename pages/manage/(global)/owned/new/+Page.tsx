'use client';

import { useState } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import WorkHoursSelector, { WorkHours } from '@/components/management/create/WorkHoursSelector';
import BusinessTypeSelect from '@/components/management/create/BusinessTypeSelect';
import BusinessTagsInput from '@/components/management/create/BusinessTagsInput';
import BusinessPricingSelector from '@/components/management/create/BusinessPricingSelector';
import BusinessSocialLinksInput from '@/components/management/create/BusinessSocialLinksInput';
import { clientOnly } from 'vike-react/clientOnly';
import { useBusinessTypes } from '@/features/business/types/useBusinessTypes';
import { BusinessTag } from '@/models/business/BusinessTag';
import { useBusinessOps } from '@/features/business/useBusinessOps';

const LocationPicker = clientOnly(() =>
    import("@/components/management/create/BusinessLocationPicker")
)
interface BusinessFormValues {
    name: string;
    description: string;
    type: string;
    workTimes: WorkHours;
    pricing: string;
    tags: BusinessTag[];
    links: any;
    location: any;
}



const initialHours: WorkHours = {
    monday: { isClosed: false, shifts: [{ open: "08:00", close: "15:00" }, { open: "21:00", close: "04:00" }] },
    tuesday: { isClosed: false, shifts: [{ open: "08:00", close: "15:00" }] },
    wednesday: { isClosed: false, shifts: [{ open: "08:00", close: "15:00" }] },
    thursday: { isClosed: false, shifts: [{ open: "08:00", close: "15:00" }] },
    friday: { isClosed: false, shifts: [{ open: "08:00", close: "15:00" }, { open: "21:00", close: "04:00" }] },
    saturday: { isClosed: true, shifts: [] },
    sunday: { isClosed: true, shifts: [] },
};


// Validation schema with Yup
const validationSchema = [
    // Step 1
    Yup.object({
        name: Yup.string().required('Business name is required'),
        description: Yup.string().required('Description is required'),
        type: Yup.string().required('Please specify the business type'),
    }),
    // Step 2
    Yup.object({
        workTimes: Yup.object().required('Work times are required'),
        pricing: Yup.string().required('Pricing information is required'),
        tags: Yup.array().required('Tags are required'),
    }),
    // Step 3
    Yup.object({
        links: Yup.object().nullable(),
    }),
];

export default function CreateNewBusiness() {
    const {
        businessTypes
    } = useBusinessTypes();

    const {
        createdNewBusiness,
    } = useBusinessOps();
    const [step, setStep] = useState(0);
    const totalSteps = 4;

    const initialValues: BusinessFormValues = {
        name: '',
        description: '',
        type: '',
        workTimes: initialHours,
        pricing: '',
        tags: [],
        links: {},
        location: {}
    };

    const handleSubmit = (values: BusinessFormValues) => {
        createdNewBusiness(values)
    };

    const nextStep = () => setStep((s) => Math.min(s + 1, totalSteps - 1));
    const prevStep = () => setStep((s) => Math.max(s - 1, 0));

    return (
        <div className="flex justify-center py-10 px-4">
            <Card className="w-full max-w-2xl shadow-xl rounded-2xl">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">
                        Create a New Business
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    <Progress value={((step) / totalSteps) * 100} className="mb-6" />

                    <Formik
                        initialValues={initialValues}
                        validationSchema={validationSchema[step]}
                        onSubmit={(values) => {
                            if (step === totalSteps - 1) {
                                console.log(values);
                                handleSubmit(values);
                            } else {
                                nextStep();
                            }
                        }}
                    >
                        {({ setFieldValue, values }) => (
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
                                                <label className="font-medium">Business Name</label>
                                                <Field
                                                    as={Input}
                                                    name="name"
                                                    placeholder="e.g. Luna Café"
                                                />
                                                <ErrorMessage
                                                    name="name"
                                                    component="p"
                                                    className="text-red-500 text-sm"
                                                />
                                            </div>

                                            <div>
                                                <label className="font-medium">Description</label>
                                                <Field
                                                    as={Textarea}
                                                    name="description"
                                                    placeholder="A cozy coffee shop in downtown..."
                                                />
                                                <ErrorMessage
                                                    name="description"
                                                    component="p"
                                                    className="text-red-500 text-sm"
                                                />
                                            </div>

                                            <BusinessTypeSelect
                                                types={businessTypes}
                                                onChange={(newValue) => {
                                                    setFieldValue("type", newValue);

                                                }}
                                                value={values.type}
                                            />
                                            <ErrorMessage
                                                name="type"
                                                component="p"
                                                className="text-red-500 text-sm"
                                            />

                                        </>
                                    )}

                                    {/* === Step 2 === */}
                                    {step === 1 && (
                                        <>
                                            <div>
                                                <label className="font-medium">Work Times</label>
                                                <WorkHoursSelector
                                                    value={values.workTimes}
                                                    onChange={(newValue) => {
                                                        setFieldValue("workTimes", newValue);
                                                    }}
                                                />
                                                <ErrorMessage
                                                    name="workTimes"
                                                    component="p"
                                                    className="text-red-500 text-sm"
                                                />
                                            </div>

                                            <BusinessPricingSelector
                                                onChange={(val) => {
                                                    setFieldValue("pricing", val);
                                                }}
                                                value={values.pricing}
                                            />
                                            <ErrorMessage
                                                name="pricing"
                                                component="p"
                                                className="text-red-500 text-sm"
                                            />

                                            <BusinessTagsInput
                                                onChange={(tags) => {
                                                    setFieldValue("tags", tags);
                                                }}
                                                value={values.tags}
                                            />
                                            <ErrorMessage
                                                name="tags"
                                                component="p"
                                                className="text-red-500 text-sm"
                                            />
                                        </>
                                    )}
                                    {
                                        step === 2 && <>
                                            <LocationPicker
                                                value={values.location}
                                                onChange={(loc) => setFieldValue("location", loc)}
                                            />
                                        </>
                                    }
                                    {/* === Step 4 === */}
                                    {step === 3 && (
                                        <>
                                            <BusinessSocialLinksInput
                                                onChange={(links) => {
                                                    setFieldValue("links", links)
                                                }}
                                                values={values.links}
                                            />


                                        </>
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
                                            Back
                                        </Button>
                                    ) : (
                                        <div />
                                    )}

                                    <Button type="submit" className="w-32">
                                        {step === totalSteps - 1 ? 'Create' : 'Next'}
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
