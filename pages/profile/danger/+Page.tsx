import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LogOut } from 'lucide-react'
import React from 'react'

const DangerParamsPage = () => {
    return (
        <Card className="border-red-500">
            <CardHeader>
                <CardTitle className="text-red-600">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <Button variant="destructive" className="w-full">
                    Delete Account
                </Button>
                <Button variant="outline" className="w-full flex gap-2">
                    <LogOut className="w-4 h-4" /> Log Out
                </Button>
            </CardContent>
        </Card>
    )
}

export default DangerParamsPage