import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import React from 'react';
import { Formik, Form } from 'formik';
import AbstractBG from "@/assets/svg/vecteezy_abstract-blue-color-background-dynamic-wave-fluid-shape_23455702.svg";
import { useTranslation } from 'react-i18next';
import { SignupFormSchema } from '@/misc/FormValidators';
import { InputError } from '@/components/inputs/InputError';
import WebsiteLogo from '@/components/shared/WebsiteLogo';
import { useAuth } from '@/features/auth/useAuth';
import { AxiosError } from 'axios';

const RegisterPage = () => {
    const { t } = useTranslation();
    const [showPassword, setShowPassword] = useState(false);
    const [showRepeatPassword, setShowRepeatPassword] = useState(false);
    const [signupErrorText, setSignupErrorText] = useState<string>();
    const { signupUser, signingUp, signupError } = useAuth();

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
                        <h1 className="text-3xl md:text-3xl font-extrabold mb-6 text-center">
                            {t("auth_page.register.signup_page_title")}
                        </h1>

                        <Formik
                            initialValues={{
                                firstName: '',
                                lastName: '',
                                email: '',
                                password: '',
                                repeatPassword: '',
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
                            {({ errors, touched, handleChange }) => (
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
                                            className="h-10 md:h-11 border-zinc-300 focus:border-[#6366F1] focus-visible:ring-0"
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
                                            className="h-10 md:h-11 border-zinc-300 focus:border-[#6366F1] focus-visible:ring-0"
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
                                            className="h-10 md:h-11 border-zinc-300 focus:border-[#6366F1] focus-visible:ring-0"
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
                                                className="h-10 md:h-11 border-zinc-300 focus:border-[#6366F1] focus-visible:ring-0"
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
                                                className="h-10 md:h-11 border-zinc-300 focus:border-[#6366F1] focus-visible:ring-0"
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

                                    {signupErrorText && <InputError message={signupErrorText} />}

                                    {/* Submit */}
                                    <Button
                                        disabled={signingUp}
                                        type="submit"
                                        className="w-full h-11 md:h-12 bg-[#6366F1] hover:bg-[#5859E9] text-white rounded-lg text-sm md:text-base flex items-center justify-center gap-2"
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
                                        className="w-full h-11 md:h-12 rounded-lg border-zinc-300 hover:bg-zinc-100 text-zinc-800 text-sm md:text-base"
                                    >
                                        <svg
                                            className="mr-2 h-5 w-5"
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
            <div className="hidden lg:block lg:w-1/2 fixed right-0 top-0 h-full ">
                <img
                    src={AbstractBG}
                    className="w-full h-full object-cover rounded-l-3xl"
                    alt="Background"
                />
            </div>
        </div>
    );
};

export default RegisterPage;
