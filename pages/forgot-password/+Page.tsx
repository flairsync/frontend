import { useState } from 'react';
import { Formik, Form } from 'formik';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputError } from '@/components/inputs/InputError';
import WebsiteLogo from '@/components/shared/WebsiteLogo';
import AbstractBG from '@/assets/svg/vecteezy_abstract-blue-color-background-dynamic-wave-fluid-shape_23455702.svg';
import { ForgotPasswordSchema } from '@/misc/FormValidators';
import { forgotPasswordApiCall } from '@/features/auth/service';
import { Mail } from 'lucide-react';

const ForgotPasswordPage = () => {
    const { t } = useTranslation();
    const [sent, setSent] = useState(false);
    const [apiError, setApiError] = useState<string>();

    if (sent) {
        return (
            <div className="flex relative min-h-screen bg-white font-sans text-zinc-900">
                <a href="/" className="absolute top-10 left-10">
                    <WebsiteLogo />
                </a>
                <div className="flex-1 flex items-center justify-center p-8 lg:p-12">
                    <div className="w-full max-w-md text-center">
                        <div className="flex justify-center mb-6">
                            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-indigo-50">
                                <Mail className="h-8 w-8 text-[#6366F1]" />
                            </div>
                        </div>
                        <h1 className="text-3xl font-extrabold mb-3">
                            {t('auth_page.forgot_password.success_title')}
                        </h1>
                        <p className="text-zinc-600 mb-2">
                            {t('auth_page.forgot_password.success_message')}
                        </p>
                        <p className="text-zinc-500 text-sm mb-8">
                            {t('auth_page.forgot_password.success_expiry')}
                        </p>
                        <Button
                            asChild
                            className="w-full h-12 bg-[#6366F1] hover:bg-[#5859E9] text-white rounded-lg"
                        >
                            <a href="/login">{t('auth_page.forgot_password.back_to_login_button')}</a>
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
                    <h1 className="text-4xl font-extrabold mb-2">
                        {t('auth_page.forgot_password.title')}
                    </h1>
                    <p className="text-zinc-600 mb-8">
                        {t('auth_page.forgot_password.subtitle')}
                    </p>

                    <Formik
                        initialValues={{ email: '' }}
                        validationSchema={ForgotPasswordSchema}
                        onSubmit={async (values, { setSubmitting }) => {
                            setApiError(undefined);
                            try {
                                const res = await forgotPasswordApiCall(values.email);
                                if (res.data?.success) {
                                    setSent(true);
                                } else {
                                    setApiError(res.data?.message ?? t('auth_page.forgot_password.network_error'));
                                }
                            } catch {
                                setApiError(t('auth_page.forgot_password.network_error'));
                            } finally {
                                setSubmitting(false);
                            }
                        }}
                    >
                        {({ errors, touched, handleChange, isSubmitting }) => (
                            <Form className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="email">{t('auth_page.forgot_password.email_label')}</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        onChange={handleChange}
                                        placeholder="you@example.com"
                                        disabled={isSubmitting}
                                        className="h-12 border-zinc-300 focus:border-[#6366F1] focus-visible:ring-0"
                                    />
                                    {errors.email && touched.email && <InputError message={errors.email} />}
                                </div>

                                {apiError && <InputError message={apiError} />}

                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full h-12 bg-[#6366F1] hover:bg-[#5859E9] text-white rounded-lg"
                                >
                                    {isSubmitting ? '…' : t('auth_page.forgot_password.submit_button')}
                                </Button>
                            </Form>
                        )}
                    </Formik>

                    <p className="mt-6 text-center text-sm text-zinc-600">
                        <a href="/login" className="font-semibold text-[#6366F1] hover:underline">
                            {t('auth_page.forgot_password.back_to_login')}
                        </a>
                    </p>
                </div>
            </div>

            <div className="hidden lg:flex flex-1 relative max-h-screen bg-gray-100 rounded-l-[50px] overflow-hidden">
                <img src={AbstractBG} className="h-screen w-full object-cover" />
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
