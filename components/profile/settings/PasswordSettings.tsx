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

const PasswordSettings = () => {

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
                <AccordionTrigger>Change Password</AccordionTrigger>
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
                                    label="Current Password"
                                    name="currentPassword"
                                    value={values.currentPassword}
                                    onChange={handleChange}
                                    error={errors.currentPassword}
                                    placeholder="Enter current password"
                                />
                                <PasswordInput
                                    label="New Password"
                                    name="newPassword"
                                    value={values.newPassword}
                                    onChange={handleChange}
                                    error={errors.newPassword}
                                    placeholder="New password"
                                />
                                <PasswordInput
                                    label="Confirm New Password"
                                    name="repeatNewPassword"
                                    value={values.repeatNewPassword}
                                    onChange={handleChange}
                                    error={errors.repeatNewPassword}
                                    placeholder="Confirm new password"
                                />
                                <Button type='submit'
                                    className='mt-3 px-10'
                                    disabled={updatingUserPassword}
                                >Save</Button>

                            </form>
                        )}
                    </Formik>

                    {
                        updateError && <Alert variant="destructive" className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-start gap-2">
                                <ShieldOff className="h-5 w-5 mt-0.5" />
                                <div>
                                    <AlertTitle>Error updating password</AlertTitle>
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