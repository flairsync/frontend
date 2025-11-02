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

interface BusinessFormValues {
    name: string;
    description: string;
    type: string;
    workTimes: string;
    pricing: string;
    tags: string;
    instagram?: string;
    facebook?: string;
    images: FileList | null;
}



const initialHours: WorkHours = {
    Monday: { isClosed: false, shifts: [{ open: "08:00", close: "15:00" }, { open: "21:00", close: "04:00" }] },
    Tuesday: { isClosed: false, shifts: [{ open: "08:00", close: "15:00" }] },
    Wednesday: { isClosed: false, shifts: [{ open: "08:00", close: "15:00" }] },
    Thursday: { isClosed: false, shifts: [{ open: "08:00", close: "15:00" }] },
    Friday: { isClosed: false, shifts: [{ open: "08:00", close: "15:00" }, { open: "21:00", close: "04:00" }] },
    Saturday: { isClosed: true, shifts: [] },
    Sunday: { isClosed: true, shifts: [] },
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
        workTimes: Yup.string().required('Work times are required'),
        pricing: Yup.string().required('Pricing information is required'),
        tags: Yup.string().required('Tags are required'),
    }),
    // Step 3
    Yup.object({
        instagram: Yup.string().url('Invalid Instagram URL').nullable(),
        facebook: Yup.string().url('Invalid Facebook URL').nullable(),
        images: Yup.mixed().nullable(),
    }),
];

export default function CreateNewBusiness() {
    const [step, setStep] = useState(0);
    const totalSteps = 3;

    const initialValues: BusinessFormValues = {
        name: '',
        description: '',
        type: '',
        workTimes: '',
        pricing: '',
        tags: '',
        instagram: '',
        facebook: '',
        images: null,
    };

    const handleSubmit = (values: BusinessFormValues) => {
        console.log('Business created:', values);
        alert('Business successfully created!');
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
                    <Progress value={((step + 1) / totalSteps) * 100} className="mb-6" />

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

                                            <div>
                                                <label className="font-medium">Type</label>
                                                <Field
                                                    as={Input}
                                                    name="type"
                                                    placeholder="e.g. Restaurant, Coffee Shop, Bakery..."
                                                />
                                                <ErrorMessage
                                                    name="type"
                                                    component="p"
                                                    className="text-red-500 text-sm"
                                                />
                                            </div>
                                        </>
                                    )}

                                    {/* === Step 2 === */}
                                    {step === 1 && (
                                        <>
                                            <div>
                                                <label className="font-medium">Work Times</label>

                                                <WorkHoursSelector
                                                    value={initialHours}
                                                    onChange={(newValue) => { }}
                                                />

                                                <ErrorMessage
                                                    name="workTimes"
                                                    component="p"
                                                    className="text-red-500 text-sm"
                                                />
                                            </div>

                                            <div>
                                                <label className="font-medium">Pricing</label>
                                                <Field
                                                    as={Input}
                                                    name="pricing"
                                                    placeholder="e.g. $$ (moderate)"
                                                />
                                                <ErrorMessage
                                                    name="pricing"
                                                    component="p"
                                                    className="text-red-500 text-sm"
                                                />
                                            </div>

                                            <div>
                                                <label className="font-medium">Tags</label>
                                                <Field
                                                    as={Input}
                                                    name="tags"
                                                    placeholder="e.g. brunch, vegan, cozy"
                                                />
                                                <ErrorMessage
                                                    name="tags"
                                                    component="p"
                                                    className="text-red-500 text-sm"
                                                />
                                                {values.tags && (
                                                    <div className="flex flex-wrap gap-2 mt-2">
                                                        {values.tags.split(',').map((tag) => (
                                                            <Badge key={tag.trim()} variant="secondary">
                                                                {tag.trim()}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}

                                    {/* === Step 3 === */}
                                    {step === 2 && (
                                        <>
                                            <div>
                                                <label className="font-medium">Instagram Link</label>
                                                <Field
                                                    as={Input}
                                                    name="instagram"
                                                    placeholder="https://instagram.com/yourpage"
                                                />
                                                <ErrorMessage
                                                    name="instagram"
                                                    component="p"
                                                    className="text-red-500 text-sm"
                                                />
                                            </div>

                                            <div>
                                                <label className="font-medium">Facebook Link</label>
                                                <Field
                                                    as={Input}
                                                    name="facebook"
                                                    placeholder="https://facebook.com/yourpage"
                                                />
                                                <ErrorMessage
                                                    name="facebook"
                                                    component="p"
                                                    className="text-red-500 text-sm"
                                                />
                                            </div>

                                            <div>
                                                <label className="font-medium">Upload Images</label>
                                                <input
                                                    type="file"
                                                    multiple
                                                    accept="image/*"
                                                    onChange={(e) =>
                                                        setFieldValue('images', e.currentTarget.files)
                                                    }
                                                    className="mt-1 block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100"
                                                />
                                                {values.images && values.images.length > 0 && (
                                                    <p className="text-sm text-gray-600 mt-2">
                                                        {values.images.length} image(s) selected
                                                    </p>
                                                )}
                                            </div>
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
