import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import React from 'react'

const ProfileSettingsPage = () => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Account Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <label className="block text-sm font-medium">Email</label>
                    <input
                        type="email"
                        className="w-full mt-1 p-2 border rounded-md"
                        defaultValue="johndoe@email.com"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium">Password</label>
                    <input
                        type="password"
                        className="w-full mt-1 p-2 border rounded-md"
                        placeholder="********"
                    />
                </div>
                <Button>Save Changes</Button>
            </CardContent>
        </Card>
    )
}

export default ProfileSettingsPage