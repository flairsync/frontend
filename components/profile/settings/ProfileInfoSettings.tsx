import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useProfile } from '@/features/profile/useProfile'
import { Formik } from 'formik'
import React, { useEffect, useState } from 'react'
import { toast } from "sonner"

const ProfileInfoSettings = () => {

    const {
        userProfile,
        loadingUserProfile,
        updateUserProfile,
        updatingUserProfile,
        updatedUserProfile
    } = useProfile();


    useEffect(() => {
        if (updatedUserProfile) {
            toast("Updated")
        }
    }, [updatedUserProfile]);

    return (
        <>

            <AccordionItem value="profile-info" className="border rounded-lg px-3">
                <AccordionTrigger>Profile Information</AccordionTrigger>
                <AccordionContent className="space-y-4 py-2">

                    <Formik
                        initialValues={{ firstname: userProfile?.firstName, lastname: userProfile?.lastName }}
                        onSubmit={(values) => {
                            updateUserProfile({
                                firstName: values.firstname,
                                lastName: values.lastname,
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
                                    <Label>First name</Label>
                                    <Input type="text"
                                        onChange={handleChange}
                                        value={values.firstname} name='firstname' />
                                </div>
                                <div className="space-y-1 pb-2">
                                    <Label>last name</Label>
                                    <Input type="text"
                                        onChange={handleChange}

                                        value={values.lastname} name='lastname' />
                                </div>

                                <Button type='submit'
                                    disabled={updatingUserProfile}
                                >Update</Button>
                            </form>
                        )}
                    </Formik>



                </AccordionContent>
            </AccordionItem>

        </>
    )
}

export default ProfileInfoSettings