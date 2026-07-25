import { usePageContext } from "vike-react/usePageContext";
import ThemesManager from "@/components/management/themes/ThemesManager";

const Page = () => {
    const { routeParams } = usePageContext();
    return <ThemesManager businessId={routeParams.id as string} />;
};

export default Page;
