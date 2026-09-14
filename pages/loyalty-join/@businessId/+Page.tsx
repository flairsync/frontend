import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
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
import { useDiscoveryProfile } from '@/features/discovery/useDiscovery';
import { joinLoyaltyProgramApiCall } from '@/features/loyalty/loyalty-api';
import { Gift, XCircle, Loader2, Eye, EyeOff } from 'lucide-react';

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

// The "Join our Loyalty Program" QR-scan landing page. Unlike /loyalty-signup
// (staff-sent invite token, business context carried by the token), this page
// is reachable by anyone scanning a business's public QR code — business
// context comes from the URL param + the public discovery profile, and there
// is no invite token to consume.
const LoyaltyJoinPage = () => {
    const { t } = useTranslation('auth');
    const pageContext = usePageContext();
    const businessId = pageContext.routeParams?.businessId as string;
    const { user } = pageContext;
    const { loginUser, loggingIn, loginError, signupUser, signingUp, signupError } = useAuth();
    const [mode, setMode] = useState<'signup' | 'login'>('signup');
    const [showPassword, setShowPassword] = useState(false);
    const [showRepeatPassword, setShowRepeatPassword] = useState(false);
    const [apiError, setApiError] = useState<string>();

    const { data: profile, isLoading: resolvingProfile } = useDiscoveryProfile(businessId);

    const {
        mutate: join,
        isPending: joining,
        isError: joinFailed,
        error: joinError,
    } = useMutation({
        mutationKey: ['join_loyalty_program', businessId],
        mutationFn: () => joinLoyaltyProgramApiCall(businessId),
        onSuccess: () => {
            window.location.href = `/diner/${businessId}/loyalty`;
        },
    });

    // Fires once the visitor is authenticated (they just logged in, just
    // registered, or were already logged in when they scanned the QR) — the
    // single point where scanning the QR turns into a LoyaltyAccount.
    useEffect(() => {
        if (user && profile && !joining && !joinFailed) {
            join();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, profile]);

    useEffect(() => {
        const err = loginError ?? signupError;
        if ((err as any)?.response?.data) setApiError((err as any).response.data.message);
    }, [loginError, signupError]);

    if (!businessId || (!resolvingProfile && !profile)) {
        return (
            <PageShell>
                <div className="text-center">
                    <div className="flex justify-center mb-6">
                        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-50">
                            <XCircle className="h-8 w-8 text-red-500" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-extrabold mb-3">{t('auth_page.loyalty_join.invalid_title')}</h1>
                    <p className="text-muted-foreground">{t('auth_page.loyalty_join.invalid_message')}</p>
                </div>
            </PageShell>
        );
    }

    if (resolvingProfile || !profile) {
        return (
            <PageShell>
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p>{t('auth_page.loyalty_join.loading')}</p>
                </div>
            </PageShell>
        );
    }

    if (user) {
        // Logged in: either still resolving the join call (redirects away on
        // success), or it failed (program inactive/not entitled) — never the
        // login/signup forms below, since there's nothing left to authenticate.
        if (joinFailed) {
            const message = (joinError as any)?.response?.data?.message ?? t('auth_page.loyalty_join.inactive_message');
            return (
                <PageShell>
                    <div className="text-center">
                        <div className="flex justify-center mb-6">
                            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-50">
                                <XCircle className="h-8 w-8 text-red-500" />
                            </div>
                        </div>
                        <h1 className="text-3xl font-extrabold mb-3">{t('auth_page.loyalty_join.inactive_title')}</h1>
                        <p className="text-muted-foreground">{message}</p>
                    </div>
                </PageShell>
            );
        }
        return (
            <PageShell>
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p>{t('auth_page.loyalty_join.joining')}</p>
                </div>
            </PageShell>
        );
    }

    const header = (
        <>
            <div className="flex items-center gap-2 mb-2 text-primary">
                <Gift className="h-5 w-5" />
                <span className="text-xs font-bold uppercase tracking-widest">{profile.name}</span>
            </div>
            <h1 className="text-2xl font-extrabold mb-2">
                {t('auth_page.loyalty_join.title', { businessName: profile.name })}
            </h1>
            <p className="text-muted-foreground mb-8">{t('auth_page.loyalty_join.subtitle')}</p>
        </>
    );

    if (mode === 'login') {
        return (
            <PageShell>
                {header}
                <Formik
                    initialValues={{ email: '', password: '' }}
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

                            <p className="text-center text-sm text-muted-foreground">
                                <button type="button" className="text-primary hover:underline" onClick={() => setMode('signup')}>
                                    {t('auth_page.loyalty_join.toggle_to_signup')}
                                </button>
                            </p>
                        </Form>
                    )}
                </Formik>
            </PageShell>
        );
    }

    return (
        <PageShell>
            {header}
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
                onSubmit={(values) => {
                    setApiError(undefined);
                    signupUser({
                        email: values.email,
                        firstName: values.firstName,
                        lastName: values.lastName,
                        password: values.password,
                        termsAccepted: values.termsAccepted,
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

                        <p className="text-center text-sm text-muted-foreground">
                            <button type="button" className="text-primary hover:underline" onClick={() => setMode('login')}>
                                {t('auth_page.loyalty_join.toggle_to_login')}
                            </button>
                        </p>
                    </Form>
                )}
            </Formik>
        </PageShell>
    );
};

export default LoyaltyJoinPage;
