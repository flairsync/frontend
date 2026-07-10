import React from "react"
import { useTranslation } from "react-i18next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { clientOnly } from "vike-react/clientOnly"
import { useProfile } from "@/features/profile/useProfile"

// recharts is a heavy dependency — defer it off the initial render path so the
// rest of the page (profile card, stats) becomes interactive immediately.
const ProfileOverviewOrdersChart = clientOnly(() => import("@/components/profile/ProfileOverviewOrdersChart"))

const ProfileOverviewPage = () => {
    const { t } = useTranslation("profile")
    const {
        userProfile
    } = useProfile();
    // Example stats
    const reservationsMade = 27
    const mealsOrdered = 134

    const chartSkeleton = (
        <Card className="shadow-sm">
            <CardHeader>
                <CardTitle>{t("overview.orders_chart_title")}</CardTitle>
            </CardHeader>
            <CardContent className="h-72 animate-pulse bg-muted rounded-md" />
        </Card>
    )

    return (
        <div className="space-y-6">
            {/* Profile Card */}
            <Card>
                <CardHeader>
                    <CardTitle>{t("overview.title")}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col md:flex-row items-center gap-4">
                    <Avatar className="w-20 h-20">
                        <AvatarFallback className="bg-primary/10 text-primary text-2xl font-semibold">
                            {userProfile?.getInitials() ?? "?"}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <h2 className="text-xl font-bold">{userProfile?.getFullName()}</h2>
                        <p className="text-sm text-muted-foreground">{userProfile?.email}</p>
                        {/* <p className="text-sm">📍 Andorra la Vella, Andorra</p> */}

                    </div>
                </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Joined */}
                <Card className="text-center">
                    <CardHeader>
                        <CardTitle>{t("overview.joined_label")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-lg font-bold">{userProfile?.getJoinDate()}</p>
                    </CardContent>
                </Card>

                {/* Reservations Made */}
                <Card className="text-center">
                    <CardHeader>
                        <CardTitle>{t("overview.reservations_label")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-lg font-bold">{reservationsMade}</p>
                    </CardContent>
                </Card>

                {/* Meals Ordered */}
                <Card className="text-center">
                    <CardHeader>
                        <CardTitle>{t("overview.meals_ordered_label")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-lg font-bold">{mealsOrdered}</p>
                    </CardContent>
                </Card>
            </div>

            <ProfileOverviewOrdersChart fallback={chartSkeleton} />

        </div>
    )
}

export default ProfileOverviewPage
