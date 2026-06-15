import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Loader2, User, Briefcase, Mail, Sparkles, CheckCircle2 } from "lucide-react";
import { useProfessionalProfile } from "@/features/professionalProfile/useProfessionalProfile";
import { useProfile } from "@/features/profile/useProfile";

const ProfessionalProfilePage: React.FC = () => {
    const {
        userProfessionalProfile,
        loadingProfessionalProfile,
        createProProfile,
        creatingProProfile,
        updateProProfile,
        updatingProProfile,
    } = useProfessionalProfile();
    const { userProfile } = useProfile();

    const hasProfile = !!userProfessionalProfile;

    const [form, setForm] = useState({
        firstName: "",
        middleName: "",
        lastName: "",
        displayName: "",
        workEmail: "",
    });

    useEffect(() => {
        if (userProfessionalProfile) {
            setForm({
                firstName: userProfessionalProfile.firstName ?? "",
                middleName: userProfessionalProfile.middleName ?? "",
                lastName: userProfessionalProfile.lastName ?? "",
                displayName: userProfessionalProfile.displayName ?? "",
                workEmail: userProfessionalProfile.workEmail ?? "",
            });
        }
    }, [userProfessionalProfile]);

    const isSaving = creatingProProfile || updatingProProfile;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
            displayName: form.displayName.trim(),
            workEmail: form.workEmail.trim(),
            ...(form.middleName.trim() ? { middleName: form.middleName.trim() } : {}),
        };
        if (hasProfile) {
            updateProProfile(payload);
        } else {
            createProProfile(payload);
        }
    };

    if (loadingProfessionalProfile) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const initials = userProfessionalProfile?.getInitials()
        || userProfile?.getInitials()
        || "ME";

    const displayName = userProfessionalProfile?.getDisplayName()
        || userProfile?.getFullName()
        || "Your Profile";

    return (
        <div className="max-w-2xl mx-auto space-y-6 p-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Professional Profile</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {hasProfile
                            ? "Update how you appear to employers and businesses."
                            : "Create your professional profile to apply for jobs and connect with businesses."}
                    </p>
                </div>
                {hasProfile && (
                    <Badge className="shrink-0 flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-50">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Active
                    </Badge>
                )}
            </div>

            {/* Profile summary card */}
            <Card className="overflow-hidden border border-border">
                <div className="h-24 bg-gradient-to-br from-primary via-primary/90 to-indigo-500 relative">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 to-transparent" />
                </div>
                <CardContent className="pt-0 pb-5 px-5">
                    {/* Avatar row — straddles the banner, text stays below */}
                    <div className="-mt-8 mb-3">
                        <Avatar className="h-16 w-16 border-4 border-background shadow-lg">
                            <AvatarFallback className="text-base font-bold bg-white text-primary">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                    {/* Name & meta — always on the card surface */}
                    <p className="font-bold text-lg leading-tight">{displayName}</p>
                    {userProfessionalProfile?.workEmail ? (
                        <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                            <Mail className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{userProfessionalProfile.workEmail}</span>
                        </p>
                    ) : (
                        <p className="text-xs text-muted-foreground mt-1 italic">No professional profile yet</p>
                    )}
                    {userProfessionalProfile?.getCreatedDate() && (
                        <p className="text-xs text-muted-foreground mt-2">
                            Member since {userProfessionalProfile.getCreatedDate()}
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Call-to-action when no profile */}
            {!hasProfile && (
                <div className="flex items-start gap-3 rounded-xl bg-primary/5 border border-primary/20 px-4 py-3.5">
                    <Sparkles className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <div>
                        <p className="text-sm font-semibold text-primary">Get discovered by businesses</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Fill in your details below to start applying for jobs and appearing in employer searches.
                        </p>
                    </div>
                </div>
            )}

            {/* Edit form */}
            <Card>
                <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2.5 text-base">
                        <div className="p-1.5 rounded-md bg-primary/10">
                            <User className="h-4 w-4 text-primary" />
                        </div>
                        {hasProfile ? "Edit Details" : "Set Up Your Profile"}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Legal name section */}
                        <div className="space-y-4">
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Legal Name
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="firstName">
                                        First Name <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="firstName"
                                        name="firstName"
                                        value={form.firstName}
                                        onChange={handleChange}
                                        placeholder="John"
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="lastName">
                                        Last Name <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="lastName"
                                        name="lastName"
                                        value={form.lastName}
                                        onChange={handleChange}
                                        placeholder="Doe"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="middleName" className="flex items-center gap-2">
                                    Middle Name
                                    <span className="text-xs text-muted-foreground font-normal">(optional)</span>
                                </Label>
                                <Input
                                    id="middleName"
                                    name="middleName"
                                    value={form.middleName}
                                    onChange={handleChange}
                                    placeholder="Optional"
                                />
                            </div>
                        </div>

                        <Separator />

                        {/* Public identity section */}
                        <div className="space-y-4">
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Public Identity
                            </p>
                            <div className="space-y-1.5">
                                <Label htmlFor="displayName">
                                    Display Name <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="displayName"
                                    name="displayName"
                                    value={form.displayName}
                                    onChange={handleChange}
                                    placeholder="How you want to appear publicly"
                                    required
                                />
                                <p className="text-xs text-muted-foreground">
                                    Shown on job applications and public-facing profiles.
                                </p>
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="workEmail" className="flex items-center gap-1.5">
                                    <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                                    Work Email <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="workEmail"
                                    name="workEmail"
                                    type="email"
                                    value={form.workEmail}
                                    onChange={handleChange}
                                    placeholder="you@work.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex justify-end pt-1">
                            <Button type="submit" disabled={isSaving} className="min-w-32">
                                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isSaving ? "Saving…" : hasProfile ? "Save Changes" : "Create Profile"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default ProfessionalProfilePage;
