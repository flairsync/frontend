import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Mail, Shield, ShieldAlert, Loader2 } from "lucide-react"
import { useProfessionalProfile } from "@/features/professionalProfile/useProfessionalProfile"
import { useProfile } from "@/features/profile/useProfile"

export default function StaffProfilePage() {
    const { userProfessionalProfile, loadingProfessionalProfile } = useProfessionalProfile();
    const { userProfile } = useProfile();

    if (loadingProfessionalProfile) {
        return (
            <div className="flex h-[60vh] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    const fullName = userProfessionalProfile?.getFullName() || userProfile?.getFullName() || "Staff Member";
    const initials = userProfessionalProfile?.getInitials() || userProfile?.getFullName().charAt(0) || "U";
    const email = userProfessionalProfile?.workEmail || userProfile?.email;

    return (
        <div className="max-w-4xl mx-auto space-y-6 p-6">
            {/* Profile Header */}
            <Card className="overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700" />
                <CardContent className="relative pt-0 pb-6">
                    <div className="flex flex-col sm:flex-row items-end gap-4 -mt-12 mb-4 px-4">
                        <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
                            <AvatarImage src="" />
                            <AvatarFallback className="text-2xl bg-muted">{initials}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 pb-1">
                            <h1 className="text-2xl font-bold">{fullName}</h1>
                            <p className="text-muted-foreground flex items-center gap-1">
                                <Badge variant="secondary" className="font-medium">
                                    Member
                                </Badge>
                            </p>
                        </div>
                        <Button variant="outline" size="sm" className="mb-1">
                            Edit Profile
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Contact Information */}
                <Card className="md:col-span-1 shadow-sm border-zinc-100">
                    <CardHeader>
                        <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                            Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-3 text-sm">
                            <Mail className="h-4 w-4 text-zinc-400" />
                            <span className="truncate">{email || "No email provided"}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <Calendar className="h-4 w-4 text-zinc-400" />
                            <span>Joined {userProfessionalProfile?.getCreatedDate() || "Recently"}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <Shield className="h-4 w-4 text-zinc-400" />
                            <span>Active Status</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Performance Stats & Recent Activity */}
                <div className="md:col-span-2 space-y-6">
                    <Card className="shadow-sm border-zinc-100">
                        <CardHeader>
                            <CardTitle>Professional Profile</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-zinc-50 rounded-lg border border-zinc-100">
                                    <p className="text-xs text-muted-foreground font-medium mb-1">Display Name</p>
                                    <p className="text-lg font-bold">{userProfessionalProfile?.displayName || "Not set"}</p>
                                </div>
                                <div className="p-4 bg-zinc-50 rounded-lg border border-zinc-100">
                                    <p className="text-xs text-muted-foreground font-medium mb-1">Work Email</p>
                                    <p className="text-lg font-bold truncate">{userProfessionalProfile?.workEmail || "-"}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm border-zinc-100">
                        <CardHeader>
                            <CardTitle>Shift Schedule</CardTitle>
                        </CardHeader>
                        <CardContent className="py-8 text-center bg-zinc-50/50 rounded-b-xl">
                            <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-20" />
                            <p className="text-sm text-muted-foreground">No upcoming shifts scheduled for this week.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Danger Zone */}
            <Card className="border-destructive/50 bg-destructive/5 shadow-none mt-8">
                <CardHeader>
                    <CardTitle className="text-destructive flex items-center gap-2 text-lg">
                        <ShieldAlert className="h-5 w-5" />
                        Danger Zone
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="space-y-1">
                            <p className="font-bold">Leave Business</p>
                            <p className="text-sm text-zinc-600">
                                Request to leave this business. This action will be sent to the manager for review.
                            </p>
                        </div>
                        <Button variant="destructive" className="w-full sm:w-auto font-bold shadow-sm">
                            Request to leave
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Optional Actions */}
            <div className="flex justify-end space-x-2">
                <Button variant="outline">Request Time Off</Button>
                <Button>View Full Schedule</Button>
            </div>
        </div>
    )
}
