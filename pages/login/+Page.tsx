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
import { getSecureItem, removeSecureItem } from '@/misc/SecureStorage';

const LoginPage = () => {
    const { t } = useTranslation("auth");
    const { urlParsed, user } = usePageContext();
    const [showPassword, setShowPassword] = useState(false);
    const [apiError, setApiError] = useState<string>();


    const { loginUser, loggingIn, loginError } = useAuth();

    // N9 (QA Retest, 2026-11-18): with no ?origin= param (e.g. navigating to /login
    // directly rather than being bounced off a protected page), this fell back to '/' —
    // the marketing homepage — instead of the dashboard every other post-auth redirect
    // in the app uses (see /manage/overview usages across the codebase).
    const origin = urlParsed.search.origin || '/manage/overview';
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
        const reason = getSecureItem('auth_logout_reason');
        if (reason === 'inactivity') {
            removeSecureItem('auth_logout_reason');
            toast.error(t("auth_page.logged_out_inactivity_toast"));
        }
    }, []);

    useEffect(() => {
        if (loginError && loginError.response?.data) {
            // @ts-ignore
            setApiError(loginError.response?.data.message);

        }
    }, [loginError]);

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-background font-sans text-foreground">
            {/* Left side - Login Form */}
            <div className="flex-1 flex flex-col">
                <a href='/' className='px-6 pt-8 lg:px-12 lg:pt-10'>
                    <WebsiteLogo />
                </a>

                <div className="flex-1 flex flex-col items-center justify-start lg:justify-center p-8 lg:p-12">
                    <div className="w-full max-w-md ">
                        <h1 className="text-4xl font-extrabold mb-2">{t("auth_page.signin_page_title")}</h1>
                        <p className="text-muted-foreground mb-8">{t("auth_page.please_login_label")}</p>
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
                                            placeholder="you@example.com"
                                            className="h-12 border-border focus:border-primary focus-visible:ring-0"
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
                                                className="h-12 border-border focus:border-primary focus-visible:ring-0"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
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
                                                className="rounded-md border-border"
                                                checked={values.stayConnected}
                                                onCheckedChange={(checked) => setFieldValue('stayConnected', checked === true)}
                                            />
                                            <Label htmlFor="keep-logged-in" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                {t("auth_page.stay_signedin_label")}
                                            </Label>
                                        </div>
                                        <a href="/forgot-password" className="text-sm font-semibold text-primary hover:underline">
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
                                        className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg"
                                    >
                                        {t("auth_page.signin_button_label")}
                                    </Button>
                                </Form>
                                );
                            }}
                        </Formik>

                        <div className="flex items-center my-6">
                            <div className="flex-1 border-t border-border"></div>
                            <span className="px-4 text-muted-foreground">{t("auth_page.or_label")}</span>
                            <div className="flex-1 border-t border-border"></div>
                        </div>

                        <GoogleLoginButton />


                        <p className="mt-8 text-center text-sm text-muted-foreground">
                            {t("auth_page.need_account_label")}{' '}
                            <a href={`/signup?origin=${encodeURIComponent(origin)}${packId ? `&packId=${packId}` : ''}`} className="font-semibold text-primary hover:underline">
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
