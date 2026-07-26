import { usePageContext } from "vike-react/usePageContext";
import { withFallback } from "vike-react-query";
import { useSuspenseBusinessPageData } from "@/features/discovery/useDiscovery";
import { THEME_REGISTRY, resolveThemeComponent } from "@/features/themes/registry";
import { Skeleton } from "@/components/ui/skeleton";

// The business's own branded public page (reached via QR code / "visit
// website" link) — distinct from /business/:id, which is FlairSync's own
// unified marketplace listing page and must stay consistent across every
// business on the platform.
const SiteContent = withFallback(
    ({ id }: { id: string }) => {
        const { data } = useSuspenseBusinessPageData(id);
        const { urlParsed } = usePageContext();
        const { profile, menu } = data;

        // Render-only override for the theme preview modal
        // (components/management/themes/ThemePreviewModal.tsx) — never
        // touches the persisted activeThemeKey. An invalid/unregistered key
        // silently falls back to the business's real applied theme, not to
        // DefaultTheme.
        const previewKey = urlParsed.search.theme;
        const effectiveKey = previewKey && THEME_REGISTRY[previewKey] ? previewKey : profile.activeThemeKey;

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
