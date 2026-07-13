import { usePageContext } from "vike-react/usePageContext";
import DiscountsPage from "@/components/management/discounts/DiscountsPage";

const Page = () => {
    const { routeParams } = usePageContext();
    return <DiscountsPage businessId={routeParams.id as string} />;
};

export default Page;
