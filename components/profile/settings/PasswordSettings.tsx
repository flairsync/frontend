import { InputError } from '@/components/inputs/InputError'
import TfaCodeNeededModal from '@/components/inputs/TfaCodeNeededModal'
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { usePasswordSettings } from '@/features/profileSettings/usePasswordSettings'
import { UpdatePasswordSchema } from '@/misc/FormValidators'
import { AxiosError } from 'axios'
import { Formik } from 'formik'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'

const PasswordSettings = () => {

    const [needsTfaModal, setNeedsTfaModal] = useState(false);

    const {
        errorUpdatingUserPassword,
        updateUserPassword,
        updatingUserPassword
    } = usePasswordSettings();


    useEffect(() => {
        if (errorUpdatingUserPassword) {
            if (errorUpdatingUserPassword instanceof AxiosError) {
                if (errorUpdatingUserPassword.response?.data.code == "tfa.error") {
                    setNeedsTfaModal(true);
                }
            }
        }
    }, [errorUpdatingUserPassword]);



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
                        validationSchema={UpdatePasswordSchema}
                        initialValues={{ currentPassword: "", newPassword: "", repeatNewPassword: "" }}
                        onSubmit={(values) => {
                            console.log(values);
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

                                <div className="space-y-1">
                                    <Label>Current Password</Label>
                                    <Input
                                        type="password"
                                        name='currentPassword'
                                        value={values.currentPassword}
                                        onChange={handleChange}
                                        placeholder="Enter current password"
                                    />
                                    <InputError
                                        message={errors.currentPassword}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label>New Password</Label>
                                    <Input
                                        name='newPassword'

                                        type="password"
                                        value={values.newPassword}
                                        onChange={handleChange}
                                        placeholder="New password"
                                    />
                                    <InputError
                                        message={errors.newPassword}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label>Confirm New Password</Label>
                                    <Input
                                        name='repeatNewPassword'

                                        type="password"
                                        value={values.repeatNewPassword}
                                        onChange={handleChange}
                                        placeholder="Confirm new password"
                                    />
                                    <InputError
                                        message={errors.repeatNewPassword}
                                    />
                                </div>
                                <Button type='submit'
                                    disabled={updatingUserPassword}
                                >Save</Button>

                            </form>
                        )}
                    </Formik>



                </AccordionContent>
            </AccordionItem>
        </>
    )
}

export default PasswordSettings