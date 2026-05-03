import { useState, useEffect } from 'react';
import { Formik, Form } from 'formik';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputError } from '@/components/inputs/InputError';
import WebsiteLogo from '@/components/shared/WebsiteLogo';
import AbstractBG from '@/assets/svg/vecteezy_abstract-blue-color-background-dynamic-wave-fluid-shape_23455702.svg';
import { ResetPasswordSchema } from '@/misc/FormValidators';
import { resetPasswordApiCall } from '@/features/auth/service';
import { Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import { navigate } from 'vike/client/router';

const ResetPasswordPage = () => {
    const { t } = useTranslation();
    const [token, setToken] = useState<string | null>(null);
    const [tokenInvalid, setTokenInvalid] = useState(false);
    const [success, setSuccess] = useState(false);
    const [apiError, setApiError] = useState<string>();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    useEffect(() => {
        const t = new URLSearchParams(window.location.search).get('token');
        if (!t) {
            setTokenInvalid(true);
        } else {
            setToken(t);
        }
    }, []);

    if (tokenInvalid) {
        return (
            <div className="flex relative min-h-screen bg-white font-sans text-zinc-900">
                <a href="/" className="absolute top-10 left-10">
                    <WebsiteLogo />
                </a>
                <div className="flex-1 flex items-center justify-center p-8 lg:p-12">
                    <div className="w-full max-w-md text-center">
                        <div className="flex justify-center mb-6">
                            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-50">
                                <XCircle className="h-8 w-8 text-red-500" />
                            </div>
                        </div>
                        <h1 className="text-3xl font-extrabold mb-3">
                            {t('auth_page.reset_password.invalid_title')}
                        </h1>
                        <p className="text-zinc-600 mb-8">
                            {t('auth_page.reset_password.invalid_message')}
                        </p>
                        <Button
                            asChild
                            className="w-full h-12 bg-[#6366F1] hover:bg-[#5859E9] text-white rounded-lg"
                        >
                            <a href="/forgot-password">{t('auth_page.reset_password.request_new_link')}</a>
                        </Button>
                    </div>
                </div>
                <div className="hidden lg:flex flex-1 relative max-h-screen bg-gray-100 rounded-l-[50px] overflow-hidden">
                    <img src={AbstractBG} className="h-screen w-full object-cover" />
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="flex relative min-h-screen bg-white font-sans text-zinc-900">
                <a href="/" className="absolute top-10 left-10">
                    <WebsiteLogo />
                </a>
                <div className="flex-1 flex items-center justify-center p-8 lg:p-12">
                    <div className="w-full max-w-md text-center">
                        <div className="flex justify-center mb-6">
                            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-50">
                                <CheckCircle className="h-8 w-8 text-green-500" />
                            </div>
                        </div>
                        <h1 className="text-3xl font-extrabold mb-3">
                            {t('auth_page.reset_password.success_title')}
                        </h1>
                        <p className="text-zinc-600 mb-8">
                            {t('auth_page.reset_password.success_message')}
                        </p>
                        <Button
                            onClick={() => navigate('/login')}
                            className="w-full h-12 bg-[#6366F1] hover:bg-[#5859E9] text-white rounded-lg"
                        >
                            {t('auth_page.reset_password.go_to_login')}
                        </Button>
                    </div>
                </div>
                <div className="hidden lg:flex flex-1 relative max-h-screen bg-gray-100 rounded-l-[50px] overflow-hidden">
                    <img src={AbstractBG} className="h-screen w-full object-cover" />
                </div>
            </div>
        );
    }

    return (
        <div className="flex relative min-h-screen bg-white font-sans text-zinc-900">
            <a href="/" className="absolute top-10 left-10">
                <WebsiteLogo />
            </a>

            <div className="flex-1 flex items-center justify-center p-8 lg:p-12">
                <div className="w-full max-w-md">
                    <h1 className="text-4xl font-extrabold mb-8">
                        {t('auth_page.reset_password.title')}
                    </h1>

                    <Formik
                        initialValues={{ newPassword: '', confirmPassword: '' }}
                        validationSchema={ResetPasswordSchema}
                        onSubmit={async (values, { setSubmitting }) => {
                            setApiError(undefined);
                            try {
                                const res = await resetPasswordApiCall({
                                    token: token!,
                                    newPassword: values.newPassword,
                                });
                                if (res.data?.success) {
                                    setSuccess(true);
                                    setTimeout(() => navigate('/login'), 3000);
                                } else if (res.data?.code === 'auth.password.token_invalid') {
                                    setTokenInvalid(true);
                                } else {
                                    setApiError(res.data?.message ?? t('auth_page.reset_password.network_error'));
                                }
                            } catch (err: any) {
                                const code = err?.response?.data?.code;
                                if (code === 'auth.password.token_invalid') {
                                    setTokenInvalid(true);
                                } else {
                                    setApiError(t('auth_page.reset_password.network_error'));
                                }
                            } finally {
                                setSubmitting(false);
                            }
                        }}
                    >
                        {({ errors, touched, handleChange, values, isSubmitting }) => (
                            <Form className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="newPassword">
                                        {t('auth_page.reset_password.new_password_label')}
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="newPassword"
                                            name="newPassword"
                                            type={showPassword ? 'text' : 'password'}
                                            onChange={handleChange}
                                            disabled={isSubmitting}
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
                                    {errors.newPassword && touched.newPassword && (
                                        <InputError message={errors.newPassword} />
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">
                                        {t('auth_page.reset_password.confirm_password_label')}
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type={showConfirm ? 'text' : 'password'}
                                            onChange={handleChange}
                                            disabled={isSubmitting}
                                            className="h-12 border-zinc-300 focus:border-[#6366F1] focus-visible:ring-0"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirm(!showConfirm)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                                        >
                                            {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                    {errors.confirmPassword && touched.confirmPassword && (
                                        <InputError message={errors.confirmPassword} />
                                    )}
                                </div>

                                <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-4">
                                    <p className="text-sm font-medium text-zinc-700 mb-2">
                                        {t('auth_page.reset_password.requirements_title')}
                                    </p>
                                    <PasswordRequirement met={values.newPassword.length >= 8} label={t('auth_page.reset_password.req_length')} />
                                    <PasswordRequirement met={/[A-Z]/.test(values.newPassword)} label={t('auth_page.reset_password.req_uppercase')} />
                                    <PasswordRequirement met={/[a-z]/.test(values.newPassword)} label={t('auth_page.reset_password.req_lowercase')} />
                                    <PasswordRequirement met={/\d/.test(values.newPassword)} label={t('auth_page.reset_password.req_number')} />
                                </div>

                                {apiError && <InputError message={apiError} />}

                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full h-12 bg-[#6366F1] hover:bg-[#5859E9] text-white rounded-lg"
                                >
                                    {isSubmitting ? '…' : t('auth_page.reset_password.submit_button')}
                                </Button>
                            </Form>
                        )}
                    </Formik>
                </div>
            </div>

            <div className="hidden lg:flex flex-1 relative max-h-screen bg-gray-100 rounded-l-[50px] overflow-hidden">
                <img src={AbstractBG} className="h-screen w-full object-cover" />
            </div>
        </div>
    );
};

function PasswordRequirement({ met, label }: { met: boolean; label: string }) {
    return (
        <div className={`flex items-center gap-2 text-sm ${met ? 'text-green-600' : 'text-zinc-500'}`}>
            <span>{met ? '✓' : '•'}</span>
            <span>{label}</span>
        </div>
    );
}

export default ResetPasswordPage;
