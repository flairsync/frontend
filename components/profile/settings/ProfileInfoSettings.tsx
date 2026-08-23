import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useProfile } from '@/features/profile/useProfile'
import { Formik } from 'formik'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { CalendarIcon, Check, ChevronsUpDown } from 'lucide-react'
import dayjs from 'dayjs'
import { usePlatformCountries } from '@/features/shared/usePlatformCountries'
import { cn } from '@/lib/utils'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { CountryStatus } from '@/models/shared/PlatformCountry'
import { Gender } from '@/models/UserProfile'
import { Badge } from '@/components/ui/badge'
import { PhoneInput } from '@/components/ui/phone-input'

const ProfileInfoSettings = () => {

    const { t } = useTranslation('profile');

    const {
        userProfile,
        loadingUserProfile,
        updateUserProfile,
        updatingUserProfile,
        updatedUserProfile
    } = useProfile();

    const [countryOpen, setCountryOpen] = useState(false);

    const { platformCountries } = usePlatformCountries({ includeAll: true });

    useEffect(() => {
        if (updatedUserProfile) {
            toast(t('profile_info_settings.updated_toast'))
        }
    }, [updatedUserProfile]);

    return (
        <>

            <AccordionItem value="profile-info" className="border rounded-lg px-3">
                <AccordionTrigger>{t('profile_info_settings.title')}</AccordionTrigger>
                <AccordionContent className="space-y-4 py-2">

                    <Formik
                        enableReinitialize
                        initialValues={{
                            firstname: userProfile?.firstName || '',
                            lastname: userProfile?.lastName || '',
                            phoneNumber: userProfile?.phoneNumber || '',
                            dateOfBirth: userProfile?.dateOfBirth ? new Date(userProfile.dateOfBirth) : undefined,
                            gender: userProfile?.gender || '',
                            countryId: userProfile?.countryId?.toString() || ''
                        }}
                        onSubmit={(values) => {
                            updateUserProfile({
                                firstName: values.firstname || null,
                                lastName: values.lastname || null,
                                phoneNumber: values.phoneNumber || null,
                                dateOfBirth: values.dateOfBirth ? dayjs(values.dateOfBirth).format('YYYY-MM-DD') : null,
                                gender: values.gender || null,
                                countryId: values.countryId ? parseInt(values.countryId) : null,
                            } as any)

                        }}
                    >
                        {({
                            values,
                            errors,
                            touched,
                            handleSubmit,
                            handleChange,
                            setFieldValue
                        }) => (
                            <form onSubmit={handleSubmit}>
                                <div className="space-y-1">
                                    <Label>{t('profile_info_settings.first_name')}</Label>
                                    <Input type="text"
                                        onChange={handleChange}
                                        value={values.firstname} name='firstname' />
                                </div>
                                <div className="space-y-1 pb-2">
                                    <Label>{t('profile_info_settings.last_name')}</Label>
                                    <Input type="text"
                                        onChange={handleChange}

                                        value={values.lastname} name='lastname' />
                                </div>

                                <div className="space-y-1 pb-2">
                                    <Label>{t('profile_info_settings.phone_number')}</Label>
                                    <PhoneInput
                                        defaultCountry="FR"
                                        value={values.phoneNumber}
                                        onChange={(v) => {
                                            setFieldValue('phoneNumber', v)
                                        }}
                                    />
                                </div>

                                <div className="space-y-1 pb-2 flex flex-col">
                                    <Label className="mb-1">{t('profile_info_settings.date_of_birth')}</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "justify-start text-left font-normal",
                                                    !values.dateOfBirth && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {values.dateOfBirth ? dayjs(values.dateOfBirth).format("MMM D, YYYY") : <span>{t('profile_info_settings.pick_a_date')}</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={values.dateOfBirth}
                                                onSelect={(date) => setFieldValue("dateOfBirth", date)}
                                                initialFocus
                                                captionLayout="dropdown"
                                                fromYear={dayjs().subtract(100, 'year').year()}
                                                toYear={dayjs().subtract(14, 'years').year()}
                                                disabled={(date) => date > dayjs().subtract(14, 'years').toDate()}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                <div className="space-y-1 pb-2">
                                    <Label>{t('profile_info_settings.gender')}</Label>
                                    <Select value={values.gender} onValueChange={(val) => setFieldValue("gender", val)}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder={t('profile_info_settings.select_gender')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={Gender.MALE}>{t('profile_info_settings.genders.male')}</SelectItem>
                                            <SelectItem value={Gender.FEMALE}>{t('profile_info_settings.genders.female')}</SelectItem>
                                            <SelectItem value={Gender.NON_BINARY}>{t('profile_info_settings.genders.non_binary')}</SelectItem>
                                            <SelectItem value={Gender.OTHER}>{t('profile_info_settings.genders.other')}</SelectItem>
                                            <SelectItem value={Gender.PREFER_NOT_TO_SAY}>{t('profile_info_settings.genders.prefer_not_to_say')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1 pb-4 flex flex-col">
                                    <Label className="mb-1">{t('profile_info_settings.country')}</Label>
                                    <Popover open={countryOpen} onOpenChange={setCountryOpen}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                aria-expanded={countryOpen}
                                                className="w-full justify-between"
                                            >
                                                {values.countryId
                                                    ? platformCountries?.find((country) => country.id.toString() === values.countryId)?.name
                                                    : t('profile_info_settings.select_country')}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[400px] p-0" align='start'>
                                            <Command>
                                                <CommandInput placeholder={t('profile_info_settings.search_country')} />
                                                <CommandList>
                                                    <CommandEmpty>{t('profile_info_settings.no_country_found')}</CommandEmpty>
                                                    <CommandGroup>
                                                        {platformCountries?.map((country) => (
                                                            <CommandItem
                                                                key={country.id}
                                                                value={country.name}
                                                                onSelect={() => {
                                                                    setFieldValue("countryId", country.id.toString())
                                                                    setCountryOpen(false)
                                                                }}
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        values.countryId === country.id.toString() ? "opacity-100" : "opacity-0"
                                                                    )}
                                                                />
                                                                <span>{country.name}</span>
                                                                {country.status === CountryStatus.COMING_SOON && (
                                                                    <Badge variant="secondary" className="ml-auto text-xs font-normal">{t('profile_info_settings.coming_soon')}</Badge>
                                                                )}
                                                                {country.status === CountryStatus.INACTIVE && (
                                                                    <span className="ml-auto text-xs text-muted-foreground mr-2">{t('profile_info_settings.inactive')}</span>
                                                                )}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                <Button type='submit'
                                    disabled={updatingUserProfile}
                                >{t('profile_info_settings.update')}</Button>
                            </form>
                        )}
                    </Formik>



                </AccordionContent>
            </AccordionItem>

        </>
    )
}

export default ProfileInfoSettings