import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { User, Info, Building2Icon } from "lucide-react";
import BusinessManagementHeader from "@/components/management/BusinessManagementHeader";
import WebsiteFooter from "@/components/shared/WebsiteFooter";
import { useProfile } from "@/features/profile/useProfile";
import { Form, Formik } from "formik";
import { CreateProfessionalProfileSchema } from "@/misc/FormValidators";
import { InputError } from "@/components/inputs/InputError";
import { useProfessionalProfile } from "@/features/professionalProfile/useProfessionalProfile";
import { navigate } from "vike/client/router";
import { usePageContext } from "vike-react/usePageContext";
import { useBusinessInvitation } from "@/features/business/invitations/useBusinessInvitation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const JoinProfessionalPage = () => {
    const { urlParsed } = usePageContext();
    const { userProfile, loadingUserProfile } = useProfile();

    const {
        createProProfile,
        creatingProProfile,
        userProfessionalProfile,
    } = useProfessionalProfile();

    if (userProfessionalProfile) {
        navigate("/manage/overview");
    }

    console.log(urlParsed.search["invitation"]);

    const { invitationDetails, loadingInvitationDetails } = useBusinessInvitation(
        urlParsed.search["invitation"]
    );

    return (
        <div className="min-h-screen flex flex-col">
            <BusinessManagementHeader />

            {/* Header */}
            <header className="bg-blue-600 text-white py-10 shadow-md pt-25">
                <div className="max-w-6xl mx-auto px-6 space-y-2">
                    <h1 className="text-3xl font-bold">Professional Account</h1>
                    <p className="text-blue-100 max-w-2xl">
                        Create a professional profile to manage or join businesses on the
                        platform.
                    </p>
                </div>

                {invitationDetails && (
                    <div className="mt-6 max-w-6xl mx-auto px-6">
                        <Alert className="border-blue-200 bg-blue-50">
                            <Building2Icon className="h-5 w-5 text-blue-600" />
                            <AlertTitle className="text-blue-800">
                                You were invited to join a business
                            </AlertTitle>
                            <AlertDescription className="text-blue-700">
                                To accept this invitation, create a professional profile using{" "}
                                <span className="font-medium">
                                    {invitationDetails.email}
                                </span>
                                .
                            </AlertDescription>
                        </Alert>
                    </div>
                )}
                {!loadingInvitationDetails && !invitationDetails && (
                    <div className="mt-6 max-w-6xl mx-auto px-6">
                        <Alert className="border-amber-200 bg-amber-50">
                            <Building2Icon className="h-5 w-5 text-amber-600" />
                            <AlertTitle className="text-amber-800">
                                Invitation not found
                            </AlertTitle>
                            <AlertDescription className="text-amber-700">
                                The invitation link you used is not valid or may have expired.
                                <br />
                                You can still continue and create a professional profile normally.
                            </AlertDescription>
                        </Alert>
                    </div>
                )}
            </header>

            {/* Main Content */}
            <main className="flex-grow px-6 py-14">
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
                    {/* Form Section */}
                    <div className="md:col-span-2">
                        <Card className="border border-zinc-200 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-xl font-bold flex items-center gap-2">
                                    <User className="h-5 w-5 text-blue-600" />
                                    Create Your Professional Profile
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="space-y-6">
                                <p className="text-sm text-muted-foreground">
                                    Your professional profile represents you in businesses. A
                                    display name is optional and can differ from your legal name.
                                </p>

                                {!loadingUserProfile && (
                                    <Formik
                                        initialValues={{
                                            fname: userProfile?.firstName || "",
                                            mname: "",
                                            lname: userProfile?.lastName || "",
                                            dname: userProfile?.getFullName() || "",
                                            email: invitationDetails
                                                ? invitationDetails.email
                                                : userProfile?.email || "",
                                            confirmed: false,
                                        }}
                                        validationSchema={CreateProfessionalProfileSchema}
                                        onSubmit={(values) => {
                                            createProProfile({
                                                displayName: values.dname,
                                                firstName: values.fname,
                                                lastName: values.lname,
                                                middleName: values.mname,
                                                workEmail: values.email,
                                            });
                                        }}
                                    >
                                        {({
                                            errors,
                                            handleChange,
                                            values,
                                            setFieldValue,
                                        }) => (
                                            <Form className="space-y-6">
                                                {/* Identity */}
                                                <div className="space-y-3">
                                                    <Input
                                                        name="fname"
                                                        placeholder="First Name"
                                                        value={values.fname}
                                                        onChange={handleChange}
                                                    />
                                                    {errors.fname && (
                                                        <InputError message={errors.fname} />
                                                    )}

                                                    <Input
                                                        name="mname"
                                                        placeholder="Middle Name (optional)"
                                                        value={values.mname}
                                                        onChange={handleChange}
                                                    />

                                                    <Input
                                                        name="lname"
                                                        placeholder="Last Name"
                                                        value={values.lname}
                                                        onChange={handleChange}
                                                    />
                                                    {errors.lname && (
                                                        <InputError message={errors.lname} />
                                                    )}

                                                    <Input
                                                        name="dname"
                                                        placeholder="Display Name"
                                                        value={values.dname}
                                                        onChange={handleChange}
                                                    />
                                                    {errors.dname && (
                                                        <InputError message={errors.dname} />
                                                    )}
                                                </div>

                                                {/* Email */}
                                                <div className="border-t pt-4 space-y-2">
                                                    <Input
                                                        name="email"
                                                        type="email"
                                                        placeholder="Work Email"
                                                        disabled={!!invitationDetails}
                                                        value={values.email}
                                                        onChange={
                                                            invitationDetails ? undefined : handleChange
                                                        }
                                                    />
                                                    {invitationDetails && (
                                                        <p className="text-xs text-muted-foreground">
                                                            This email is locked because the invitation was
                                                            sent to it.
                                                        </p>
                                                    )}
                                                    {errors.email && (
                                                        <InputError message={errors.email} />
                                                    )}
                                                </div>

                                                {/* Confirmation */}
                                                <div className="flex items-start gap-2">
                                                    <Checkbox
                                                        checked={values.confirmed}
                                                        onCheckedChange={(checked) =>
                                                            setFieldValue(
                                                                "confirmed",
                                                                checked.valueOf()
                                                            )
                                                        }
                                                    />
                                                    <label className="text-sm leading-snug">
                                                        I confirm that the information above is accurate and
                                                        belongs to me.
                                                    </label>
                                                </div>
                                                {errors.confirmed && (
                                                    <InputError message={errors.confirmed} />
                                                )}

                                                <Button
                                                    type="submit"
                                                    className="w-full rounded-xl bg-blue-600 hover:bg-blue-700"
                                                    disabled={creatingProProfile}
                                                >
                                                    Create Professional Profile
                                                </Button>
                                            </Form>
                                        )}
                                    </Formik>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Info Section */}
                    <div className="space-y-4">
                        <Card className="border border-zinc-200">
                            <CardHeader className="flex items-center gap-2">
                                <Info className="h-5 w-5 text-blue-600" />
                                <CardTitle>Profile Tips</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <p>✅ Use your legal name for official documentation.</p>
                                <p>
                                    ✅ Display name can differ for privacy or branding.
                                </p>
                                <p>
                                    ✅ Work email should be active and accessible.
                                </p>
                                <p>
                                    ✅ Required to join or manage businesses.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border border-zinc-200">
                            <CardHeader className="flex items-center gap-2">
                                <User className="h-5 w-5 text-blue-600" />
                                <CardTitle>Why this matters</CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm">
                                A professional profile separates your personal account from
                                business activity while keeping verification and billing secure.
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>

            <WebsiteFooter />
        </div>
    );
};

export default JoinProfessionalPage;
