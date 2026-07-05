import { useEffect, useLayoutEffect, useState } from 'react';
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
import { EmailSuggestionHint } from '@/components/inputs/EmailSuggestionHint';
import { suggestEmailCorrection } from '@/lib/emailUtils';
import WebsiteLogo from '@/components/shared/WebsiteLogo';
import { usePageContext } from 'vike-react/usePageContext';
import { useAuth } from '@/features/auth/useAuth';
import GoogleLoginButton from '@/components/inputs/GoogleLoginButton';
import { toast } from 'sonner';

const LoginPage = () => {
    const { t } = useTranslation("auth");
    const { urlParsed, user } = usePageContext();
    const [showPassword, setShowPassword] = useState(false);
    const [apiError, setApiError] = useState<string>();


    const { loginUser, loggingIn, loginError } = useAuth();

    const origin = urlParsed.search.origin || '/';
    const packId = urlParsed.search.packId;

    const handlePostLogin = (res?: any) => {
        const target = packId ? `${origin}?packId=${packId}` : origin;

        if (res?.data?.data?.tfaRequired) {
            navigate(`/tfa?origin=${encodeURIComponent(target)}`);
            return;
        }

        navigate(target);
    };

    useEffect(() => {
        const reason = localStorage.getItem('auth_logout_reason');
        if (reason === 'inactivity') {
            localStorage.removeItem('auth_logout_reason');
            toast.error(t("auth_page.logged_out_inactivity_toast"));
        }
    }, []);

    useEffect(() => {
        console.log("------ client ", user);

        if (loginError && loginError.response?.data) {
            // @ts-ignore
            setApiError(loginError.response?.data.message);

        }
    }, [loginError]);

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-white font-sans text-zinc-900">
            {/* Left side - Login Form */}
            <div className="flex-1 flex flex-col">
                <a href='/' className='px-6 pt-8 lg:px-12 lg:pt-10'>
                    <WebsiteLogo />
                </a>

                <div className="flex-1 flex flex-col items-center justify-start lg:justify-center p-8 lg:p-12">
                    <div className="w-full max-w-md ">
                        <h1 className="text-4xl font-extrabold mb-2">{t("auth_page.signin_page_title")}</h1>
                        <p className="text-zinc-600 mb-8">{t("auth_page.please_login_label")}</p>
                        <Formik
                            initialValues={{ email: '', password: '', stayConnected: false }}
                            validationSchema={LoginFormSchema}
                            onSubmit={values => {
                                setApiError(undefined);
                                loginUser({
                                    email: values.email,
                                    password: values.password,
                                    stayConnected: values.stayConnected,
                                }, {
                                    onSuccess: handlePostLogin
                                })
                            }}
                        >
                            {({ errors, touched, handleChange, handleBlur, values, setFieldValue }) => {
                                const emailSuggestion = suggestEmailCorrection(values.email);
                                return (
                                <Form className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">{t("auth_page.email_label")}</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            name='email'
                                            value={values.email}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            placeholder="jonas_kahnwald@gmail.com"
                                            className="h-12 border-zinc-300 focus:border-[#6366F1] focus-visible:ring-0"
                                        />
                                    </div>
                                    {errors.email && touched.email && <InputError message={errors.email} />}
                                    {!errors.email && touched.email && emailSuggestion && (
                                        <EmailSuggestionHint
                                            suggestion={emailSuggestion}
                                            onAccept={(email) => setFieldValue('email', email)}
                                        />
                                    )}

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

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="keep-logged-in"
                                                className="rounded-md border-zinc-300"
                                                checked={values.stayConnected}
                                                onCheckedChange={(checked) => setFieldValue('stayConnected', checked === true)}
                                            />
                                            <Label htmlFor="keep-logged-in" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                {t("auth_page.stay_signedin_label")}
                                            </Label>
                                        </div>
                                        <a href="/forgot-password" className="text-sm font-semibold text-[#6366F1] hover:underline">
                                            {t("auth_page.forgot_password_link")}
                                        </a>
                                    </div>

                                    {
                                        apiError && <InputError
                                            message={apiError}
                                        />
                                    }

                                    <Button
                                        disabled={loggingIn}
                                        type='submit'
                                        className="w-full h-12 bg-[#6366F1] hover:bg-[#5859E9] text-white rounded-lg"
                                    >
                                        {t("auth_page.signin_button_label")}
                                    </Button>
                                </Form>
                                );
                            }}
                        </Formik>

                        <div className="flex items-center my-6">
                            <div className="flex-1 border-t border-zinc-300"></div>
                            <span className="px-4 text-zinc-500">{t("auth_page.or_label")}</span>
                            <div className="flex-1 border-t border-zinc-300"></div>
                        </div>

                        {/*  <Button variant="outline" className="w-full h-12 rounded-lg border-zinc-300 hover:bg-zinc-100 text-zinc-800">
                            <svg
                                className="mr-2 h-5 w-5"
                                fill="currentColor"
                                viewBox="0 0 488 500"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path d="M488 261.8C488 432 377.9 488 244 488 108.9 488 0 379.1 0 244S108.9 0 244 0c74.4 0 123.6 28.5 163.6 66.8l-49.9 48.9c-29.4-28-71.8-46.6-113.6-46.6-89 0-161 72-161 161s72 161 161 161c94.2 0 144.3-64.2 150-97.1h-150v-85h255.9c2.3 12.7 3.5 25.5 3.5 39.3z" />
                            </svg>
                            {t("auth_page.signin_with_google_label")}
                        </Button> */}

                        <GoogleLoginButton />


                        <p className="mt-8 text-center text-sm text-zinc-600">
                            {t("auth_page.need_account_label")}{' '}
                            <a href={`/signup?origin=${encodeURIComponent(origin)}${packId ? `&packId=${packId}` : ''}`} className="font-semibold text-[#6366F1] hover:underline">
                                {t("auth_page.create_account_label")}
                            </a>
                        </p>
                    </div>
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
