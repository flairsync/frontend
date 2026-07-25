import { ThemeComponentProps } from "../registry";

// Fallback rendered whenever a business has no theme applied yet, or its
// applied theme's key isn't (or is no longer) registered — e.g. before any
// theme is picked, or an admin retired/deleted the applied theme.
export function DefaultTheme({ profile }: ThemeComponentProps) {
    return (
        <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center gap-4">
            {profile.logo && (
                <img
                    src={profile.logo}
                    alt={profile.name}
                    className="w-20 h-20 rounded-full object-cover"
                />
            )}
            <h1 className="text-3xl font-semibold">{profile.name}</h1>
            {profile.description && (
                <p className="text-muted-foreground max-w-xl">{profile.description}</p>
            )}
            {profile.phone && <p className="text-sm">{profile.phone}</p>}
            {profile.address && (
                <p className="text-sm text-muted-foreground">
                    {profile.address}{profile.city ? `, ${profile.city}` : ""}
                </p>
            )}
        </main>
    );
}
