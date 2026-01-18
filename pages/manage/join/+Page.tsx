import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { User, Info } from "lucide-react";
import BusinessManagementHeader from "@/components/management/BusinessManagementHeader";
import WebsiteFooter from "@/components/shared/WebsiteFooter";
import { useProfile } from "@/features/profile/useProfile";
import { Form, Formik } from "formik";
import { CreateProfessionalProfileSchema, } from "@/misc/FormValidators";
import { InputError } from "@/components/inputs/InputError";
import { useProfessionalProfile } from "@/features/professionalProfile/useProfessionalProfile";
import { navigate } from "vike/client/router";

const JoinProfessionalPage = () => {

    const { userProfile, loadingUserProfile } = useProfile();

    const {
        createProProfile,
        creatingProProfile,
        loadingProfessionalProfile,
        userProfessionalProfile
    } = useProfessionalProfile();


    if (userProfessionalProfile) {
        navigate("/manage/overview");
    }

    return (
        <div className="min-h-screen flex flex-col ">
            <BusinessManagementHeader />
            <div className="pt-20">
                {/* Header */}
                <header className="bg-blue-600 text-white py-6 shadow-md">
                    <div className="max-w-6xl mx-auto px-6">
                        <h1 className="text-3xl font-bold">Professional Account</h1>
                        <p className="mt-2 text-blue-100">
                            You need a professional profile to manage or join businesses on our platform.
                        </p>
                    </div>
                </header>

            </div>
            {/* Main Content */}
            <main className="flex-grow w-full px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-8 ">

                {/* Form Section */}
                <div className="md:col-span-2 ">
                    <Card className="border border-zinc-200 shadow-sm ">
                        <CardHeader>
                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                <User className="h-5 w-5 text-blue-600" />
                                Create Your Professional Profile
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm ">
                                Please provide your professional details below. You can set a display name if you want your public profile to be different from your legal name.
                            </p>
                            {
                                !loadingUserProfile &&
                                <Formik
                                    initialValues={{
                                        fname: userProfile?.firstName || "",
                                        mname: "",
                                        lname: userProfile?.lastName || "",
                                        dname: userProfile?.getFullName() || "",
                                        email: userProfile?.email || "",
                                        confirmed: false
                                    }}
                                    validationSchema={CreateProfessionalProfileSchema}
                                    onSubmit={values => {
                                        createProProfile({
                                            displayName: values.dname,
                                            firstName: values.fname,
                                            lastName: values.lname,
                                            workEmail: values.email,
                                            middleName: values.mname,
                                        })

                                    }}
                                >
                                    {({ errors, touched, handleChange, values, setFieldValue }) => (
                                        <Form>
                                            <div className="space-y-3">
                                                <Input
                                                    placeholder="First Name"
                                                    id="fname"
                                                    name="fname"
                                                    type="text"
                                                    value={values.fname}
                                                    onChange={handleChange}
                                                />
                                                {
                                                    errors.fname &&
                                                    <InputError
                                                        message={errors.fname}
                                                    />
                                                }
                                                <Input
                                                    id="mname"
                                                    name="mname"
                                                    type="text"
                                                    value={values.mname}
                                                    onChange={handleChange}
                                                    placeholder="Middle Name (optional)"
                                                />
                                                {
                                                    errors.mname &&
                                                    <InputError
                                                        message={errors.mname}
                                                    />
                                                }
                                                <Input
                                                    placeholder="Last Name"
                                                    id="lname"
                                                    name="lname"
                                                    type="text"
                                                    value={values.lname}
                                                    onChange={handleChange}
                                                />
                                                {
                                                    errors.lname &&
                                                    <InputError
                                                        message={errors.lname}
                                                    />
                                                }
                                                <Input
                                                    placeholder="Display Name"
                                                    id="dname"
                                                    name="dname"
                                                    type="text"
                                                    value={values.dname}
                                                    onChange={handleChange}
                                                />
                                                {
                                                    errors.dname &&
                                                    <InputError
                                                        message={errors.dname}
                                                    />
                                                }
                                                <Input
                                                    placeholder="Work Email"
                                                    id="email"
                                                    name="email"
                                                    type="email"
                                                    value={values.email}
                                                    onChange={handleChange}
                                                />
                                                {
                                                    errors.email &&
                                                    <InputError
                                                        message={errors.email}
                                                    />
                                                }
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="confirm"
                                                    checked={values.confirmed}
                                                    onCheckedChange={(checked) => {
                                                        setFieldValue("confirmed", checked.valueOf());
                                                    }}
                                                />

                                                <label htmlFor="confirm" className="text-sm ">
                                                    I confirm that the above information is correct.
                                                </label>
                                            </div>
                                            {
                                                errors.confirmed &&
                                                <InputError
                                                    message={errors.confirmed}
                                                />
                                            }

                                            <Button
                                                className="bg-blue-600 hover:bg-blue-700 text-white w-full rounded-xl"
                                                type="submit"
                                                disabled={creatingProProfile}
                                            >
                                                Create Professional Profile
                                            </Button>

                                        </Form>
                                    )}


                                </Formik>
                            }
                        </CardContent>
                    </Card>
                </div>

                {/* Tips/Info Section */}
                <div className="space-y-4">
                    <Card className="border border-zinc-200">
                        <CardHeader className="flex items-center gap-2">
                            <Info className="h-5 w-5 text-blue-600" />
                            <CardTitle>Tips for your professional profile</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm ">
                            <p>✅ Use your legal name for accurate business documentation.</p>
                            <p>✅ Display name is optional and can be different from your legal name for privacy.</p>
                            <p>✅ Work email should be active so businesses can contact you.</p>
                            <p>✅ Once created, you can join or manage businesses on the platform.</p>
                        </CardContent>
                    </Card>

                    <Card className="border border-zinc-200">
                        <CardHeader className="flex items-center gap-2">
                            <User className="h-5 w-5 text-blue-600" />
                            <CardTitle>Why a professional profile?</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm ">
                            A professional profile separates your public user identity from your work identity, giving you control over how you appear in businesses, while keeping legal information safe for billing and verification.
                        </CardContent>
                    </Card>
                </div>
            </main>
            <WebsiteFooter />

        </div>
    );
};

export default JoinProfessionalPage;
