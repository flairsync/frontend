import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import React, { useRef } from 'react';
import { Formik, Form } from 'formik';
import AbstractBG from "@/assets/svg/vecteezy_abstract-blue-color-background-dynamic-wave-fluid-shape_23455702.svg";
import { useTranslation } from 'react-i18next';
import { SignupFormSchema } from '@/misc/FormValidators';
import { InputError } from '@/components/inputs/InputError';
import WebsiteLogo from '@/components/shared/WebsiteLogo';
import { useAuth } from '@/features/auth/useAuth';
import { AxiosError } from 'axios';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

const RegisterPage = () => {
    const { t } = useTranslation();
    const [showPassword, setShowPassword] = useState(false);
    const [showRepeatPassword, setShowRepeatPassword] = useState(false);
    const [signupErrorText, setSignupErrorText] = useState<string>();
    const { signupUser, signingUp, signupError } = useAuth();

    // Terms & Conditions Modal State
    const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
    const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        // Check if user has scrolled close to the bottom
        if (Math.abs(scrollHeight - scrollTop - clientHeight) < 5) {
            setHasScrolledToBottom(true);
        }
    };

    useEffect(() => {
        if (signupError instanceof AxiosError) {
            setSignupErrorText(signupError.response?.data.message);
        }
    }, [signupError]);

    return (
        <div className="flex min-h-screen bg-white font-sans text-zinc-900 relative overflow-hidden">
            {/* ✅ LEFT SIDE (Form + Scroll + Navbar) */}
            <div className="relative flex flex-col w-full lg:w-1/2 bg-white">
                {/* Navbar (fixed only to left panel) */}
                <div className="sticky top-0 left-0 z-20  h-16 flex items-center px-8 ">
                    <a href="/" className="flex flex-row items-center gap-3">
                        <WebsiteLogo />
                    </a>
                </div>

                {/* Scrollable Form Area */}
                <div className="flex-1 overflow-y-auto px-6 lg:px-10 py-10">
                    <div className="w-full max-w-sm md:max-w-md mx-auto">
                        <h1 className="text-3xl md:text-3xl font-extrabold mb-2 text-center text-zinc-900 tracking-tight">
                            {t("auth_page.register.signup_page_title")}
                        </h1>
                        <p className="text-center text-zinc-500 mb-8 text-sm md:text-base">
                            {t("auth_page.register.signup_page_subtitle")}
                        </p>

                        <Formik
                            initialValues={{
                                firstName: '',
                                lastName: '',
                                email: '',
                                password: '',
                                repeatPassword: '',
                                termsAccepted: false,
                            }}
                            validationSchema={SignupFormSchema}
                            validateOnChange
                            onSubmit={values => {
                                setSignupErrorText(undefined);
                                signupUser({
                                    email: values.email,
                                    firstName: values.firstName,
                                    lastName: values.lastName,
                                    password: values.password,
                                });
                            }}
                        >
                            {({ errors, touched, handleChange, setFieldValue, values }) => (
                                <Form className="space-y-5 md:space-y-6 pb-10">
                                    {/* First Name */}
                                    <div className="space-y-1.5">
                                        <Label htmlFor="firstName">{t("auth_page.register.firstname_label")}</Label>
                                        <Input
                                            id="firstName"
                                            name="firstName"
                                            type="text"
                                            onChange={handleChange}
                                            placeholder="firstName"
                                            className="h-11 md:h-12 bg-zinc-50 border-zinc-200 focus:bg-white focus:border-[#6366F1] focus:ring-4 focus:ring-[#6366F1]/10 focus-visible:ring-0 transition-all rounded-lg"
                                        />
                                        {errors.firstName && touched.firstName && <InputError message={errors.firstName} />}
                                    </div>

                                    {/* Last Name */}
                                    <div className="space-y-1.5">
                                        <Label htmlFor="lastName">{t("auth_page.register.lastname_label")}</Label>
                                        <Input
                                            id="lastName"
                                            name="lastName"
                                            type="text"
                                            onChange={handleChange}
                                            placeholder="lastName"
                                            className="h-11 md:h-12 bg-zinc-50 border-zinc-200 focus:bg-white focus:border-[#6366F1] focus:ring-4 focus:ring-[#6366F1]/10 focus-visible:ring-0 transition-all rounded-lg"
                                        />
                                        {errors.lastName && touched.lastName && <InputError message={errors.lastName} />}
                                    </div>

                                    {/* Email */}
                                    <div className="space-y-1.5">
                                        <Label htmlFor="email">{t("auth_page.register.email_label")}</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            name="email"
                                            onChange={handleChange}
                                            placeholder="email@gmail.com"
                                            className="h-11 md:h-12 bg-zinc-50 border-zinc-200 focus:bg-white focus:border-[#6366F1] focus:ring-4 focus:ring-[#6366F1]/10 focus-visible:ring-0 transition-all rounded-lg"
                                        />
                                        {errors.email && touched.email && <InputError message={errors.email} />}
                                    </div>

                                    {/* Password */}
                                    <div className="space-y-1.5">
                                        <Label htmlFor="password">{t("auth_page.register.password_label")}</Label>
                                        <div className="relative">
                                            <Input
                                                id="password"
                                                name="password"
                                                type={showPassword ? 'text' : 'password'}
                                                onChange={handleChange}
                                                placeholder={t("auth_page.register.password_label")}
                                                className="h-11 md:h-12 bg-zinc-50 border-zinc-200 focus:bg-white focus:border-[#6366F1] focus:ring-4 focus:ring-[#6366F1]/10 focus-visible:ring-0 transition-all rounded-lg"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                                            >
                                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                            </button>
                                        </div>
                                        {errors.password && touched.password && <InputError message={errors.password} />}
                                    </div>

                                    {/* Repeat Password */}
                                    <div className="space-y-1.5">
                                        <Label htmlFor="repeatPassword">{t("auth_page.register.repeat_password_label")}</Label>
                                        <div className="relative">
                                            <Input
                                                id="repeatPassword"
                                                name="repeatPassword"
                                                type={showRepeatPassword ? 'text' : 'password'}
                                                onChange={handleChange}
                                                placeholder={t("auth_page.register.repeat_password_label")}
                                                className="h-11 md:h-12 bg-zinc-50 border-zinc-200 focus:bg-white focus:border-[#6366F1] focus:ring-4 focus:ring-[#6366F1]/10 focus-visible:ring-0 transition-all rounded-lg"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                                            >
                                                {showRepeatPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                            </button>
                                        </div>
                                        {errors.repeatPassword && touched.repeatPassword && <InputError message={errors.repeatPassword} />}
                                    </div>

                                    {/* Terms and Conditions Checkbox */}
                                    <div className="flex flex-col space-y-1.5">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="termsAccepted"
                                                checked={values.termsAccepted}
                                                onCheckedChange={(checked) => {
                                                    if (!values.termsAccepted) {
                                                        // Open modal when trying to check it
                                                        setIsTermsModalOpen(true);
                                                        setHasScrolledToBottom(false);
                                                    } else {
                                                        // Allow unchecking
                                                        setFieldValue('termsAccepted', false);
                                                    }
                                                }}
                                            />
                                            <Label
                                                htmlFor="termsAccepted"
                                                className="text-sm cursor-pointer"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    if (!values.termsAccepted) {
                                                        setIsTermsModalOpen(true);
                                                        setHasScrolledToBottom(false);
                                                    } else {
                                                        setFieldValue('termsAccepted', false);
                                                    }
                                                }}
                                            >
                                                {t("auth_page.register.i_agree_to")}{" "}
                                                <span className="text-[#6366F1] hover:underline" onClick={(e) => {
                                                    e.stopPropagation();
                                                    setIsTermsModalOpen(true);
                                                    setHasScrolledToBottom(false);
                                                }}>
                                                    {t("auth_page.register.terms_and_conditions")}
                                                </span>
                                            </Label>
                                        </div>
                                        {errors.termsAccepted && touched.termsAccepted && <InputError message={errors.termsAccepted} />}
                                    </div>

                                    {/* Terms Modal */}
                                    <Dialog open={isTermsModalOpen} onOpenChange={setIsTermsModalOpen}>
                                        <DialogContent className="sm:max-w-lg">
                                            <DialogHeader>
                                                <DialogTitle>{t("auth_page.register.terms_and_conditions")}</DialogTitle>
                                                <DialogDescription>
                                                    {t("auth_page.register.please_read_terms")}
                                                </DialogDescription>
                                            </DialogHeader>

                                            <div
                                                className="mt-4 h-64 overflow-y-auto pr-4 space-y-4 text-sm text-zinc-600 rounded-md border p-4 bg-zinc-50"
                                                onScroll={handleScroll}
                                            >
                                                <h3 className="font-semibold text-zinc-900">1. Introduction</h3>
                                                <p>Welcome to our platform. These Terms and Conditions govern your use of our service and provide information about our service, outlined below. By creating an account or using our platform, you agree to these terms.</p>

                                                <h3 className="font-semibold text-zinc-900 mt-4">2. Account Registration</h3>
                                                <p>You must register for an account to access certain features. You agree to provide accurate, current, and complete information during the registration process and keep your account up-to-date. You are solely responsible for safeguarding your password.</p>

                                                <h3 className="font-semibold text-zinc-900 mt-4">3. Privacy Policy</h3>
                                                <p>Your privacy is important to us. Our Privacy Policy explains how we collect, use, and share your personal information. By using our services, you agree to the collection and use of information in accordance with our Privacy Policy.</p>

                                                <h3 className="font-semibold text-zinc-900 mt-4">4. Acceptable Use</h3>
                                                <p>You agree not to misuse our services or help anyone else do so. For example, you must not: do anything illegal, deceptive, misleading, or fraudulent; impersonate any person or entity; violate the rights of others; or introduce malicious software code.</p>

                                                <h3 className="font-semibold text-zinc-900 mt-4">5. Subscription & Billing</h3>
                                                <p>Fees are non-refundable except as required by law. We may change our fees from time to time by posting the changes on our site with 30 days prior notice, but no advance notice is required for temporary promotions.</p>

                                                <h3 className="font-semibold text-zinc-900 mt-4">6. Intellectual Property</h3>
                                                <p>The platform and its original content, features, and functionality are owned by us and are protected by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.</p>

                                                <h3 className="font-semibold text-zinc-900 mt-4">7. Termination</h3>
                                                <p>We may terminate or suspend your account immediately, without prior notice or liability, for any reason, including without limitation if you breach the Terms. Upon termination, your right to use the Service will immediately cease.</p>

                                                <h3 className="font-semibold text-zinc-900 mt-4">8. Dispute Resolution</h3>
                                                <p>Any disputes arising from these Terms will be governed by local laws without regard to conflict of law provisions. We aim to resolve disputes informally first, but formal proceedings should be brought in competent courts.</p>
                                            </div>

                                            <DialogFooter className="mt-6">
                                                <Button
                                                    variant="outline"
                                                    onClick={() => setIsTermsModalOpen(false)}
                                                >
                                                    {t("shared.actions.cancel")}
                                                </Button>
                                                <Button
                                                    disabled={!hasScrolledToBottom}
                                                    onClick={() => {
                                                        setFieldValue('termsAccepted', true);
                                                        setIsTermsModalOpen(false);
                                                    }}
                                                    className="bg-[#6366F1] hover:bg-[#5859E9] text-white"
                                                >
                                                    {t("auth_page.register.confirm")}
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>

                                    {signupErrorText && <InputError message={signupErrorText} />}

                                    {/* Submit */}
                                    <Button
                                        disabled={signingUp}
                                        type="submit"
                                        className="w-full h-11 md:h-12 bg-[#6366F1] hover:bg-[#5859E9] text-white rounded-lg text-sm md:text-base font-semibold shadow-lg shadow-[#6366F1]/20 hover:shadow-[#6366F1]/40 transition-all flex items-center justify-center gap-2"
                                    >
                                        {signingUp ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                {t("auth_page.register.signup_loading_label")}
                                            </>
                                        ) : (
                                            t("auth_page.register.signup_button_label")
                                        )}
                                    </Button>

                                    {/* Divider */}
                                    <div className="flex items-center my-6">
                                        <div className="flex-1 border-t border-zinc-300"></div>
                                        <span className="px-3 text-zinc-500 text-sm">{t("auth_page.register.or_label")}</span>
                                        <div className="flex-1 border-t border-zinc-300"></div>
                                    </div>

                                    {/* Google Button */}
                                    <Button
                                        variant="outline"
                                        className="w-full h-11 md:h-12 rounded-lg border-zinc-200 bg-white hover:bg-zinc-50 hover:border-zinc-300 text-zinc-800 text-sm md:text-base font-medium shadow-sm transition-all"
                                    >
                                        <svg
                                            className="mr-3 h-5 w-5"
                                            fill="currentColor"
                                            viewBox="0 0 488 500"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path d="M488 261.8C488 432 377.9 488 244 488 108.9 488 0 379.1 0 244S108.9 0 244 0c74.4 0 123.6 28.5 163.6 66.8l-49.9 48.9c-29.4-28-71.8-46.6-113.6-46.6-89 0-161 72-161 161s72 161 161 161c94.2 0 144.3-64.2 150-97.1h-150v-85h255.9c2.3 12.7 3.5 25.5 3.5 39.3z" />
                                        </svg>
                                        {t("auth_page.register.signin_with_google_label")}
                                    </Button>

                                    {/* Already have account */}
                                    <p className="mt-6 text-center text-xs md:text-sm text-zinc-600">
                                        {t("auth_page.register.already_have_account_label")}{' '}
                                        <a href="/login" className="font-semibold text-[#6366F1] hover:underline">
                                            {t("auth_page.register.signin_instead_label")}
                                        </a>
                                    </p>
                                </Form>
                            )}
                        </Formik>
                    </div>
                </div>
            </div>

            {/* ✅ RIGHT SIDE (Fixed Image) */}
            <div className="hidden lg:block lg:w-1/2 fixed right-0 top-0 h-full">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#6366F1]/20 to-transparent mix-blend-multiply z-10 rounded-l-[2rem]" />
                <div className="absolute inset-0 bg-black/5 z-10 rounded-l-[2rem]" />
                <img
                    src={AbstractBG}
                    className="w-full h-full object-cover rounded-l-[2rem] shadow-2xl relative z-0"
                    alt="Background"
                />
            </div>
        </div>
    );
};

export default RegisterPage;
