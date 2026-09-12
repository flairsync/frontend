import { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Formik, Form } from 'formik';
import { useTranslation } from 'react-i18next';
import { usePageContext } from 'vike-react/usePageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputError } from '@/components/inputs/InputError';
import WebsiteLogo from '@/components/shared/WebsiteLogo';
import AbstractBG from '@/assets/svg/vecteezy_abstract-blue-color-background-dynamic-wave-fluid-shape_23455702.svg';
import { LoginFormSchema, SignupFormSchema } from '@/misc/FormValidators';
import { useAuth } from '@/features/auth/useAuth';
import { resolveLoyaltySignupInviteApiCall, consumeLoyaltySignupInviteApiCall } from '@/features/loyalty/loyalty-api';
import { Gift, XCircle, CheckCircle, Loader2, Eye, EyeOff } from 'lucide-react';

function PageShell({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex relative min-h-screen bg-background font-sans text-foreground">
            <a href="/" className="absolute top-10 left-10 z-10">
                <WebsiteLogo />
            </a>
            <div className="flex-1 flex items-center justify-center p-8 lg:p-12">
                <div className="w-full max-w-md">{children}</div>
            </div>
            <div className="hidden lg:flex flex-1 relative max-h-screen bg-gray-100 rounded-l-[50px] overflow-hidden">
                <img src={AbstractBG} className="h-screen w-full object-cover" />
            </div>
        </div>
    );
}

const LoyaltySignupPage = () => {
    const { t } = useTranslation('auth');
    const { user } = usePageContext();
    const { loginUser, loggingIn, loginError, signupUser, signingUp, signupError } = useAuth();
    const [token, setToken] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showRepeatPassword, setShowRepeatPassword] = useState(false);
    const [apiError, setApiError] = useState<string>();

    useEffect(() => {
        setToken(new URLSearchParams(window.location.search).get('token'));
    }, []);

    const { data: invite, isLoading: resolving } = useQuery({
        queryKey: ['loyalty_signup_invite', token],
        queryFn: async () => (await resolveLoyaltySignupInviteApiCall(token!)).data.data,
        enabled: !!token,
    });

    const { mutate: consumeInvite, isPending: consuming, isSuccess: consumed } = useMutation({
        mutationKey: ['consume_loyalty_invite'],
        mutationFn: () => consumeLoyaltySignupInviteApiCall(token!),
    });

    // Fires once the visitor is authenticated (they just logged in, just
    // registered, or were already logged in when they opened the link) and
    // the invite has resolved as valid — this is the single point where a
    // consumed invite turns into a LoyaltyAccount.
    useEffect(() => {
        if (user && invite?.valid && !consuming && !consumed) {
            consumeInvite();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, invite?.valid]);

    useEffect(() => {
        const err = loginError ?? signupError;
        // @ts-ignore
        if (err?.response?.data) setApiError((err as any).response.data.message);
    }, [loginError, signupError]);

    if (!token || (invite && !invite.valid)) {
        return (
            <PageShell>
                <div className="text-center">
                    <div className="flex justify-center mb-6">
                        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-50">
                            <XCircle className="h-8 w-8 text-red-500" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-extrabold mb-3">{t('auth_page.loyalty_signup.invalid_title')}</h1>
                    <p className="text-muted-foreground">{t('auth_page.loyalty_signup.invalid_message')}</p>
                </div>
            </PageShell>
        );
    }

    if (resolving || !invite) {
        return (
            <PageShell>
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p>{t('auth_page.loyalty_signup.loading')}</p>
                </div>
            </PageShell>
        );
    }

    if (user && (consuming || !consumed)) {
        return (
            <PageShell>
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p>{t('auth_page.loyalty_signup.setting_up')}</p>
                </div>
            </PageShell>
        );
    }

    if (user && consumed) {
        return (
            <PageShell>
                <div className="text-center">
                    <div className="flex justify-center mb-6">
                        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-50">
                            <CheckCircle className="h-8 w-8 text-green-500" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-extrabold mb-3">{t('auth_page.loyalty_signup.success_title')}</h1>
                    <p className="text-muted-foreground mb-8">
                        {t('auth_page.loyalty_signup.success_message', { businessName: invite.businessName })}
                    </p>
                    <Button asChild className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg">
                        <a href="/">{t('auth_page.loyalty_signup.go_to_app')}</a>
                    </Button>
                </div>
            </PageShell>
        );
    }

    // Not logged in, has an existing FlairSync account — log in to confirm.
    if (invite.alreadyHasAccount) {
        return (
            <PageShell>
                <div className="flex items-center gap-2 mb-2 text-primary">
                    <Gift className="h-5 w-5" />
                    <span className="text-xs font-bold uppercase tracking-widest">{invite.businessName}</span>
                </div>
                <h1 className="text-2xl font-extrabold mb-2">
                    {t('auth_page.loyalty_signup.login_title', { businessName: invite.businessName })}
                </h1>
                <p className="text-muted-foreground mb-8">{t('auth_page.loyalty_signup.login_subtitle')}</p>

                <Formik
                    initialValues={{ email: invite.contactEmail ?? '', password: '' }}
                    validationSchema={LoginFormSchema}
                    onSubmit={(values) => {
                        setApiError(undefined);
                        loginUser({ email: values.email, password: values.password });
                    }}
                >
                    {({ errors, touched, handleChange, values }) => (
                        <Form className="space-y-5">
                            <div className="space-y-1.5">
                                <Label htmlFor="email">{t('auth_page.email_label')}</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={values.email}
                                    onChange={handleChange}
                                    disabled={!!invite.contactEmail}
                                    className="h-12 border-border focus:border-primary focus-visible:ring-0"
                                />
                                {errors.email && touched.email && <InputError message={errors.email} />}
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="password">{t('auth_page.password_label')}</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        onChange={handleChange}
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

                            {apiError && <InputError message={apiError} />}

                            <Button type="submit" disabled={loggingIn} className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg gap-2">
                                {loggingIn ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                                {t('auth_page.loyalty_signup.login_button')}
                            </Button>
                        </Form>
                    )}
                </Formik>
            </PageShell>
        );
    }

    // Not logged in, no existing account — create one, tying it to the invite token.
    return (
        <PageShell>
            <div className="flex items-center gap-2 mb-2 text-primary">
                <Gift className="h-5 w-5" />
                <span className="text-xs font-bold uppercase tracking-widest">{invite.businessName}</span>
            </div>
            <h1 className="text-2xl font-extrabold mb-2">
                {t('auth_page.loyalty_signup.join_title', { businessName: invite.businessName })}
            </h1>
            <p className="text-muted-foreground mb-8">{t('auth_page.loyalty_signup.join_subtitle')}</p>

            <Formik
                initialValues={{
                    firstName: '',
                    lastName: '',
                    email: invite.contactEmail ?? '',
                    password: '',
                    repeatPassword: '',
                    termsAccepted: false,
                }}
                validationSchema={SignupFormSchema}
                onSubmit={(values) => {
                    setApiError(undefined);
                    signupUser({
                        email: values.email,
                        firstName: values.firstName,
                        lastName: values.lastName,
                        password: values.password,
                        termsAccepted: values.termsAccepted,
                        loyaltyInviteToken: token!,
                    });
                }}
            >
                {({ errors, touched, handleChange, values, setFieldValue }) => (
                    <Form className="space-y-5">
                        <div className="space-y-1.5">
                            <Label htmlFor="firstName">{t('auth_page.register.firstname_label')}</Label>
                            <Input id="firstName" name="firstName" onChange={handleChange} className="h-12 border-border focus:border-primary focus-visible:ring-0" />
                            {errors.firstName && touched.firstName && <InputError message={errors.firstName} />}
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="lastName">{t('auth_page.register.lastname_label')}</Label>
                            <Input id="lastName" name="lastName" onChange={handleChange} className="h-12 border-border focus:border-primary focus-visible:ring-0" />
                            {errors.lastName && touched.lastName && <InputError message={errors.lastName} />}
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="email">{t('auth_page.register.email_label')}</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                value={values.email}
                                onChange={handleChange}
                                disabled={!!invite.contactEmail}
                                className="h-12 border-border focus:border-primary focus-visible:ring-0"
                            />
                            {errors.email && touched.email && <InputError message={errors.email} />}
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="password">{t('auth_page.register.password_label')}</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    onChange={handleChange}
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
                        <div className="space-y-1.5">
                            <Label htmlFor="repeatPassword">{t('auth_page.register.repeat_password_label')}</Label>
                            <div className="relative">
                                <Input
                                    id="repeatPassword"
                                    name="repeatPassword"
                                    type={showRepeatPassword ? 'text' : 'password'}
                                    onChange={handleChange}
                                    className="h-12 border-border focus:border-primary focus-visible:ring-0"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showRepeatPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                            {errors.repeatPassword && touched.repeatPassword && <InputError message={errors.repeatPassword} />}
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                id="termsAccepted"
                                type="checkbox"
                                checked={values.termsAccepted}
                                onChange={(e) => setFieldValue('termsAccepted', e.target.checked)}
                                className="h-4 w-4"
                            />
                            <Label htmlFor="termsAccepted" className="text-sm cursor-pointer">
                                {t('auth_page.register.i_agree_to')}{' '}
                                <a href="/terms" target="_blank" className="text-primary hover:underline">
                                    {t('auth_page.register.terms_and_conditions')}
                                </a>
                            </Label>
                        </div>
                        {errors.termsAccepted && touched.termsAccepted && <InputError message={errors.termsAccepted} />}

                        {apiError && <InputError message={apiError} />}

                        <Button type="submit" disabled={signingUp} className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg gap-2">
                            {signingUp ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                            {t('auth_page.register.signup_button_label')}
                        </Button>
                    </Form>
                )}
            </Formik>
        </PageShell>
    );
};

export default LoyaltySignupPage;
