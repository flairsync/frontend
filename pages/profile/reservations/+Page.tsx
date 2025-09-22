import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import React from 'react'

const ReservationsPage = () => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>My Reservations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                    <div>
                        <h3 className="font-medium">Borda La Vella</h3>
                        <p className="text-sm text-muted-foreground">
                            Sept 28, 2025 – 19:30
                        </p>
                    </div>
                    <Button size="sm">Cancel</Button>
                </div>
            </CardContent>
        </Card>
    )
}

export default ReservationsPage