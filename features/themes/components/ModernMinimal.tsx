import { ThemeComponentProps } from "../registry";

// Proof-of-concept theme wired end-to-end through the registry
// (features/themes/registry.tsx) — validates the plumbing, not a
// professionally designed theme. Real theme designs are separate follow-up
// work.
export function ModernMinimalTheme({ profile, menu }: ThemeComponentProps) {
    return (
        <main className="min-h-screen bg-background text-foreground">
            <header className="border-b px-6 py-16 text-center">
                {profile.logo && (
                    <img
                        src={profile.logo}
                        alt={profile.name}
                        className="w-24 h-24 rounded-full object-cover mx-auto mb-6"
                    />
                )}
                <h1 className="text-4xl font-bold tracking-tight">{profile.name}</h1>
                {profile.description && (
                    <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
                        {profile.description}
                    </p>
                )}
            </header>

            {menu && menu.categories.length > 0 && (
                <section className="max-w-3xl mx-auto px-6 py-16">
                    <h2 className="text-2xl font-semibold mb-8 text-center">Menu</h2>
                    <div className="space-y-10">
                        {menu.categories.map((category) => (
                            <div key={category.id}>
                                <h3 className="text-xl font-medium mb-4">{category.name}</h3>
                                <ul className="space-y-3">
                                    {(category.items ?? []).map((item) => (
                                        <li key={item.id} className="flex justify-between gap-4">
                                            <div>
                                                <p className="font-medium">{item.name}</p>
                                                {item.description && (
                                                    <p className="text-sm text-muted-foreground">{item.description}</p>
                                                )}
                                            </div>
                                            <span className="whitespace-nowrap font-medium">
                                                {item.price.toFixed(2)} {profile.currency ?? ""}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <footer className="border-t px-6 py-12 text-center text-sm text-muted-foreground space-y-1">
                {profile.address && (
                    <p>{profile.address}{profile.city ? `, ${profile.city}` : ""}</p>
                )}
                {profile.phone && <p>{profile.phone}</p>}
                {profile.email && <p>{profile.email}</p>}
            </footer>
        </main>
    );
}
