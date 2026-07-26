import { usePageContext } from "vike-react/usePageContext";
import { withFallback } from "vike-react-query";
import { useSuspenseBusinessPageData } from "@/features/discovery/useDiscovery";
import { THEME_REGISTRY, resolveThemeComponent } from "@/features/themes/registry";
import { usePermissions } from "@/features/auth/usePermissions";
import { Skeleton } from "@/components/ui/skeleton";

// The business's own branded public page (reached via QR code) — distinct
// from /business/:id, which is FlairSync's own unified marketplace listing
// page and must stay consistent across every business on the platform.
const SiteContent = withFallback(
    ({ id }: { id: string }) => {
        const { data } = useSuspenseBusinessPageData(id);
        const { urlParsed, user } = usePageContext();
        const { profile, menu } = data;

        // Render-only override for the theme preview modal
        // (components/management/themes/ThemePreviewModal.tsx) — never
        // touches the persisted activeThemeKey. Gated on the viewer actually
        // holding THEMES permission on THIS business (checked via the same
        // effective-permissions endpoint the manage app uses), so a random
        // public visitor can't tamper with the query string to see a theme
        // the business hasn't applied — anyone without that permission always
        // sees the real applied theme regardless of the query param.
        const { hasPermission } = usePermissions(user ? id : undefined);
        const canPreview = !!user && hasPermission("THEMES", "read");

        const previewKey = urlParsed.search.theme;
        const effectiveKey =
            canPreview && previewKey && THEME_REGISTRY[previewKey] ? previewKey : profile.activeThemeKey;

        const ThemeComponent = resolveThemeComponent(effectiveKey);
        return <ThemeComponent profile={profile} menu={menu} />;
    },
    () => <Skeleton className="w-full h-screen" />,
);

const Page = () => {
    const { routeParams } = usePageContext();
    return <SiteContent id={routeParams.id as string} />;
};

export default Page;
