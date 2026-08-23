import { InputError } from '@/components/inputs/InputError'
import { PasswordInput } from '@/components/inputs/PasswordInput'
import TfaCodeNeededModal from '@/components/inputs/TfaCodeNeededModal'
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { usePasswordSettings } from '@/features/profileSettings/usePasswordSettings'
import { UpdatePasswordSchema } from '@/misc/FormValidators'
import { AxiosError } from 'axios'
import { Formik, FormikProps } from 'formik'
import { ShieldOff } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

const PasswordSettings = () => {

    const { t } = useTranslation('profile');
    const [needsTfaModal, setNeedsTfaModal] = useState(false);
    const [updateError, setUpdateError] = useState<string>();

    const formRef = useRef<FormikProps<{
        currentPassword: string;
        newPassword: string;
        repeatNewPassword: string;
    }>>(null);
    const {
        errorUpdatingUserPassword,
        updateUserPassword,
        updatingUserPassword,
        userPasswordUpdated
    } = usePasswordSettings();


    useEffect(() => {
        if (errorUpdatingUserPassword) {
            if (errorUpdatingUserPassword instanceof AxiosError) {

                if (errorUpdatingUserPassword.response?.data.code == "tfa.error") {
                    setNeedsTfaModal(true);
                } else {
                    setUpdateError(errorUpdatingUserPassword.response?.data.message);
                }
            }
        }
    }, [errorUpdatingUserPassword]);


    useEffect(() => {
        if (userPasswordUpdated) {
            formRef.current?.resetForm();
        }
    }, [userPasswordUpdated]);



    return (
        <>
            <TfaCodeNeededModal
                open={needsTfaModal}
                closeModal={() => {
                    setNeedsTfaModal(false);
                }}
            />

            <AccordionItem value="password" className="border rounded-lg px-3">
                <AccordionTrigger>{t('password_settings.title')}</AccordionTrigger>
                <AccordionContent className="space-y-4 py-2">
                    <Formik
                        innerRef={formRef}
                        validationSchema={UpdatePasswordSchema}
                        initialValues={{ currentPassword: "", newPassword: "", repeatNewPassword: "" }}
                        onSubmit={(values) => {
                            setUpdateError(undefined);
                            updateUserPassword({
                                password: values.currentPassword,
                                newPassword: values.newPassword,
                            })
                        }}
                    >
                        {({
                            values,
                            errors,
                            touched,
                            handleSubmit,
                            handleChange
                        }) => (
                            <form onSubmit={handleSubmit}>

                                <PasswordInput
                                    label={t('password_settings.current_password')}
                                    name="currentPassword"
                                    value={values.currentPassword}
                                    onChange={handleChange}
                                    error={errors.currentPassword}
                                    placeholder={t('password_settings.current_password_placeholder')}
                                />
                                <PasswordInput
                                    label={t('password_settings.new_password')}
                                    name="newPassword"
                                    value={values.newPassword}
                                    onChange={handleChange}
                                    error={errors.newPassword}
                                    placeholder={t('password_settings.new_password_placeholder')}
                                />
                                <PasswordInput
                                    label={t('password_settings.confirm_new_password')}
                                    name="repeatNewPassword"
                                    value={values.repeatNewPassword}
                                    onChange={handleChange}
                                    error={errors.repeatNewPassword}
                                    placeholder={t('password_settings.confirm_new_password_placeholder')}
                                />
                                <Button type='submit'
                                    className='mt-3 px-10'
                                    disabled={updatingUserPassword}
                                >{t('password_settings.save')}</Button>

                            </form>
                        )}
                    </Formik>

                    {
                        updateError && <Alert variant="destructive" className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-start gap-2">
                                <ShieldOff className="h-5 w-5 mt-0.5" />
                                <div>
                                    <AlertTitle>{t('password_settings.error_title')}</AlertTitle>
                                    <AlertDescription>
                                        {updateError}
                                    </AlertDescription>
                                </div>
                            </div>

                        </Alert>
                    }


                </AccordionContent>
            </AccordionItem>
        </>
    )
}

export default PasswordSettings