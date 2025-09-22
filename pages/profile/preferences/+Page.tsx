import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import React from 'react'

const ProfilePreferencesPage = () => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked /> Halal
                </label>
                <label className="flex items-center gap-2">
                    <input type="checkbox" /> Vegan
                </label>
                <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked /> Gluten-free
                </label>
                <Button className="mt-2">Update Preferences</Button>
            </CardContent>
        </Card>
    )
}

export default ProfilePreferencesPage