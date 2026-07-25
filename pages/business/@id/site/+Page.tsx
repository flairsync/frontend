import { usePageContext } from "vike-react/usePageContext";
import { withFallback } from "vike-react-query";
import { useSuspenseBusinessPageData } from "@/features/discovery/useDiscovery";
import { resolveThemeComponent } from "@/features/themes/registry";
import { Skeleton } from "@/components/ui/skeleton";

// The business's own branded public page (reached via QR code / "visit
// website" link) — distinct from /business/:id, which is FlairSync's own
// unified marketplace listing page and must stay consistent across every
// business on the platform.
const SiteContent = withFallback(
    ({ id }: { id: string }) => {
        const { data } = useSuspenseBusinessPageData(id);
        const { profile, menu } = data;
        const ThemeComponent = resolveThemeComponent(profile.activeThemeKey);
        return <ThemeComponent profile={profile} menu={menu} />;
    },
    () => <Skeleton className="w-full h-screen" />,
);

const Page = () => {
    const { routeParams } = usePageContext();
    return <SiteContent id={routeParams.id as string} />;
};

export default Page;
