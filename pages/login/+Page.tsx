import { useLayoutEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';
import React from 'react';
import { Formik, Form } from 'formik';
import { navigate } from 'vike/client/router';
import AbstractBG from "@/assets/svg/vecteezy_abstract-blue-color-background-dynamic-wave-fluid-shape_23455702.svg";
import { useTranslation } from 'react-i18next';
import { LoginFormSchema, SignupFormSchema } from '@/misc/FormValidators';
import { InputError } from '@/components/inputs/InputError';
import WebsiteLogo from '@/components/shared/WebsiteLogo';
import { useAuth } from '@/features/auth/useAuth';
import { loginUserApiCall } from '@/features/auth/service';
import axios from 'axios';

const LoginPage = () => {
    const { t } = useTranslation();
    const [showPassword, setShowPassword] = useState(false);

    const { loginUser, loggingIn, } = useAuth();


    return (
        <div className="flex relative min-h-screen bg-white font-sans text-zinc-900">
            {/* Left side - Login Form */}
            <a href='/' className='absolute top-10 left-10'>
                <WebsiteLogo />
            </a>

            <div className="flex-1 flex-col flex items-center justify-center p-8 lg:p-12">
                <div className="w-full max-w-md ">
                    <h1 className="text-4xl font-extrabold mb-2">{t("auth_page.signin_page_title")}</h1>
                    <p className="text-zinc-600 mb-8">{t("auth_page.please_login_label")}</p>
                    <Formik
                        initialValues={{ email: '', password: '' }}
                        validationSchema={LoginFormSchema}
                        onSubmit={values => {
                            // loginUser(values);
                            loginUser({
                                email: values.email,
                                password: values.password
                            })
                        }}
                    >
                        {({ errors, touched, handleChange }) => (
                            <Form className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="email">{t("auth_page.email_label")}</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        name='email'
                                        onChange={handleChange}
                                        placeholder="jonas_kahnwald@gmail.com"
                                        className="h-12 border-zinc-300 focus:border-[#6366F1] focus-visible:ring-0"
                                    />
                                </div>
                                {errors.email && touched.email && <InputError message={errors.email} />}

                                <div className="space-y-2">
                                    <Label htmlFor="password">{t("auth_page.password_label")}</Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            name='password'
                                            type={showPassword ? 'text' : 'password'}
                                            onChange={handleChange}
                                            placeholder={t("auth_page.password_label")}
                                            className="h-12 border-zinc-300 focus:border-[#6366F1] focus-visible:ring-0"
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

                                <div className="flex items-center space-x-2">
                                    <Checkbox id="keep-logged-in" className="rounded-md border-zinc-300" />
                                    <Label htmlFor="keep-logged-in" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        {t("auth_page.stay_signedin_label")}
                                    </Label>
                                </div>

                                {loggingIn && <>Logging in ...</>}

                                <Button
                                    disabled={loggingIn}
                                    type='submit'
                                    className="w-full h-12 bg-[#6366F1] hover:bg-[#5859E9] text-white rounded-lg"
                                >
                                    {t("auth_page.signin_button_label")}
                                </Button>
                            </Form>
                        )}
                    </Formik>

                    <div className="flex items-center my-6">
                        <div className="flex-1 border-t border-zinc-300"></div>
                        <span className="px-4 text-zinc-500">{t("auth_page.or_label")}</span>
                        <div className="flex-1 border-t border-zinc-300"></div>
                    </div>

                    <Button variant="outline" className="w-full h-12 rounded-lg border-zinc-300 hover:bg-zinc-100 text-zinc-800">
                        <svg
                            className="mr-2 h-5 w-5"
                            fill="currentColor"
                            viewBox="0 0 488 500"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path d="M488 261.8C488 432 377.9 488 244 488 108.9 488 0 379.1 0 244S108.9 0 244 0c74.4 0 123.6 28.5 163.6 66.8l-49.9 48.9c-29.4-28-71.8-46.6-113.6-46.6-89 0-161 72-161 161s72 161 161 161c94.2 0 144.3-64.2 150-97.1h-150v-85h255.9c2.3 12.7 3.5 25.5 3.5 39.3z" />
                        </svg>
                        {t("auth_page.signin_with_google_label")}
                    </Button>

                    <p className="mt-8 text-center text-sm text-zinc-600">
                        {t("auth_page.need_account_label")}{' '}
                        <a href="/register" className="font-semibold text-[#6366F1] hover:underline">
                            {t("auth_page.create_account_label")}
                        </a>
                    </p>
                </div>
            </div>

            {/* Right side - Image */}
            <div className="hidden lg:flex flex-1 relative max-h-screen bg-gray-100 rounded-l-[50px] overflow-hidden">
                <img
                    id='abstract_login_svg'
                    src={AbstractBG}
                    className='abstract_login_svg h-screen w-full object-cover'
                />
            </div>
        </div>
    );
};

export default LoginPage;
